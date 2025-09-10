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
import { AssessmentAttempt } from './assessment-attempt.entity';

export enum AssessmentType {
  QUIZ = 'quiz',
  EXAM = 'exam',
  ASSIGNMENT = 'assignment',
  SURVEY = 'survey',
  PRACTICAL = 'practical',
}

export enum AssessmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  TEXT = 'text',
  ESSAY = 'essay',
  FILL_BLANK = 'fill_blank',
  MATCHING = 'matching',
  ORDERING = 'ordering',
}

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  question: string;
  description?: string;
  options?: string[];
  correctAnswer: string | string[] | number[];
  explanation?: string;
  points: number;
  required: boolean;
  order: number;
  metadata?: Record<string, any>;
}

@Entity('education_assessments')
@Index(['title'])
@Index(['assessmentType'])
@Index(['status'])
@Index(['courseId'])
@Index(['isActive'])
export class Assessment {
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

  @Column({
    name: 'assessment_type',
    type: 'enum',
    enum: AssessmentType,
    default: AssessmentType.QUIZ,
  })
  assessmentType: AssessmentType;

  @Column({
    type: 'enum',
    enum: AssessmentStatus,
    default: AssessmentStatus.DRAFT,
  })
  status: AssessmentStatus;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_required', default: true })
  isRequired: boolean;

  @Column({ name: 'questions', type: 'jsonb' })
  questions: AssessmentQuestion[];

  @Column({ name: 'total_points', type: 'integer' })
  totalPoints: number;

  @Column({ name: 'passing_score', type: 'integer', comment: 'Minimum percentage required to pass' })
  passingScore: number;

  @Column({ name: 'time_limit', type: 'integer', nullable: true, comment: 'Time limit in minutes' })
  timeLimit?: number;

  @Column({ name: 'max_attempts', type: 'integer', nullable: true })
  maxAttempts?: number;

  @Column({ name: 'shuffle_questions', default: false })
  shuffleQuestions: boolean;

  @Column({ name: 'shuffle_answers', default: false })
  shuffleAnswers: boolean;

  @Column({ name: 'show_results_immediately', default: true })
  showResultsImmediately: boolean;

  @Column({ name: 'show_correct_answers', default: true })
  showCorrectAnswers: boolean;

  @Column({ name: 'allow_review', default: true })
  allowReview: boolean;

  @Column({ name: 'require_proctor', default: false })
  requireProctor: boolean;

  @Column({ name: 'available_from', type: 'timestamp', nullable: true })
  availableFrom?: Date;

  @Column({ name: 'available_until', type: 'timestamp', nullable: true })
  availableUntil?: Date;

  @Column({ name: 'instructions', type: 'text', nullable: true })
  instructions?: string;

  @Column({ name: 'completion_message', type: 'text', nullable: true })
  completionMessage?: string;

  @Column({ name: 'pass_message', type: 'text', nullable: true })
  passMessage?: string;

  @Column({ name: 'fail_message', type: 'text', nullable: true })
  failMessage?: string;

  @Column({ name: 'attempt_count', default: 0 })
  attemptCount: number;

  @Column({ name: 'pass_count', default: 0 })
  passCount: number;

  @Column({ name: 'fail_count', default: 0 })
  failCount: number;

  @Column({ name: 'average_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageScore: number;

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

  @ManyToOne(() => Course, (course) => course.assessments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => AssessmentAttempt, (attempt) => attempt.assessment, { cascade: true })
  attempts: AssessmentAttempt[];

  // Virtual properties
  get isPublished(): boolean {
    return this.status === AssessmentStatus.PUBLISHED && this.publishedAt && this.publishedAt <= new Date();
  }

  get isDraft(): boolean {
    return this.status === AssessmentStatus.DRAFT;
  }

  get isArchived(): boolean {
    return this.status === AssessmentStatus.ARCHIVED;
  }

  get isAvailable(): boolean {
    const now = new Date();
    const isAfterStart = !this.availableFrom || this.availableFrom <= now;
    const isBeforeEnd = !this.availableUntil || this.availableUntil >= now;
    return this.isPublished && isAfterStart && isBeforeEnd;
  }

  get isExpired(): boolean {
    return this.availableUntil && this.availableUntil < new Date();
  }

  get hasTimeLimit(): boolean {
    return this.timeLimit !== null && this.timeLimit > 0;
  }

  get hasAttemptLimit(): boolean {
    return this.maxAttempts !== null && this.maxAttempts > 0;
  }

  get questionCount(): number {
    return this.questions?.length || 0;
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  get passRate(): number {
    if (this.attemptCount === 0) return 0;
    return Math.round((this.passCount / this.attemptCount) * 100);
  }

  get failRate(): number {
    if (this.attemptCount === 0) return 0;
    return Math.round((this.failCount / this.attemptCount) * 100);
  }

  get timeLimitFormatted(): string {
    if (!this.timeLimit) return 'No time limit';
    if (this.timeLimit < 60) return `${this.timeLimit} minutes`;
    
    const hours = Math.floor(this.timeLimit / 60);
    const minutes = this.timeLimit % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  // Methods
  publish(): void {
    this.status = AssessmentStatus.PUBLISHED;
    this.publishedAt = new Date();
  }

  unpublish(): void {
    this.status = AssessmentStatus.DRAFT;
    this.publishedAt = null;
  }

  archive(): void {
    this.status = AssessmentStatus.ARCHIVED;
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

  addQuestion(question: Omit<AssessmentQuestion, 'id' | 'order'>): void {
    const newQuestion: AssessmentQuestion = {
      ...question,
      id: this.generateQuestionId(),
      order: this.questions.length,
    };

    if (!this.questions) {
      this.questions = [];
    }

    this.questions.push(newQuestion);
    this.recalculateTotalPoints();
  }

  updateQuestion(questionId: string, updates: Partial<AssessmentQuestion>): void {
    const questionIndex = this.questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
      this.questions[questionIndex] = { ...this.questions[questionIndex], ...updates };
      this.recalculateTotalPoints();
    }
  }

  removeQuestion(questionId: string): void {
    this.questions = this.questions.filter(q => q.id !== questionId);
    this.reorderQuestions();
    this.recalculateTotalPoints();
  }

  reorderQuestions(): void {
    this.questions.forEach((question, index) => {
      question.order = index;
    });
  }

  shuffleQuestionsOrder(): AssessmentQuestion[] {
    if (!this.shuffleQuestions) return this.questions;
    
    const shuffled = [...this.questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getQuestionById(questionId: string): AssessmentQuestion | undefined {
    return this.questions.find(q => q.id === questionId);
  }

  canUserAttempt(attemptCount: number): boolean {
    return !this.hasAttemptLimit || attemptCount < this.maxAttempts;
  }

  calculateScore(answers: Record<string, any>): {
    score: number;
    percentage: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
  } {
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    for (const question of this.questions) {
      totalPoints += question.points;
      const userAnswer = answers[question.id];

      if (this.isAnswerCorrect(question, userAnswer)) {
        correctAnswers++;
        earnedPoints += question.points;
      }
    }

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = percentage >= this.passingScore;

    return {
      score: earnedPoints,
      percentage,
      passed,
      correctAnswers,
      totalQuestions: this.questions.length,
    };
  }

  updateAttemptStatistics(passed: boolean, score: number): void {
    this.attemptCount++;
    
    if (passed) {
      this.passCount++;
    } else {
      this.failCount++;
    }

    // Update average score
    const totalScore = this.averageScore * (this.attemptCount - 1) + score;
    this.averageScore = totalScore / this.attemptCount;
  }

  setAvailabilityWindow(from?: Date, until?: Date): void {
    this.availableFrom = from;
    this.availableUntil = until;
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.isActive = false;
  }

  restore(): void {
    this.deletedAt = null;
    this.isActive = true;
  }

  clone(courseId?: string): Partial<Assessment> {
    return {
      title: `${this.title} (Copy)`,
      description: this.description,
      assessmentType: this.assessmentType,
      status: AssessmentStatus.DRAFT,
      questions: this.questions.map(q => ({ ...q, id: this.generateQuestionId() })),
      totalPoints: this.totalPoints,
      passingScore: this.passingScore,
      timeLimit: this.timeLimit,
      maxAttempts: this.maxAttempts,
      shuffleQuestions: this.shuffleQuestions,
      shuffleAnswers: this.shuffleAnswers,
      showResultsImmediately: this.showResultsImmediately,
      showCorrectAnswers: this.showCorrectAnswers,
      allowReview: this.allowReview,
      requireProctor: this.requireProctor,
      instructions: this.instructions,
      completionMessage: this.completionMessage,
      passMessage: this.passMessage,
      failMessage: this.failMessage,
      metadata: this.metadata,
      courseId: courseId || this.courseId,
    };
  }

  private recalculateTotalPoints(): void {
    this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
  }

  private generateQuestionId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isAnswerCorrect(question: AssessmentQuestion, userAnswer: any): boolean {
    if (!userAnswer) return false;

    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.TRUE_FALSE:
        return userAnswer === question.correctAnswer;

      case QuestionType.TEXT:
      case QuestionType.FILL_BLANK:
        if (Array.isArray(question.correctAnswer)) {
          return question.correctAnswer.some(correct => 
            userAnswer.toLowerCase().trim() === correct.toLowerCase().trim()
          );
        }
        return userAnswer.toLowerCase().trim() === (question.correctAnswer as string).toLowerCase().trim();

      case QuestionType.MATCHING:
      case QuestionType.ORDERING:
        if (Array.isArray(question.correctAnswer) && Array.isArray(userAnswer)) {
          return JSON.stringify(question.correctAnswer.sort()) === JSON.stringify(userAnswer.sort());
        }
        return false;

      case QuestionType.ESSAY:
        // Essay questions typically require manual grading
        return false;

      default:
        return false;
    }
  }
}