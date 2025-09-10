import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  Min,
  Max,
  Length,
  IsObject,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProgressStatus } from '../entities/user-progress.entity';

export class BookmarkDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  timestamp: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty()
  createdAt: Date;
}

export class UpdateProgressDto {
  @ApiProperty({ description: 'Completion percentage (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  completionPercentage: number;

  @ApiPropertyOptional({ description: 'Additional time spent in seconds' })
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

export class ProgressResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  courseId?: string;

  @ApiPropertyOptional()
  lessonId?: string;

  @ApiProperty({ enum: ProgressStatus })
  status: ProgressStatus;

  @ApiProperty()
  completionPercentage: number;

  @ApiProperty()
  timeSpent: number;

  @ApiProperty()
  videoProgress: number;

  @ApiPropertyOptional()
  quizScore?: number;

  @ApiProperty()
  quizAttempts: number;

  @ApiPropertyOptional()
  quizAnswers?: Record<string, any>;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional({ type: [BookmarkDto] })
  bookmarks?: BookmarkDto[];

  @ApiPropertyOptional()
  lastAccessedAt?: Date;

  @ApiPropertyOptional()
  startedAt?: Date;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiPropertyOptional()
  firstCompletedAt?: Date;

  @ApiProperty()
  certificateIssued: boolean;

  @ApiPropertyOptional()
  certificateIssuedAt?: Date;

  @ApiProperty()
  pointsEarned: number;

  @ApiProperty()
  streakCount: number;

  @ApiPropertyOptional()
  lastActivityDate?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Virtual properties
  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty()
  isInProgress: boolean;

  @ApiProperty()
  isNotStarted: boolean;

  @ApiProperty()
  hasStarted: boolean;

  @ApiProperty()
  completionPercentageRounded: number;

  @ApiProperty()
  timeSpentFormatted: string;

  @ApiProperty()
  videoProgressPercentage: number;

  @ApiProperty()
  daysSinceStarted: number;

  @ApiProperty()
  daysSinceCompleted: number;

  @ApiProperty()
  hasBookmarks: boolean;

  @ApiProperty()
  quizPassed: boolean;
}

export class CourseProgressSummaryDto {
  @ApiProperty()
  courseId: string;

  @ApiProperty()
  courseTitle: string;

  @ApiProperty()
  completionPercentage: number;

  @ApiProperty()
  totalTimeSpent: number;

  @ApiProperty()
  completedLessons: number;

  @ApiProperty()
  totalLessons: number;

  @ApiProperty({ enum: ProgressStatus })
  status: ProgressStatus;

  @ApiPropertyOptional()
  lastAccessedAt?: Date;

  @ApiPropertyOptional()
  startedAt?: Date;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiProperty()
  certificateIssued: boolean;

  @ApiProperty()
  pointsEarned: number;

  @ApiProperty()
  enrolledAt: Date;
}

export class UserProgressStatsDto {
  @ApiProperty()
  totalCoursesEnrolled: number;

  @ApiProperty()
  coursesCompleted: number;

  @ApiProperty()
  coursesInProgress: number;

  @ApiProperty()
  totalTimeSpent: number;

  @ApiProperty()
  totalPointsEarned: number;

  @ApiProperty()
  certificatesEarned: number;

  @ApiProperty()
  currentStreak: number;

  @ApiProperty()
  longestStreak: number;

  @ApiProperty()
  averageCompletionRate: number;

  @ApiProperty({ type: [CourseProgressSummaryDto] })
  recentActivity: CourseProgressSummaryDto[];

  @ApiProperty({ type: [CourseProgressSummaryDto] })
  completedCourses: CourseProgressSummaryDto[];

  @ApiProperty({ type: [CourseProgressSummaryDto] })
  inProgressCourses: CourseProgressSummaryDto[];
}

export class LessonProgressDto {
  @ApiProperty()
  lessonId: string;

  @ApiProperty()
  lessonTitle: string;

  @ApiProperty({ enum: ProgressStatus })
  status: ProgressStatus;

  @ApiProperty()
  completionPercentage: number;

  @ApiProperty()
  timeSpent: number;

  @ApiPropertyOptional()
  lastAccessedAt?: Date;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiProperty()
  isRequired: boolean;

  @ApiProperty()
  orderIndex: number;
}