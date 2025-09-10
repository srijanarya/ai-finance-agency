import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { NotificationType, NotificationStatus } from './notification.entity';

export enum NotificationAction {
  CREATED = 'created',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  READ = 'read',
  CLICKED = 'clicked',
  CANCELLED = 'cancelled',
  RETRY = 'retry',
}

@Entity('notification_history')
@Index(['notificationId', 'createdAt'])
@Index(['action'])
@Index(['createdAt'])
export class NotificationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'notification_id', type: 'uuid' })
  notificationId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: NotificationAction,
  })
  action: NotificationAction;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
  })
  status: NotificationStatus;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ nullable: true })
  details?: string;

  @Column({ name: 'error_message', nullable: true })
  errorMessage?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'processing_time', type: 'int', nullable: true })
  processingTime?: number; // in milliseconds

  @Column({ name: 'external_id', nullable: true })
  externalId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}