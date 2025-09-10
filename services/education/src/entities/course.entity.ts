import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Lesson } from './lesson.entity';
import { UserProgress } from './user-progress.entity';
import { Assessment } from './assessment.entity';
import { Certificate } from './certificate.entity';

export enum CourseDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  COMING_SOON = 'coming_soon',
}

export enum CourseType {
  FREE = 'free',
  PREMIUM = 'premium',
  SUBSCRIPTION = 'subscription',
}

@Entity('education_courses')
@Index(['title'])
@Index(['slug'])
@Index(['status'])
@Index(['difficulty'])
@Index(['courseType'])
@Index(['isActive'])
@Index(['publishedAt'])
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  title: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  shortDescription?: string;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl?: string;

  @Column({ name: 'banner_url', nullable: true })
  bannerUrl?: string;

  @Column({ name: 'trailer_video_url', nullable: true })
  trailerVideoUrl?: string;

  @Column({
    type: 'enum',
    enum: CourseDifficulty,
    default: CourseDifficulty.BEGINNER,
  })
  difficulty: CourseDifficulty;

  @Column({
    name: 'course_type',
    type: 'enum',
    enum: CourseType,
    default: CourseType.FREE,
  })
  courseType: CourseType;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({
    name: 'estimated_duration',
    type: 'integer',
    comment: 'Duration in minutes',
  })
  estimatedDuration: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ name: 'rating_count', default: 0 })
  ratingCount: number;

  @Column({ name: 'enrollment_count', default: 0 })
  enrollmentCount: number;

  @Column({ name: 'completion_count', default: 0 })
  completionCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({ name: 'discount_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountPrice?: number;

  @Column({ name: 'discount_expires_at', type: 'timestamp', nullable: true })
  discountExpiresAt?: Date;

  @Column({ name: 'prerequisites', type: 'simple-array', nullable: true })
  prerequisites?: string[];

  @Column({ name: 'learning_objectives', type: 'simple-array', nullable: true })
  learningObjectives?: string[];

  @Column({ name: 'target_audience', type: 'simple-array', nullable: true })
  targetAudience?: string[];

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ name: 'language', default: 'en' })
  language: string;

  @Column({ name: 'instructor_name', nullable: true })
  instructorName?: string;

  @Column({ name: 'instructor_bio', type: 'text', nullable: true })
  instructorBio?: string;

  @Column({ name: 'instructor_avatar', nullable: true })
  instructorAvatar?: string;

  @Column({ name: 'certificate_enabled', default: true })
  certificateEnabled: boolean;

  @Column({ name: 'certificate_template', nullable: true })
  certificateTemplate?: string;

  @Column({ name: 'passing_score', type: 'integer', default: 70, comment: 'Minimum percentage required to pass' })
  passingScore: number;

  @Column({ name: 'max_attempts', type: 'integer', nullable: true, comment: 'Maximum attempts allowed for assessments' })
  maxAttempts?: number;

  @Column({ name: 'access_duration', type: 'integer', nullable: true, comment: 'Access duration in days after enrollment' })
  accessDuration?: number;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @Column({ name: 'last_updated_at', type: 'timestamp', nullable: true })
  lastUpdatedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  // Relations
  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.courses, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Lesson, (lesson) => lesson.course, { cascade: true })
  lessons: Lesson[];

  @OneToMany(() => UserProgress, (progress) => progress.course)
  userProgress: UserProgress[];

  @OneToMany(() => Assessment, (assessment) => assessment.course, { cascade: true })
  assessments: Assessment[];

  @OneToMany(() => Certificate, (certificate) => certificate.course)
  certificates: Certificate[];

  // Virtual properties
  get isPublished(): boolean {
    return this.status === CourseStatus.PUBLISHED && this.publishedAt <= new Date();
  }

  get isDraft(): boolean {
    return this.status === CourseStatus.DRAFT;
  }

  get isArchived(): boolean {
    return this.status === CourseStatus.ARCHIVED;
  }

  get isComingSoon(): boolean {
    return this.status === CourseStatus.COMING_SOON;
  }

  get isFree(): boolean {
    return this.courseType === CourseType.FREE || (this.price && this.price === 0);
  }

  get isPremium(): boolean {
    return this.courseType === CourseType.PREMIUM;
  }

  get currentPrice(): number {
    if (this.discountPrice && this.discountExpiresAt && this.discountExpiresAt > new Date()) {
      return this.discountPrice;
    }
    return this.price || 0;
  }

  get hasActiveDiscount(): boolean {
    return this.discountPrice !== null && this.discountExpiresAt && this.discountExpiresAt > new Date();
  }

  get discountPercentage(): number {
    if (this.hasActiveDiscount && this.price && this.discountPrice) {
      return Math.round(((this.price - this.discountPrice) / this.price) * 100);
    }
    return 0;
  }

  get completionRate(): number {
    if (this.enrollmentCount === 0) return 0;
    return Math.round((this.completionCount / this.enrollmentCount) * 100);
  }

  get averageRating(): number {
    return Math.round(this.rating * 100) / 100;
  }

  get totalLessons(): number {
    return this.lessons?.length || 0;
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  // Methods
  publish(): void {
    this.status = CourseStatus.PUBLISHED;
    this.publishedAt = new Date();
    this.lastUpdatedAt = new Date();
  }

  unpublish(): void {
    this.status = CourseStatus.DRAFT;
    this.publishedAt = null;
    this.lastUpdatedAt = new Date();
  }

  archive(): void {
    this.status = CourseStatus.ARCHIVED;
    this.lastUpdatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  feature(): void {
    this.isFeatured = true;
  }

  unfeature(): void {
    this.isFeatured = false;
  }

  setDiscount(discountPrice: number, expiresAt: Date): void {
    this.discountPrice = discountPrice;
    this.discountExpiresAt = expiresAt;
  }

  removeDiscount(): void {
    this.discountPrice = null;
    this.discountExpiresAt = null;
  }

  updateRating(newRating: number): void {
    if (this.ratingCount === 0) {
      this.rating = newRating;
      this.ratingCount = 1;
    } else {
      const totalRating = this.rating * this.ratingCount;
      this.ratingCount += 1;
      this.rating = (totalRating + newRating) / this.ratingCount;
    }
  }

  incrementEnrollment(): void {
    this.enrollmentCount += 1;
  }

  incrementCompletion(): void {
    this.completionCount += 1;
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.isActive = false;
  }

  restore(): void {
    this.deletedAt = null;
    this.isActive = true;
  }

  updateLastUpdated(): void {
    this.lastUpdatedAt = new Date();
  }

  addTag(tag: string): void {
    if (!this.tags) {
      this.tags = [];
    }
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    if (this.tags) {
      this.tags = this.tags.filter(t => t !== tag);
    }
  }

  addLearningObjective(objective: string): void {
    if (!this.learningObjectives) {
      this.learningObjectives = [];
    }
    if (!this.learningObjectives.includes(objective)) {
      this.learningObjectives.push(objective);
    }
  }

  addPrerequisite(prerequisite: string): void {
    if (!this.prerequisites) {
      this.prerequisites = [];
    }
    if (!this.prerequisites.includes(prerequisite)) {
      this.prerequisites.push(prerequisite);
    }
  }
}