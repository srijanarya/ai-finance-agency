import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { GeneratedContent } from './generated-content.entity';
import { ContentApprovalWorkflow } from './content-approval-workflow.entity';

@Entity('content_approval_instances')
@Index(['contentId'])
@Index(['overallStatus', 'currentStep'])
@Index(['overallStatus', 'submittedAt'], { where: '"overall_status" = \'pending\'' })
export class ContentApprovalInstance {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique approval instance identifier' })
  id: string;

  @Column({ name: 'content_id', type: 'uuid' })
  @ApiProperty({ description: 'Associated content ID' })
  contentId: string;

  @ManyToOne(() => GeneratedContent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_id' })
  content: GeneratedContent;

  @Column({ name: 'workflow_id', type: 'uuid' })
  @ApiProperty({ description: 'Associated workflow ID' })
  workflowId: string;

  @ManyToOne(() => ContentApprovalWorkflow, (workflow) => workflow.approvalInstances)
  @JoinColumn({ name: 'workflow_id' })
  workflow: ContentApprovalWorkflow;

  @Column({ name: 'current_step', type: 'int', default: 1 })
  @ApiProperty({ description: 'Current approval step' })
  currentStep: number;

  @Column({ name: 'overall_status', length: 20, default: 'pending' })
  @ApiProperty({
    description: 'Overall approval status',
    enum: ['pending', 'approved', 'rejected', 'escalated'],
    default: 'pending',
  })
  overallStatus: string;

  @Column({ name: 'approval_steps_status', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Status of each approval step' })
  approvalStepsStatus: Record<string, any>;

  @CreateDateColumn({ name: 'submitted_at' })
  @ApiProperty({ description: 'When approval was submitted' })
  submittedAt: Date;

  @Column({ name: 'first_review_at', type: 'timestamp', nullable: true })
  @ApiProperty({ description: 'When first review occurred' })
  firstReviewAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  @ApiProperty({ description: 'When approval process completed' })
  completedAt: Date;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  @ApiProperty({ description: 'User who approved the content' })
  approvedBy: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  @ApiProperty({ description: 'Reason for rejection' })
  rejectionReason: string;

  @Column({ name: 'approval_notes', type: 'text', nullable: true })
  @ApiProperty({ description: 'Notes from approver' })
  approvalNotes: string;

  @Column({ name: 'escalated_at', type: 'timestamp', nullable: true })
  @ApiProperty({ description: 'When approval was escalated' })
  escalatedAt: Date;

  @Column({ name: 'escalation_reason', type: 'text', nullable: true })
  @ApiProperty({ description: 'Reason for escalation' })
  escalationReason: string;

  @Column({ name: 'escalated_to', type: 'uuid', nullable: true })
  @ApiProperty({ description: 'User escalated to' })
  escalatedTo: string;

  @Column({ name: 'notifications_sent', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Track sent notifications' })
  notificationsSent: Record<string, any>;

  @Column({ name: 'next_reminder_at', type: 'timestamp', nullable: true })
  @ApiProperty({ description: 'Next reminder notification time' })
  nextReminderAt: Date;
}