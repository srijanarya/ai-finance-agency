import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('push_subscriptions')
@Index(['userId'])
@Index(['active'])
@Unique(['userId', 'endpoint'])
export class PushSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column()
  endpoint: string;

  @Column({ name: 'p256dh_key' })
  p256dhKey: string;

  @Column({ name: 'auth_key' })
  authKey: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ name: 'device_type', nullable: true })
  deviceType?: string;

  @Column({ name: 'browser_name', nullable: true })
  browserName?: string;

  @Column({ name: 'browser_version', nullable: true })
  browserVersion?: string;

  @Column({ name: 'os_name', nullable: true })
  osName?: string;

  @Column({ name: 'os_version', nullable: true })
  osVersion?: string;

  @Column({ default: true })
  active: boolean;

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @Column({ name: 'failure_count', type: 'int', default: 0 })
  failureCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper method to check if subscription is valid
  get isValid(): boolean {
    return this.active && this.failureCount < 5;
  }

  // Helper method to get push subscription object
  getPushSubscription(): {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  } {
    return {
      endpoint: this.endpoint,
      keys: {
        p256dh: this.p256dhKey,
        auth: this.authKey,
      },
    };
  }

  // Helper method to mark as used
  markAsUsed(): void {
    this.lastUsedAt = new Date();
    this.failureCount = 0;
  }

  // Helper method to record failure
  recordFailure(): void {
    this.failureCount += 1;
    if (this.failureCount >= 5) {
      this.active = false;
    }
  }
}