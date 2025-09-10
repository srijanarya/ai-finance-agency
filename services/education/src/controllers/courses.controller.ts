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
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CoursesService } from '../services/courses.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../decorators/public.decorator';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseQueryDto,
  CourseResponseDto,
  CourseStatsDto,
  EnrollCourseDto,
  RateCourseDto,
  PublishCourseDto,
} from '../dto/course.dto';

@ApiTags('courses')
@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    type: CourseResponseDto,
  })
  @ApiBearerAuth()
  async create(
    @Body(ValidationPipe) createCourseDto: CreateCourseDto,
  ): Promise<CourseResponseDto> {
    return await this.coursesService.create(createCourseDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all courses with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Courses retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        courses: {
          type: 'array',
          items: { $ref: '#/components/schemas/CourseResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async findAll(@Query(ValidationPipe) query: CourseQueryDto) {
    return await this.coursesService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get course statistics' })
  @ApiResponse({
    status: 200,
    description: 'Course statistics retrieved successfully',
    type: CourseStatsDto,
  })
  @ApiBearerAuth()
  async getStats(): Promise<CourseStatsDto> {
    return await this.coursesService.getStats();
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search courses by term' })
  @ApiQuery({ name: 'q', description: 'Search term' })
  @ApiQuery({ name: 'limit', description: 'Number of results', required: false })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: [CourseResponseDto],
  })
  async search(
    @Query('q') searchTerm: string,
    @Query('limit') limit?: number,
  ): Promise<CourseResponseDto[]> {
    return await this.coursesService.searchCourses(searchTerm, limit);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get recommended courses for user' })
  @ApiQuery({ name: 'limit', description: 'Number of recommendations', required: false })
  @ApiResponse({
    status: 200,
    description: 'Recommendations retrieved successfully',
    type: [CourseResponseDto],
  })
  @ApiBearerAuth()
  async getRecommendations(
    @Request() req,
    @Query('limit') limit?: number,
  ): Promise<CourseResponseDto[]> {
    return await this.coursesService.getRecommendedCourses(req.user.sub, limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course retrieved successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CourseResponseDto> {
    return await this.coursesService.findOne(id);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get course by slug' })
  @ApiParam({ name: 'slug', description: 'Course slug' })
  @ApiResponse({
    status: 200,
    description: 'Course retrieved successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  async findBySlug(@Param('slug') slug: string): Promise<CourseResponseDto> {
    return await this.coursesService.findBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiBearerAuth()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateCourseDto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    return await this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 204,
    description: 'Course deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.coursesService.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore deleted course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course restored successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiBearerAuth()
  async restore(@Param('id', ParseUUIDPipe) id: string): Promise<CourseResponseDto> {
    return await this.coursesService.restore(id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course published successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Course cannot be published',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiBearerAuth()
  async publish(@Param('id', ParseUUIDPipe) id: string): Promise<CourseResponseDto> {
    return await this.coursesService.publish(id);
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course unpublished successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiBearerAuth()
  async unpublish(@Param('id', ParseUUIDPipe) id: string): Promise<CourseResponseDto> {
    return await this.coursesService.unpublish(id);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course archived successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiBearerAuth()
  async archive(@Param('id', ParseUUIDPipe) id: string): Promise<CourseResponseDto> {
    return await this.coursesService.archive(id);
  }

  @Post(':id/feature')
  @ApiOperation({ summary: 'Feature course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course featured successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiBearerAuth()
  async feature(@Param('id', ParseUUIDPipe) id: string): Promise<CourseResponseDto> {
    return await this.coursesService.feature(id);
  }

  @Post(':id/unfeature')
  @ApiOperation({ summary: 'Unfeature course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course unfeatured successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiBearerAuth()
  async unfeature(@Param('id', ParseUUIDPipe) id: string): Promise<CourseResponseDto> {
    return await this.coursesService.unfeature(id);
  }

  @Post(':id/discount')
  @ApiOperation({ summary: 'Set course discount' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Discount set successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid discount parameters',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiBearerAuth()
  async setDiscount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { discountPrice: number; expiresAt: Date },
  ): Promise<CourseResponseDto> {
    return await this.coursesService.setDiscount(id, body.discountPrice, body.expiresAt);
  }

  @Delete(':id/discount')
  @ApiOperation({ summary: 'Remove course discount' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Discount removed successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiBearerAuth()
  async removeDiscount(@Param('id', ParseUUIDPipe) id: string): Promise<CourseResponseDto> {
    return await this.coursesService.removeDiscount(id);
  }

  @Post('enroll')
  @ApiOperation({ summary: 'Enroll in a course' })
  @ApiResponse({
    status: 201,
    description: 'Enrolled successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        progressId: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot enroll in course',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Already enrolled',
  })
  @ApiBearerAuth()
  async enroll(
    @Request() req,
    @Body(ValidationPipe) enrollDto: EnrollCourseDto,
  ) {
    const progress = await this.coursesService.enroll(req.user.sub, enrollDto.courseId);
    return {
      message: 'Enrolled successfully',
      progressId: progress.id,
    };
  }

  @Post(':id/rate')
  @ApiOperation({ summary: 'Rate a course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course rated successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiBearerAuth()
  async rateCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) rateDto: RateCourseDto,
  ): Promise<CourseResponseDto> {
    return await this.coursesService.updateRating(id, rateDto.rating);
  }
}