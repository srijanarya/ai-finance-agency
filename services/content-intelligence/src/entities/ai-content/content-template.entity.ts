import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ContentType, ContentStyle } from '../../interfaces/ai-content/ai-content.interface';

@Entity('content_templates')
@Index(['contentType', 'isActive'])
@Index(['style', 'isActive'])
@Index(['name'])
export class ContentTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  @Index()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ContentType })
  contentType: ContentType;

  @Column({ type: 'enum', enum: ContentStyle })
  style: ContentStyle;

  @Column({ type: 'json' })
  structure: TemplateSection[];

  @Column({ type: 'json' })
  variables: TemplateVariable[];

  @Column({ type: 'json' })
  constraints: TemplateConstraints;

  @Column({ type: 'json', nullable: true })
  examples?: string[];

  @Column({ type: 'text' })
  promptTemplate: string;

  @Column({ type: 'json', nullable: true })
  defaultValues?: { [key: string]: any };

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isBuiltIn: boolean;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  createdBy?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Column({ type: 'json', nullable: true })
  tags?: string[];

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  averageRating?: number;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  @Column({ type: 'json', nullable: true })
  metadata?: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  incrementUsage(): void {
    this.usageCount += 1;
  }

  addRating(rating: number): void {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const totalRating = (this.averageRating || 0) * this.ratingCount + rating;
    this.ratingCount += 1;
    this.averageRating = totalRating / this.ratingCount;
  }

  isHighQuality(): boolean {
    return (this.averageRating || 0) >= 4.0 && this.ratingCount >= 5;
  }

  isPopular(): boolean {
    return this.usageCount >= 100;
  }

  validateVariables(values: { [key: string]: any }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const variable of this.variables) {
      const value = values[variable.name];

      if (variable.required && (value === undefined || value === null || value === '')) {
        errors.push(`Required variable '${variable.name}' is missing`);
        continue;
      }

      if (value !== undefined && variable.validation) {
        const regex = new RegExp(variable.validation);
        if (!regex.test(String(value))) {
          errors.push(`Variable '${variable.name}' does not match required pattern`);
        }
      }

      if (variable.type === 'number' && value !== undefined && isNaN(Number(value))) {
        errors.push(`Variable '${variable.name}' must be a number`);
      }

      if (variable.options && variable.options.length > 0 && value !== undefined) {
        if (!variable.options.includes(String(value))) {
          warnings.push(`Variable '${variable.name}' value '${value}' is not in recommended options`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  generatePrompt(variables: { [key: string]: any }): string {
    let prompt = this.promptTemplate;

    // Replace variables in the template
    for (const variable of this.variables) {
      const value = variables[variable.name] || variable.defaultValue || '';
      const placeholder = `{{${variable.name}}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
    }

    // Replace any remaining placeholders with empty strings
    prompt = prompt.replace(/\{\{[^}]+\}\}/g, '');

    return prompt.trim();
  }

  getRequiredVariables(): TemplateVariable[] {
    return this.variables.filter(v => v.required);
  }

  getOptionalVariables(): TemplateVariable[] {
    return this.variables.filter(v => !v.required);
  }

  clone(newName: string, userId?: string): Partial<ContentTemplate> {
    return {
      name: newName,
      description: this.description,
      contentType: this.contentType,
      style: this.style,
      structure: JSON.parse(JSON.stringify(this.structure)),
      variables: JSON.parse(JSON.stringify(this.variables)),
      constraints: JSON.parse(JSON.stringify(this.constraints)),
      examples: this.examples ? [...this.examples] : undefined,
      promptTemplate: this.promptTemplate,
      defaultValues: this.defaultValues ? JSON.parse(JSON.stringify(this.defaultValues)) : undefined,
      version: 1,
      isActive: true,
      isBuiltIn: false,
      createdBy: userId,
      category: this.category,
      tags: this.tags ? [...this.tags] : undefined,
    };
  }
}

interface TemplateSection {
  id: string;
  name: string;
  description: string;
  required: boolean;
  order: number;
  minLength?: number;
  maxLength?: number;
  style?: ContentStyle;
}

interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multi_select';
  description: string;
  required: boolean;
  defaultValue?: string;
  options?: string[];
  validation?: string; // regex pattern
}

interface TemplateConstraints {
  maxLength: number;
  minLength: number;
  requiredSections: string[];
  forbiddenPhrases?: string[];
  requiredKeywords?: string[];
  complianceRules?: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}