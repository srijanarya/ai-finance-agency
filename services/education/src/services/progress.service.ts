import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProgress, ProgressStatus } from '../entities/user-progress.entity';
import { Course } from '../entities/course.entity';
import { Lesson } from '../entities/lesson.entity';
import { Certificate } from '../entities/certificate.entity';
import {
  UpdateProgressDto,
  UserProgressStatsDto,
  CourseProgressSummaryDto,
  LessonProgressDto,
} from '../dto/progress.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(UserProgress)
    private progressRepository: Repository<UserProgress>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
  ) {}

  async getUserCourseProgress(userId: string, courseId: string): Promise<UserProgress> {
    let progress = await this.progressRepository.findOne({
      where: { userId, courseId },
      relations: ['course'],
    });

    if (!progress) {
      // Auto-create progress record when user first accesses course
      const course = await this.courseRepository.findOne({
        where: { id: courseId },
      });

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      progress = this.progressRepository.create({
        userId,
        courseId,
      });

      progress = await this.progressRepository.save(progress);
      progress.course = course;
    }

    return progress;
  }

  async getUserLessonProgress(userId: string, lessonId: string): Promise<UserProgress> {
    let progress = await this.progressRepository.findOne({
      where: { userId, lessonId },
      relations: ['lesson', 'lesson.course'],
    });

    if (!progress) {
      const lesson = await this.lessonRepository.findOne({
        where: { id: lessonId },
        relations: ['course'],
      });

      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }

      progress = this.progressRepository.create({
        userId,
        lessonId,
        courseId: lesson.courseId,
      });

      progress = await this.progressRepository.save(progress);
      progress.lesson = lesson;
    }

    return progress;
  }

  async updateCourseProgress(
    userId: string,
    courseId: string,
    updateDto: UpdateProgressDto,
  ): Promise<UserProgress> {
    const progress = await this.getUserCourseProgress(userId, courseId);
    
    progress.updateProgress(updateDto.completionPercentage, updateDto.timeSpent);
    
    if (updateDto.notes) {
      progress.updateNotes(updateDto.notes);
    }

    // Check if course should be completed
    if (updateDto.completionPercentage >= 100) {
      await this.checkAndCompleteCourse(userId, courseId);
    }

    return await this.progressRepository.save(progress);
  }

  async updateLessonProgress(
    userId: string,
    lessonId: string,
    updateDto: UpdateProgressDto,
  ): Promise<UserProgress> {
    const progress = await this.getUserLessonProgress(userId, lessonId);
    
    progress.updateProgress(updateDto.completionPercentage, updateDto.timeSpent);
    
    if (updateDto.videoProgress !== undefined) {
      progress.updateVideoProgress(updateDto.videoProgress);
    }
    
    if (updateDto.notes) {
      progress.updateNotes(updateDto.notes);
    }

    // Check if lesson should be completed
    if (updateDto.completionPercentage >= (progress.lesson?.minCompletionPercentage || 80)) {
      progress.complete();
      
      // Update course progress
      await this.updateCourseProgressFromLessons(userId, progress.courseId);
    }

    return await this.progressRepository.save(progress);
  }

  async submitQuiz(
    userId: string,
    lessonId: string,
    answers: Record<string, any>,
  ): Promise<{ progress: UserProgress; score: number; passed: boolean }> {
    const progress = await this.getUserLessonProgress(userId, lessonId);
    
    if (!progress.lesson?.hasQuiz) {
      throw new BadRequestException('This lesson does not have a quiz');
    }

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    progress.lesson.quizQuestions.forEach((question) => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];

      if (this.isAnswerCorrect(question, userAnswer)) {
        correctAnswers++;
        earnedPoints += question.points;
      }
    });

    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = percentage >= (progress.lesson.course?.passingScore || 70);

    progress.updateQuizScore(percentage, answers);

    if (passed && percentage >= (progress.lesson.minCompletionPercentage || 80)) {
      progress.complete();
      progress.awardPoints(progress.lesson.pointsReward);
      
      // Update course progress
      await this.updateCourseProgressFromLessons(userId, progress.courseId);
    }

    await this.progressRepository.save(progress);

    return {
      progress,
      score: percentage,
      passed,
    };
  }

  async addBookmark(
    userId: string,
    lessonId: string,
    timestamp: number,
    note?: string,
  ): Promise<UserProgress> {
    const progress = await this.getUserLessonProgress(userId, lessonId);
    progress.addBookmark(timestamp, note);
    return await this.progressRepository.save(progress);
  }

  async removeBookmark(
    userId: string,
    lessonId: string,
    timestamp: number,
  ): Promise<UserProgress> {
    const progress = await this.getUserLessonProgress(userId, lessonId);
    progress.removeBookmark(timestamp);
    return await this.progressRepository.save(progress);
  }

  async getUserStats(userId: string): Promise<UserProgressStatsDto> {
    const courseProgresses = await this.progressRepository.find({
      where: { userId, lessonId: null }, // Only course-level progress
      relations: ['course'],
      order: { updatedAt: 'DESC' },
    });

    const totalCoursesEnrolled = courseProgresses.length;
    const coursesCompleted = courseProgresses.filter(p => p.isCompleted).length;
    const coursesInProgress = courseProgresses.filter(p => p.isInProgress).length;
    
    const totalTimeSpent = courseProgresses.reduce((total, p) => total + p.timeSpent, 0);
    const totalPointsEarned = courseProgresses.reduce((total, p) => total + p.pointsEarned, 0);
    
    const certificatesEarned = await this.certificateRepository.count({
      where: { userId, status: 'issued' },
    });

    const currentStreak = courseProgresses.length > 0 
      ? Math.max(...courseProgresses.map(p => p.streakCount), 0) 
      : 0;

    const averageCompletionRate = totalCoursesEnrolled > 0 
      ? courseProgresses.reduce((total, p) => total + Number(p.completionPercentage), 0) / totalCoursesEnrolled
      : 0;

    return {
      totalCoursesEnrolled,
      coursesCompleted,
      coursesInProgress,
      totalTimeSpent,
      totalPointsEarned,
      certificatesEarned,
      currentStreak,
      longestStreak: currentStreak, // TODO: Implement proper longest streak tracking
      averageCompletionRate,
      recentActivity: await this.getRecentActivity(userId, 5),
      completedCourses: await this.getCompletedCourses(userId, 10),
      inProgressCourses: await this.getInProgressCourses(userId, 10),
    };
  }

  async getCourseProgressSummary(userId: string, courseId: string): Promise<CourseProgressSummaryDto> {
    const courseProgress = await this.progressRepository.findOne({
      where: { userId, courseId, lessonId: null },
      relations: ['course'],
    });

    if (!courseProgress) {
      throw new NotFoundException('Course progress not found');
    }

    const lessonProgresses = await this.progressRepository.find({
      where: { userId, courseId, lessonId: null }, // Changed to NOT null for lesson progress
      relations: ['lesson'],
    });

    const { completionPercentage, totalTimeSpent, completedLessons, totalLessons, status } = 
      UserProgress.calculateCourseProgress(lessonProgresses);

    return {
      courseId,
      courseTitle: courseProgress.course.title,
      completionPercentage,
      totalTimeSpent,
      completedLessons,
      totalLessons,
      status,
      lastAccessedAt: courseProgress.lastAccessedAt,
      startedAt: courseProgress.startedAt,
      completedAt: courseProgress.completedAt,
      certificateIssued: courseProgress.certificateIssued,
      pointsEarned: courseProgress.pointsEarned,
      enrolledAt: courseProgress.createdAt,
    };
  }

  async getLessonProgress(userId: string, courseId: string): Promise<LessonProgressDto[]> {
    const lessonProgresses = await this.progressRepository
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.lesson', 'lesson')
      .where('progress.userId = :userId', { userId })
      .andWhere('progress.courseId = :courseId', { courseId })
      .andWhere('progress.lessonId IS NOT NULL')
      .orderBy('lesson.orderIndex', 'ASC')
      .getMany();

    return lessonProgresses.map(progress => ({
      lessonId: progress.lessonId,
      lessonTitle: progress.lesson.title,
      status: progress.status,
      completionPercentage: Number(progress.completionPercentage),
      timeSpent: progress.timeSpent,
      lastAccessedAt: progress.lastAccessedAt,
      completedAt: progress.completedAt,
      isRequired: progress.lesson.isRequired,
      orderIndex: progress.lesson.orderIndex,
    }));
  }

  async resetCourseProgress(userId: string, courseId: string): Promise<void> {
    const progresses = await this.progressRepository.find({
      where: { userId, courseId },
    });

    for (const progress of progresses) {
      progress.reset();
      await this.progressRepository.save(progress);
    }
  }

  private async updateCourseProgressFromLessons(userId: string, courseId: string): Promise<void> {
    const lessonProgresses = await this.progressRepository.find({
      where: { userId, courseId, lessonId: null }, // Changed to NOT null for lesson progress
      relations: ['lesson'],
    });

    const courseProgress = await this.getUserCourseProgress(userId, courseId);

    const { completionPercentage, totalTimeSpent, status } = 
      UserProgress.calculateCourseProgress(lessonProgresses);

    courseProgress.completionPercentage = completionPercentage;
    courseProgress.timeSpent = totalTimeSpent;
    courseProgress.status = status;

    if (status === ProgressStatus.COMPLETED && !courseProgress.isCompleted) {
      courseProgress.complete();
      await this.checkAndIssueCertificate(userId, courseId);
    }

    await this.progressRepository.save(courseProgress);
  }

  private async checkAndCompleteCourse(userId: string, courseId: string): Promise<void> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) return;

    const courseProgress = await this.getUserCourseProgress(userId, courseId);
    
    if (!courseProgress.isCompleted) {
      courseProgress.complete();
      course.incrementCompletion();
      
      await Promise.all([
        this.progressRepository.save(courseProgress),
        this.courseRepository.save(course),
      ]);

      await this.checkAndIssueCertificate(userId, courseId);
    }
  }

  private async checkAndIssueCertificate(userId: string, courseId: string): Promise<void> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course?.certificateEnabled) return;

    const existingCertificate = await this.certificateRepository.findOne({
      where: { userId, courseId },
    });

    if (existingCertificate) return;

    const progress = await this.getUserCourseProgress(userId, courseId);
    progress.issueCertificate();
    await this.progressRepository.save(progress);

    // Certificate issuance logic would be handled by CertificatesService
  }

  private async getRecentActivity(userId: string, limit: number): Promise<CourseProgressSummaryDto[]> {
    const progresses = await this.progressRepository.find({
      where: { userId, lessonId: null },
      relations: ['course'],
      order: { lastAccessedAt: 'DESC' },
      take: limit,
    });

    return progresses.map(progress => ({
      courseId: progress.courseId,
      courseTitle: progress.course.title,
      completionPercentage: Number(progress.completionPercentage),
      totalTimeSpent: progress.timeSpent,
      completedLessons: 0, // Would need to calculate
      totalLessons: 0, // Would need to calculate
      status: progress.status,
      lastAccessedAt: progress.lastAccessedAt,
      startedAt: progress.startedAt,
      completedAt: progress.completedAt,
      certificateIssued: progress.certificateIssued,
      pointsEarned: progress.pointsEarned,
      enrolledAt: progress.createdAt,
    }));
  }

  private async getCompletedCourses(userId: string, limit: number): Promise<CourseProgressSummaryDto[]> {
    const progresses = await this.progressRepository.find({
      where: { userId, lessonId: null, status: ProgressStatus.COMPLETED },
      relations: ['course'],
      order: { completedAt: 'DESC' },
      take: limit,
    });

    return progresses.map(progress => ({
      courseId: progress.courseId,
      courseTitle: progress.course.title,
      completionPercentage: Number(progress.completionPercentage),
      totalTimeSpent: progress.timeSpent,
      completedLessons: 0, // Would need to calculate
      totalLessons: 0, // Would need to calculate
      status: progress.status,
      lastAccessedAt: progress.lastAccessedAt,
      startedAt: progress.startedAt,
      completedAt: progress.completedAt,
      certificateIssued: progress.certificateIssued,
      pointsEarned: progress.pointsEarned,
      enrolledAt: progress.createdAt,
    }));
  }

  private async getInProgressCourses(userId: string, limit: number): Promise<CourseProgressSummaryDto[]> {
    const progresses = await this.progressRepository.find({
      where: { userId, lessonId: null, status: ProgressStatus.IN_PROGRESS },
      relations: ['course'],
      order: { lastAccessedAt: 'DESC' },
      take: limit,
    });

    return progresses.map(progress => ({
      courseId: progress.courseId,
      courseTitle: progress.course.title,
      completionPercentage: Number(progress.completionPercentage),
      totalTimeSpent: progress.timeSpent,
      completedLessons: 0, // Would need to calculate
      totalLessons: 0, // Would need to calculate
      status: progress.status,
      lastAccessedAt: progress.lastAccessedAt,
      startedAt: progress.startedAt,
      completedAt: progress.completedAt,
      certificateIssued: progress.certificateIssued,
      pointsEarned: progress.pointsEarned,
      enrolledAt: progress.createdAt,
    }));
  }

  private isAnswerCorrect(question: any, userAnswer: any): boolean {
    if (!userAnswer) return false;

    switch (question.type) {
      case 'multiple_choice':
      case 'true_false':
        return userAnswer === question.correct_answer;

      case 'text':
        if (Array.isArray(question.correct_answer)) {
          return question.correct_answer.some((correct: string) => 
            userAnswer.toLowerCase().trim() === correct.toLowerCase().trim()
          );
        }
        return userAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();

      default:
        return false;
    }
  }
}