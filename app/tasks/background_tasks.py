"""
Background Tasks for System Maintenance and Monitoring
Periodic tasks for cleanup, statistics, and health monitoring
"""

from datetime import datetime, timedelta
from typing import Dict, Any
import logging
from sqlalchemy import func

from ..celery_app import celery_app
from ..database.models import (
    Photo, PhotoAnalysis, PhotoEnhancement, FaceDetection,
    PhotoProcessingJob, db_manager
)

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="cleanup_expired_jobs")
def cleanup_expired_jobs(self, max_age_days: int = 7) -> Dict[str, Any]:
    """
    Clean up expired processing jobs and associated data
    
    Args:
        max_age_days: Maximum age in days for jobs to keep
        
    Returns:
        Dictionary with cleanup results
    """
    session = db_manager.get_session()
    
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=max_age_days)
        
        # Count jobs to be deleted
        expired_jobs = session.query(PhotoProcessingJob).filter(
            PhotoProcessingJob.created_at < cutoff_date,
            PhotoProcessingJob.status.in_(["completed", "failed"])
        ).all()
        
        jobs_deleted = 0
        data_freed_mb = 0
        
        for job in expired_jobs:
            try:
                # Calculate approximate data size (for metrics)
                if job.result_data:
                    import json
                    data_size = len(json.dumps(job.result_data).encode('utf-8'))
                    data_freed_mb += data_size / (1024 * 1024)
                
                session.delete(job)
                jobs_deleted += 1
                
            except Exception as e:
                logger.warning(f"Failed to delete job {job.id}: {e}")
        
        session.commit()
        
        result = {
            "jobs_deleted": jobs_deleted,
            "data_freed_mb": round(data_freed_mb, 2),
            "cutoff_date": cutoff_date.isoformat(),
            "max_age_days": max_age_days,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        logger.info(f"Cleanup completed: {jobs_deleted} jobs deleted, {data_freed_mb:.2f}MB freed")
        return result
        
    except Exception as e:
        session.rollback()
        logger.error(f"Job cleanup failed: {e}")
        raise e
    
    finally:
        session.close()


@celery_app.task(bind=True, name="update_processing_statistics")
def update_processing_statistics(self) -> Dict[str, Any]:
    """
    Update system processing statistics
    
    Returns:
        Dictionary with current statistics
    """
    session = db_manager.get_session()
    
    try:
        # Photo statistics
        total_photos = session.query(func.count(Photo.id)).scalar()
        
        photos_by_status = session.query(
            Photo.processing_status,
            func.count(Photo.id)
        ).group_by(Photo.processing_status).all()
        
        # Processing job statistics
        total_jobs = session.query(func.count(PhotoProcessingJob.id)).scalar()
        
        jobs_by_status = session.query(
            PhotoProcessingJob.status,
            func.count(PhotoProcessingJob.id)
        ).group_by(PhotoProcessingJob.status).all()
        
        jobs_by_type = session.query(
            PhotoProcessingJob.job_type,
            func.count(PhotoProcessingJob.id)
        ).group_by(PhotoProcessingJob.job_type).all()
        
        # Success rates (last 24 hours)
        last_24h = datetime.utcnow() - timedelta(hours=24)
        
        recent_jobs = session.query(PhotoProcessingJob).filter(
            PhotoProcessingJob.created_at >= last_24h
        ).all()
        
        success_rate = 0
        avg_processing_time = 0
        
        if recent_jobs:
            successful_jobs = [j for j in recent_jobs if j.status == "completed"]
            success_rate = (len(successful_jobs) / len(recent_jobs)) * 100
            
            # Calculate average processing time for completed jobs
            completed_with_times = [
                j for j in successful_jobs 
                if j.completed_at and j.created_at
            ]
            
            if completed_with_times:
                total_time = sum([
                    (j.completed_at - j.created_at).total_seconds()
                    for j in completed_with_times
                ])
                avg_processing_time = total_time / len(completed_with_times)
        
        # Analysis statistics
        total_analyses = session.query(func.count(PhotoAnalysis.id)).scalar()
        
        avg_quality_score = session.query(
            func.avg(PhotoAnalysis.overall_quality_score)
        ).scalar() or 0
        
        # Enhancement statistics
        total_enhancements = session.query(func.count(PhotoEnhancement.id)).scalar()
        
        avg_improvement_score = session.query(
            func.avg(PhotoEnhancement.enhancement_score)
        ).scalar() or 0
        
        # Face detection statistics
        total_face_detections = session.query(func.count(FaceDetection.id)).scalar()
        
        faces_detected_distribution = session.query(
            FaceDetection.faces_detected,
            func.count(FaceDetection.id)
        ).group_by(FaceDetection.faces_detected).all()
        
        # Queue health from Celery
        from ..celery_app import QueueManager
        queue_stats = QueueManager.get_all_queue_stats()
        queue_health, health_message = QueueManager.is_queue_healthy()
        
        # Compile statistics
        statistics = {
            "timestamp": datetime.utcnow().isoformat(),
            "photos": {
                "total": total_photos,
                "by_status": dict(photos_by_status)
            },
            "processing_jobs": {
                "total": total_jobs,
                "by_status": dict(jobs_by_status),
                "by_type": dict(jobs_by_type),
                "success_rate_24h": round(success_rate, 2),
                "avg_processing_time_seconds": round(avg_processing_time, 2)
            },
            "analysis": {
                "total_analyses": total_analyses,
                "avg_quality_score": round(float(avg_quality_score), 3)
            },
            "enhancement": {
                "total_enhancements": total_enhancements,
                "avg_improvement_score": round(float(avg_improvement_score), 3)
            },
            "face_detection": {
                "total_detections": total_face_detections,
                "faces_per_photo_distribution": dict(faces_detected_distribution)
            },
            "queue_health": {
                "healthy": queue_health,
                "message": health_message,
                "queue_stats": queue_stats
            },
            "system_health": {
                "database_connection": True,  # If we got here, DB is working
                "redis_connection": True,     # If Celery is working, Redis is working
                "processing_capacity": "normal" if queue_health else "degraded"
            }
        }
        
        # Store statistics (you might want to store this in a separate table or cache)
        logger.info("Processing statistics updated successfully")
        return statistics
        
    except Exception as e:
        logger.error(f"Failed to update processing statistics: {e}")
        raise e
    
    finally:
        session.close()


@celery_app.task(bind=True, name="health_check_system")
def health_check_system(self) -> Dict[str, Any]:
    """
    Comprehensive system health check
    
    Returns:
        Dictionary with health status
    """
    health_status = {
        "timestamp": datetime.utcnow().isoformat(),
        "overall_health": "healthy",
        "components": {}
    }
    
    issues = []
    
    try:
        # Database health
        session = db_manager.get_session()
        try:
            session.execute("SELECT 1")
            health_status["components"]["database"] = {
                "status": "healthy",
                "message": "Database connection successful"
            }
        except Exception as e:
            health_status["components"]["database"] = {
                "status": "unhealthy",
                "message": f"Database connection failed: {e}"
            }
            issues.append("Database connection failed")
        finally:
            session.close()
        
        # Redis/Celery health
        from ..celery_app import QueueManager, validate_celery_config
        
        try:
            queue_health, queue_message = QueueManager.is_queue_healthy()
            celery_issues = validate_celery_config()
            
            if queue_health and not celery_issues:
                health_status["components"]["celery"] = {
                    "status": "healthy",
                    "message": "Celery queues operating normally"
                }
            else:
                health_status["components"]["celery"] = {
                    "status": "degraded",
                    "message": f"Queue issues: {queue_message}, Config issues: {celery_issues}"
                }
                issues.append("Celery/Redis issues detected")
        except Exception as e:
            health_status["components"]["celery"] = {
                "status": "unhealthy",
                "message": f"Celery health check failed: {e}"
            }
            issues.append("Celery system unavailable")
        
        # Disk space check
        try:
            import shutil
            total, used, free = shutil.disk_usage("/")
            
            free_percent = (free / total) * 100
            
            if free_percent > 20:
                health_status["components"]["disk_space"] = {
                    "status": "healthy",
                    "message": f"Sufficient disk space: {free_percent:.1f}% free"
                }
            elif free_percent > 10:
                health_status["components"]["disk_space"] = {
                    "status": "warning",
                    "message": f"Low disk space: {free_percent:.1f}% free"
                }
                issues.append("Disk space running low")
            else:
                health_status["components"]["disk_space"] = {
                    "status": "critical",
                    "message": f"Critical disk space: {free_percent:.1f}% free"
                }
                issues.append("Critical disk space shortage")
        except Exception as e:
            health_status["components"]["disk_space"] = {
                "status": "unknown",
                "message": f"Could not check disk space: {e}"
            }
        
        # AI Services health
        try:
            from ..services.nano_banana_client import nano_banana_client
            
            if nano_banana_client.api_key:
                if nano_banana_client.health_check():
                    health_status["components"]["nano_banana_api"] = {
                        "status": "healthy",
                        "message": "Nano Banana API accessible"
                    }
                else:
                    health_status["components"]["nano_banana_api"] = {
                        "status": "unhealthy",
                        "message": "Nano Banana API not responding"
                    }
                    issues.append("Nano Banana API unavailable")
            else:
                health_status["components"]["nano_banana_api"] = {
                    "status": "not_configured",
                    "message": "Nano Banana API key not configured"
                }
        except Exception as e:
            health_status["components"]["nano_banana_api"] = {
                "status": "error",
                "message": f"Nano Banana API check failed: {e}"
            }
        
        # Processing capacity check
        try:
            current_stats = update_processing_statistics()
            recent_success_rate = current_stats["processing_jobs"]["success_rate_24h"]
            
            if recent_success_rate >= 95:
                health_status["components"]["processing_capacity"] = {
                    "status": "healthy",
                    "message": f"High success rate: {recent_success_rate}%"
                }
            elif recent_success_rate >= 80:
                health_status["components"]["processing_capacity"] = {
                    "status": "warning",
                    "message": f"Moderate success rate: {recent_success_rate}%"
                }
                issues.append("Processing success rate below optimal")
            else:
                health_status["components"]["processing_capacity"] = {
                    "status": "degraded",
                    "message": f"Low success rate: {recent_success_rate}%"
                }
                issues.append("Processing success rate critically low")
        except Exception as e:
            health_status["components"]["processing_capacity"] = {
                "status": "unknown",
                "message": f"Could not assess processing capacity: {e}"
            }
        
        # Determine overall health
        component_statuses = [
            comp["status"] for comp in health_status["components"].values()
        ]
        
        if "unhealthy" in component_statuses or "critical" in component_statuses:
            health_status["overall_health"] = "unhealthy"
        elif "degraded" in component_statuses or "warning" in component_statuses:
            health_status["overall_health"] = "degraded"
        else:
            health_status["overall_health"] = "healthy"
        
        health_status["issues"] = issues
        health_status["issue_count"] = len(issues)
        
        logger.info(f"System health check completed: {health_status['overall_health']}")
        return health_status
        
    except Exception as e:
        logger.error(f"System health check failed: {e}")
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "overall_health": "error",
            "error": str(e),
            "components": {},
            "issues": ["Health check system failure"],
            "issue_count": 1
        }


@celery_app.task(bind=True, name="optimize_database")
def optimize_database(self) -> Dict[str, Any]:
    """
    Optimize database performance
    
    Returns:
        Dictionary with optimization results
    """
    session = db_manager.get_session()
    
    try:
        # PostgreSQL-specific optimizations
        optimization_results = {
            "timestamp": datetime.utcnow().isoformat(),
            "optimizations_performed": []
        }
        
        # Analyze tables for better query planning
        tables_to_analyze = [
            "photos", "photo_analysis", "photo_enhancements",
            "face_detections", "face_landmarks", "photo_processing_jobs"
        ]
        
        for table in tables_to_analyze:
            try:
                session.execute(f"ANALYZE {table}")
                optimization_results["optimizations_performed"].append(f"Analyzed table: {table}")
            except Exception as e:
                logger.warning(f"Failed to analyze table {table}: {e}")
        
        # Vacuum deleted records (if supported)
        try:
            session.execute("VACUUM")
            optimization_results["optimizations_performed"].append("Vacuumed database")
        except Exception as e:
            logger.warning(f"Vacuum failed: {e}")
        
        session.commit()
        
        optimization_results["success"] = True
        optimization_results["optimizations_count"] = len(optimization_results["optimizations_performed"])
        
        logger.info(f"Database optimization completed: {optimization_results['optimizations_count']} operations")
        return optimization_results
        
    except Exception as e:
        session.rollback()
        logger.error(f"Database optimization failed: {e}")
        raise e
    
    finally:
        session.close()


@celery_app.task(bind=True, name="generate_processing_report")
def generate_processing_report(self, hours_back: int = 24) -> Dict[str, Any]:
    """
    Generate comprehensive processing report
    
    Args:
        hours_back: Number of hours to look back for the report
        
    Returns:
        Dictionary with detailed processing report
    """
    session = db_manager.get_session()
    
    try:
        cutoff_time = datetime.utcnow() - timedelta(hours=hours_back)
        
        # Get processing jobs in time range
        recent_jobs = session.query(PhotoProcessingJob).filter(
            PhotoProcessingJob.created_at >= cutoff_time
        ).all()
        
        # Calculate metrics
        total_jobs = len(recent_jobs)
        completed_jobs = [j for j in recent_jobs if j.status == "completed"]
        failed_jobs = [j for j in recent_jobs if j.status == "failed"]
        
        # Success rates by job type
        job_types = {}
        for job in recent_jobs:
            job_type = job.job_type
            if job_type not in job_types:
                job_types[job_type] = {"total": 0, "completed": 0, "failed": 0}
            
            job_types[job_type]["total"] += 1
            if job.status == "completed":
                job_types[job_type]["completed"] += 1
            elif job.status == "failed":
                job_types[job_type]["failed"] += 1
        
        # Add success rates
        for job_type in job_types:
            stats = job_types[job_type]
            stats["success_rate"] = (stats["completed"] / stats["total"]) * 100 if stats["total"] > 0 else 0
        
        # Processing times
        processing_times = []
        for job in completed_jobs:
            if job.completed_at and job.created_at:
                duration = (job.completed_at - job.created_at).total_seconds()
                processing_times.append(duration)
        
        avg_processing_time = sum(processing_times) / len(processing_times) if processing_times else 0
        max_processing_time = max(processing_times) if processing_times else 0
        min_processing_time = min(processing_times) if processing_times else 0
        
        # Error analysis
        error_summary = {}
        for job in failed_jobs:
            error_msg = job.error_message or "Unknown error"
            error_type = error_msg.split(":")[0]  # Get error type
            
            if error_type not in error_summary:
                error_summary[error_type] = 0
            error_summary[error_type] += 1
        
        # Generate report
        report = {
            "report_period": {
                "start_time": cutoff_time.isoformat(),
                "end_time": datetime.utcnow().isoformat(),
                "hours_covered": hours_back
            },
            "summary": {
                "total_jobs": total_jobs,
                "completed_jobs": len(completed_jobs),
                "failed_jobs": len(failed_jobs),
                "overall_success_rate": (len(completed_jobs) / total_jobs) * 100 if total_jobs > 0 else 0
            },
            "job_type_breakdown": job_types,
            "performance_metrics": {
                "avg_processing_time_seconds": round(avg_processing_time, 2),
                "max_processing_time_seconds": round(max_processing_time, 2),
                "min_processing_time_seconds": round(min_processing_time, 2),
                "total_processing_time_hours": round(sum(processing_times) / 3600, 2)
            },
            "error_analysis": {
                "total_errors": len(failed_jobs),
                "error_types": error_summary,
                "error_rate": (len(failed_jobs) / total_jobs) * 100 if total_jobs > 0 else 0
            },
            "recommendations": []
        }
        
        # Add recommendations based on analysis
        if report["summary"]["overall_success_rate"] < 90:
            report["recommendations"].append("Overall success rate is below 90%. Investigate common failure patterns.")
        
        if avg_processing_time > 300:  # 5 minutes
            report["recommendations"].append("Average processing time is high. Consider optimizing algorithms or scaling workers.")
        
        if len(error_summary) > 0:
            most_common_error = max(error_summary, key=error_summary.get)
            report["recommendations"].append(f"Most common error: {most_common_error}. Focus on resolving this issue.")
        
        if not report["recommendations"]:
            report["recommendations"].append("System is performing well. No immediate action required.")
        
        logger.info(f"Processing report generated: {total_jobs} jobs analyzed over {hours_back} hours")
        return report
        
    except Exception as e:
        logger.error(f"Failed to generate processing report: {e}")
        raise e
    
    finally:
        session.close()