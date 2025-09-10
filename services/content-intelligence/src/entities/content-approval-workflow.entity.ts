import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ContentApprovalInstance } from './content-approval-instance.entity';

@Entity('content_approval_workflows')
@Index(['organizationId', 'isActive'])
@Index(['contentTypes'])
@Unique(['organizationId', 'workflowName'])
export class ContentApprovalWorkflow {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique workflow identifier' })
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  @ApiProperty({ description: 'Organization that owns the workflow' })
  organizationId: string;

  @Column({ name: 'workflow_name', length: 200 })
  @ApiProperty({ description: 'Workflow name' })
  workflowName: string;

  @Column({ name: 'workflow_description', type: 'text', nullable: true })
  @ApiProperty({ description: 'Workflow description' })
  workflowDescription: string;

  @Column({ name: 'approval_steps', type: 'jsonb' })
  @ApiProperty({ description: 'Ordered array of approval steps' })
  approvalSteps: Record<string, any>[];

  @Column({ name: 'parallel_approval', type: 'boolean', default: false })
  @ApiProperty({ description: 'Whether approvals can happen in parallel' })
  parallelApproval: boolean;

  @Column({ name: 'content_types', type: 'text', array: true, nullable: true })
  @ApiProperty({ description: 'Content types that trigger this workflow' })
  contentTypes: string[];

  @Column({ name: 'risk_levels', type: 'text', array: true, nullable: true })
  @ApiProperty({ description: 'Risk levels that trigger this workflow' })
  riskLevels: string[];

  @Column({ name: 'compliance_requirements', type: 'text', array: true, nullable: true })
  @ApiProperty({ description: 'Compliance requirements that trigger this workflow' })
  complianceRequirements: string[];

  @Column({
    name: 'auto_approve_threshold',
    type: 'decimal',
    precision: 3,
    scale: 1,
    nullable: true,
  })
  @ApiProperty({ description: 'Auto-approve if quality/compliance above threshold' })
  autoApproveThreshold: number;

  @Column({ name: 'escalation_timeout_hours', type: 'int', default: 24 })
  @ApiProperty({ description: 'Hours before escalation occurs' })
  escalationTimeoutHours: number;

  @Column({
    name: 'reminder_intervals',
    type: 'int',
    array: true,
    default: [2, 6, 24],
  })
  @ApiProperty({ description: 'Hours for reminder notifications' })
  reminderIntervals: number[];

  @Column({ name: 'required_approvers', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Required approvers by role/user' })
  requiredApprovers: Record<string, any>;

  @Column({ name: 'optional_reviewers', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Optional reviewers' })
  optionalReviewers: Record<string, any>;

  @Column({ name: 'escalation_approvers', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Escalation approvers' })
  escalationApprovers: Record<string, any>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ description: 'Whether workflow is active' })
  isActive: boolean;

  @Column({ name: 'default_workflow', type: 'boolean', default: false })
  @ApiProperty({ description: 'Whether this is the default workflow' })
  defaultWorkflow: boolean;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  @ApiProperty({ description: 'User who created the workflow' })
  createdBy: string;

  @OneToMany(() => ContentApprovalInstance, (instance) => instance.workflow)
  approvalInstances: ContentApprovalInstance[];

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Workflow creation date' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Workflow last update date' })
  updatedAt: Date;
}