import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Course } from './course.entity';
import { Lesson } from './lesson.entity';

export enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('education_user_progress')
@Unique(['userId', 'courseId'])
@Unique(['userId', 'lessonId'])
@Index(['userId'])
@Index(['courseId'])
@Index(['lessonId'])
@Index(['status'])
@Index(['completedAt'])
@Index(['lastAccessedAt'])
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'course_id', nullable: true })
  courseId?: string;

  @Column({ name: 'lesson_id', nullable: true })
  lessonId?: string;

  @Column({
    type: 'enum',
    enum: ProgressStatus,
    default: ProgressStatus.NOT_STARTED,
  })
  status: ProgressStatus;

  @Column({
    name: 'completion_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  completionPercentage: number;

  @Column({ name: 'time_spent', type: 'integer', default: 0, comment: 'Time spent in seconds' })
  timeSpent: number;

  @Column({ name: 'video_progress', type: 'integer', default: 0, comment: 'Video progress in seconds' })
  videoProgress: number;

  @Column({ name: 'quiz_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  quizScore?: number;

  @Column({ name: 'quiz_attempts', type: 'integer', default: 0 })
  quizAttempts: number;

  @Column({ name: 'quiz_answers', type: 'jsonb', nullable: true })
  quizAnswers?: Record<string, any>;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'bookmarks', type: 'jsonb', nullable: true })
  bookmarks?: Array<{
    timestamp: number;
    note?: string;
    createdAt: Date;
  }>;

  @Column({ name: 'last_accessed_at', type: 'timestamp', nullable: true })
  lastAccessedAt?: Date;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ name: 'first_completed_at', type: 'timestamp', nullable: true })
  firstCompletedAt?: Date;

  @Column({ name: 'certificate_issued', default: false })
  certificateIssued: boolean;

  @Column({ name: 'certificate_issued_at', type: 'timestamp', nullable: true })
  certificateIssuedAt?: Date;

  @Column({ name: 'points_earned', type: 'integer', default: 0 })
  pointsEarned: number;

  @Column({ name: 'streak_count', type: 'integer', default: 0 })
  streakCount: number;

  @Column({ name: 'last_activity_date', type: 'date', nullable: true })
  lastActivityDate?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Course, (course) => course.userProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course?: Course;

  @ManyToOne(() => Lesson, (lesson) => lesson.userProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson?: Lesson;

  // Virtual properties
  get isCompleted(): boolean {
    return this.status === ProgressStatus.COMPLETED;
  }

  get isInProgress(): boolean {
    return this.status === ProgressStatus.IN_PROGRESS;
  }

  get isNotStarted(): boolean {
    return this.status === ProgressStatus.NOT_STARTED;
  }

  get isFailed(): boolean {
    return this.status === ProgressStatus.FAILED;
  }

  get hasStarted(): boolean {
    return this.startedAt !== null;
  }

  get completionPercentageRounded(): number {
    return Math.round(Number(this.completionPercentage));
  }

  get timeSpentFormatted(): string {
    const hours = Math.floor(this.timeSpent / 3600);
    const minutes = Math.floor((this.timeSpent % 3600) / 60);
    const seconds = this.timeSpent % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  get videoProgressPercentage(): number {
    if (!this.lesson?.videoDuration || this.lesson.videoDuration === 0) return 0;
    return Math.min(100, (this.videoProgress / this.lesson.videoDuration) * 100);
  }

  get daysSinceStarted(): number {
    if (!this.startedAt) return 0;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.startedAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get daysSinceCompleted(): number {
    if (!this.completedAt) return 0;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.completedAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get hasBookmarks(): boolean {
    return this.bookmarks && this.bookmarks.length > 0;
  }

  get quizPassed(): boolean {
    if (!this.quizScore || !this.lesson?.course) return false;
    return this.quizScore >= this.lesson.course.passingScore;
  }

  // Methods
  start(): void {
    if (this.status === ProgressStatus.NOT_STARTED) {
      this.status = ProgressStatus.IN_PROGRESS;
      this.startedAt = new Date();
    }
    this.updateLastAccessed();
  }

  updateProgress(percentage: number, timeSpent?: number): void {
    this.completionPercentage = Math.min(100, Math.max(0, percentage));
    
    if (timeSpent) {
      this.timeSpent += timeSpent;
    }

    if (this.status === ProgressStatus.NOT_STARTED) {
      this.start();
    } else if (this.status !== ProgressStatus.COMPLETED) {
      this.status = ProgressStatus.IN_PROGRESS;
    }

    this.updateLastAccessed();
  }

  complete(): void {
    this.status = ProgressStatus.COMPLETED;
    this.completionPercentage = 100;
    this.completedAt = new Date();

    if (!this.firstCompletedAt) {
      this.firstCompletedAt = new Date();
    }

    this.updateLastAccessed();
    this.updateStreak();
  }

  fail(): void {
    this.status = ProgressStatus.FAILED;
    this.updateLastAccessed();
  }

  reset(): void {
    this.status = ProgressStatus.NOT_STARTED;
    this.completionPercentage = 0;
    this.timeSpent = 0;
    this.videoProgress = 0;
    this.quizScore = null;
    this.quizAttempts = 0;
    this.quizAnswers = null;
    this.completedAt = null;
    this.certificateIssued = false;
    this.certificateIssuedAt = null;
    this.pointsEarned = 0;
    this.updateLastAccessed();
  }

  updateVideoProgress(progress: number): void {
    this.videoProgress = Math.max(0, progress);
    
    // Auto-update lesson progress based on video progress
    if (this.lesson?.videoDuration) {
      const progressPercentage = (progress / this.lesson.videoDuration) * 100;
      this.updateProgress(progressPercentage);
    }
  }

  updateQuizScore(score: number, answers?: Record<string, any>): void {
    this.quizScore = score;
    this.quizAttempts += 1;
    
    if (answers) {
      this.quizAnswers = answers;
    }

    // Check if passed and complete if necessary
    if (this.quizPassed && this.lesson) {
      const requiredPercentage = this.lesson.minCompletionPercentage || 80;
      if (score >= requiredPercentage) {
        this.complete();
      }
    }

    this.updateLastAccessed();
  }

  addBookmark(timestamp: number, note?: string): void {
    if (!this.bookmarks) {
      this.bookmarks = [];
    }

    this.bookmarks.push({
      timestamp,
      note,
      createdAt: new Date(),
    });
  }

  removeBookmark(timestamp: number): void {
    if (this.bookmarks) {
      this.bookmarks = this.bookmarks.filter(b => b.timestamp !== timestamp);
    }
  }

  updateNotes(notes: string): void {
    this.notes = notes;
    this.updateLastAccessed();
  }

  awardPoints(points: number): void {
    this.pointsEarned += points;
  }

  issueCertificate(): void {
    if (this.isCompleted) {
      this.certificateIssued = true;
      this.certificateIssuedAt = new Date();
    }
  }

  private updateLastAccessed(): void {
    this.lastAccessedAt = new Date();
    this.lastActivityDate = new Date();
  }

  private updateStreak(): void {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (this.lastActivityDate) {
      const lastActivity = new Date(this.lastActivityDate);
      
      // If last activity was yesterday, increment streak
      if (this.isSameDate(lastActivity, yesterday)) {
        this.streakCount += 1;
      }
      // If last activity was not today and not yesterday, reset streak
      else if (!this.isSameDate(lastActivity, today)) {
        this.streakCount = 1;
      }
    } else {
      this.streakCount = 1;
    }
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // Static methods for aggregation
  static calculateCourseProgress(lessonProgresses: UserProgress[]): {
    completionPercentage: number;
    totalTimeSpent: number;
    completedLessons: number;
    totalLessons: number;
    status: ProgressStatus;
  } {
    const totalLessons = lessonProgresses.length;
    const completedLessons = lessonProgresses.filter(p => p.isCompleted).length;
    const totalTimeSpent = lessonProgresses.reduce((sum, p) => sum + p.timeSpent, 0);
    
    let completionPercentage = 0;
    if (totalLessons > 0) {
      completionPercentage = (completedLessons / totalLessons) * 100;
    }

    let status = ProgressStatus.NOT_STARTED;
    if (completedLessons === totalLessons && totalLessons > 0) {
      status = ProgressStatus.COMPLETED;
    } else if (completedLessons > 0 || lessonProgresses.some(p => p.isInProgress)) {
      status = ProgressStatus.IN_PROGRESS;
    }

    return {
      completionPercentage,
      totalTimeSpent,
      completedLessons,
      totalLessons,
      status,
    };
  }
}