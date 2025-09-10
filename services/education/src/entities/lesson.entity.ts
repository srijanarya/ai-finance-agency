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
import { Course } from './course.entity';
import { UserProgress } from './user-progress.entity';

export enum LessonType {
  VIDEO = 'video',
  TEXT = 'text',
  QUIZ = 'quiz',
  DOCUMENT = 'document',
  INTERACTIVE = 'interactive',
  EXTERNAL_LINK = 'external_link',
}

export enum LessonStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('education_lessons')
@Index(['title'])
@Index(['status'])
@Index(['lessonType'])
@Index(['isActive'])
@Index(['courseId'])
@Index(['orderIndex'])
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  title: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({
    name: 'lesson_type',
    type: 'enum',
    enum: LessonType,
    default: LessonType.TEXT,
  })
  lessonType: LessonType;

  @Column({
    type: 'enum',
    enum: LessonStatus,
    default: LessonStatus.DRAFT,
  })
  status: LessonStatus;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_free', default: false })
  isFree: boolean;

  @Column({ name: 'order_index', type: 'integer' })
  orderIndex: number;

  @Column({
    type: 'integer',
    comment: 'Duration in seconds',
    nullable: true,
  })
  duration?: number;

  @Column({ name: 'video_url', nullable: true })
  videoUrl?: string;

  @Column({ name: 'video_duration', type: 'integer', nullable: true, comment: 'Video duration in seconds' })
  videoDuration?: number;

  @Column({ name: 'video_thumbnail', nullable: true })
  videoThumbnail?: string;

  @Column({ name: 'audio_url', nullable: true })
  audioUrl?: string;

  @Column({ name: 'document_url', nullable: true })
  documentUrl?: string;

  @Column({ name: 'external_url', nullable: true })
  externalUrl?: string;

  @Column({ name: 'attachments', type: 'jsonb', nullable: true })
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;

  @Column({ name: 'interactive_content', type: 'jsonb', nullable: true })
  interactiveContent?: Record<string, any>;

  @Column({ name: 'quiz_questions', type: 'jsonb', nullable: true })
  quizQuestions?: Array<{
    id: string;
    question: string;
    type: 'multiple_choice' | 'true_false' | 'text';
    options?: string[];
    correct_answer: string | string[];
    explanation?: string;
    points: number;
  }>;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'transcript', type: 'text', nullable: true })
  transcript?: string;

  @Column({ name: 'keywords', type: 'simple-array', nullable: true })
  keywords?: string[];

  @Column({ name: 'resources', type: 'jsonb', nullable: true })
  resources?: Array<{
    title: string;
    url: string;
    type: string;
    description?: string;
  }>;

  @Column({ name: 'is_required', default: true })
  isRequired: boolean;

  @Column({ name: 'min_completion_percentage', type: 'integer', default: 80, comment: 'Minimum percentage to mark as completed' })
  minCompletionPercentage: number;

  @Column({ name: 'points_reward', type: 'integer', default: 0 })
  pointsReward: number;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  // Relations
  @Column({ name: 'course_id' })
  courseId: string;

  @ManyToOne(() => Course, (course) => course.lessons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => UserProgress, (progress) => progress.lesson)
  userProgress: UserProgress[];

  // Virtual properties
  get isPublished(): boolean {
    return this.status === LessonStatus.PUBLISHED && this.publishedAt && this.publishedAt <= new Date();
  }

  get isDraft(): boolean {
    return this.status === LessonStatus.DRAFT;
  }

  get isArchived(): boolean {
    return this.status === LessonStatus.ARCHIVED;
  }

  get isVideo(): boolean {
    return this.lessonType === LessonType.VIDEO;
  }

  get isQuiz(): boolean {
    return this.lessonType === LessonType.QUIZ;
  }

  get isInteractive(): boolean {
    return this.lessonType === LessonType.INTERACTIVE;
  }

  get hasVideo(): boolean {
    return this.videoUrl !== null && this.videoUrl !== undefined;
  }

  get hasAudio(): boolean {
    return this.audioUrl !== null && this.audioUrl !== undefined;
  }

  get hasDocument(): boolean {
    return this.documentUrl !== null && this.documentUrl !== undefined;
  }

  get hasAttachments(): boolean {
    return this.attachments && this.attachments.length > 0;
  }

  get hasResources(): boolean {
    return this.resources && this.resources.length > 0;
  }

  get estimatedReadingTime(): number {
    if (!this.content) return 0;
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  get totalDuration(): number {
    let total = 0;
    
    if (this.videoDuration) {
      total += this.videoDuration;
    }
    
    if (this.duration) {
      total += this.duration;
    } else if (this.content && this.lessonType === LessonType.TEXT) {
      total += this.estimatedReadingTime * 60; // Convert to seconds
    }
    
    return total;
  }

  get formattedDuration(): string {
    const seconds = this.totalDuration;
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  get hasQuiz(): boolean {
    return this.quizQuestions && this.quizQuestions.length > 0;
  }

  get totalQuizPoints(): number {
    if (!this.hasQuiz) return 0;
    return this.quizQuestions.reduce((total, q) => total + q.points, 0);
  }

  // Methods
  publish(): void {
    this.status = LessonStatus.PUBLISHED;
    this.publishedAt = new Date();
  }

  unpublish(): void {
    this.status = LessonStatus.DRAFT;
    this.publishedAt = null;
  }

  archive(): void {
    this.status = LessonStatus.ARCHIVED;
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  makeRequired(): void {
    this.isRequired = true;
  }

  makeOptional(): void {
    this.isRequired = false;
  }

  setFree(): void {
    this.isFree = true;
  }

  setPremium(): void {
    this.isFree = false;
  }

  updateOrder(newOrder: number): void {
    this.orderIndex = newOrder;
  }

  setVideoDuration(duration: number): void {
    this.videoDuration = duration;
    if (this.lessonType === LessonType.VIDEO) {
      this.duration = duration;
    }
  }

  addAttachment(attachment: { name: string; url: string; type: string; size: number }): void {
    if (!this.attachments) {
      this.attachments = [];
    }
    this.attachments.push(attachment);
  }

  removeAttachment(attachmentUrl: string): void {
    if (this.attachments) {
      this.attachments = this.attachments.filter(a => a.url !== attachmentUrl);
    }
  }

  addResource(resource: { title: string; url: string; type: string; description?: string }): void {
    if (!this.resources) {
      this.resources = [];
    }
    this.resources.push(resource);
  }

  removeResource(resourceUrl: string): void {
    if (this.resources) {
      this.resources = this.resources.filter(r => r.url !== resourceUrl);
    }
  }

  addQuizQuestion(question: {
    id: string;
    question: string;
    type: 'multiple_choice' | 'true_false' | 'text';
    options?: string[];
    correct_answer: string | string[];
    explanation?: string;
    points: number;
  }): void {
    if (!this.quizQuestions) {
      this.quizQuestions = [];
    }
    this.quizQuestions.push(question);
  }

  removeQuizQuestion(questionId: string): void {
    if (this.quizQuestions) {
      this.quizQuestions = this.quizQuestions.filter(q => q.id !== questionId);
    }
  }

  addKeyword(keyword: string): void {
    if (!this.keywords) {
      this.keywords = [];
    }
    if (!this.keywords.includes(keyword)) {
      this.keywords.push(keyword);
    }
  }

  removeKeyword(keyword: string): void {
    if (this.keywords) {
      this.keywords = this.keywords.filter(k => k !== keyword);
    }
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.isActive = false;
  }

  restore(): void {
    this.deletedAt = null;
    this.isActive = true;
  }

  clone(courseId: string, orderIndex?: number): Partial<Lesson> {
    return {
      title: `${this.title} (Copy)`,
      description: this.description,
      content: this.content,
      lessonType: this.lessonType,
      status: LessonStatus.DRAFT,
      orderIndex: orderIndex || this.orderIndex,
      duration: this.duration,
      videoUrl: this.videoUrl,
      videoDuration: this.videoDuration,
      videoThumbnail: this.videoThumbnail,
      audioUrl: this.audioUrl,
      documentUrl: this.documentUrl,
      externalUrl: this.externalUrl,
      attachments: this.attachments,
      interactiveContent: this.interactiveContent,
      quizQuestions: this.quizQuestions,
      notes: this.notes,
      transcript: this.transcript,
      keywords: this.keywords,
      resources: this.resources,
      isRequired: this.isRequired,
      minCompletionPercentage: this.minCompletionPercentage,
      pointsReward: this.pointsReward,
      metadata: this.metadata,
      courseId,
    };
  }
}