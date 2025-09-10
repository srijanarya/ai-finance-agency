import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProgressService } from '../services/progress.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  UpdateProgressDto,
  ProgressResponseDto,
  UserProgressStatsDto,
  CourseProgressSummaryDto,
  LessonProgressDto,
} from '../dto/progress.dto';
import { SubmitQuizDto, AddBookmarkDto } from '../dto/lesson.dto';

@ApiTags('progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get user progress statistics' })
  @ApiResponse({
    status: 200,
    description: 'User progress statistics retrieved successfully',
    type: UserProgressStatsDto,
  })
  async getUserStats(@Request() req): Promise<UserProgressStatsDto> {
    return await this.progressService.getUserStats(req.user.sub);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get user progress for a specific course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course progress retrieved successfully',
    type: ProgressResponseDto,
  })
  async getCourseProgress(
    @Request() req,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ): Promise<ProgressResponseDto> {
    return await this.progressService.getUserCourseProgress(req.user.sub, courseId);
  }

  @Get('course/:courseId/summary')
  @ApiOperation({ summary: 'Get course progress summary' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course progress summary retrieved successfully',
    type: CourseProgressSummaryDto,
  })
  async getCourseProgressSummary(
    @Request() req,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ): Promise<CourseProgressSummaryDto> {
    return await this.progressService.getCourseProgressSummary(req.user.sub, courseId);
  }

  @Get('course/:courseId/lessons')
  @ApiOperation({ summary: 'Get lesson progress for a course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson progress retrieved successfully',
    type: [LessonProgressDto],
  })
  async getLessonProgress(
    @Request() req,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ): Promise<LessonProgressDto[]> {
    return await this.progressService.getLessonProgress(req.user.sub, courseId);
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Get user progress for a specific lesson' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson progress retrieved successfully',
    type: ProgressResponseDto,
  })
  async getLessonProgress(
    @Request() req,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
  ): Promise<ProgressResponseDto> {
    return await this.progressService.getUserLessonProgress(req.user.sub, lessonId);
  }

  @Patch('course/:courseId')
  @ApiOperation({ summary: 'Update course progress' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course progress updated successfully',
    type: ProgressResponseDto,
  })
  async updateCourseProgress(
    @Request() req,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body(ValidationPipe) updateDto: UpdateProgressDto,
  ): Promise<ProgressResponseDto> {
    return await this.progressService.updateCourseProgress(
      req.user.sub,
      courseId,
      updateDto,
    );
  }

  @Patch('lesson/:lessonId')
  @ApiOperation({ summary: 'Update lesson progress' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson progress updated successfully',
    type: ProgressResponseDto,
  })
  async updateLessonProgress(
    @Request() req,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body(ValidationPipe) updateDto: UpdateProgressDto,
  ): Promise<ProgressResponseDto> {
    return await this.progressService.updateLessonProgress(
      req.user.sub,
      lessonId,
      updateDto,
    );
  }

  @Post('lesson/:lessonId/quiz')
  @ApiOperation({ summary: 'Submit quiz for a lesson' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'Quiz submitted successfully',
    schema: {
      type: 'object',
      properties: {
        progress: { $ref: '#/components/schemas/ProgressResponseDto' },
        score: { type: 'number' },
        passed: { type: 'boolean' },
      },
    },
  })
  async submitQuiz(
    @Request() req,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body(ValidationPipe) quizDto: SubmitQuizDto,
  ) {
    return await this.progressService.submitQuiz(
      req.user.sub,
      lessonId,
      quizDto.answers,
    );
  }

  @Post('lesson/:lessonId/bookmark')
  @ApiOperation({ summary: 'Add bookmark to a lesson' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'Bookmark added successfully',
    type: ProgressResponseDto,
  })
  async addBookmark(
    @Request() req,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body(ValidationPipe) bookmarkDto: AddBookmarkDto,
  ): Promise<ProgressResponseDto> {
    return await this.progressService.addBookmark(
      req.user.sub,
      lessonId,
      bookmarkDto.timestamp,
      bookmarkDto.note,
    );
  }

  @Delete('lesson/:lessonId/bookmark/:timestamp')
  @ApiOperation({ summary: 'Remove bookmark from a lesson' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiParam({ name: 'timestamp', description: 'Bookmark timestamp' })
  @ApiResponse({
    status: 200,
    description: 'Bookmark removed successfully',
    type: ProgressResponseDto,
  })
  async removeBookmark(
    @Request() req,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Param('timestamp') timestamp: number,
  ): Promise<ProgressResponseDto> {
    return await this.progressService.removeBookmark(
      req.user.sub,
      lessonId,
      timestamp,
    );
  }

  @Delete('course/:courseId/reset')
  @ApiOperation({ summary: 'Reset course progress' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({
    status: 204,
    description: 'Course progress reset successfully',
  })
  async resetCourseProgress(
    @Request() req,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ): Promise<void> {
    return await this.progressService.resetCourseProgress(req.user.sub, courseId);
  }
}