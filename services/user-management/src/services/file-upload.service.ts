import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  KYCDocument,
  DocumentType,
  DocumentStatus,
} from '../entities/kyc-document.entity';
import { KYCApplication } from '../entities/kyc-application.entity';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface FileUploadResult {
  document: KYCDocument;
  uploadPath: string;
  success: boolean;
  error?: string;
}

@Injectable()
export class FileUploadService {
  private readonly uploadDirectory =
    process.env.UPLOAD_DIRECTORY || './uploads/kyc';
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes = KYCDocument.getSupportedMimeTypes();

  constructor(
    @InjectRepository(KYCDocument)
    private documentRepository: Repository<KYCDocument>,
    @InjectRepository(KYCApplication)
    private kycApplicationRepository: Repository<KYCApplication>,
  ) {
    this.ensureUploadDirectory();
  }

  async uploadDocument(
    kycApplicationId: string,
    documentType: DocumentType,
    file: UploadedFile,
    uploadedBy?: string,
  ): Promise<FileUploadResult> {
    try {
      // Validate file
      this.validateFile(file);

      // Check if KYC application exists
      const kycApplication = await this.kycApplicationRepository.findOne({
        where: { id: kycApplicationId },
      });

      if (!kycApplication) {
        throw new BadRequestException('KYC application not found');
      }

      // Generate file details
      const fileHash = this.generateFileHash(file.buffer);
      const fileName = this.generateFileName(file.originalname, fileHash);
      const filePath = path.join(this.uploadDirectory, fileName);

      // Save file to disk
      await fs.writeFile(filePath, file.buffer);

      // Create document record
      const document = this.documentRepository.create({
        kycApplicationId,
        documentType,
        fileName,
        originalFileName: file.originalname,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileHash,
        status: DocumentStatus.UPLOADED,
        uploadedAt: new Date(),
      });

      const savedDocument = await this.documentRepository.save(document);

      return {
        document: savedDocument,
        uploadPath: filePath,
        success: true,
      };
    } catch (error) {
      return {
        document: null as any,
        uploadPath: '',
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      const document = await this.documentRepository.findOne({
        where: { id: documentId },
      });

      if (!document) {
        throw new BadRequestException('Document not found');
      }

      // Delete file from disk
      try {
        await fs.unlink(document.filePath);
      } catch (error) {
        // File might not exist on disk, continue with database deletion
        console.warn(`Failed to delete file from disk: ${document.filePath}`);
      }

      // Delete document record
      await this.documentRepository.delete(documentId);

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  async getDocumentBuffer(documentId: string): Promise<Buffer> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new BadRequestException('Document not found');
    }

    try {
      return await fs.readFile(document.filePath);
    } catch (error) {
      throw new BadRequestException('Failed to read document file');
    }
  }

  private validateFile(file: UploadedFile): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size too large. Maximum allowed: ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    // Check MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    // Check if file has content
    if (file.size === 0) {
      throw new BadRequestException('File is empty');
    }
  }

  private generateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  private generateFileName(originalName: string, hash: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    return `${hash}_${timestamp}${ext}`;
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDirectory);
    } catch (error) {
      await fs.mkdir(this.uploadDirectory, { recursive: true });
    }
  }

  async cleanupOldFiles(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldDocuments = await this.documentRepository
      .createQueryBuilder('document')
      .where('document.uploadedAt < :cutoffDate', { cutoffDate })
      .andWhere('document.status = :status', {
        status: DocumentStatus.REJECTED,
      })
      .getMany();

    let cleanedCount = 0;

    for (const document of oldDocuments) {
      try {
        await fs.unlink(document.filePath);
        await this.documentRepository.delete(document.id);
        cleanedCount++;
      } catch (error) {
        console.error(`Failed to cleanup document ${document.id}:`, error);
      }
    }

    return cleanedCount;
  }

  getFileStats(): Promise<{
    totalDocuments: number;
    totalSizeBytes: number;
    byType: Record<DocumentType, number>;
    byStatus: Record<DocumentStatus, number>;
  }> {
    // This would typically involve database queries to get statistics
    // For now, return a placeholder implementation
    return Promise.resolve({
      totalDocuments: 0,
      totalSizeBytes: 0,
      byType: {} as Record<DocumentType, number>,
      byStatus: {} as Record<DocumentStatus, number>,
    });
  }
}
