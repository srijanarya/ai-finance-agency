"""
TalkingPhoto MVP - Video Storage and CDN Delivery Service
Production-ready file storage with CDN distribution for fast video delivery
"""

import os
import boto3
import hashlib
import time
import mimetypes
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timezone, timedelta
from urllib.parse import urljoin
import structlog
from botocore.exceptions import ClientError, BotoCoreError
from PIL import Image
import subprocess
import tempfile

from models.file import UploadedFile
from core.database import db
from flask import current_app
import json

logger = structlog.get_logger()


class StorageCDNService:
    """
    Comprehensive storage and CDN service for video files
    """

    def __init__(self):
        # AWS S3 Configuration
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=current_app.config.get('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=current_app.config.get('AWS_SECRET_ACCESS_KEY'),
            region_name=current_app.config.get('AWS_REGION', 'us-east-1')
        )

        self.s3_bucket = current_app.config.get('S3_BUCKET_NAME', 'talkingphoto-videos')
        self.cloudfront_domain = current_app.config.get('CLOUDFRONT_DOMAIN')

        # Local storage fallback
        self.local_storage_path = current_app.config.get('LOCAL_STORAGE_PATH', '/tmp/talkingphoto')
        os.makedirs(self.local_storage_path, exist_ok=True)

        # Storage tiers
        self.storage_tiers = {
            'hot': {
                's3_storage_class': 'STANDARD',
                'lifecycle_days': 30,
                'description': 'Immediate access, recent videos'
            },
            'warm': {
                's3_storage_class': 'STANDARD_IA',
                'lifecycle_days': 90,
                'description': 'Infrequent access, older videos'
            },
            'cold': {
                's3_storage_class': 'GLACIER',
                'lifecycle_days': 365,
                'description': 'Long-term archival'
            }
        }

    async def store_video(
        self,
        video_content: bytes,
        filename: str,
        user_id: str,
        video_id: str,
        metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Store video file with multi-tier storage and CDN distribution
        """
        try:
            logger.info("Starting video storage",
                       filename=filename,
                       size=len(video_content),
                       user_id=user_id,
                       video_id=video_id)

            # Generate file paths and keys
            file_hash = self._calculate_file_hash(video_content)
            storage_paths = self._generate_storage_paths(user_id, video_id, filename, file_hash)

            # Store in multiple locations for redundancy
            storage_results = {}

            # 1. Primary storage - S3 with CloudFront CDN
            s3_result = await self._store_to_s3(
                video_content,
                storage_paths['s3_key'],
                metadata or {},
                tier='hot'
            )
            storage_results['s3'] = s3_result

            # 2. Local storage backup
            local_result = await self._store_locally(
                video_content,
                storage_paths['local_path']
            )
            storage_results['local'] = local_result

            # 3. Generate video thumbnail
            thumbnail_result = await self._generate_video_thumbnail(
                video_content,
                storage_paths['thumbnail_key'],
                video_id
            )
            storage_results['thumbnail'] = thumbnail_result

            # 4. Create multiple video qualities/formats
            variants_result = await self._create_video_variants(
                video_content,
                storage_paths,
                video_id
            )
            storage_results['variants'] = variants_result

            # Create database record
            file_record = self._create_file_record(
                filename=filename,
                file_hash=file_hash,
                file_size=len(video_content),
                user_id=user_id,
                storage_paths=storage_paths,
                metadata=metadata or {}
            )

            # Generate CDN URLs
            cdn_urls = self._generate_cdn_urls(storage_paths, file_record.id)

            logger.info("Video storage completed",
                       file_id=file_record.id,
                       s3_success=s3_result['success'],
                       cdn_url=cdn_urls['primary'])

            return {
                'success': True,
                'file_id': file_record.id,
                'storage_path': storage_paths['local_path'],
                'cdn_url': cdn_urls['primary'],
                'thumbnail_url': cdn_urls.get('thumbnail'),
                'variants': cdn_urls.get('variants', {}),
                'file_hash': file_hash,
                'storage_tier': 'hot',
                'redundancy_locations': list(storage_results.keys()),
                'storage_results': storage_results
            }

        except Exception as e:
            logger.error("Video storage failed",
                        error=str(e),
                        filename=filename,
                        video_id=video_id)
            return {
                'success': False,
                'error': str(e)
            }

    async def _store_to_s3(
        self,
        content: bytes,
        s3_key: str,
        metadata: Dict[str, Any],
        tier: str = 'hot'
    ) -> Dict[str, Any]:
        """
        Store file to AWS S3 with appropriate storage class
        """
        try:
            storage_class = self.storage_tiers[tier]['s3_storage_class']

            # Prepare metadata
            s3_metadata = {
                'uploaded_at': datetime.now(timezone.utc).isoformat(),
                'tier': tier,
                **{k: str(v) for k, v in metadata.items()}
            }

            # Upload to S3
            response = self.s3_client.put_object(
                Bucket=self.s3_bucket,
                Key=s3_key,
                Body=content,
                ContentType='video/mp4',
                StorageClass=storage_class,
                Metadata=s3_metadata,
                ServerSideEncryption='AES256',
                # Cache control for CDN
                CacheControl='max-age=31536000, public',  # 1 year
                # CORS headers
                ContentDisposition='inline'
            )

            # Get S3 URL
            s3_url = f"https://{self.s3_bucket}.s3.amazonaws.com/{s3_key}"

            logger.info("S3 upload successful",
                       s3_key=s3_key,
                       storage_class=storage_class,
                       etag=response.get('ETag'))

            return {
                'success': True,
                's3_key': s3_key,
                's3_url': s3_url,
                'storage_class': storage_class,
                'etag': response.get('ETag'),
                'version_id': response.get('VersionId')
            }

        except ClientError as e:
            error_code = e.response['Error']['Code']
            logger.error("S3 upload failed",
                        error_code=error_code,
                        error_message=str(e))
            return {
                'success': False,
                'error': f'S3 error: {error_code}',
                'retry_recommended': error_code in ['RequestTimeout', 'ServiceUnavailable']
            }
        except Exception as e:
            logger.error("S3 upload error", error=str(e))
            return {
                'success': False,
                'error': str(e)
            }

    async def _store_locally(
        self,
        content: bytes,
        local_path: str
    ) -> Dict[str, Any]:
        """
        Store file locally as backup
        """
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(local_path), exist_ok=True)

            # Write file
            with open(local_path, 'wb') as f:
                f.write(content)

            # Verify file integrity
            if os.path.getsize(local_path) != len(content):
                return {
                    'success': False,
                    'error': 'File size mismatch after local storage'
                }

            logger.info("Local storage successful", path=local_path)

            return {
                'success': True,
                'local_path': local_path,
                'file_size': len(content)
            }

        except Exception as e:
            logger.error("Local storage failed", error=str(e), path=local_path)
            return {
                'success': False,
                'error': str(e)
            }

    async def _generate_video_thumbnail(
        self,
        video_content: bytes,
        thumbnail_key: str,
        video_id: str
    ) -> Dict[str, Any]:
        """
        Generate video thumbnail and store it
        """
        try:
            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_video:
                temp_video.write(video_content)
                temp_video_path = temp_video.name

            thumbnail_path = f"/tmp/thumb_{video_id}.jpg"

            # Use ffmpeg to extract thumbnail at 1 second
            cmd = [
                'ffmpeg',
                '-i', temp_video_path,
                '-ss', '1',  # Extract at 1 second
                '-vframes', '1',
                '-q:v', '2',  # High quality
                '-y',  # Overwrite output
                thumbnail_path
            ]

            try:
                subprocess.run(cmd, check=True, capture_output=True, text=True, timeout=30)

                # Read thumbnail content
                with open(thumbnail_path, 'rb') as f:
                    thumbnail_content = f.read()

                # Store thumbnail to S3
                thumbnail_s3_result = await self._store_to_s3(
                    thumbnail_content,
                    thumbnail_key,
                    {'type': 'thumbnail', 'video_id': video_id},
                    tier='hot'
                )

                # Cleanup temp files
                os.unlink(temp_video_path)
                os.unlink(thumbnail_path)

                if thumbnail_s3_result['success']:
                    return {
                        'success': True,
                        'thumbnail_key': thumbnail_key,
                        'thumbnail_size': len(thumbnail_content)
                    }
                else:
                    return {
                        'success': False,
                        'error': f"Thumbnail S3 upload failed: {thumbnail_s3_result['error']}"
                    }

            except subprocess.TimeoutExpired:
                return {'success': False, 'error': 'Thumbnail generation timeout'}
            except subprocess.CalledProcessError as e:
                return {'success': False, 'error': f'FFmpeg error: {e.stderr}'}

        except Exception as e:
            logger.error("Thumbnail generation failed", error=str(e))
            return {
                'success': False,
                'error': str(e)
            }

    async def _create_video_variants(
        self,
        video_content: bytes,
        storage_paths: Dict[str, str],
        video_id: str
    ) -> Dict[str, Any]:
        """
        Create multiple video quality variants for adaptive streaming
        """
        try:
            variants_created = {}

            # Define quality variants
            quality_variants = {
                '1080p': {'bitrate': '4000k', 'scale': '1920:1080'},
                '720p': {'bitrate': '2500k', 'scale': '1280:720'},
                '480p': {'bitrate': '1000k', 'scale': '854:480'}
            }

            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_video:
                temp_video.write(video_content)
                source_path = temp_video.name

            for quality, settings in quality_variants.items():
                try:
                    variant_path = f"/tmp/variant_{video_id}_{quality}.mp4"

                    # FFmpeg command for quality conversion
                    cmd = [
                        'ffmpeg',
                        '-i', source_path,
                        '-c:v', 'libx264',
                        '-b:v', settings['bitrate'],
                        '-vf', f"scale={settings['scale']}",
                        '-c:a', 'aac',
                        '-b:a', '128k',
                        '-movflags', '+faststart',  # Optimize for streaming
                        '-y',
                        variant_path
                    ]

                    subprocess.run(cmd, check=True, capture_output=True, timeout=120)

                    # Read variant content
                    with open(variant_path, 'rb') as f:
                        variant_content = f.read()

                    # Store variant to S3
                    variant_key = storage_paths['s3_key'].replace('.mp4', f'_{quality}.mp4')
                    variant_s3_result = await self._store_to_s3(
                        variant_content,
                        variant_key,
                        {'type': 'variant', 'quality': quality, 'video_id': video_id},
                        tier='hot'
                    )

                    if variant_s3_result['success']:
                        variants_created[quality] = {
                            's3_key': variant_key,
                            'file_size': len(variant_content),
                            'bitrate': settings['bitrate']
                        }

                    # Cleanup
                    os.unlink(variant_path)

                except Exception as e:
                    logger.warning(f"Failed to create {quality} variant", error=str(e))

            # Cleanup source
            os.unlink(source_path)

            return {
                'success': True,
                'variants_created': len(variants_created),
                'variants': variants_created
            }

        except Exception as e:
            logger.error("Video variants creation failed", error=str(e))
            return {
                'success': False,
                'error': str(e),
                'variants': {}
            }

    def _generate_storage_paths(
        self,
        user_id: str,
        video_id: str,
        filename: str,
        file_hash: str
    ) -> Dict[str, str]:
        """
        Generate storage paths for different storage systems
        """
        # Date-based partitioning
        date_path = datetime.now(timezone.utc).strftime('%Y/%m/%d')

        # Clean filename
        clean_filename = self._sanitize_filename(filename)

        # Generate paths
        paths = {
            # S3 key with hierarchical structure
            's3_key': f"videos/{date_path}/{user_id}/{video_id}/{clean_filename}",

            # Local backup path
            'local_path': os.path.join(
                self.local_storage_path,
                'videos',
                date_path,
                user_id,
                f"{video_id}_{clean_filename}"
            ),

            # Thumbnail paths
            'thumbnail_key': f"thumbnails/{date_path}/{user_id}/{video_id}/thumb.jpg",

            # Hash-based path for deduplication
            'hash_key': f"hash/{file_hash[:2]}/{file_hash[2:4]}/{file_hash}.mp4"
        }

        return paths

    def _generate_cdn_urls(
        self,
        storage_paths: Dict[str, str],
        file_id: str
    ) -> Dict[str, str]:
        """
        Generate CDN URLs for fast content delivery
        """
        urls = {}

        if self.cloudfront_domain:
            # CloudFront CDN URLs
            urls['primary'] = f"https://{self.cloudfront_domain}/{storage_paths['s3_key']}"
            urls['thumbnail'] = f"https://{self.cloudfront_domain}/{storage_paths['thumbnail_key']}"

            # Signed URL for secure access (implement as needed)
            # urls['signed'] = self._generate_signed_url(storage_paths['s3_key'])
        else:
            # Direct S3 URLs
            urls['primary'] = f"https://{self.s3_bucket}.s3.amazonaws.com/{storage_paths['s3_key']}"
            urls['thumbnail'] = f"https://{self.s3_bucket}.s3.amazonaws.com/{storage_paths['thumbnail_key']}"

        # Add local URL as fallback
        urls['local_fallback'] = f"/api/v1/files/{file_id}/download"

        return urls

    def _create_file_record(
        self,
        filename: str,
        file_hash: str,
        file_size: int,
        user_id: str,
        storage_paths: Dict[str, str],
        metadata: Dict[str, Any]
    ) -> UploadedFile:
        """
        Create database record for the stored file
        """
        file_record = UploadedFile(
            filename=filename,
            original_filename=filename,
            mime_type='video/mp4',
            file_size=file_size,
            file_hash=file_hash,
            storage_path=storage_paths['local_path'],
            user_id=user_id,
            metadata=json.dumps({
                **metadata,
                'storage_paths': storage_paths,
                'storage_tier': 'hot',
                'cdn_enabled': bool(self.cloudfront_domain)
            })
        )

        db.session.add(file_record)
        db.session.commit()

        return file_record

    def _calculate_file_hash(self, content: bytes) -> str:
        """Calculate SHA-256 hash of file content"""
        return hashlib.sha256(content).hexdigest()

    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for safe storage"""
        # Remove or replace unsafe characters
        unsafe_chars = ['<', '>', ':', '"', '/', '\\', '|', '?', '*']
        clean_name = filename
        for char in unsafe_chars:
            clean_name = clean_name.replace(char, '_')

        # Ensure reasonable length
        if len(clean_name) > 100:
            name, ext = os.path.splitext(clean_name)
            clean_name = name[:96] + ext

        return clean_name

    # File retrieval methods
    async def get_video_url(
        self,
        file_id: str,
        quality: str = 'original',
        signed: bool = False,
        expires_in: int = 3600
    ) -> Dict[str, Any]:
        """
        Get video URL with optional quality selection and signing
        """
        try:
            file_record = UploadedFile.query.get(file_id)
            if not file_record:
                return {'success': False, 'error': 'File not found'}

            metadata = json.loads(file_record.metadata or '{}')
            storage_paths = metadata.get('storage_paths', {})

            # Determine S3 key based on quality
            if quality == 'original':
                s3_key = storage_paths['s3_key']
            else:
                s3_key = storage_paths['s3_key'].replace('.mp4', f'_{quality}.mp4')

            # Generate URL
            if signed:
                url = self._generate_presigned_url(s3_key, expires_in)
            else:
                if self.cloudfront_domain:
                    url = f"https://{self.cloudfront_domain}/{s3_key}"
                else:
                    url = f"https://{self.s3_bucket}.s3.amazonaws.com/{s3_key}"

            return {
                'success': True,
                'url': url,
                'quality': quality,
                'expires_at': (datetime.now(timezone.utc) + timedelta(seconds=expires_in)).isoformat() if signed else None
            }

        except Exception as e:
            logger.error("Failed to get video URL", file_id=file_id, error=str(e))
            return {'success': False, 'error': str(e)}

    def _generate_presigned_url(self, s3_key: str, expires_in: int = 3600) -> str:
        """Generate presigned URL for secure file access"""
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.s3_bucket, 'Key': s3_key},
                ExpiresIn=expires_in
            )
            return url
        except Exception as e:
            logger.error("Failed to generate presigned URL", s3_key=s3_key, error=str(e))
            return ""

    # Storage management methods
    async def move_to_cold_storage(self, file_id: str) -> Dict[str, Any]:
        """
        Move file to cold storage tier
        """
        try:
            file_record = UploadedFile.query.get(file_id)
            if not file_record:
                return {'success': False, 'error': 'File not found'}

            metadata = json.loads(file_record.metadata or '{}')
            storage_paths = metadata.get('storage_paths', {})
            s3_key = storage_paths.get('s3_key')

            if not s3_key:
                return {'success': False, 'error': 'S3 key not found'}

            # Move to Glacier storage class
            self.s3_client.copy_object(
                Bucket=self.s3_bucket,
                CopySource={'Bucket': self.s3_bucket, 'Key': s3_key},
                Key=s3_key,
                StorageClass='GLACIER',
                MetadataDirective='COPY'
            )

            # Update metadata
            metadata['storage_tier'] = 'cold'
            file_record.metadata = json.dumps(metadata)
            db.session.commit()

            logger.info("File moved to cold storage", file_id=file_id, s3_key=s3_key)

            return {
                'success': True,
                'storage_tier': 'cold',
                'message': 'File moved to Glacier storage'
            }

        except Exception as e:
            logger.error("Failed to move to cold storage", file_id=file_id, error=str(e))
            return {'success': False, 'error': str(e)}

    async def delete_file(self, file_id: str) -> Dict[str, Any]:
        """
        Delete file from all storage locations
        """
        try:
            file_record = UploadedFile.query.get(file_id)
            if not file_record:
                return {'success': False, 'error': 'File not found'}

            metadata = json.loads(file_record.metadata or '{}')
            storage_paths = metadata.get('storage_paths', {})

            # Delete from S3
            if storage_paths.get('s3_key'):
                try:
                    self.s3_client.delete_object(
                        Bucket=self.s3_bucket,
                        Key=storage_paths['s3_key']
                    )
                    logger.info("File deleted from S3", s3_key=storage_paths['s3_key'])
                except Exception as e:
                    logger.warning("Failed to delete from S3", error=str(e))

            # Delete thumbnail
            if storage_paths.get('thumbnail_key'):
                try:
                    self.s3_client.delete_object(
                        Bucket=self.s3_bucket,
                        Key=storage_paths['thumbnail_key']
                    )
                except Exception as e:
                    logger.warning("Failed to delete thumbnail", error=str(e))

            # Delete local file
            if storage_paths.get('local_path') and os.path.exists(storage_paths['local_path']):
                try:
                    os.unlink(storage_paths['local_path'])
                    logger.info("File deleted locally", path=storage_paths['local_path'])
                except Exception as e:
                    logger.warning("Failed to delete local file", error=str(e))

            # Delete database record
            db.session.delete(file_record)
            db.session.commit()

            logger.info("File completely deleted", file_id=file_id)

            return {
                'success': True,
                'message': 'File deleted from all locations'
            }

        except Exception as e:
            logger.error("Failed to delete file", file_id=file_id, error=str(e))
            return {'success': False, 'error': str(e)}

    def get_storage_stats(self) -> Dict[str, Any]:
        """
        Get storage usage statistics
        """
        try:
            # Query database for file stats
            from sqlalchemy import func

            stats = db.session.query(
                func.count(UploadedFile.id).label('total_files'),
                func.sum(UploadedFile.file_size).label('total_size')
            ).first()

            # Get S3 storage costs (approximate)
            total_size_gb = (stats.total_size or 0) / (1024 ** 3)
            estimated_monthly_cost = total_size_gb * 0.023  # Standard S3 pricing

            return {
                'total_files': stats.total_files or 0,
                'total_size_bytes': stats.total_size or 0,
                'total_size_gb': total_size_gb,
                'estimated_monthly_cost_usd': estimated_monthly_cost,
                's3_bucket': self.s3_bucket,
                'cdn_enabled': bool(self.cloudfront_domain),
                'timestamp': datetime.now(timezone.utc).isoformat()
            }

        except Exception as e:
            logger.error("Failed to get storage stats", error=str(e))
            return {
                'error': str(e),
                'timestamp': datetime.now(timezone.utc).isoformat()
            }