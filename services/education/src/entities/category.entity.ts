import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  Tree,
  TreeParent,
  TreeChildren,
} from 'typeorm';
import { Course } from './course.entity';

@Entity('education_categories')
@Tree('closure-table')
@Index(['name'])
@Index(['slug'])
@Index(['isActive'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  name: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'icon_url', nullable: true })
  iconUrl?: string;

  @Column({ name: 'color_code', nullable: true })
  colorCode?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Tree relations
  @TreeParent()
  parent?: Category;

  @TreeChildren()
  children?: Category[];

  // Course relation
  @OneToMany(() => Course, (course) => course.category)
  courses: Course[];

  // Virtual properties
  get isRoot(): boolean {
    return !this.parent;
  }

  get hasChildren(): boolean {
    return this.children && this.children.length > 0;
  }

  get level(): number {
    let level = 0;
    let current = this.parent;
    while (current) {
      level++;
      current = current.parent;
    }
    return level;
  }

  // Methods
  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  updateDisplayOrder(order: number): void {
    this.displayOrder = order;
  }

  setParent(parent: Category): void {
    this.parent = parent;
  }

  addChild(child: Category): void {
    if (!this.children) {
      this.children = [];
    }
    this.children.push(child);
    child.parent = this;
  }
}