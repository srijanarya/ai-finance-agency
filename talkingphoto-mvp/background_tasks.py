"""
Background Task Management for Streamlit Cloud
Alternative to Celery for background video processing
"""

import asyncio
import threading
import time
import json
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import streamlit as st

class TaskStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class TaskResult:
    task_id: str
    status: TaskStatus
    progress: float
    message: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: datetime = None
    updated_at: datetime = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        self.updated_at = datetime.now()

class StreamlitTaskManager:
    """
    Task manager optimized for Streamlit Cloud deployment
    Uses session state and threading for background processing
    """

    def __init__(self):
        self.tasks: Dict[str, TaskResult] = {}
        self.task_timeout = 300  # 5 minutes
        self._cleanup_interval = 60  # Cleanup every minute
        self._start_cleanup_thread()

    def _start_cleanup_thread(self):
        """Start background cleanup thread"""
        def cleanup_loop():
            while True:
                try:
                    self._cleanup_old_tasks()
                    time.sleep(self._cleanup_interval)
                except Exception as e:
                    print(f"Cleanup error: {e}")

        cleanup_thread = threading.Thread(target=cleanup_loop, daemon=True)
        cleanup_thread.start()

    def _cleanup_old_tasks(self):
        """Remove old completed/failed tasks"""
        current_time = datetime.now()
        cutoff_time = current_time - timedelta(seconds=self.task_timeout * 2)

        tasks_to_remove = []
        for task_id, task in self.tasks.items():
            if (task.status in [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED]
                and task.updated_at < cutoff_time):
                tasks_to_remove.append(task_id)

        for task_id in tasks_to_remove:
            del self.tasks[task_id]

    def generate_task_id(self, user_id: str, image_hash: str) -> str:
        """Generate unique task ID"""
        timestamp = str(int(time.time()))
        combined = f"{user_id}:{image_hash}:{timestamp}"
        return hashlib.md5(combined.encode()).hexdigest()

    def submit_task(self, task_id: str, task_func: Callable, *args, **kwargs) -> str:
        """Submit a task for background processing"""

        # Create initial task result
        task_result = TaskResult(
            task_id=task_id,
            status=TaskStatus.PENDING,
            progress=0.0,
            message="Task queued for processing"
        )

        self.tasks[task_id] = task_result

        # Start task in background thread
        def run_task():
            try:
                self._update_task(task_id, TaskStatus.PROCESSING, 0.1, "Starting video generation...")

                # Execute the task function
                result = task_func(task_id, self._progress_callback, *args, **kwargs)

                # Mark as completed
                self._update_task(
                    task_id,
                    TaskStatus.COMPLETED,
                    1.0,
                    "Video generation completed successfully",
                    result=result
                )

            except Exception as e:
                error_msg = str(e)
                self._update_task(
                    task_id,
                    TaskStatus.FAILED,
                    0.0,
                    f"Task failed: {error_msg}",
                    error=error_msg
                )

        task_thread = threading.Thread(target=run_task, daemon=True)
        task_thread.start()

        return task_id

    def _progress_callback(self, task_id: str, progress: float, message: str):
        """Callback for task progress updates"""
        if task_id in self.tasks:
            self.tasks[task_id].progress = progress
            self.tasks[task_id].message = message
            self.tasks[task_id].updated_at = datetime.now()

    def _update_task(self, task_id: str, status: TaskStatus, progress: float,
                    message: str, result: Optional[Dict] = None, error: Optional[str] = None):
        """Update task status and progress"""
        if task_id in self.tasks:
            task = self.tasks[task_id]
            task.status = status
            task.progress = progress
            task.message = message
            task.updated_at = datetime.now()

            if result is not None:
                task.result = result
            if error is not None:
                task.error = error

    def get_task_status(self, task_id: str) -> Optional[TaskResult]:
        """Get current task status"""
        return self.tasks.get(task_id)

    def cancel_task(self, task_id: str) -> bool:
        """Cancel a pending/processing task"""
        if task_id in self.tasks:
            task = self.tasks[task_id]
            if task.status in [TaskStatus.PENDING, TaskStatus.PROCESSING]:
                self._update_task(task_id, TaskStatus.CANCELLED, task.progress, "Task cancelled by user")
                return True
        return False

    def get_user_tasks(self, user_id: str) -> Dict[str, TaskResult]:
        """Get all tasks for a specific user"""
        user_tasks = {}
        for task_id, task in self.tasks.items():
            if task_id.startswith(hashlib.md5(user_id.encode()).hexdigest()[:8]):
                user_tasks[task_id] = task
        return user_tasks

# Global task manager instance
_task_manager = None

def get_task_manager() -> StreamlitTaskManager:
    """Get or create global task manager instance"""
    global _task_manager
    if _task_manager is None:
        _task_manager = StreamlitTaskManager()
    return _task_manager

# Task execution functions for video generation
def execute_video_generation_task(task_id: str, progress_callback: Callable,
                                 image_data: bytes, script_text: str,
                                 voice_config: Dict, video_config: Dict) -> Dict[str, Any]:
    """
    Execute video generation task with progress tracking
    This replaces Celery task execution
    """

    try:
        # Simulate video generation process with progress updates
        steps = [
            (0.1, "Uploading image to processing server..."),
            (0.25, "Analyzing facial features and landmarks..."),
            (0.45, "Generating voice synthesis..."),
            (0.65, "Creating lip-sync mapping..."),
            (0.85, "Rendering final video..."),
            (0.95, "Applying post-processing effects..."),
            (1.0, "Video generation completed successfully!")
        ]

        for progress, message in steps:
            progress_callback(task_id, progress, message)
            # Simulate processing time
            time.sleep(2 if progress < 1.0 else 1)

        # Mock result - in production, this would be actual video generation
        result = {
            "video_url": f"https://storage.example.com/videos/{task_id}.mp4",
            "thumbnail_url": f"https://storage.example.com/thumbnails/{task_id}.jpg",
            "duration": 15.7,
            "size_mb": 2.3,
            "quality": "1080p",
            "created_at": datetime.now().isoformat(),
            "metadata": {
                "script_length": len(script_text),
                "voice_model": voice_config.get("model", "default"),
                "video_quality": video_config.get("quality", "standard"),
                "processing_time": 12.5
            }
        }

        return result

    except Exception as e:
        raise Exception(f"Video generation failed: {str(e)}")

# Streamlit integration helpers
def init_session_state():
    """Initialize session state for task management"""
    if 'task_manager' not in st.session_state:
        st.session_state.task_manager = get_task_manager()

    if 'current_task_id' not in st.session_state:
        st.session_state.current_task_id = None

    if 'user_id' not in st.session_state:
        # Generate a session-based user ID
        st.session_state.user_id = hashlib.md5(str(time.time()).encode()).hexdigest()[:16]

def submit_video_generation(image_data: bytes, script_text: str,
                          voice_config: Dict, video_config: Dict) -> str:
    """Submit video generation task"""
    init_session_state()

    # Generate task ID
    image_hash = hashlib.md5(image_data).hexdigest()[:16]
    task_id = st.session_state.task_manager.generate_task_id(
        st.session_state.user_id,
        image_hash
    )

    # Submit task
    st.session_state.task_manager.submit_task(
        task_id,
        execute_video_generation_task,
        image_data,
        script_text,
        voice_config,
        video_config
    )

    st.session_state.current_task_id = task_id
    return task_id

def get_current_task_status() -> Optional[TaskResult]:
    """Get status of current task"""
    init_session_state()

    if st.session_state.current_task_id:
        return st.session_state.task_manager.get_task_status(
            st.session_state.current_task_id
        )
    return None

def cancel_current_task() -> bool:
    """Cancel current task"""
    init_session_state()

    if st.session_state.current_task_id:
        success = st.session_state.task_manager.cancel_task(
            st.session_state.current_task_id
        )
        if success:
            st.session_state.current_task_id = None
        return success
    return False

# Streamlit component for real-time task monitoring
def render_task_progress():
    """Render real-time task progress component"""
    task_status = get_current_task_status()

    if not task_status:
        return False

    # Progress container
    progress_container = st.container()

    with progress_container:
        if task_status.status == TaskStatus.PROCESSING:
            st.markdown(f"""
            <div style="
                background: rgba(217,104,51,0.1);
                border: 1px solid #d96833;
                border-radius: 15px;
                padding: 2rem;
                text-align: center;
                margin: 1rem 0;
            ">
                <h3 style="color: #d96833; margin-bottom: 1rem;">🎬 Creating Your Talking Photo</h3>
                <p style="color: #ece7e2; margin-bottom: 1rem;">{task_status.message}</p>
            </div>
            """, unsafe_allow_html=True)

            # Progress bar
            st.progress(task_status.progress)

            # Cancel button
            col1, col2, col3 = st.columns([1,1,1])
            with col2:
                if st.button("❌ Cancel Generation", key="cancel_task"):
                    if cancel_current_task():
                        st.success("Task cancelled successfully!")
                        st.rerun()

            # Auto-refresh every 2 seconds
            time.sleep(2)
            st.rerun()

        elif task_status.status == TaskStatus.COMPLETED:
            st.success("✅ Video generation completed successfully!")
            return True

        elif task_status.status == TaskStatus.FAILED:
            st.error(f"❌ Video generation failed: {task_status.error}")
            st.session_state.current_task_id = None
            return False

        elif task_status.status == TaskStatus.CANCELLED:
            st.warning("⚠️ Video generation was cancelled")
            st.session_state.current_task_id = None
            return False

    return False

# Utility functions
def estimate_processing_time(script_length: int, video_quality: str) -> int:
    """Estimate processing time in seconds"""
    base_time = 15  # Base processing time

    # Add time based on script length
    word_count = len(script_length.split()) if isinstance(script_length, str) else script_length
    script_time = word_count * 0.5

    # Quality multiplier
    quality_multipliers = {
        "economy": 0.8,
        "standard": 1.0,
        "premium": 1.5
    }

    quality_multiplier = quality_multipliers.get(video_quality.lower(), 1.0)

    total_time = (base_time + script_time) * quality_multiplier
    return max(10, min(120, int(total_time)))  # Between 10-120 seconds

def get_task_cost(script_length: int, video_quality: str) -> float:
    """Calculate task cost in credits"""
    base_cost = 1.0

    # Additional cost for longer scripts
    word_count = len(script_length.split()) if isinstance(script_length, str) else script_length
    if word_count > 100:
        base_cost += 0.5

    # Quality multiplier
    quality_multipliers = {
        "economy": 0.8,
        "standard": 1.0,
        "premium": 1.5
    }

    quality_multiplier = quality_multipliers.get(video_quality.lower(), 1.0)

    return base_cost * quality_multiplier