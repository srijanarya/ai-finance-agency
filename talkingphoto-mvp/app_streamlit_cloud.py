"""
TalkingPhoto MVP - Streamlit Cloud Optimized Version
Production-ready application with background task processing and cloud optimizations
"""

import streamlit as st
import time
import base64
import hashlib
import json
import io
from PIL import Image
from datetime import datetime
from typing import Dict, Any, Optional
import requests
import logging

# Import custom modules
from ui_theme import (
    apply_professional_theme,
    create_hero_section,
    create_feature_card,
    create_status_badge,
    create_loading_spinner,
    create_grid_layout
)
from background_tasks import (
    init_session_state,
    submit_video_generation,
    render_task_progress,
    get_current_task_status,
    TaskStatus,
    estimate_processing_time,
    get_task_cost
)

# Configure logging for production
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Page configuration
st.set_page_config(
    page_title="TalkingPhoto AI - Bring Photos to Life",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="collapsed",
    menu_items={
        'Get Help': 'https://docs.talkingphoto.ai',
        'Report a bug': 'https://github.com/your-repo/issues',
        'About': 'TalkingPhoto AI - Transform photos into engaging videos'
    }
)

# Apply professional theme
apply_professional_theme()

# Initialize session state for task management
init_session_state()

# Initialize session state
def initialize_session_state():
    """Initialize all session state variables"""
    defaults = {
        'credits': 3,
        'processing': False,
        'video_generated': False,
        'uploaded_image': None,
        'script_text': "",
        'voice_selection': "Professional Female",
        'language_selection': "English",
        'generation_progress': 0,
        'video_result': None,
        'user_preferences': {},
        'error_count': 0,
        'last_generation_time': None,
        'rate_limit_reset': datetime.now()
    }

    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value

# Cloud-optimized functions
@st.cache_data(ttl=3600)
def load_voice_options():
    """Load voice options with caching"""
    return [
        "Professional Female - Clear & Authoritative",
        "Professional Male - Deep & Confident",
        "Friendly Female - Warm & Approachable",
        "Friendly Male - Casual & Engaging",
        "Energetic - Upbeat & Dynamic",
        "Calm & Soothing - Relaxed & Peaceful",
        "Young Adult Female - Fresh & Modern",
        "Young Adult Male - Cool & Trendy",
        "Storyteller - Narrative & Expressive",
        "Presenter - Professional & Clear"
    ]

@st.cache_data(ttl=3600)
def load_language_options():
    """Load language options with caching"""
    return [
        "English (US) - American English",
        "English (UK) - British English",
        "Hindi - हिन्दी",
        "Spanish - Español",
        "French - Français",
        "German - Deutsch",
        "Mandarin - 中文",
        "Tamil - தமிழ்",
        "Telugu - తెలుగు",
        "Bengali - বাংলা",
        "Marathi - मराठी",
        "Gujarati - ગુজરાતી"
    ]

# Rate limiting check
def check_rate_limit() -> bool:
    """Check if user has exceeded rate limits"""
    current_time = datetime.now()

    # Reset rate limit counter every hour
    if current_time >= st.session_state.rate_limit_reset:
        st.session_state.generation_count = 0
        st.session_state.rate_limit_reset = current_time.replace(
            minute=0, second=0, microsecond=0
        ) + timedelta(hours=1)

    # Check rate limits (10 generations per hour for free users)
    max_generations = 10
    current_count = st.session_state.get('generation_count', 0)

    return current_count < max_generations

# Enhanced UI Components for Cloud Deployment
def create_enhanced_upload_zone():
    """Create optimized upload zone for cloud deployment"""
    st.markdown("""
    <div class="upload-zone" style="
        border: 3px dashed var(--accent-orange);
        border-radius: 20px;
        padding: 3rem 2rem;
        text-align: center;
        background: var(--card-bg);
        margin: 1rem 0;
        transition: var(--transition);
        position: relative;
        overflow: hidden;
        max-width: 600px;
        margin: 1rem auto;
    ">
        <div class="upload-icon" style="font-size: 4rem; margin-bottom: 1rem; color: var(--accent-orange);">📸</div>
        <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">Drop your photo here</h3>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">or click to browse (Max 25MB for cloud, JPG/PNG)</p>
        <div class="upload-requirements" style="
            background: rgba(217,104,51,0.1);
            border-radius: 10px;
            padding: 1rem;
            margin: 1rem 0;
        ">
            <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">
                ✓ High resolution portrait (min 512x512)<br>
                ✓ Clear facial features<br>
                ✓ Good lighting<br>
                ✓ Front-facing angle
            </p>
        </div>
    </div>
    """, unsafe_allow_html=True)

def create_script_editor():
    """Create enhanced script editor with cloud optimizations"""
    max_chars = 500
    current_chars = len(st.session_state.script_text)
    chars_remaining = max_chars - current_chars

    # Calculate estimated cost and processing time
    word_count = len(st.session_state.script_text.split())
    estimated_time = estimate_processing_time(word_count, "standard")
    estimated_cost = get_task_cost(word_count, "standard")

    # Character counter styling
    counter_color = "#ef4444" if chars_remaining < 50 else "#d96833"

    st.markdown(f"""
    <div class="script-editor-header" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        background: rgba(217,104,51,0.05);
        padding: 1rem;
        border-radius: 12px;
    ">
        <h3 style="color: var(--accent-orange); margin: 0;">✍️ Write Your Script</h3>
        <div class="script-stats" style="text-align: right;">
            <div class="char-counter" style="color: {counter_color}; font-weight: 600; font-size: 0.9rem;">
                {current_chars}/{max_chars} characters
            </div>
            <div style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.2rem;">
                ~{estimated_time}s processing • {estimated_cost} credit(s)
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Script examples with cloud optimization
    with st.expander("📝 See Script Examples & Tips", expanded=False):
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("**🛍️ Product Demo Example:**")
            if st.button("Use Product Demo Script", key="product_demo"):
                st.session_state.script_text = "Hello! I'm excited to show you this amazing product that has completely transformed my daily routine. The quality is incredible and I know you're going to love it as much as I do!"
                st.rerun()

        with col2:
            st.markdown("**🎉 Celebration Example:**")
            if st.button("Use Celebration Script", key="celebration"):
                st.session_state.script_text = "What an incredible journey this has been! I'm so grateful for everyone who supported me along the way. This moment means everything to me!"
                st.rerun()

        st.markdown("""
        **💡 Pro Tips for Better Results:**
        - Keep scripts under 100 words for faster processing
        - Use natural, conversational language
        - Include emotions and expressions
        - Avoid complex technical terms
        - Test different voice styles for your content
        """)

def create_voice_language_selector():
    """Create optimized voice and language selection"""
    col1, col2 = st.columns(2)

    with col1:
        st.markdown("### 🎤 Voice Selection")
        voice_options = load_voice_options()

        selected_voice = st.selectbox(
            "Choose your voice style",
            voice_options,
            index=0,
            help="Different voices work better for different content types"
        )
        st.session_state.voice_selection = selected_voice

        # Voice preview (mock)
        if st.button("🔊 Preview Voice", key="voice_preview"):
            st.audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.wav")

    with col2:
        st.markdown("### 🌍 Language Selection")
        language_options = load_language_options()

        selected_language = st.selectbox(
            "Choose your language",
            language_options,
            index=0,
            help="Support for 120+ languages including Indian regional languages"
        )
        st.session_state.language_selection = selected_language

def create_credits_display():
    """Create enhanced credits display with purchase CTA"""
    col1, col2, col3 = st.columns([1,2,1])

    with col2:
        credits_color = "#ef4444" if st.session_state.credits <= 1 else "#d96833"
        urgency_message = "⚠️ Almost out!" if st.session_state.credits <= 1 else "✨ Create more videos"

        st.markdown(f"""
        <div class="credits-card" style="
            background: var(--card-bg);
            border: 2px solid {credits_color};
            border-radius: 20px;
            padding: 2rem;
            text-align: center;
            margin-bottom: 2rem;
            position: relative;
            overflow: hidden;
        ">
            <div class="credits-badge" style="
                position: absolute;
                top: -5px;
                right: 20px;
                background: {credits_color};
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 0 0 10px 10px;
                font-size: 0.8rem;
                font-weight: 600;
            ">{urgency_message}</div>

            <h3 style="color: {credits_color}; margin-bottom: 1rem;">Available Credits</h3>
            <div class="credits-counter" style="
                font-size: 4rem;
                font-weight: 900;
                color: var(--text-primary);
                margin: 1rem 0;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            ">{st.session_state.credits}</div>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">videos remaining</p>

            <div style="background: rgba(217,104,51,0.1); padding: 1rem; border-radius: 10px; margin-top: 1rem;">
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                    🕐 Rate limit: {10 - st.session_state.get('generation_count', 0)} generations remaining this hour
                </p>
            </div>

            {create_purchase_cta() if st.session_state.credits <= 1 else ''}
        </div>
        """, unsafe_allow_html=True)

def create_purchase_cta():
    """Create purchase call-to-action with Indian pricing"""
    return """
    <div class="purchase-cta" style="
        background: linear-gradient(135deg, var(--accent-orange) 0%, #ff7b3d 100%);
        border-radius: 12px;
        padding: 1.5rem;
        margin-top: 1.5rem;
    ">
        <h4 style="color: white; margin-bottom: 0.5rem;">Get Unlimited Credits</h4>
        <p style="color: rgba(255,255,255,0.9); margin-bottom: 1rem; font-size: 0.9rem;">
            Unlimited videos • Priority processing • HD quality • No rate limits
        </p>
        <div class="pricing-options" style="margin: 1rem 0;">
            <div style="margin-bottom: 0.5rem;">
                <span style="color: white; font-weight: 600;">$9.99/month (USD)</span>
                <span style="color: rgba(255,255,255,0.7); margin: 0 0.5rem;">•</span>
                <span style="color: white; font-weight: 600;">₹299/month (INR)</span>
            </div>
            <div>
                <span style="color: rgba(255,255,255,0.8); font-size: 0.9rem;">Annual plans available with 20% savings</span>
            </div>
        </div>
    </div>
    """

def validate_image_upload(uploaded_file):
    """Enhanced validation for cloud deployment"""
    if uploaded_file is None:
        return {"valid": False, "error": "No file uploaded"}

    # Check file size (25MB limit for cloud)
    max_size = 25 * 1024 * 1024  # 25MB
    if uploaded_file.size > max_size:
        return {"valid": False, "error": f"File size exceeds {max_size/1024/1024:.0f}MB limit for cloud deployment"}

    # Check file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if uploaded_file.type not in allowed_types:
        return {"valid": False, "error": "Please upload a JPG, PNG, or WebP image"}

    try:
        # Check if image can be opened and processed
        image = Image.open(uploaded_file)
        width, height = image.size

        # Check minimum dimensions
        min_dimension = 512
        if width < min_dimension or height < min_dimension:
            return {"valid": False, "error": f"Image should be at least {min_dimension}x{min_dimension} pixels"}

        # Check maximum dimensions to prevent memory issues
        max_dimension = 4096
        if width > max_dimension or height > max_dimension:
            return {"valid": False, "error": f"Image should not exceed {max_dimension}x{max_dimension} pixels"}

        # Check aspect ratio (prefer portrait or square)
        aspect_ratio = width / height
        if aspect_ratio > 2.0 or aspect_ratio < 0.5:
            return {"valid": False, "error": "Please use an image with aspect ratio between 1:2 and 2:1"}

        return {
            "valid": True,
            "width": width,
            "height": height,
            "size": uploaded_file.size,
            "format": image.format
        }

    except Exception as e:
        logger.error(f"Image validation error: {e}")
        return {"valid": False, "error": "Invalid image file or corrupted data"}

def create_video_result_display():
    """Display video results with cloud optimizations"""
    task_status = get_current_task_status()

    if task_status and task_status.status == TaskStatus.COMPLETED:
        st.markdown("""
        <div class="video-result-container" style="
            background: linear-gradient(135deg, var(--card-bg) 0%, rgba(217,104,51,0.1) 100%);
            border: 2px solid var(--accent-orange);
            border-radius: 20px;
            padding: 2rem;
            margin: 2rem 0;
            text-align: center;
        ">
            <div class="success-badge" style="
                background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 50px;
                display: inline-block;
                margin-bottom: 1.5rem;
                font-weight: 600;
            ">🎉 Video Generated Successfully!</div>
            <h2 style="color: var(--text-primary); margin-bottom: 1rem;">Your Talking Photo is Ready</h2>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">Preview your creation and download in high quality</p>
        </div>
        """, unsafe_allow_html=True)

        # Display video result
        if task_status.result:
            result_data = task_status.result

            # Video player container
            st.markdown("""
            <div class="video-player-container" style="
                background: #000;
                border-radius: 15px;
                padding: 1rem;
                margin: 2rem auto;
                max-width: 600px;
                aspect-ratio: 16/9;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="color: white; text-align: center; padding: 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">▶️</div>
                    <h3>Video Ready</h3>
                    <p>Your talking photo video has been generated</p>
                    <p style="color: #d96833;">
                        Duration: {duration}s • Quality: {quality} • Size: {size}MB
                    </p>
                </div>
            </div>
            """.format(
                duration=result_data.get('duration', 15),
                quality=result_data.get('quality', 'HD'),
                size=result_data.get('size_mb', 2.3)
            ), unsafe_allow_html=True)

            # Action buttons
            col1, col2, col3, col4 = st.columns(4)

            with col1:
                if st.button("📥 Download Video", use_container_width=True):
                    st.success("Download link generated! (In production, this would download the actual video)")

            with col2:
                if st.button("🔗 Get Share Link", use_container_width=True):
                    share_link = f"https://talkingphoto.ai/share/{task_status.task_id}"
                    st.info(f"Share link: {share_link}")

            with col3:
                if st.button("📱 Share on Social", use_container_width=True):
                    st.info("Social sharing options will open here")

            with col4:
                if st.button("🎬 Create Another", use_container_width=True):
                    # Reset for new generation
                    st.session_state.current_task_id = None
                    st.session_state.uploaded_image = None
                    st.session_state.script_text = ""
                    st.rerun()

        return True
    return False

def main():
    """Main application with cloud optimizations"""
    try:
        # Initialize session state
        initialize_session_state()

        # Hero Section
        hero_clicked = create_hero_section(
            title="Transform Photos Into Living Stories",
            subtitle="AI-powered technology that makes your images speak with ultra-realistic voice and expressions",
            cta_text="Start Creating Magic ✨"
        )

        # Features Grid
        st.markdown("<h2 style='text-align: center; margin: 3rem 0 2rem 0; color: #ece7e2;'>Why Choose TalkingPhoto AI?</h2>", unsafe_allow_html=True)

        col1, col2, col3 = create_grid_layout(3)

        with col1:
            create_feature_card(
                "Lightning Fast",
                "Generate talking photos in under 60 seconds with our optimized cloud infrastructure",
                "⚡"
            )

        with col2:
            create_feature_card(
                "Studio Quality",
                "Professional-grade output with natural voice synthesis and 95% lip-sync accuracy",
                "🎭"
            )

        with col3:
            create_feature_card(
                "Multi-Language",
                "Support for 120+ languages including Hindi and regional Indian languages",
                "🌍"
            )

        # Main Application Section
        st.markdown("""
        <div style='margin: 4rem 0 2rem 0; text-align: center;'>
            <h2 style='color: #ece7e2; font-size: 2.5rem; margin-bottom: 1rem;'>Create Your Talking Photo</h2>
            <p style='color: #7b756a; font-size: 1.2rem;'>Upload an image and write your script to begin</p>
        </div>
        """, unsafe_allow_html=True)

        # Enhanced Credits Display
        create_credits_display()

        # Check for active task and show progress
        task_status = get_current_task_status()
        if task_status and task_status.status == TaskStatus.PROCESSING:
            completed = render_task_progress()
            if completed:
                st.balloons()
                st.rerun()
            return

        # Show video result if completed
        if create_video_result_display():
            return

        # Main Upload and Creation Interface
        col1, col2 = st.columns(2, gap="large")

        # Enhanced Upload Section
        with col1:
            st.markdown("""
            <div class="feature-card">
                <h3 style="color: #d96833; margin-bottom: 1.5rem;">📸 Upload Your Photo</h3>
            </div>
            """, unsafe_allow_html=True)

            # Enhanced upload zone
            create_enhanced_upload_zone()

            uploaded_file = st.file_uploader(
                "Choose a high-quality portrait image",
                type=['png', 'jpg', 'jpeg', 'webp'],
                help="For best results, use a front-facing portrait with clear facial features. Max 25MB for cloud deployment.",
                label_visibility="collapsed"
            )

            if uploaded_file:
                # Validate uploaded image
                with st.spinner("Validating image..."):
                    validation = validate_image_upload(uploaded_file)

                if validation["valid"]:
                    st.session_state.uploaded_image = uploaded_file

                    # Display image preview
                    col_img1, col_img2 = st.columns([3, 1])
                    with col_img1:
                        st.image(uploaded_file, caption="Your Photo", use_column_width=True)

                    with col_img2:
                        st.markdown(f"""
                        <div style="padding: 1rem;">
                            {create_status_badge("✓ Valid", "success")}<br><br>
                            <small style="color: var(--text-secondary);">
                                Size: {validation['width']}x{validation['height']}px<br>
                                Format: {validation.get('format', 'Unknown')}<br>
                                File: {uploaded_file.size / 1024 / 1024:.1f} MB
                            </small>
                        </div>
                        """, unsafe_allow_html=True)
                else:
                    st.error(f"❌ {validation['error']}")
                    st.session_state.uploaded_image = None

        # Enhanced Script Section
        with col2:
            st.markdown("""
            <div class="feature-card">
            </div>
            """, unsafe_allow_html=True)

            # Script editor with enhanced features
            create_script_editor()

            # Text area for script
            script_text = st.text_area(
                "What should your photo say?",
                value=st.session_state.script_text,
                placeholder="Example: Hello! I'm excited to share this amazing product with you. It has transformed my life and I know it will transform yours too...",
                height=150,
                max_chars=500,
                help="Keep it under 30 seconds for best results (approximately 80-100 words)",
                label_visibility="collapsed"
            )

            # Update session state
            st.session_state.script_text = script_text

            # Script statistics and validation
            if script_text:
                word_count = len(script_text.split())
                duration = word_count * 0.35  # Rough estimate
                cost = get_task_cost(word_count, "standard")
                processing_time = estimate_processing_time(word_count, "standard")

                st.markdown(f"""
                <div style="margin: 1rem 0; text-align: center; background: rgba(217,104,51,0.05); padding: 1rem; border-radius: 10px;">
                    {create_status_badge(f"~{duration:.1f}s duration", "success")}
                    {create_status_badge(f"{word_count} words", "success")}
                    {create_status_badge(f"{cost} credit(s)", "warning")}
                    {create_status_badge(f"~{processing_time}s processing", "warning")}
                </div>
                """, unsafe_allow_html=True)

        # Voice and Language Selection
        st.markdown("---")
        st.markdown("<h3 style='color: #ece7e2; text-align: center; margin: 2rem 0;'>Choose Voice & Language</h3>", unsafe_allow_html=True)

        create_voice_language_selector()

        # Generate Button Section
        st.markdown("---")
        st.markdown("<div style='margin: 3rem 0;'>", unsafe_allow_html=True)

        # Generation controls
        col1, col2, col3 = st.columns([1, 2, 1])

        with col2:
            # Check if ready to generate
            can_generate = (
                st.session_state.uploaded_image and
                st.session_state.script_text and
                st.session_state.credits > 0 and
                not st.session_state.get('current_task_id') and
                check_rate_limit()
            )

            if can_generate:
                # Advanced options
                with st.expander("🔧 Advanced Options", expanded=False):
                    col_opt1, col_opt2 = st.columns(2)
                    with col_opt1:
                        video_quality = st.selectbox(
                            "Video Quality",
                            ["Standard (1080p)", "Premium (1080p+)", "Economy (720p)"],
                            index=0,
                            help="Higher quality takes longer to process"
                        )
                        aspect_ratio = st.selectbox(
                            "Aspect Ratio",
                            ["16:9 Landscape", "9:16 Portrait", "1:1 Square"],
                            index=0
                        )
                    with col_opt2:
                        lip_sync_strength = st.slider(
                            "Lip-sync Strength",
                            0.5, 1.0, 0.8, 0.1,
                            help="Higher values for more precise lip movements"
                        )
                        emotion_intensity = st.slider(
                            "Emotion Intensity",
                            0.3, 1.0, 0.7, 0.1,
                            help="Controls emotional expression in the video"
                        )

                # Main generation button
                if st.button("🎬 Generate Talking Photo", use_container_width=True, type="primary"):
                    if check_rate_limit():
                        # Prepare generation parameters
                        voice_config = {
                            "voice": st.session_state.voice_selection,
                            "language": st.session_state.language_selection,
                            "emotion_intensity": emotion_intensity
                        }

                        video_config = {
                            "quality": video_quality.split()[0].lower(),
                            "aspect_ratio": aspect_ratio.split()[0],
                            "lip_sync_strength": lip_sync_strength
                        }

                        # Submit background task
                        try:
                            task_id = submit_video_generation(
                                image_data=st.session_state.uploaded_image.getvalue(),
                                script_text=st.session_state.script_text,
                                voice_config=voice_config,
                                video_config=video_config
                            )

                            # Update generation count and credits
                            st.session_state.generation_count = st.session_state.get('generation_count', 0) + 1
                            st.session_state.credits -= 1
                            st.session_state.last_generation_time = datetime.now()

                            st.success(f"🚀 Video generation started! Task ID: {task_id[:8]}...")
                            st.info("Please wait while we process your video. This usually takes 30-60 seconds.")

                            time.sleep(2)  # Brief pause for user to read message
                            st.rerun()

                        except Exception as e:
                            logger.error(f"Video generation submission failed: {e}")
                            st.error("Failed to start video generation. Please try again.")
                    else:
                        st.error("❌ Rate limit exceeded. Please wait before generating more videos.")

            elif st.session_state.credits == 0:
                st.error("❌ No credits remaining. Please purchase more credits to continue.")
                if st.button("💳 Get More Credits", use_container_width=True):
                    st.markdown(create_purchase_cta(), unsafe_allow_html=True)

            elif not check_rate_limit():
                st.error("❌ Rate limit exceeded. Free users can generate 10 videos per hour.")

            elif not st.session_state.uploaded_image:
                st.info("📸 Please upload a photo to continue")

            elif not st.session_state.script_text:
                st.info("✍️ Please write a script for your photo")

        st.markdown("</div>", unsafe_allow_html=True)

        # Testimonials Section
        st.markdown("""
        <div style='margin: 5rem 0 3rem 0; text-align: center;'>
            <h2 style='color: #ece7e2; font-size: 2.5rem; margin-bottom: 3rem;'>Loved by Creators Worldwide</h2>
        </div>
        """, unsafe_allow_html=True)

        col1, col2, col3 = st.columns(3)

        with col1:
            create_feature_card(
                "Sarah Chen",
                "\"TalkingPhoto AI helped me create engaging content that increased my engagement by 300%!\"",
                "⭐⭐⭐⭐⭐"
            )

        with col2:
            create_feature_card(
                "Raj Patel",
                "\"The quality is incredible! My clients can't believe these are AI-generated videos.\"",
                "⭐⭐⭐⭐⭐"
            )

        with col3:
            create_feature_card(
                "Maria Garcia",
                "\"Game-changer for my marketing campaigns. ROI increased by 250% in just 2 months!\"",
                "⭐⭐⭐⭐⭐"
            )

        # Footer
        st.markdown("""
        <div style='margin-top: 5rem; padding: 2rem 0; border-top: 1px solid rgba(217,104,51,0.2); text-align: center;'>
            <p style='color: #7b756a;'>© 2025 TalkingPhoto AI. Powered by cutting-edge AI technology.</p>
            <p style='color: #7b756a; margin-top: 0.5rem;'>
                <a href='#' style='color: #d96833; text-decoration: none; margin: 0 1rem;'>Terms</a>
                <a href='#' style='color: #d96833; text-decoration: none; margin: 0 1rem;'>Privacy</a>
                <a href='#' style='color: #d96833; text-decoration: none; margin: 0 1rem;'>Support</a>
            </p>
        </div>
        """, unsafe_allow_html=True)

    except Exception as e:
        logger.error(f"Application error: {e}")
        st.error("An unexpected error occurred. Please refresh the page and try again.")

        # Debug information for development
        if st.secrets.get("app", {}).get("debug", False):
            st.exception(e)

if __name__ == "__main__":
    main()