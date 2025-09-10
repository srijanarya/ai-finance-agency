terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }
  
  backend "s3" {
    bucket         = "treum-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "treum-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = var.environment
      Project     = "TREUM-AI-Finance"
      ManagedBy   = "Terraform"
      CostCenter  = "Engineering"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"
  
  name               = "${var.project_name}-${var.environment}-vpc"
  cidr               = var.vpc_cidr
  availability_zones = data.aws_availability_zones.available.names
  
  private_subnet_cidrs = var.private_subnet_cidrs
  public_subnet_cidrs  = var.public_subnet_cidrs
  
  enable_nat_gateway = true
  single_nat_gateway = false  # One NAT gateway per AZ for HA
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }
}

# EKS Module
module "eks" {
  source = "./modules/eks"
  
  cluster_name    = var.cluster_name
  cluster_version = var.kubernetes_version
  
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  
  # Node Groups
  node_groups = {
    general = {
      desired_capacity = 3
      min_capacity     = 3
      max_capacity     = 10
      
      instance_types = ["t3.large"]
      
      k8s_labels = {
        node-role = "worker"
      }
      
      additional_tags = {
        Name = "${var.cluster_name}-general-node"
      }
    }
    
    compute = {
      desired_capacity = 2
      min_capacity     = 2
      max_capacity     = 8
      
      instance_types = ["c5.xlarge"]
      
      k8s_labels = {
        node-role = "compute"
      }
      
      taints = [
        {
          key    = "compute"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      ]
      
      additional_tags = {
        Name = "${var.cluster_name}-compute-node"
      }
    }
    
    database = {
      desired_capacity = 2
      min_capacity     = 2
      max_capacity     = 4
      
      instance_types = ["r5.large"]
      
      k8s_labels = {
        node-role = "database"
      }
      
      taints = [
        {
          key    = "database"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      ]
      
      additional_tags = {
        Name = "${var.cluster_name}-database-node"
      }
    }
    
    cache = {
      desired_capacity = 2
      min_capacity     = 2
      max_capacity     = 4
      
      instance_types = ["r5.large"]
      
      k8s_labels = {
        node-role = "cache"
      }
      
      taints = [
        {
          key    = "cache"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      ]
      
      additional_tags = {
        Name = "${var.cluster_name}-cache-node"
      }
    }
  }
  
  # Enable IRSA (IAM Roles for Service Accounts)
  enable_irsa = true
  
  # Cluster Addons
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }
  
  tags = var.tags
}

# RDS Module (Managed PostgreSQL)
module "rds" {
  source = "./modules/rds"
  
  identifier = "${var.project_name}-${var.environment}-db"
  
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = var.rds_instance_class
  allocated_storage    = 100
  max_allocated_storage = 500
  storage_encrypted    = true
  
  database_name = "treum_production"
  username      = var.db_username
  password      = var.db_password  # Should be from AWS Secrets Manager
  
  vpc_id                  = module.vpc.vpc_id
  subnet_ids              = module.vpc.private_subnet_ids
  allowed_security_groups = [module.eks.cluster_security_group_id]
  
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  multi_az               = true
  deletion_protection    = true
  skip_final_snapshot    = false
  
  performance_insights_enabled = true
  monitoring_interval         = 60
  
  tags = var.tags
}

# ElastiCache Module (Managed Redis)
module "elasticache" {
  source = "./modules/elasticache"
  
  cluster_id = "${var.project_name}-${var.environment}-redis"
  
  engine               = "redis"
  engine_version       = "7.0"
  node_type           = var.elasticache_node_type
  number_cache_nodes  = 3
  
  vpc_id                  = module.vpc.vpc_id
  subnet_ids              = module.vpc.private_subnet_ids
  allowed_security_groups = [module.eks.cluster_security_group_id]
  
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  snapshot_retention_limit = 7
  snapshot_window         = "03:00-05:00"
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  tags = var.tags
}

# S3 Buckets
module "s3" {
  source = "./modules/s3"
  
  buckets = {
    assets = {
      name = "${var.project_name}-${var.environment}-assets"
      versioning = true
      lifecycle_rules = [
        {
          id      = "archive-old-objects"
          enabled = true
          
          transition = [
            {
              days          = 30
              storage_class = "STANDARD_IA"
            },
            {
              days          = 90
              storage_class = "GLACIER"
            }
          ]
          
          expiration = {
            days = 365
          }
        }
      ]
    }
    
    backups = {
      name = "${var.project_name}-${var.environment}-backups"
      versioning = true
      lifecycle_rules = [
        {
          id      = "delete-old-backups"
          enabled = true
          
          expiration = {
            days = 90
          }
        }
      ]
    }
    
    logs = {
      name = "${var.project_name}-${var.environment}-logs"
      versioning = false
      lifecycle_rules = [
        {
          id      = "delete-old-logs"
          enabled = true
          
          expiration = {
            days = 30
          }
        }
      ]
    }
  }
  
  tags = var.tags
}

# CloudFront CDN
module "cloudfront" {
  source = "./modules/cloudfront"
  
  aliases = ["app.treum.ai", "www.treum.ai"]
  
  origin_domain_name = module.alb.dns_name
  origin_id          = "ALB-${module.alb.id}"
  
  s3_bucket_domain_name = module.s3.bucket_domain_names["assets"]
  s3_origin_id         = "S3-${module.s3.bucket_ids["assets"]}"
  
  acm_certificate_arn = module.acm.certificate_arn
  
  geo_restriction = {
    restriction_type = "whitelist"
    locations        = ["IN", "US", "GB", "SG", "AE"]  # India, US, UK, Singapore, UAE
  }
  
  tags = var.tags
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"
  
  name = "${var.project_name}-${var.environment}-alb"
  
  vpc_id          = module.vpc.vpc_id
  subnets         = module.vpc.public_subnet_ids
  security_groups = [aws_security_group.alb.id]
  
  certificate_arn = module.acm.certificate_arn
  
  target_groups = [
    {
      name     = "treum-api"
      port     = 8000
      protocol = "HTTP"
      
      health_check = {
        enabled             = true
        path                = "/api/v1/health"
        healthy_threshold   = 2
        unhealthy_threshold = 3
        timeout             = 5
        interval            = 30
      }
    }
  ]
  
  tags = var.tags
}

# ACM Certificate
module "acm" {
  source = "./modules/acm"
  
  domain_name = "treum.ai"
  subject_alternative_names = [
    "*.treum.ai",
    "app.treum.ai",
    "api.treum.ai",
    "www.treum.ai"
  ]
  
  zone_id = aws_route53_zone.main.zone_id
  
  tags = var.tags
}

# Route53 DNS
resource "aws_route53_zone" "main" {
  name = "treum.ai"
  
  tags = merge(
    var.tags,
    {
      Name = "treum.ai"
    }
  )
}

resource "aws_route53_record" "app" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "app.treum.ai"
  type    = "A"
  
  alias {
    name                   = module.cloudfront.distribution_domain_name
    zone_id                = module.cloudfront.distribution_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.treum.ai"
  type    = "A"
  
  alias {
    name                   = module.alb.dns_name
    zone_id                = module.alb.zone_id
    evaluate_target_health = true
  }
}

# Security Group for ALB
resource "aws_security_group" "alb" {
  name_prefix = "${var.project_name}-alb-"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-alb-sg"
    }
  )
}

# Outputs
output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "rds_endpoint" {
  value = module.rds.endpoint
}

output "redis_endpoint" {
  value = module.elasticache.primary_endpoint
}

output "alb_dns_name" {
  value = module.alb.dns_name
}

output "cloudfront_domain_name" {
  value = module.cloudfront.distribution_domain_name
}