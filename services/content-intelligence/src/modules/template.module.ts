import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ContentTemplate } from '../entities/content-template.entity';

// Future implementation for template management
// Controllers and services would be implemented here

@Module({
  imports: [
    TypeOrmModule.forFeature([ContentTemplate]),
  ],
  controllers: [
    // TemplateController - to be implemented
  ],
  providers: [
    // TemplateService - to be implemented
  ],
  exports: [
    // Services to be exported
  ],
})
export class TemplateModule {}