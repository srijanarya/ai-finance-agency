import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { GeneratedContent } from './generated-content.entity';

@Entity('platform_optimized_content')
@Index(['platformName', 'publishingStatus'])
@Index(['scheduledTime'])
@Index(['likesCount', 'sharesCount', 'commentsCount'])
@Unique(['generatedContentId', 'platformName'])
export class PlatformOptimizedContent {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique platform content identifier' })
  id: string;

  @Column({ name: 'generated_content_id', type: 'uuid' })
  @ApiProperty({ description: 'Associated generated content' })
  generatedContentId: string;

  @ManyToOne(() => GeneratedContent, (content) => content.platformContents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'generated_content_id' })
  generatedContent: GeneratedContent;

  @Column({ name: 'platform_name', length: 50 })
  @ApiProperty({
    description: 'Publishing platform',
    enum: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'tiktok', 'newsletter'],
  })
  platformName: string;

  @Column({ name: 'platform_post_id', length: 200, nullable: true })
  @ApiProperty({ description: 'Platform-specific post ID after publishing' })
  platformPostId: string;

  @Column({ name: 'optimized_text', type: 'text' })
  @ApiProperty({ description: 'Platform-optimized content text' })
  optimizedText: string;

  @Column({ name: 'hashtags', type: 'text', array: true, nullable: true })
  @ApiProperty({ description: 'Platform-specific hashtags' })
  hashtags: string[];

  @Column({ name: 'mentions', type: 'text', array: true, nullable: true })
  @ApiProperty({ description: 'User mentions in the content' })
  mentions: string[];

  @Column({ name: 'call_to_action', type: 'text', nullable: true })
  @ApiProperty({ description: 'Call-to-action for the platform' })
  callToAction: string;

  @Column({ name: 'character_count', type: 'int', nullable: true })
  @ApiProperty({ description: 'Character count of optimized content' })
  characterCount: number;

  @Column({ name: 'media_urls', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Associated media URLs (images, videos, documents)' })
  mediaUrls: Record<string, string[]>;

  @Column({ name: 'link_urls', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Links included in the content' })
  linkUrls: Record<string, string>;

  @Column({ name: 'scheduled_time', type: 'timestamp', nullable: true })
  @ApiProperty({ description: 'Scheduled publishing time' })
  scheduledTime: Date;

  @Column({ name: 'published_time', type: 'timestamp', nullable: true })
  @ApiProperty({ description: 'Actual publishing time' })
  publishedTime: Date;

  @Column({ name: 'publishing_status', length: 20, default: 'draft' })
  @ApiProperty({
    description: 'Publishing status',
    enum: ['draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled'],
    default: 'draft',
  })
  publishingStatus: string;

  @Column({ name: 'likes_count', type: 'int', default: 0 })
  @ApiProperty({ description: 'Number of likes/reactions' })
  likesCount: number;

  @Column({ name: 'shares_count', type: 'int', default: 0 })
  @ApiProperty({ description: 'Number of shares/reposts' })
  sharesCount: number;

  @Column({ name: 'comments_count', type: 'int', default: 0 })
  @ApiProperty({ description: 'Number of comments' })
  commentsCount: number;

  @Column({ name: 'clicks_count', type: 'int', default: 0 })
  @ApiProperty({ description: 'Number of clicks on links' })
  clicksCount: number;

  @Column({ name: 'impressions_count', type: 'int', default: 0 })
  @ApiProperty({ description: 'Number of impressions' })
  impressionsCount: number;

  @Column({ name: 'platform_metrics', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Platform-specific additional metrics' })
  platformMetrics: Record<string, any>;

  @Column({ name: 'publishing_error_message', type: 'text', nullable: true })
  @ApiProperty({ description: 'Error message if publishing failed' })
  publishingErrorMessage: string;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  @ApiProperty({ description: 'Number of publishing retry attempts' })
  retryCount: number;

  @Column({ name: 'last_retry_at', type: 'timestamp', nullable: true })
  @ApiProperty({ description: 'Last retry attempt timestamp' })
  lastRetryAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Platform content creation date' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Platform content last update date' })
  updatedAt: Date;
}