"""
Photo Processing API Endpoints
RESTful API for photo upload, analysis, enhancement, and face detection
"""

import os
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field, validator
from sqlalchemy.orm import Session

from ....core.config import get_settings
from ....core.database import get_db
from ....services.nano_banana_client import nano_banana_client
from ....database.models import (
    Photo, PhotoAnalysis, PhotoEnhancement, FaceDetection,
    FaceLandmark, PhotoProcessingJob, db_manager
)
from ....tasks.photo_processing_tasks import (
    analyze_photo_task, enhance_photo_task, detect_faces_task, 
    batch_process_photos_task, get_processing_stats
)
from ....celery_app import TaskMonitor, QueueManager

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()

# Pydantic models for request/response
class PhotoUploadResponse(BaseModel):
    photo_id: int
    filename: str
    file_size: int
    format: str
    width: int
    height: int
    upload_timestamp: datetime
    processing_status: str

class AnalysisRequest(BaseModel):
    use_nano_banana: bool = True
    priority: str = Field(default="normal", regex="^(low|normal|high)$")

class EnhancementRequest(BaseModel):
    brightness_adjustment: Optional[float] = Field(default=None, ge=-1.0, le=1.0)
    contrast_adjustment: Optional[float] = Field(default=None, ge=-1.0, le=1.0)
    saturation_adjustment: Optional[float] = Field(default=None, ge=-1.0, le=1.0)
    sharpness_adjustment: Optional[float] = Field(default=None, ge=-1.0, le=1.0)
    noise_reduction_level: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    auto_enhance: bool = True
    apply_background_blur: bool = False
    enhance_face_region: bool = False
    auto_white_balance: bool = False
    auto_color_correction: bool = False

class BatchProcessingRequest(BaseModel):
    photo_ids: List[int]
    analyze: bool = True
    enhance: bool = False
    detect_faces: bool = True
    enhancement_settings: Optional[EnhancementRequest] = None

class ProcessingJobStatus(BaseModel):
    job_id: str
    photo_id: int
    job_type: str
    status: str
    progress: int
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    error_message: Optional[str]
    result_data: Optional[Dict[str, Any]]


# Utility functions
def save_uploaded_file(uploaded_file: UploadFile, user_id: int) -> str:
    """Save uploaded file to disk and return file path"""
    # Create user directory
    upload_dir = f"uploads/user_{user_id}"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(uploaded_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(uploaded_file.file.read())
    
    return file_path

def validate_image_file(uploaded_file: UploadFile) -> None:
    """Validate uploaded image file"""
    # Check file type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if uploaded_file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {uploaded_file.content_type}. Allowed: {allowed_types}"
        )
    
    # Check file size
    max_size = settings.max_photo_size_mb * 1024 * 1024  # Convert to bytes
    if uploaded_file.size > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large: {uploaded_file.size} bytes. Maximum: {max_size} bytes"
        )

def get_image_dimensions(file_path: str) -> tuple:
    """Get image dimensions"""
    from PIL import Image
    try:
        with Image.open(file_path) as img:
            return img.width, img.height
    except Exception as e:
        logger.error(f"Failed to get image dimensions: {e}")
        return 0, 0


# API Endpoints

@router.post("/upload", response_model=PhotoUploadResponse)
async def upload_photo(
    file: UploadFile = File(...),
    user_id: int = Form(...),
    db: Session = Depends(get_db)
):
    """
    Upload a photo for processing
    """
    try:
        # Validate file
        validate_image_file(file)
        
        # Save file
        file_path = save_uploaded_file(file, user_id)
        
        # Get image dimensions
        width, height = get_image_dimensions(file_path)
        
        # Create database record
        photo = Photo(
            user_id=user_id,
            filename=file.filename,
            file_path=file_path,
            file_size_bytes=file.size,
            format=file.content_type.split("/")[1].upper(),
            width=width,
            height=height,
            processing_status="uploaded"
        )
        
        db.add(photo)
        db.commit()
        db.refresh(photo)
        
        logger.info(f"Photo uploaded: {photo.id} by user {user_id}")
        
        return PhotoUploadResponse(
            photo_id=photo.id,
            filename=photo.filename,
            file_size=photo.file_size_bytes,
            format=photo.format,
            width=photo.width,
            height=photo.height,
            upload_timestamp=photo.upload_timestamp,
            processing_status=photo.processing_status
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Photo upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/analyze/{photo_id}")
async def analyze_photo(
    photo_id: int,
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Start photo analysis job
    """
    try:
        # Check if photo exists
        photo = db.query(Photo).filter_by(id=photo_id).first()
        if not photo:
            raise HTTPException(status_code=404, detail="Photo not found")
        
        # Create processing job record
        job = PhotoProcessingJob(
            photo_id=photo_id,
            job_type="analysis",
            status="pending"
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # Start analysis task
        queue = "photo_analysis"
        if request.priority == "high":
            # High priority tasks go to front of queue
            task = analyze_photo_task.apply_async(
                args=[photo_id, request.use_nano_banana],
                queue=queue,
                priority=10
            )
        else:
            task = analyze_photo_task.apply_async(
                args=[photo_id, request.use_nano_banana],
                queue=queue
            )
        
        # Update job with task ID
        job.celery_task_id = task.id
        db.commit()
        
        logger.info(f"Analysis started for photo {photo_id}, task {task.id}")
        
        return {
            "photo_id": photo_id,
            "job_id": task.id,
            "status": "started",
            "message": "Photo analysis started",
            "estimated_completion_time": "30-60 seconds",
            "use_nano_banana": request.use_nano_banana
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start photo analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/enhance/{photo_id}")
async def enhance_photo(
    photo_id: int,
    request: EnhancementRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Start photo enhancement job
    """
    try:
        # Check if photo exists
        photo = db.query(Photo).filter_by(id=photo_id).first()
        if not photo:
            raise HTTPException(status_code=404, detail="Photo not found")
        
        # Create processing job record
        job = PhotoProcessingJob(
            photo_id=photo_id,
            job_type="enhancement",
            status="pending"
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # Prepare enhancement settings
        enhancement_settings = None
        if not request.auto_enhance:
            enhancement_settings = {
                "brightness_adjustment": request.brightness_adjustment or 0.0,
                "contrast_adjustment": request.contrast_adjustment or 0.0,
                "saturation_adjustment": request.saturation_adjustment or 0.0,
                "sharpness_adjustment": request.sharpness_adjustment or 0.0,
                "noise_reduction_level": request.noise_reduction_level or 0.0,
                "apply_background_blur": request.apply_background_blur,
                "enhance_face_region": request.enhance_face_region,
                "auto_white_balance": request.auto_white_balance,
                "auto_color_correction": request.auto_color_correction
            }
        
        # Start enhancement task
        task = enhance_photo_task.apply_async(
            args=[photo_id, enhancement_settings],
            queue="photo_enhancement"
        )
        
        # Update job with task ID
        job.celery_task_id = task.id
        db.commit()
        
        logger.info(f"Enhancement started for photo {photo_id}, task {task.id}")
        
        return {
            "photo_id": photo_id,
            "job_id": task.id,
            "status": "started",
            "message": "Photo enhancement started",
            "estimated_completion_time": "60-120 seconds",
            "auto_enhance": request.auto_enhance,
            "custom_settings": enhancement_settings is not None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start photo enhancement: {e}")
        raise HTTPException(status_code=500, detail=f"Enhancement failed: {str(e)}")


@router.post("/detect-faces/{photo_id}")
async def detect_faces(
    photo_id: int,
    use_nano_banana: bool = True,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db)
):
    """
    Start face detection job
    """
    try:
        # Check if photo exists
        photo = db.query(Photo).filter_by(id=photo_id).first()
        if not photo:
            raise HTTPException(status_code=404, detail="Photo not found")
        
        # Create processing job record
        job = PhotoProcessingJob(
            photo_id=photo_id,
            job_type="face_detection",
            status="pending"
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # Start face detection task
        task = detect_faces_task.apply_async(
            args=[photo_id, use_nano_banana],
            queue="face_detection"
        )
        
        # Update job with task ID
        job.celery_task_id = task.id
        db.commit()
        
        logger.info(f"Face detection started for photo {photo_id}, task {task.id}")
        
        return {
            "photo_id": photo_id,
            "job_id": task.id,
            "status": "started",
            "message": "Face detection started",
            "estimated_completion_time": "30-90 seconds",
            "use_nano_banana": use_nano_banana
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start face detection: {e}")
        raise HTTPException(status_code=500, detail=f"Face detection failed: {str(e)}")


@router.post("/batch-process")
async def batch_process_photos(
    request: BatchProcessingRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Start batch processing for multiple photos
    """
    try:
        # Validate all photos exist
        photos = db.query(Photo).filter(Photo.id.in_(request.photo_ids)).all()
        if len(photos) != len(request.photo_ids):
            found_ids = [p.id for p in photos]
            missing_ids = [pid for pid in request.photo_ids if pid not in found_ids]
            raise HTTPException(
                status_code=404, 
                detail=f"Photos not found: {missing_ids}"
            )
        
        # Create batch processing job
        job = PhotoProcessingJob(
            photo_id=request.photo_ids[0],  # Use first photo as reference
            job_type="batch_processing",
            status="pending"
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # Prepare processing options
        processing_options = {
            "analyze": request.analyze,
            "enhance": request.enhance,
            "detect_faces": request.detect_faces
        }
        
        # Start batch processing task
        task = batch_process_photos_task.apply_async(
            args=[request.photo_ids, processing_options],
            queue="batch_processing"
        )
        
        # Update job with task ID
        job.celery_task_id = task.id
        db.commit()
        
        logger.info(f"Batch processing started for {len(request.photo_ids)} photos, task {task.id}")
        
        return {
            "batch_job_id": task.id,
            "photo_count": len(request.photo_ids),
            "processing_options": processing_options,
            "status": "started",
            "message": f"Batch processing started for {len(request.photo_ids)} photos",
            "estimated_completion_time": f"{len(request.photo_ids) * 30}-{len(request.photo_ids) * 120} seconds"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start batch processing: {e}")
        raise HTTPException(status_code=500, detail=f"Batch processing failed: {str(e)}")


@router.get("/job/{job_id}/status", response_model=Dict[str, Any])
async def get_job_status(job_id: str, db: Session = Depends(get_db)):
    """
    Get processing job status
    """
    try:
        # Get task result from Celery
        task_result = TaskMonitor.get_task_result(job_id)
        
        if not task_result:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Get job from database
        job = db.query(PhotoProcessingJob).filter_by(celery_task_id=job_id).first()
        
        # Get task state and metadata
        state = task_result.state
        info = task_result.info or {}
        
        # Map Celery states to our status
        status_mapping = {
            "PENDING": "pending",
            "STARTED": "running", 
            "PROGRESS": "running",
            "SUCCESS": "completed",
            "FAILURE": "failed",
            "REVOKED": "cancelled"
        }
        
        status = status_mapping.get(state, "unknown")
        progress = 0
        
        if state == "PROGRESS" and isinstance(info, dict):
            progress = info.get("progress", 0)
        elif state == "SUCCESS":
            progress = 100
        
        result = {
            "job_id": job_id,
            "status": status,
            "progress": progress,
            "state": state
        }
        
        # Add job details if available in database
        if job:
            result.update({
                "photo_id": job.photo_id,
                "job_type": job.job_type,
                "created_at": job.created_at.isoformat(),
                "started_at": job.started_at.isoformat() if job.started_at else None,
                "completed_at": job.completed_at.isoformat() if job.completed_at else None,
                "error_message": job.error_message
            })
        
        # Add result data if completed
        if state == "SUCCESS":
            result["result"] = info
        elif state == "FAILURE":
            result["error"] = str(info)
        elif state == "PROGRESS":
            result["progress_info"] = info
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get job status: {e}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")


@router.get("/photo/{photo_id}/results")
async def get_photo_results(photo_id: int, db: Session = Depends(get_db)):
    """
    Get all processing results for a photo
    """
    try:
        # Check if photo exists
        photo = db.query(Photo).filter_by(id=photo_id).first()
        if not photo:
            raise HTTPException(status_code=404, detail="Photo not found")
        
        # Get analysis results
        analysis = db.query(PhotoAnalysis).filter_by(photo_id=photo_id).first()
        
        # Get enhancement results
        enhancements = db.query(PhotoEnhancement).filter_by(photo_id=photo_id).all()
        
        # Get face detection results
        face_detections = db.query(FaceDetection).filter_by(photo_id=photo_id).all()
        
        # Get processing jobs
        jobs = db.query(PhotoProcessingJob).filter_by(photo_id=photo_id).all()
        
        # Compile results
        results = {
            "photo_id": photo_id,
            "photo_info": {
                "filename": photo.filename,
                "format": photo.format,
                "width": photo.width,
                "height": photo.height,
                "file_size": photo.file_size_bytes,
                "upload_timestamp": photo.upload_timestamp.isoformat(),
                "processing_status": photo.processing_status
            },
            "analysis": None,
            "enhancements": [],
            "face_detections": [],
            "processing_jobs": []
        }
        
        # Add analysis results
        if analysis:
            results["analysis"] = {
                "id": analysis.id,
                "quality_metrics": {
                    "brightness": analysis.brightness_score,
                    "contrast": analysis.contrast_score,
                    "sharpness": analysis.sharpness_score,
                    "noise_level": analysis.noise_level,
                    "overall_score": analysis.overall_quality_score
                },
                "composition": {
                    "rule_of_thirds": analysis.rule_of_thirds_score,
                    "symmetry": analysis.symmetry_score,
                    "leading_lines": analysis.leading_lines_detected,
                    "composition_score": analysis.composition_score
                },
                "crop_suggestion": {
                    "x": analysis.suggested_crop_x,
                    "y": analysis.suggested_crop_y,
                    "width": analysis.suggested_crop_width,
                    "height": analysis.suggested_crop_height
                } if analysis.suggested_crop_x is not None else None,
                "created_at": analysis.created_at.isoformat(),
                "metadata": analysis.analysis_metadata
            }
        
        # Add enhancement results
        for enhancement in enhancements:
            results["enhancements"].append({
                "id": enhancement.id,
                "settings": {
                    "brightness_adjustment": enhancement.brightness_adjustment,
                    "contrast_adjustment": enhancement.contrast_adjustment,
                    "saturation_adjustment": enhancement.saturation_adjustment,
                    "sharpness_adjustment": enhancement.sharpness_adjustment,
                    "noise_reduction_level": enhancement.noise_reduction_level
                },
                "enhanced_file_path": enhancement.enhanced_file_path,
                "improvement_score": enhancement.enhancement_score,
                "processing_time": enhancement.processing_time_seconds,
                "created_at": enhancement.created_at.isoformat(),
                "metadata": enhancement.enhancement_metadata
            })
        
        # Add face detection results
        for detection in face_detections:
            # Get landmarks for this detection
            landmarks = db.query(FaceLandmark).filter_by(face_detection_id=detection.id).all()
            
            detection_result = {
                "id": detection.id,
                "faces_detected": detection.faces_detected,
                "primary_face_id": detection.primary_face_id,
                "detection_confidence": detection.detection_confidence,
                "detection_service": detection.detection_service,
                "processing_time": detection.processing_time_seconds,
                "created_at": detection.created_at.isoformat(),
                "faces": []
            }
            
            for landmark in landmarks:
                detection_result["faces"].append({
                    "face_index": landmark.face_index,
                    "bounding_box": {
                        "x": landmark.bbox_x,
                        "y": landmark.bbox_y,
                        "width": landmark.bbox_width,
                        "height": landmark.bbox_height
                    },
                    "key_landmarks": {
                        "left_eye_center": [landmark.left_eye_center_x, landmark.left_eye_center_y],
                        "right_eye_center": [landmark.right_eye_center_x, landmark.right_eye_center_y],
                        "nose_tip": [landmark.nose_tip_x, landmark.nose_tip_y],
                        "mouth_center": [landmark.mouth_center_x, landmark.mouth_center_y],
                        "mouth_left": [landmark.mouth_left_x, landmark.mouth_left_y],
                        "mouth_right": [landmark.mouth_right_x, landmark.mouth_right_y]
                    },
                    "head_pose": {
                        "pitch": landmark.head_pose_pitch,
                        "yaw": landmark.head_pose_yaw,
                        "roll": landmark.head_pose_roll
                    },
                    "expression": {
                        "primary": landmark.primary_expression,
                        "confidence": landmark.expression_confidence,
                        "scores": landmark.expression_scores
                    },
                    "quality": {
                        "landmark_quality": landmark.landmark_quality_score,
                        "suitable_for_animation": landmark.suitable_for_animation
                    }
                })
            
            results["face_detections"].append(detection_result)
        
        # Add job history
        for job in jobs:
            results["processing_jobs"].append({
                "id": job.id,
                "job_type": job.job_type,
                "status": job.status,
                "celery_task_id": job.celery_task_id,
                "created_at": job.created_at.isoformat(),
                "started_at": job.started_at.isoformat() if job.started_at else None,
                "completed_at": job.completed_at.isoformat() if job.completed_at else None,
                "error_message": job.error_message,
                "retry_count": job.retry_count
            })
        
        return results
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get photo results: {e}")
        raise HTTPException(status_code=500, detail=f"Results retrieval failed: {str(e)}")


@router.get("/photo/{photo_id}/download/{file_type}")
async def download_photo_file(
    photo_id: int,
    file_type: str,
    db: Session = Depends(get_db)
):
    """
    Download photo files (original, enhanced, comparison)
    """
    try:
        # Check if photo exists
        photo = db.query(Photo).filter_by(id=photo_id).first()
        if not photo:
            raise HTTPException(status_code=404, detail="Photo not found")
        
        file_path = None
        filename = None
        
        if file_type == "original":
            file_path = photo.file_path
            filename = photo.filename
        elif file_type == "enhanced":
            enhancement = db.query(PhotoEnhancement).filter_by(photo_id=photo_id).first()
            if not enhancement or not enhancement.enhanced_file_path:
                raise HTTPException(status_code=404, detail="Enhanced photo not available")
            file_path = enhancement.enhanced_file_path
            filename = f"enhanced_{photo.filename}"
        elif file_type == "comparison":
            # Look for comparison file
            base_name = os.path.splitext(photo.filename)[0]
            comparison_path = os.path.join(os.path.dirname(photo.file_path), f"{base_name}_comparison.jpg")
            if not os.path.exists(comparison_path):
                raise HTTPException(status_code=404, detail="Comparison image not available")
            file_path = comparison_path
            filename = f"comparison_{photo.filename}"
        else:
            raise HTTPException(
                status_code=400, 
                detail="Invalid file type. Use: original, enhanced, comparison"
            )
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found on disk")
        
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type="image/jpeg"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to download photo file: {e}")
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")


@router.get("/stats")
async def get_processing_statistics():
    """
    Get processing statistics and system status
    """
    try:
        # Get processing stats task
        stats_task = get_processing_stats.delay()
        stats = stats_task.get(timeout=10)  # Wait up to 10 seconds
        
        # Get queue statistics
        queue_stats = QueueManager.get_all_queue_stats()
        queue_health, health_message = QueueManager.is_queue_healthy()
        
        # Get active tasks
        active_tasks = TaskMonitor.get_active_tasks()
        active_count = sum(len(tasks) for tasks in active_tasks.values()) if active_tasks else 0
        
        return {
            "processing_stats": stats,
            "queue_stats": queue_stats,
            "queue_health": {
                "healthy": queue_health,
                "message": health_message
            },
            "active_tasks": active_count,
            "nano_banana_available": nano_banana_client.api_key is not None,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get processing statistics: {e}")
        raise HTTPException(status_code=500, detail=f"Stats retrieval failed: {str(e)}")


@router.post("/job/{job_id}/cancel")
async def cancel_job(job_id: str, db: Session = Depends(get_db)):
    """
    Cancel a running processing job
    """
    try:
        # Cancel the Celery task
        TaskMonitor.cancel_task(job_id)
        
        # Update job status in database
        job = db.query(PhotoProcessingJob).filter_by(celery_task_id=job_id).first()
        if job:
            job.status = "cancelled"
            job.error_message = "Job cancelled by user"
            db.commit()
        
        logger.info(f"Job {job_id} cancelled")
        
        return {
            "job_id": job_id,
            "status": "cancelled",
            "message": "Job cancelled successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to cancel job {job_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Job cancellation failed: {str(e)}")


@router.delete("/photo/{photo_id}")
async def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    """
    Delete a photo and all associated data
    """
    try:
        # Get photo
        photo = db.query(Photo).filter_by(id=photo_id).first()
        if not photo:
            raise HTTPException(status_code=404, detail="Photo not found")
        
        # Delete associated files
        files_deleted = []
        
        # Delete original file
        if os.path.exists(photo.file_path):
            os.remove(photo.file_path)
            files_deleted.append("original")
        
        # Delete enhanced files
        enhancements = db.query(PhotoEnhancement).filter_by(photo_id=photo_id).all()
        for enhancement in enhancements:
            if enhancement.enhanced_file_path and os.path.exists(enhancement.enhanced_file_path):
                os.remove(enhancement.enhanced_file_path)
                files_deleted.append("enhanced")
        
        # Delete comparison files
        base_name = os.path.splitext(photo.filename)[0]
        comparison_path = os.path.join(os.path.dirname(photo.file_path), f"{base_name}_comparison.jpg")
        if os.path.exists(comparison_path):
            os.remove(comparison_path)
            files_deleted.append("comparison")
        
        # Cancel any running jobs
        active_jobs = db.query(PhotoProcessingJob).filter_by(
            photo_id=photo_id,
            status="running"
        ).all()
        
        for job in active_jobs:
            if job.celery_task_id:
                TaskMonitor.cancel_task(job.celery_task_id)
        
        # Delete database records (cascading will handle related records)
        db.delete(photo)
        db.commit()
        
        logger.info(f"Photo {photo_id} deleted successfully")
        
        return {
            "photo_id": photo_id,
            "status": "deleted",
            "files_deleted": files_deleted,
            "jobs_cancelled": len(active_jobs),
            "message": "Photo and all associated data deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete photo {photo_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Photo deletion failed: {str(e)}")


# Health check endpoint
@router.get("/health")
async def health_check():
    """
    Health check for photo processing service
    """
    try:
        # Check basic service health
        health_status = {
            "service": "photo_processing_api",
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "components": {}
        }
        
        # Check database connection
        try:
            db = next(get_db())
            db.execute("SELECT 1")
            health_status["components"]["database"] = "healthy"
        except Exception as e:
            health_status["components"]["database"] = f"unhealthy: {e}"
            health_status["status"] = "degraded"
        
        # Check Celery/Redis
        try:
            queue_health, message = QueueManager.is_queue_healthy()
            health_status["components"]["celery_queues"] = "healthy" if queue_health else f"unhealthy: {message}"
            if not queue_health:
                health_status["status"] = "degraded"
        except Exception as e:
            health_status["components"]["celery_queues"] = f"error: {e}"
            health_status["status"] = "degraded"
        
        # Check Nano Banana API
        try:
            if nano_banana_client.api_key:
                api_healthy = nano_banana_client.health_check()
                health_status["components"]["nano_banana_api"] = "healthy" if api_healthy else "unhealthy"
            else:
                health_status["components"]["nano_banana_api"] = "not_configured"
        except Exception as e:
            health_status["components"]["nano_banana_api"] = f"error: {e}"
        
        return health_status
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "service": "photo_processing_api",
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }