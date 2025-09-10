import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('watchlists')
@Index(['userId', 'symbol'], { unique: true })
@Index(['userId'])
export class Watchlist {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User ID who owns the watchlist' })
  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ApiProperty({ description: 'Trading symbol' })
  @Column({ type: 'varchar', length: 20 })
  @Index()
  symbol: string;

  @ApiProperty({ description: 'Display name for the symbol' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  displayName?: string;

  @ApiProperty({ description: 'User notes about this symbol' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Custom tags for categorization' })
  @Column({ type: 'simple-array', default: [] })
  tags: string[];

  @ApiProperty({ description: 'Order/position in the watchlist' })
  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @ApiProperty({ description: 'Target buy price' })
  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  targetBuyPrice?: number;

  @ApiProperty({ description: 'Target sell price' })
  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  targetSellPrice?: number;

  @ApiProperty({ description: 'Stop loss price' })
  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  stopLossPrice?: number;

  @ApiProperty({ description: 'Is this symbol actively monitored' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Receive price alerts for this symbol' })
  @Column({ type: 'boolean', default: false })
  enableAlerts: boolean;

  @ApiProperty({ description: 'Price when added to watchlist' })
  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  addedAtPrice?: number;

  @ApiProperty({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}