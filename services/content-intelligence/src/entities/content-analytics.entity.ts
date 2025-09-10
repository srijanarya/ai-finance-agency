import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { GeneratedContent } from './generated-content.entity';

@Entity('content_analytics')
@Index(['contentId', 'analyticsDate'])
@Index(['analyticsPeriod', 'analyticsDate'])
@Index(['engagementRate'])
@Unique(['contentId', 'analyticsDate', 'analyticsPeriod'])
export class ContentAnalytics {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique analytics identifier' })
  id: string;

  @Column({ name: 'content_id', type: 'uuid' })
  @ApiProperty({ description: 'Associated content ID' })
  contentId: string;

  @ManyToOne(() => GeneratedContent, (content) => content.analytics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'content_id' })
  content: GeneratedContent;

  @Column({ name: 'analytics_date', type: 'date' })
  @ApiProperty({ description: 'Analytics date' })
  analyticsDate: Date;

  @Column({ name: 'analytics_period', length: 20 })
  @ApiProperty({
    description: 'Analytics period',
    enum: ['daily', 'weekly', 'monthly'],
  })
  analyticsPeriod: string;

  @Column({ name: 'total_views', type: 'int', default: 0 })
  @ApiProperty({ description: 'Total views/impressions' })
  totalViews: number;

  @Column({ name: 'total_likes', type: 'int', default: 0 })
  @ApiProperty({ description: 'Total likes/reactions' })
  totalLikes: number;

  @Column({ name: 'total_shares', type: 'int', default: 0 })
  @ApiProperty({ description: 'Total shares/reposts' })
  totalShares: number;

  @Column({ name: 'total_comments', type: 'int', default: 0 })
  @ApiProperty({ description: 'Total comments' })
  totalComments: number;

  @Column({ name: 'total_clicks', type: 'int', default: 0 })
  @ApiProperty({ description: 'Total link clicks' })
  totalClicks: number;

  @Column({ name: 'total_impressions', type: 'bigint', default: 0 })
  @ApiProperty({ description: 'Total impressions across platforms' })
  totalImpressions: number;

  @Column({ name: 'unique_reach', type: 'int', default: 0 })
  @ApiProperty({ description: 'Unique reach/audience size' })
  uniqueReach: number;

  @Column({ name: 'impression_frequency', type: 'decimal', precision: 4, scale: 2, nullable: true })
  @ApiProperty({ description: 'Average impressions per unique user' })
  impressionFrequency: number;

  @Column({ name: 'website_visits', type: 'int', default: 0 })
  @ApiProperty({ description: 'Website visits generated' })
  websiteVisits: number;

  @Column({ name: 'lead_generations', type: 'int', default: 0 })
  @ApiProperty({ description: 'Leads generated' })
  leadGenerations: number;

  @Column({ name: 'conversions', type: 'int', default: 0 })
  @ApiProperty({ description: 'Conversions achieved' })
  conversions: number;

  @Column({ name: 'revenue_attributed', type: 'decimal', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Revenue attributed to content' })
  revenueAttributed: number;

  @Column({ name: 'engagement_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  @ApiProperty({ description: 'Engagement rate (engagement/impressions)' })
  engagementRate: number;

  @Column({ name: 'click_through_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  @ApiProperty({ description: 'Click-through rate (clicks/impressions)' })
  clickThroughRate: number;

  @Column({ name: 'conversion_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  @ApiProperty({ description: 'Conversion rate (conversions/clicks)' })
  conversionRate: number;

  @Column({ name: 'audience_demographics', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Audience demographic breakdown' })
  audienceDemographics: Record<string, any>;

  @Column({ name: 'geographic_distribution', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Geographic distribution of audience' })
  geographicDistribution: Record<string, any>;

  @Column({ name: 'device_breakdown', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Device type breakdown' })
  deviceBreakdown: Record<string, any>;

  @Column({ name: 'platform_performance', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Performance breakdown by platform' })
  platformPerformance: Record<string, any>;

  @Column({ name: 'peak_engagement_time', type: 'time', nullable: true })
  @ApiProperty({ description: 'Peak engagement time of day' })
  peakEngagementTime: string;

  @Column({ name: 'engagement_by_hour', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Hourly engagement breakdown' })
  engagementByHour: Record<string, number>;

  @Column({ name: 'industry_benchmark_comparison', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Comparison to industry benchmarks' })
  industryBenchmarkComparison: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Analytics record creation date' })
  createdAt: Date;
}