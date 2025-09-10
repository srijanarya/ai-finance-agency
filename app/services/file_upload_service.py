"""
Secure file upload service for KYC documents
Handles encryption, validation, and storage of sensitive documents
"""

import hashlib
import mimetypes
import os
import secrets
import uuid
from datetime import datetime
from pathlib import Path
from typing import BinaryIO, Optional, Tuple

from cryptography.fernet import Fernet
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from PIL import Image
import magic

from config.enhanced_config import enhanced_config


class FileUploadService:
    """
    Service for secure file upload and management
    Implements encryption, validation, and virus scanning
    """
    
    # Maximum file sizes (in bytes)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    MAX_IMAGE_SIZE = 5 * 1024 * 1024   # 5MB
    MAX_PDF_SIZE = 10 * 1024 * 1024    # 10MB
    
    # Allowed MIME types for KYC documents
    ALLOWED_MIME_TYPES = {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/gif': ['.gif'],
        'application/pdf': ['.pdf'],
        'image/webp': ['.webp'],
        'image/tiff': ['.tiff', '.tif']
    }
    
    # Allowed document types
    ALLOWED_DOCUMENT_TYPES = {
        'PAN': ['image/jpeg', 'image/png', 'application/pdf'],
        'AADHAAR': ['image/jpeg', 'image/png', 'application/pdf'],
        'BANK_STATEMENT': ['application/pdf'],
        'UTILITY_BILL': ['image/jpeg', 'image/png', 'application/pdf'],
        'PASSPORT': ['image/jpeg', 'image/png', 'application/pdf'],
        'DRIVING_LICENSE': ['image/jpeg', 'image/png', 'application/pdf'],
        'VOTER_ID': ['image/jpeg', 'image/png', 'application/pdf']
    }
    
    def __init__(self):
        """Initialize file upload service with encryption keys"""
        self.upload_dir = Path(enhanced_config.storage.upload_path or "uploads/kyc")
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize encryption
        self._init_encryption()
        
        # Initialize magic for file type detection
        self.file_magic = magic.Magic(mime=True)
    
    def _init_encryption(self):
        """Initialize encryption key from environment or generate new one"""
        encryption_key = enhanced_config.security.encryption_key
        
        if not encryption_key:
            # Generate a new key if not provided
            encryption_key = Fernet.generate_key()
            # In production, save this key securely (e.g., AWS KMS, Azure Key Vault)
            
        self.cipher = Fernet(encryption_key if isinstance(encryption_key, bytes) else encryption_key.encode())
    
    def validate_file(self, file: BinaryIO, document_type: str) -> Tuple[bool, Optional[str]]:
        """
        Validate uploaded file for type, size, and content
        
        Args:
            file: File binary stream
            document_type: Type of KYC document
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check file size
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > self.MAX_FILE_SIZE:
            return False, f"File size exceeds maximum limit of {self.MAX_FILE_SIZE / (1024*1024)}MB"
        
        # Check MIME type using magic
        file_content = file.read(8192)  # Read first 8KB for magic detection
        file.seek(0)  # Reset
        
        detected_mime = self.file_magic.from_buffer(file_content)
        
        if detected_mime not in self.ALLOWED_MIME_TYPES:
            return False, f"File type {detected_mime} is not allowed"
        
        # Check if document type allows this MIME type
        if document_type in self.ALLOWED_DOCUMENT_TYPES:
            if detected_mime not in self.ALLOWED_DOCUMENT_TYPES[document_type]:
                return False, f"File type {detected_mime} is not allowed for {document_type} documents"
        
        # Additional validation for images
        if detected_mime.startswith('image/'):
            is_valid, error = self._validate_image(file)
            if not is_valid:
                return False, error
        
        # Additional validation for PDFs
        if detected_mime == 'application/pdf':
            is_valid, error = self._validate_pdf(file)
            if not is_valid:
                return False, error
        
        return True, None
    
    def _validate_image(self, file: BinaryIO) -> Tuple[bool, Optional[str]]:
        """
        Validate image file for corruption and dimensions
        
        Args:
            file: Image file stream
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            file.seek(0)
            image = Image.open(file)
            image.verify()  # Verify image integrity
            
            # Check image dimensions
            width, height = image.size
            if width < 200 or height < 200:
                return False, "Image resolution too low (minimum 200x200)"
            
            if width > 10000 or height > 10000:
                return False, "Image resolution too high (maximum 10000x10000)"
            
            file.seek(0)  # Reset for further processing
            return True, None
            
        except Exception as e:
            return False, f"Invalid image file: {str(e)}"
    
    def _validate_pdf(self, file: BinaryIO) -> Tuple[bool, Optional[str]]:
        """
        Validate PDF file for corruption and basic security
        
        Args:
            file: PDF file stream
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            file.seek(0)
            header = file.read(5)
            
            if header != b'%PDF-':
                return False, "Invalid PDF file format"
            
            # Check for encrypted PDFs (basic check)
            file.seek(0)
            content = file.read()
            if b'/Encrypt' in content:
                return False, "Encrypted PDFs are not allowed"
            
            file.seek(0)  # Reset
            return True, None
            
        except Exception as e:
            return False, f"Invalid PDF file: {str(e)}"
    
    def scan_for_malware(self, file_path: Path) -> Tuple[bool, Optional[str]]:
        """
        Scan file for malware using ClamAV or similar
        
        Args:
            file_path: Path to file to scan
            
        Returns:
            Tuple of (is_clean, threat_name)
        """
        # TODO: Integrate with actual antivirus service
        # For now, perform basic checks
        
        # Check for suspicious file patterns
        suspicious_patterns = [
            b'<script',  # JavaScript in files
            b'<%',       # Server-side scripts
            b'<?php',    # PHP code
            b'\x4d\x5a', # Windows executable
            b'\x7fELF',  # Linux executable
        ]
        
        try:
            with open(file_path, 'rb') as f:
                content = f.read(1024)  # Check first 1KB
                
                for pattern in suspicious_patterns:
                    if pattern in content:
                        return False, "Suspicious content detected"
            
            return True, None
            
        except Exception:
            return False, "Unable to scan file"
    
    def encrypt_file(self, file_content: bytes) -> Tuple[bytes, str]:
        """
        Encrypt file content using Fernet encryption
        
        Args:
            file_content: Raw file content
            
        Returns:
            Tuple of (encrypted_content, encryption_key_id)
        """
        encrypted_content = self.cipher.encrypt(file_content)
        
        # Generate a unique key ID for key rotation tracking
        key_id = f"key_{datetime.utcnow().strftime('%Y%m%d')}_{secrets.token_hex(8)}"
        
        return encrypted_content, key_id
    
    def decrypt_file(self, encrypted_content: bytes) -> bytes:
        """
        Decrypt file content
        
        Args:
            encrypted_content: Encrypted file content
            
        Returns:
            Decrypted content
        """
        return self.cipher.decrypt(encrypted_content)
    
    def calculate_file_hash(self, file_content: bytes) -> str:
        """
        Calculate SHA-256 hash of file content
        
        Args:
            file_content: File content
            
        Returns:
            Hex digest of SHA-256 hash
        """
        return hashlib.sha256(file_content).hexdigest()
    
    def generate_secure_filename(self, original_filename: str, user_id: str, document_type: str) -> str:
        """
        Generate secure filename for storage
        
        Args:
            original_filename: Original uploaded filename
            user_id: User ID
            document_type: Type of document
            
        Returns:
            Secure filename
        """
        # Extract extension
        _, ext = os.path.splitext(original_filename)
        ext = ext.lower()
        
        # Generate secure filename
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        random_suffix = secrets.token_hex(8)
        
        secure_filename = f"{user_id}/{document_type}/{timestamp}_{random_suffix}{ext}"
        
        return secure_filename
    
    def save_encrypted_file(
        self,
        file: BinaryIO,
        user_id: str,
        document_type: str,
        original_filename: str
    ) -> Tuple[str, str, str, int]:
        """
        Save encrypted file to storage
        
        Args:
            file: File stream
            user_id: User ID
            document_type: Document type
            original_filename: Original filename
            
        Returns:
            Tuple of (file_path, file_hash, encryption_key_id, file_size)
        """
        # Read file content
        file_content = file.read()
        file_size = len(file_content)
        
        # Calculate hash before encryption
        file_hash = self.calculate_file_hash(file_content)
        
        # Encrypt content
        encrypted_content, key_id = self.encrypt_file(file_content)
        
        # Generate secure filename
        secure_filename = self.generate_secure_filename(original_filename, user_id, document_type)
        
        # Create full path
        file_path = self.upload_dir / secure_filename
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Save encrypted file
        with open(file_path, 'wb') as f:
            f.write(encrypted_content)
        
        # Set restrictive permissions (Unix-like systems)
        os.chmod(file_path, 0o600)
        
        return str(file_path), file_hash, key_id, file_size
    
    def retrieve_decrypted_file(self, file_path: str) -> Optional[bytes]:
        """
        Retrieve and decrypt file from storage
        
        Args:
            file_path: Path to encrypted file
            
        Returns:
            Decrypted file content or None if error
        """
        try:
            with open(file_path, 'rb') as f:
                encrypted_content = f.read()
            
            return self.decrypt_file(encrypted_content)
            
        except Exception:
            return None
    
    def delete_file(self, file_path: str) -> bool:
        """
        Securely delete file from storage
        
        Args:
            file_path: Path to file
            
        Returns:
            True if successful
        """
        try:
            path = Path(file_path)
            
            if path.exists():
                # Overwrite file with random data before deletion
                file_size = path.stat().st_size
                with open(path, 'wb') as f:
                    f.write(os.urandom(file_size))
                
                # Delete file
                path.unlink()
                
                # Clean up empty directories
                try:
                    path.parent.rmdir()
                except OSError:
                    pass  # Directory not empty
                
            return True
            
        except Exception:
            return False
    
    def create_thumbnail(self, image_content: bytes, max_size: Tuple[int, int] = (200, 200)) -> bytes:
        """
        Create thumbnail for image files
        
        Args:
            image_content: Original image content
            max_size: Maximum thumbnail dimensions
            
        Returns:
            Thumbnail image content
        """
        from io import BytesIO
        
        # Open image
        image = Image.open(BytesIO(image_content))
        
        # Convert RGBA to RGB if necessary
        if image.mode == 'RGBA':
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[3])
            image = background
        
        # Create thumbnail
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save to bytes
        output = BytesIO()
        image.save(output, format='JPEG', quality=85, optimize=True)
        
        return output.getvalue()
    
    def apply_watermark(self, image_content: bytes, watermark_text: str) -> bytes:
        """
        Apply watermark to image for audit purposes
        
        Args:
            image_content: Original image content
            watermark_text: Text to use as watermark
            
        Returns:
            Watermarked image content
        """
        from io import BytesIO
        from PIL import ImageDraw, ImageFont
        
        # Open image
        image = Image.open(BytesIO(image_content))
        
        # Create drawing context
        draw = ImageDraw.Draw(image)
        
        # Calculate text position
        width, height = image.size
        text_width = len(watermark_text) * 10  # Approximate
        text_height = 20
        
        x = width - text_width - 10
        y = height - text_height - 10
        
        # Draw watermark
        draw.text((x, y), watermark_text, fill=(128, 128, 128, 128))
        
        # Save to bytes
        output = BytesIO()
        image.save(output, format=image.format or 'JPEG')
        
        return output.getvalue()


# Singleton instance
file_upload_service = FileUploadService()