# Consul Configuration for TREUM AI Finance Platform
datacenter = "treum-finance"
data_dir = "/consul/data"
log_level = "INFO"
server = true
bootstrap_expect = 1

# Bind addresses
bind_addr = "0.0.0.0"
client_addr = "0.0.0.0"

# UI
ui_config {
  enabled = true
}

# Connect
connect {
  enabled = true
}

# Ports
ports {
  grpc = 8502
}

# Service registration
services {
  name = "consul"
  port = 8500
  check {
    http = "http://localhost:8500/v1/status/leader"
    interval = "10s"
  }
}