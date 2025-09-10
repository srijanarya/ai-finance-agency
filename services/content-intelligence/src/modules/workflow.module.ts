import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ContentApprovalWorkflow } from '../entities/content-approval-workflow.entity';
import { ContentApprovalInstance } from '../entities/content-approval-instance.entity';

// Future implementation for workflow management
// Controllers and services would be implemented here

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContentApprovalWorkflow,
      ContentApprovalInstance,
    ]),
  ],
  controllers: [
    // WorkflowController - to be implemented
  ],
  providers: [
    // WorkflowService - to be implemented
    // ApprovalService - to be implemented
    // NotificationService - to be implemented
  ],
  exports: [
    // Services to be exported
  ],
})
export class WorkflowModule {}