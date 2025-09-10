import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  IsUrl,
  IsDateString,
  IsUUID,
  Min,
  Max,
  Length,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CourseDifficulty, CourseStatus, CourseType } from '../entities/course.entity';

export class CreateCourseDto {
  @ApiProperty({ description: 'Course title' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 200)
  title: string;

  @ApiProperty({ description: 'Course description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Short description for preview' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  shortDescription?: string;

  @ApiProperty({ description: 'Category ID' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ description: 'Course thumbnail URL' })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Course banner URL' })
  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @ApiPropertyOptional({ description: 'Course trailer video URL' })
  @IsOptional()
  @IsUrl()
  trailerVideoUrl?: string;

  @ApiProperty({ enum: CourseDifficulty, description: 'Course difficulty level' })
  @IsEnum(CourseDifficulty)
  difficulty: CourseDifficulty;

  @ApiProperty({ enum: CourseType, description: 'Course type (free/premium/subscription)' })
  @IsEnum(CourseType)
  courseType: CourseType;

  @ApiProperty({ description: 'Estimated duration in minutes' })
  @IsNumber()
  @Min(1)
  @Max(10000)
  estimatedDuration: number;

  @ApiPropertyOptional({ description: 'Course price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Discount price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountPrice?: number;

  @ApiPropertyOptional({ description: 'Discount expiration date' })
  @IsOptional()
  @IsDateString()
  discountExpiresAt?: Date;

  @ApiPropertyOptional({ description: 'Prerequisites', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];

  @ApiPropertyOptional({ description: 'Learning objectives', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningObjectives?: string[];

  @ApiPropertyOptional({ description: 'Target audience', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetAudience?: string[];

  @ApiPropertyOptional({ description: 'Tags for course', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Course language', default: 'en' })
  @IsOptional()
  @IsString()
  @Length(2, 5)
  language?: string;

  @ApiPropertyOptional({ description: 'Instructor name' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  instructorName?: string;

  @ApiPropertyOptional({ description: 'Instructor biography' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  instructorBio?: string;

  @ApiPropertyOptional({ description: 'Instructor avatar URL' })
  @IsOptional()
  @IsUrl()
  instructorAvatar?: string;

  @ApiPropertyOptional({ description: 'Enable certificate generation', default: true })
  @IsOptional()
  @IsBoolean()
  certificateEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Passing score percentage', default: 70 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  passingScore?: number;

  @ApiPropertyOptional({ description: 'Maximum attempts for assessments' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxAttempts?: number;

  @ApiPropertyOptional({ description: 'Access duration in days after enrollment' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  accessDuration?: number;

  @ApiPropertyOptional({ description: 'Featured course flag', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}

export class PublishCourseDto {
  @ApiProperty({ enum: CourseStatus, description: 'Course status' })
  @IsEnum(CourseStatus)
  status: CourseStatus;

  @ApiPropertyOptional({ description: 'Publication date' })
  @IsOptional()
  @IsDateString()
  publishedAt?: Date;
}

export class CourseQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  search?: string;

  @ApiPropertyOptional({ description: 'Category ID filter' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ enum: CourseDifficulty, description: 'Difficulty filter' })
  @IsOptional()
  @IsEnum(CourseDifficulty)
  difficulty?: CourseDifficulty;

  @ApiPropertyOptional({ enum: CourseType, description: 'Course type filter' })
  @IsOptional()
  @IsEnum(CourseType)
  courseType?: CourseType;

  @ApiPropertyOptional({ enum: CourseStatus, description: 'Status filter' })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiPropertyOptional({ description: 'Featured courses only', default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ description: 'Free courses only', default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  free?: boolean;

  @ApiPropertyOptional({ description: 'Sort field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ description: 'Filter by tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Minimum rating filter' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ description: 'Maximum duration in minutes' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxDuration?: number;

  @ApiPropertyOptional({ description: 'Include deleted courses', default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeDeleted?: boolean;
}

export class CourseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional()
  shortDescription?: string;

  @ApiPropertyOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  bannerUrl?: string;

  @ApiPropertyOptional()
  trailerVideoUrl?: string;

  @ApiProperty({ enum: CourseDifficulty })
  difficulty: CourseDifficulty;

  @ApiProperty({ enum: CourseType })
  courseType: CourseType;

  @ApiProperty({ enum: CourseStatus })
  status: CourseStatus;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  estimatedDuration: number;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  ratingCount: number;

  @ApiProperty()
  enrollmentCount: number;

  @ApiProperty()
  completionCount: number;

  @ApiPropertyOptional()
  price?: number;

  @ApiPropertyOptional()
  discountPrice?: number;

  @ApiPropertyOptional()
  discountExpiresAt?: Date;

  @ApiPropertyOptional({ type: [String] })
  prerequisites?: string[];

  @ApiPropertyOptional({ type: [String] })
  learningObjectives?: string[];

  @ApiPropertyOptional({ type: [String] })
  targetAudience?: string[];

  @ApiPropertyOptional({ type: [String] })
  tags?: string[];

  @ApiProperty()
  language: string;

  @ApiPropertyOptional()
  instructorName?: string;

  @ApiPropertyOptional()
  instructorBio?: string;

  @ApiPropertyOptional()
  instructorAvatar?: string;

  @ApiProperty()
  certificateEnabled: boolean;

  @ApiProperty()
  passingScore: number;

  @ApiPropertyOptional()
  maxAttempts?: number;

  @ApiPropertyOptional()
  accessDuration?: number;

  @ApiPropertyOptional()
  publishedAt?: Date;

  @ApiPropertyOptional()
  lastUpdatedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  categoryId: string;

  // Virtual properties
  @ApiProperty()
  isPublished: boolean;

  @ApiProperty()
  isDraft: boolean;

  @ApiProperty()
  isArchived: boolean;

  @ApiProperty()
  isFree: boolean;

  @ApiProperty()
  isPremium: boolean;

  @ApiProperty()
  currentPrice: number;

  @ApiProperty()
  hasActiveDiscount: boolean;

  @ApiProperty()
  discountPercentage: number;

  @ApiProperty()
  completionRate: number;

  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  totalLessons: number;
}

export class CourseStatsDto {
  @ApiProperty()
  totalCourses: number;

  @ApiProperty()
  publishedCourses: number;

  @ApiProperty()
  draftCourses: number;

  @ApiProperty()
  featuredCourses: number;

  @ApiProperty()
  freeCourses: number;

  @ApiProperty()
  premiumCourses: number;

  @ApiProperty()
  totalEnrollments: number;

  @ApiProperty()
  totalCompletions: number;

  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  averageCompletionRate: number;

  @ApiProperty()
  mostPopularCourses: CourseResponseDto[];

  @ApiProperty()
  recentCourses: CourseResponseDto[];
}

export class EnrollCourseDto {
  @ApiProperty({ description: 'Course ID to enroll in' })
  @IsUUID()
  courseId: string;
}

export class RateCourseDto {
  @ApiProperty({ description: 'Rating from 1 to 5' })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Optional review comment' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  review?: string;
}