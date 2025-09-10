import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { NotificationType, NotificationCategory } from './notification.entity';

export enum TemplateVariableType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  CURRENCY = 'currency',
  PERCENTAGE = 'percentage',
}

export interface TemplateVariable {
  name: string;
  type: TemplateVariableType;
  required: boolean;
  defaultValue?: any;
  description?: string;
}

@Entity('notification_templates')
@Index(['name'])
@Index(['category', 'type'])
@Index(['active'])
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

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

  @Column()
  subject: string;

  @Column('text')
  body: string;

  @Column({ name: 'html_body', type: 'text', nullable: true })
  htmlBody?: string;

  @Column({ type: 'jsonb', nullable: true })
  variables: TemplateVariable[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  version: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper method to validate template variables
  validateVariables(variables: Record<string, any>): string[] {
    const errors: string[] = [];
    
    for (const templateVar of this.variables || []) {
      if (templateVar.required && !(templateVar.name in variables)) {
        errors.push(`Required variable '${templateVar.name}' is missing`);
      }
    }

    return errors;
  }

  // Helper method to render template with variables
  render(variables: Record<string, any> = {}): { subject: string; body: string; htmlBody?: string } {
    const renderTemplate = (template: string): string => {
      return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        return variables[varName] !== undefined ? String(variables[varName]) : match;
      });
    };

    return {
      subject: renderTemplate(this.subject),
      body: renderTemplate(this.body),
      htmlBody: this.htmlBody ? renderTemplate(this.htmlBody) : undefined,
    };
  }
}