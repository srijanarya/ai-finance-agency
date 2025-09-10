import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
import { Course, CourseStatus } from '../entities/course.entity';
import { Category } from '../entities/category.entity';
import { UserProgress } from '../entities/user-progress.entity';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto, CourseStatsDto } from '../dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(UserProgress)
    private progressRepository: Repository<UserProgress>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    // Verify category exists
    const category = await this.categoryRepository.findOne({
      where: { id: createCourseDto.categoryId, isActive: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found or inactive');
    }

    // Generate slug from title
    const slug = this.generateSlug(createCourseDto.title);
    
    // Check if slug already exists
    const existingCourse = await this.courseRepository.findOne({
      where: { slug },
    });

    if (existingCourse) {
      throw new ConflictException('Course with this title already exists');
    }

    // Create course
    const course = this.courseRepository.create({
      ...createCourseDto,
      slug,
    });

    return await this.courseRepository.save(course);
  }

  async findAll(query: CourseQueryDto): Promise<{
    courses: Course[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      difficulty,
      courseType,
      status,
      featured,
      free,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      tags,
      minRating,
      maxDuration,
      includeDeleted = false,
    } = query;

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category');

    // Apply filters
    this.applyFilters(queryBuilder, {
      search,
      categoryId,
      difficulty,
      courseType,
      status,
      featured,
      free,
      tags,
      minRating,
      maxDuration,
      includeDeleted,
    });

    // Apply sorting
    this.applySorting(queryBuilder, sortBy, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    const courses = await queryBuilder.getMany();

    return {
      courses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, includeDeleted = false): Promise<Course> {
    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.lessons', 'lessons', 'lessons.isActive = true AND lessons.deletedAt IS NULL')
      .where('course.id = :id', { id });

    if (!includeDeleted) {
      queryBuilder.andWhere('course.deletedAt IS NULL');
    }

    // Order lessons by orderIndex
    queryBuilder.orderBy('lessons.orderIndex', 'ASC');

    const course = await queryBuilder.getOne();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async findBySlug(slug: string): Promise<Course> {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.lessons', 'lessons', 'lessons.isActive = true AND lessons.deletedAt IS NULL')
      .where('course.slug = :slug', { slug })
      .andWhere('course.deletedAt IS NULL')
      .orderBy('lessons.orderIndex', 'ASC')
      .getOne();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);

    // If title is being updated, update slug
    if (updateCourseDto.title && updateCourseDto.title !== course.title) {
      const newSlug = this.generateSlug(updateCourseDto.title);
      
      // Check if new slug already exists
      const existingCourse = await this.courseRepository.findOne({
        where: { slug: newSlug },
      });

      if (existingCourse && existingCourse.id !== id) {
        throw new ConflictException('Course with this title already exists');
      }

      updateCourseDto['slug'] = newSlug;
    }

    // If category is being updated, verify it exists
    if (updateCourseDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateCourseDto.categoryId, isActive: true },
      });

      if (!category) {
        throw new NotFoundException('Category not found or inactive');
      }
    }

    // Update course
    Object.assign(course, updateCourseDto);
    course.updateLastUpdated();

    return await this.courseRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    course.softDelete();
    await this.courseRepository.save(course);
  }

  async restore(id: string): Promise<Course> {
    const course = await this.findOne(id, true);
    course.restore();
    return await this.courseRepository.save(course);
  }

  async publish(id: string): Promise<Course> {
    const course = await this.findOne(id);
    
    // Validate course has required content before publishing
    if (!course.lessons || course.lessons.length === 0) {
      throw new BadRequestException('Course must have at least one lesson before publishing');
    }

    course.publish();
    return await this.courseRepository.save(course);
  }

  async unpublish(id: string): Promise<Course> {
    const course = await this.findOne(id);
    course.unpublish();
    return await this.courseRepository.save(course);
  }

  async archive(id: string): Promise<Course> {
    const course = await this.findOne(id);
    course.archive();
    return await this.courseRepository.save(course);
  }

  async feature(id: string): Promise<Course> {
    const course = await this.findOne(id);
    course.feature();
    return await this.courseRepository.save(course);
  }

  async unfeature(id: string): Promise<Course> {
    const course = await this.findOne(id);
    course.unfeature();
    return await this.courseRepository.save(course);
  }

  async setDiscount(
    id: string,
    discountPrice: number,
    expiresAt: Date,
  ): Promise<Course> {
    const course = await this.findOne(id);
    
    if (!course.price || discountPrice >= course.price) {
      throw new BadRequestException('Discount price must be less than original price');
    }

    course.setDiscount(discountPrice, expiresAt);
    return await this.courseRepository.save(course);
  }

  async removeDiscount(id: string): Promise<Course> {
    const course = await this.findOne(id);
    course.removeDiscount();
    return await this.courseRepository.save(course);
  }

  async enroll(userId: string, courseId: string): Promise<UserProgress> {
    const course = await this.findOne(courseId);

    if (!course.isPublished) {
      throw new BadRequestException('Cannot enroll in unpublished course');
    }

    // Check if already enrolled
    const existingProgress = await this.progressRepository.findOne({
      where: { userId, courseId },
    });

    if (existingProgress) {
      throw new ConflictException('Already enrolled in this course');
    }

    // Create progress record
    const progress = this.progressRepository.create({
      userId,
      courseId,
    });

    await this.progressRepository.save(progress);

    // Update enrollment count
    course.incrementEnrollment();
    await this.courseRepository.save(course);

    return progress;
  }

  async updateRating(courseId: string, rating: number): Promise<Course> {
    const course = await this.findOne(courseId);
    course.updateRating(rating);
    return await this.courseRepository.save(course);
  }

  async getStats(): Promise<CourseStatsDto> {
    const [
      totalCourses,
      publishedCourses,
      draftCourses,
      featuredCourses,
      freeCourses,
      premiumCourses,
      enrollments,
      completions,
      mostPopular,
      recent,
    ] = await Promise.all([
      this.courseRepository.count({ where: { deletedAt: null } }),
      this.courseRepository.count({ where: { status: CourseStatus.PUBLISHED, deletedAt: null } }),
      this.courseRepository.count({ where: { status: CourseStatus.DRAFT, deletedAt: null } }),
      this.courseRepository.count({ where: { isFeatured: true, deletedAt: null } }),
      this.courseRepository
        .createQueryBuilder('course')
        .where('course.deletedAt IS NULL')
        .andWhere('(course.price = 0 OR course.price IS NULL)')
        .getCount(),
      this.courseRepository
        .createQueryBuilder('course')
        .where('course.deletedAt IS NULL')
        .andWhere('course.price > 0')
        .getCount(),
      this.courseRepository
        .createQueryBuilder('course')
        .select('SUM(course.enrollmentCount)', 'total')
        .where('course.deletedAt IS NULL')
        .getRawOne(),
      this.courseRepository
        .createQueryBuilder('course')
        .select('SUM(course.completionCount)', 'total')
        .where('course.deletedAt IS NULL')
        .getRawOne(),
      this.courseRepository
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.category', 'category')
        .where('course.deletedAt IS NULL')
        .andWhere('course.status = :status', { status: CourseStatus.PUBLISHED })
        .orderBy('course.enrollmentCount', 'DESC')
        .take(5)
        .getMany(),
      this.courseRepository
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.category', 'category')
        .where('course.deletedAt IS NULL')
        .orderBy('course.createdAt', 'DESC')
        .take(5)
        .getMany(),
    ]);

    const avgRating = await this.courseRepository
      .createQueryBuilder('course')
      .select('AVG(course.rating)', 'avg')
      .where('course.deletedAt IS NULL')
      .andWhere('course.ratingCount > 0')
      .getRawOne();

    const totalEnrollments = enrollments?.total || 0;
    const totalCompletions = completions?.total || 0;

    return {
      totalCourses,
      publishedCourses,
      draftCourses,
      featuredCourses,
      freeCourses,
      premiumCourses,
      totalEnrollments,
      totalCompletions,
      averageRating: avgRating?.avg ? parseFloat(avgRating.avg) : 0,
      averageCompletionRate: totalEnrollments > 0 ? (totalCompletions / totalEnrollments) * 100 : 0,
      mostPopularCourses: mostPopular,
      recentCourses: recent,
    };
  }

  async searchCourses(searchTerm: string, limit = 10): Promise<Course[]> {
    return await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .where('course.deletedAt IS NULL')
      .andWhere('course.status = :status', { status: CourseStatus.PUBLISHED })
      .andWhere(
        'LOWER(course.title) LIKE LOWER(:search) OR LOWER(course.description) LIKE LOWER(:search) OR LOWER(course.tags) LIKE LOWER(:search)',
        { search: `%${searchTerm}%` },
      )
      .orderBy('course.enrollmentCount', 'DESC')
      .take(limit)
      .getMany();
  }

  async getRecommendedCourses(userId: string, limit = 5): Promise<Course[]> {
    // Get user's enrolled course categories
    const userCategories = await this.progressRepository
      .createQueryBuilder('progress')
      .leftJoin('progress.course', 'course')
      .select('DISTINCT course.categoryId', 'categoryId')
      .where('progress.userId = :userId', { userId })
      .getRawMany();

    const categoryIds = userCategories.map(c => c.categoryId);

    if (categoryIds.length === 0) {
      // If no enrollment history, return popular courses
      return await this.courseRepository
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.category', 'category')
        .where('course.deletedAt IS NULL')
        .andWhere('course.status = :status', { status: CourseStatus.PUBLISHED })
        .orderBy('course.enrollmentCount', 'DESC')
        .take(limit)
        .getMany();
    }

    // Get courses from similar categories that user hasn't enrolled in
    const enrolledCourseIds = await this.progressRepository
      .createQueryBuilder('progress')
      .select('progress.courseId')
      .where('progress.userId = :userId', { userId })
      .getRawMany();

    const enrolledIds = enrolledCourseIds.map(c => c.courseId);

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .where('course.deletedAt IS NULL')
      .andWhere('course.status = :status', { status: CourseStatus.PUBLISHED })
      .andWhere('course.categoryId IN (:...categoryIds)', { categoryIds });

    if (enrolledIds.length > 0) {
      queryBuilder.andWhere('course.id NOT IN (:...enrolledIds)', { enrolledIds });
    }

    return await queryBuilder
      .orderBy('course.rating', 'DESC')
      .addOrderBy('course.enrollmentCount', 'DESC')
      .take(limit)
      .getMany();
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Course>,
    filters: any,
  ): void {
    const {
      search,
      categoryId,
      difficulty,
      courseType,
      status,
      featured,
      free,
      tags,
      minRating,
      maxDuration,
      includeDeleted,
    } = filters;

    if (!includeDeleted) {
      queryBuilder.andWhere('course.deletedAt IS NULL');
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(course.title) LIKE LOWER(:search) OR LOWER(course.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('course.categoryId = :categoryId', { categoryId });
    }

    if (difficulty) {
      queryBuilder.andWhere('course.difficulty = :difficulty', { difficulty });
    }

    if (courseType) {
      queryBuilder.andWhere('course.courseType = :courseType', { courseType });
    }

    if (status) {
      queryBuilder.andWhere('course.status = :status', { status });
    }

    if (featured !== undefined) {
      queryBuilder.andWhere('course.isFeatured = :featured', { featured });
    }

    if (free !== undefined) {
      if (free) {
        queryBuilder.andWhere('(course.price = 0 OR course.price IS NULL)');
      } else {
        queryBuilder.andWhere('course.price > 0');
      }
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('course.tags && :tags', { tags });
    }

    if (minRating) {
      queryBuilder.andWhere('course.rating >= :minRating', { minRating });
    }

    if (maxDuration) {
      queryBuilder.andWhere('course.estimatedDuration <= :maxDuration', { maxDuration });
    }
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Course>,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC',
  ): void {
    const allowedSortFields = [
      'title',
      'createdAt',
      'updatedAt',
      'rating',
      'enrollmentCount',
      'estimatedDuration',
      'price',
    ];

    if (allowedSortFields.includes(sortBy)) {
      queryBuilder.orderBy(`course.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('course.createdAt', 'DESC');
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}