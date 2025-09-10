import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Assessment } from './assessment.entity';

export enum AttemptStatus {
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  EXPIRED = 'expired',
  ABANDONED = 'abandoned',
}

@Entity('education_assessment_attempts')
@Index(['userId'])
@Index(['assessmentId'])
@Index(['status'])
@Index(['startedAt'])
@Index(['submittedAt'])
@Index(['score'])
export class AssessmentAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'assessment_id' })
  assessmentId: string;

  @Column({ name: 'attempt_number', type: 'integer' })
  attemptNumber: number;

  @Column({
    type: 'enum',
    enum: AttemptStatus,
    default: AttemptStatus.IN_PROGRESS,
  })
  status: AttemptStatus;

  @Column({ name: 'answers', type: 'jsonb', nullable: true })
  answers?: Record<string, any>;

  @Column({ name: 'question_order', type: 'jsonb', nullable: true })
  questionOrder?: string[];

  @Column({ name: 'time_spent', type: 'integer', default: 0, comment: 'Time spent in seconds' })
  timeSpent: number;

  @Column({ name: 'time_remaining', type: 'integer', nullable: true, comment: 'Time remaining in seconds' })
  timeRemaining?: number;

  @Column({ name: 'score', type: 'decimal', precision: 10, scale: 2, nullable: true })
  score?: number;

  @Column({ name: 'percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage?: number;

  @Column({ name: 'max_score', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxScore?: number;

  @Column({ name: 'correct_answers', type: 'integer', nullable: true })
  correctAnswers?: number;

  @Column({ name: 'total_questions', type: 'integer', nullable: true })
  totalQuestions?: number;

  @Column({ name: 'passed', nullable: true })
  passed?: boolean;

  @Column({ name: 'feedback', type: 'text', nullable: true })
  feedback?: string;

  @Column({ name: 'grader_notes', type: 'text', nullable: true })
  graderNotes?: string;

  @Column({ name: 'graded_by', nullable: true })
  gradedBy?: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'browser_info', type: 'jsonb', nullable: true })
  browserInfo?: Record<string, any>;

  @Column({ name: 'started_at', type: 'timestamp' })
  startedAt: Date;

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt?: Date;

  @Column({ name: 'graded_at', type: 'timestamp', nullable: true })
  gradedAt?: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'auto_submitted', default: false })
  autoSubmitted: boolean;

  @Column({ name: 'review_requested', default: false })
  reviewRequested: boolean;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @Column({ name: 'proctored', default: false })
  proctored: boolean;

  @Column({ name: 'proctor_notes', type: 'text', nullable: true })
  proctorNotes?: string;

  @Column({ name: 'suspicious_activity', type: 'jsonb', nullable: true })
  suspiciousActivity?: Array<{
    type: string;
    description: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high';
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Assessment, (assessment) => assessment.attempts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assessment_id' })
  assessment: Assessment;

  // Virtual properties
  get isInProgress(): boolean {
    return this.status === AttemptStatus.IN_PROGRESS;
  }

  get isSubmitted(): boolean {
    return this.status === AttemptStatus.SUBMITTED;
  }

  get isGraded(): boolean {
    return this.status === AttemptStatus.GRADED;
  }

  get isExpired(): boolean {
    return this.status === AttemptStatus.EXPIRED;
  }

  get isAbandoned(): boolean {
    return this.status === AttemptStatus.ABANDONED;
  }

  get isCompleted(): boolean {
    return [AttemptStatus.SUBMITTED, AttemptStatus.GRADED].includes(this.status);
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

  get timeRemainingFormatted(): string {
    if (!this.timeRemaining) return 'No time limit';
    
    const hours = Math.floor(this.timeRemaining / 3600);
    const minutes = Math.floor((this.timeRemaining % 3600) / 60);
    const seconds = this.timeRemaining % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  get isTimeExpired(): boolean {
    return this.expiresAt && this.expiresAt <= new Date();
  }

  get durationInMinutes(): number {
    if (!this.submittedAt) return 0;
    const diffMs = this.submittedAt.getTime() - this.startedAt.getTime();
    return Math.round(diffMs / (1000 * 60));
  }

  get hasSuspiciousActivity(): boolean {
    return this.suspiciousActivity && this.suspiciousActivity.length > 0;
  }

  get highSeverityFlags(): number {
    if (!this.suspiciousActivity) return 0;
    return this.suspiciousActivity.filter(activity => activity.severity === 'high').length;
  }

  get completionRate(): number {
    if (!this.answers || !this.totalQuestions) return 0;
    const answeredQuestions = Object.keys(this.answers).length;
    return Math.round((answeredQuestions / this.totalQuestions) * 100);
  }

  get grade(): string {
    if (!this.percentage) return 'N/A';
    
    if (this.percentage >= 90) return 'A';
    if (this.percentage >= 80) return 'B';
    if (this.percentage >= 70) return 'C';
    if (this.percentage >= 60) return 'D';
    return 'F';
  }

  // Methods
  submit(autoSubmit = false): void {
    this.status = AttemptStatus.SUBMITTED;
    this.submittedAt = new Date();
    this.autoSubmitted = autoSubmit;
  }

  grade(
    score: number,
    percentage: number,
    maxScore: number,
    correctAnswers: number,
    totalQuestions: number,
    passed: boolean,
    graderId?: string,
    feedback?: string
  ): void {
    this.status = AttemptStatus.GRADED;
    this.score = score;
    this.percentage = percentage;
    this.maxScore = maxScore;
    this.correctAnswers = correctAnswers;
    this.totalQuestions = totalQuestions;
    this.passed = passed;
    this.gradedAt = new Date();
    this.gradedBy = graderId;
    
    if (feedback) {
      this.feedback = feedback;
    }
  }

  expire(): void {
    this.status = AttemptStatus.EXPIRED;
    if (!this.submittedAt) {
      this.submittedAt = new Date();
      this.autoSubmitted = true;
    }
  }

  abandon(): void {
    this.status = AttemptStatus.ABANDONED;
  }

  updateAnswer(questionId: string, answer: any): void {
    if (!this.answers) {
      this.answers = {};
    }
    this.answers[questionId] = answer;
  }

  removeAnswer(questionId: string): void {
    if (this.answers && this.answers[questionId]) {
      delete this.answers[questionId];
    }
  }

  getAnswer(questionId: string): any {
    return this.answers?.[questionId];
  }

  hasAnswer(questionId: string): boolean {
    return this.answers && this.answers[questionId] !== undefined;
  }

  updateTimeSpent(additionalSeconds: number): void {
    this.timeSpent += additionalSeconds;
  }

  updateTimeRemaining(seconds: number): void {
    this.timeRemaining = Math.max(0, seconds);
  }

  setExpirationTime(minutes: number): void {
    this.expiresAt = new Date(Date.now() + minutes * 60 * 1000);
    this.timeRemaining = minutes * 60;
  }

  requestReview(): void {
    this.reviewRequested = true;
  }

  markReviewed(): void {
    this.reviewedAt = new Date();
    this.reviewRequested = false;
  }

  addSuspiciousActivity(
    type: string,
    description: string,
    severity: 'low' | 'medium' | 'high' = 'medium'
  ): void {
    if (!this.suspiciousActivity) {
      this.suspiciousActivity = [];
    }

    this.suspiciousActivity.push({
      type,
      description,
      timestamp: new Date(),
      severity,
    });
  }

  setProctorNotes(notes: string): void {
    this.proctored = true;
    this.proctorNotes = notes;
  }

  setBrowserInfo(userAgent: string, browserInfo: Record<string, any>): void {
    this.userAgent = userAgent;
    this.browserInfo = browserInfo;
  }

  setIpAddress(ipAddress: string): void {
    this.ipAddress = ipAddress;
  }

  calculateProgress(): {
    answeredQuestions: number;
    totalQuestions: number;
    percentage: number;
    timeSpent: string;
    timeRemaining?: string;
  } {
    const answeredQuestions = this.answers ? Object.keys(this.answers).length : 0;
    const totalQuestions = this.totalQuestions || 0;
    const percentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

    return {
      answeredQuestions,
      totalQuestions,
      percentage,
      timeSpent: this.timeSpentFormatted,
      timeRemaining: this.timeRemaining ? this.timeRemainingFormatted : undefined,
    };
  }

  getResult(): {
    score: number;
    percentage: number;
    passed: boolean;
    grade: string;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: string;
    feedback?: string;
  } | null {
    if (!this.isGraded) return null;

    return {
      score: this.score || 0,
      percentage: this.percentage || 0,
      passed: this.passed || false,
      grade: this.grade,
      correctAnswers: this.correctAnswers || 0,
      totalQuestions: this.totalQuestions || 0,
      timeSpent: this.timeSpentFormatted,
      feedback: this.feedback,
    };
  }

  getSummary(): {
    id: string;
    attemptNumber: number;
    status: string;
    score?: number;
    percentage?: number;
    passed?: boolean;
    startedAt: Date;
    submittedAt?: Date;
    timeSpent: string;
  } {
    return {
      id: this.id,
      attemptNumber: this.attemptNumber,
      status: this.status,
      score: this.score,
      percentage: this.percentage,
      passed: this.passed,
      startedAt: this.startedAt,
      submittedAt: this.submittedAt,
      timeSpent: this.timeSpentFormatted,
    };
  }
}