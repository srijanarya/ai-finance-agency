import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  IsUrl,
  IsUUID,
  Min,
  Max,
  Length,
  ValidateNested,
  IsNotEmpty,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { LessonType, LessonStatus } from '../entities/lesson.entity';

export class AttachmentDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsUrl()
  url: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  size: number;
}

export class ResourceDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsUrl()
  url: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class QuizQuestionDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  question: string;

  @ApiProperty({ enum: ['multiple_choice', 'true_false', 'text'] })
  @IsEnum(['multiple_choice', 'true_false', 'text'])
  type: 'multiple_choice' | 'true_false' | 'text';

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiProperty()
  correctAnswer: string | string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  points: number;
}

export class CreateLessonDto {
  @ApiProperty({ description: 'Lesson title' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 200)
  title: string;

  @ApiPropertyOptional({ description: 'Lesson description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Lesson content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: 'Course ID this lesson belongs to' })
  @IsUUID()
  courseId: string;

  @ApiProperty({ enum: LessonType, description: 'Type of lesson' })
  @IsEnum(LessonType)
  lessonType: LessonType;

  @ApiProperty({ description: 'Order index within the course' })
  @IsNumber()
  @Min(0)
  orderIndex: number;

  @ApiPropertyOptional({ description: 'Lesson duration in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ description: 'Video URL' })
  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Video duration in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  videoDuration?: number;

  @ApiPropertyOptional({ description: 'Video thumbnail URL' })
  @IsOptional()
  @IsUrl()
  videoThumbnail?: string;

  @ApiPropertyOptional({ description: 'Audio URL' })
  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Document URL' })
  @IsOptional()
  @IsUrl()
  documentUrl?: string;

  @ApiPropertyOptional({ description: 'External URL' })
  @IsOptional()
  @IsUrl()
  externalUrl?: string;

  @ApiPropertyOptional({ description: 'File attachments', type: [AttachmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @ApiPropertyOptional({ description: 'Interactive content data' })
  @IsOptional()
  @IsObject()
  interactiveContent?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Quiz questions', type: [QuizQuestionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  quizQuestions?: QuizQuestionDto[];

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Video transcript' })
  @IsOptional()
  @IsString()
  transcript?: string;

  @ApiPropertyOptional({ description: 'Keywords for search', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ description: 'Additional resources', type: [ResourceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceDto)
  resources?: ResourceDto[];

  @ApiPropertyOptional({ description: 'Is lesson required for completion', default: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Minimum completion percentage', default: 80 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minCompletionPercentage?: number;

  @ApiPropertyOptional({ description: 'Points reward for completion', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pointsReward?: number;

  @ApiPropertyOptional({ description: 'Is lesson free preview', default: false })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;
}

export class UpdateLessonDto extends PartialType(CreateLessonDto) {
  @ApiPropertyOptional({ description: 'Course ID is not updatable' })
  @IsOptional()
  courseId?: never;
}

export class ReorderLessonsDto {
  @ApiProperty({ description: 'Array of lesson IDs in new order', type: [String] })
  @IsArray()
  @IsUUID(undefined, { each: true })
  lessonIds: string[];
}

export class LessonQueryDto {
  @ApiPropertyOptional({ description: 'Course ID filter' })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional({ enum: LessonType, description: 'Lesson type filter' })
  @IsOptional()
  @IsEnum(LessonType)
  lessonType?: LessonType;

  @ApiPropertyOptional({ enum: LessonStatus, description: 'Status filter' })
  @IsOptional()
  @IsEnum(LessonStatus)
  status?: LessonStatus;

  @ApiPropertyOptional({ description: 'Free lessons only', default: false })
  @IsOptional()
  @IsBoolean()
  freeOnly?: boolean;

  @ApiPropertyOptional({ description: 'Required lessons only', default: false })
  @IsOptional()
  @IsBoolean()
  requiredOnly?: boolean;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Include deleted lessons', default: false })
  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;
}

export class LessonResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  content?: string;

  @ApiProperty({ enum: LessonType })
  lessonType: LessonType;

  @ApiProperty({ enum: LessonStatus })
  status: LessonStatus;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isFree: boolean;

  @ApiProperty()
  orderIndex: number;

  @ApiPropertyOptional()
  duration?: number;

  @ApiPropertyOptional()
  videoUrl?: string;

  @ApiPropertyOptional()
  videoDuration?: number;

  @ApiPropertyOptional()
  videoThumbnail?: string;

  @ApiPropertyOptional()
  audioUrl?: string;

  @ApiPropertyOptional()
  documentUrl?: string;

  @ApiPropertyOptional()
  externalUrl?: string;

  @ApiPropertyOptional({ type: [AttachmentDto] })
  attachments?: AttachmentDto[];

  @ApiPropertyOptional()
  interactiveContent?: Record<string, any>;

  @ApiPropertyOptional({ type: [QuizQuestionDto] })
  quizQuestions?: QuizQuestionDto[];

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  transcript?: string;

  @ApiPropertyOptional({ type: [String] })
  keywords?: string[];

  @ApiPropertyOptional({ type: [ResourceDto] })
  resources?: ResourceDto[];

  @ApiProperty()
  isRequired: boolean;

  @ApiProperty()
  minCompletionPercentage: number;

  @ApiProperty()
  pointsReward: number;

  @ApiPropertyOptional()
  publishedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  courseId: string;

  // Virtual properties
  @ApiProperty()
  isPublished: boolean;

  @ApiProperty()
  isDraft: boolean;

  @ApiProperty()
  isVideo: boolean;

  @ApiProperty()
  isQuiz: boolean;

  @ApiProperty()
  hasVideo: boolean;

  @ApiProperty()
  hasAudio: boolean;

  @ApiProperty()
  hasDocument: boolean;

  @ApiProperty()
  hasAttachments: boolean;

  @ApiProperty()
  hasResources: boolean;

  @ApiProperty()
  estimatedReadingTime: number;

  @ApiProperty()
  totalDuration: number;

  @ApiProperty()
  formattedDuration: string;

  @ApiProperty()
  hasQuiz: boolean;

  @ApiProperty()
  totalQuizPoints: number;
}

export class UpdateLessonProgressDto {
  @ApiProperty({ description: 'Completion percentage (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  completionPercentage: number;

  @ApiPropertyOptional({ description: 'Time spent in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;

  @ApiPropertyOptional({ description: 'Video progress in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  videoProgress?: number;

  @ApiPropertyOptional({ description: 'User notes' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notes?: string;
}

export class SubmitQuizDto {
  @ApiProperty({ description: 'Quiz answers' })
  @IsObject()
  answers: Record<string, any>;
}

export class AddBookmarkDto {
  @ApiProperty({ description: 'Timestamp for bookmark in seconds' })
  @IsNumber()
  @Min(0)
  timestamp: number;

  @ApiPropertyOptional({ description: 'Optional bookmark note' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  note?: string;
}