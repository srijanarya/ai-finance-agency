import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { NotificationType, NotificationCategory } from './notification.entity';

@Entity('notification_preferences')
@Index(['userId'])
@Unique(['userId', 'category', 'type'])
export class NotificationPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: NotificationCategory,
  })
  category: NotificationCategory;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ default: true })
  enabled: boolean;

  @Column({ name: 'quiet_hours_start', nullable: true })
  quietHoursStart?: string; // Format: HH:MM

  @Column({ name: 'quiet_hours_end', nullable: true })
  quietHoursEnd?: string; // Format: HH:MM

  @Column({ name: 'timezone', nullable: true, default: 'UTC' })
  timezone: string;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper method to check if notification should be sent based on quiet hours
  isInQuietHours(currentTime: Date = new Date()): boolean {
    if (!this.quietHoursStart || !this.quietHoursEnd) {
      return false;
    }

    const [startHour, startMinute] = this.quietHoursStart.split(':').map(Number);
    const [endHour, endMinute] = this.quietHoursEnd.split(':').map(Number);

    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    if (startTotalMinutes <= endTotalMinutes) {
      // Same day range (e.g., 09:00 to 17:00)
      return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes;
    } else {
      // Overnight range (e.g., 22:00 to 06:00)
      return currentTotalMinutes >= startTotalMinutes || currentTotalMinutes <= endTotalMinutes;
    }
  }
}