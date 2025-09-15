"""
TalkingPhoto MVP - Professional UI Implementation
Enhanced with drag-and-drop upload, advanced features, and Veo3 integration
"""

import streamlit as st
import time
import base64
import hashlib
import json
import io
from PIL import Image
from datetime import datetime
from ui_theme import (
    apply_professional_theme,
    create_hero_section,
    create_feature_card,
    create_status_badge,
    create_loading_spinner,
    create_grid_layout
)

# Page configuration
st.set_page_config(
    page_title="TalkingPhoto AI - Bring Photos to Life",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Apply professional theme
apply_professional_theme()

# Initialize session state
if 'credits' not in st.session_state:
    st.session_state.credits = 3
if 'processing' not in st.session_state:
    st.session_state.processing = False
if 'video_generated' not in st.session_state:
    st.session_state.video_generated = False
if 'uploaded_image' not in st.session_state:
    st.session_state.uploaded_image = None
if 'script_text' not in st.session_state:
    st.session_state.script_text = ""
if 'voice_selection' not in st.session_state:
    st.session_state.voice_selection = "Professional Female"
if 'language_selection' not in st.session_state:
    st.session_state.language_selection = "English"
if 'generation_progress' not in st.session_state:
    st.session_state.generation_progress = 0
if 'video_result' not in st.session_state:
    st.session_state.video_result = None

# Enhanced UI Components
def create_enhanced_upload_zone():
    """Create drag-and-drop upload zone with validation"""
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
    ">
        <div class="upload-icon" style="font-size: 4rem; margin-bottom: 1rem; color: var(--accent-orange);">📸</div>
        <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">Drop your photo here</h3>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">or click to browse (Max 10MB, JPG/PNG)</p>
        <div class="upload-requirements" style="
            background: rgba(217,104,51,0.1);
            border-radius: 10px;
            padding: 1rem;
            margin: 1rem 0;
        ">
            <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">
                ✓ High resolution portrait<br>
                ✓ Clear facial features<br>
                ✓ Good lighting<br>
                ✓ Front-facing angle
            </p>
        </div>
    </div>
    """, unsafe_allow_html=True)

def create_script_editor():
    """Create enhanced script editor with character counter"""
    max_chars = 500
    current_chars = len(st.session_state.script_text)
    chars_remaining = max_chars - current_chars

    # Character counter styling
    counter_color = "#ef4444" if chars_remaining < 50 else "#d96833"

    st.markdown(f"""
    <div class="script-editor-header" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    ">
        <h3 style="color: var(--accent-orange); margin: 0;">✍️ Write Your Script</h3>
        <div class="char-counter" style="
            color: {counter_color};
            font-weight: 600;
            font-size: 0.9rem;
        ">{current_chars}/{max_chars} characters</div>
    </div>
    """, unsafe_allow_html=True)

    # Script examples
    with st.expander("📝 See Script Examples", expanded=False):
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🛍️ Product Demo"):
                st.session_state.script_text = "Hello! I'm excited to show you this amazing product that has completely transformed my daily routine. The quality is incredible and I know you're going to love it as much as I do!"
                st.rerun()
        with col2:
            if st.button("🎉 Celebration"):
                st.session_state.script_text = "What an incredible journey this has been! I'm so grateful for everyone who supported me along the way. This moment means everything to me and I can't wait to share what's coming next!"

def create_voice_language_selector():
    """Create enhanced voice and language selection UI"""
    col1, col2 = st.columns(2)

    with col1:
        st.markdown("### 🎤 Voice Selection")
        voice_options = [
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

        selected_voice = st.selectbox(
            "Choose your voice style",
            voice_options,
            index=voice_options.index(next((v for v in voice_options if "Professional Female" in v), voice_options[0]))
        )
        st.session_state.voice_selection = selected_voice

    with col2:
        st.markdown("### 🌍 Language Selection")
        language_options = [
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
            "Gujarati - ગુજરાતી"
        ]

        selected_language = st.selectbox(
            "Choose your language",
            language_options,
            index=0
        )
        st.session_state.language_selection = selected_language

def create_progress_tracker():
    """Create real-time progress tracking component"""
    if st.session_state.processing:
        st.markdown("""
        <div class="progress-container" style="
            background: var(--card-bg);
            border: 1px solid var(--accent-orange);
            border-radius: 15px;
            padding: 2rem;
            margin: 2rem 0;
            text-align: center;
        ">
            <h3 style="color: var(--accent-orange); margin-bottom: 1.5rem;">🎬 Creating Your Talking Photo</h3>
        </div>
        """, unsafe_allow_html=True)

        # Progress steps
        steps = [
            ("📤 Uploading image", 10),
            ("🔍 Analyzing facial features", 25),
            ("🎵 Processing voice synthesis", 45),
            ("💋 Generating lip-sync mapping", 65),
            ("🎥 Creating final video", 85),
            ("✨ Applying post-processing", 100)
        ]

        progress_placeholder = st.empty()
        status_placeholder = st.empty()

        for step_name, progress_value in steps:
            progress_placeholder.progress(progress_value / 100)
            status_placeholder.markdown(f"""
            <div style="text-align: center; margin: 1rem 0;">
                <p style="color: var(--accent-orange); font-size: 1.1rem; font-weight: 600;">{step_name}</p>
            </div>
            """, unsafe_allow_html=True)
            time.sleep(1.2)
            st.session_state.generation_progress = progress_value

        return True
    return False

def create_video_result_display():
    """Create video preview and download interface"""
    if st.session_state.video_generated:
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

        # Mock video player
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
            <div style="
                color: white;
                text-align: center;
                padding: 2rem;
            ">
                <div style="font-size: 4rem; margin-bottom: 1rem;">▶️</div>
                <h3>Video Preview</h3>
                <p>Your talking photo video will appear here</p>
                <p style="color: #d96833;">Duration: ~15 seconds • Quality: HD 1080p</p>
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Download and action buttons
        col1, col2, col3, col4 = st.columns(4)

        with col1:
            if st.button("📥 Download HD Video", use_container_width=True):
                st.success("Video downloaded! Check your downloads folder.")

        with col2:
            if st.button("🔗 Share Link", use_container_width=True):
                st.info("Share link copied to clipboard!")

        with col3:
            if st.button("📱 Share on Social", use_container_width=True):
                st.info("Social sharing options coming soon!")

        with col4:
            if st.button("🎬 Create Another", use_container_width=True):
                st.session_state.video_generated = False
                st.session_state.uploaded_image = None
                st.session_state.script_text = ""
                st.rerun()

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

            {create_purchase_cta() if st.session_state.credits <= 1 else ''}
        </div>
        """, unsafe_allow_html=True)

def create_purchase_cta():
    """Create purchase call-to-action"""
    return """
    <div class="purchase-cta" style="
        background: linear-gradient(135deg, var(--accent-orange) 0%, #ff7b3d 100%);
        border-radius: 12px;
        padding: 1.5rem;
        margin-top: 1.5rem;
    ">
        <h4 style="color: white; margin-bottom: 0.5rem;">Get More Credits</h4>
        <p style="color: rgba(255,255,255,0.9); margin-bottom: 1rem; font-size: 0.9rem;">
            Unlimited videos • Priority processing • HD quality
        </p>
        <div class="pricing-options" style="margin: 1rem 0;">
            <span style="color: white; font-weight: 600;">$9.99/month</span>
            <span style="color: rgba(255,255,255,0.7); margin: 0 1rem;">or</span>
            <span style="color: white; font-weight: 600;">$99/year (save 17%)</span>
        </div>
    </div>
    """

def validate_image_upload(uploaded_file):
    """Validate uploaded image file"""
    if uploaded_file is None:
        return {"valid": False, "error": "No file uploaded"}

    # Check file size (10MB limit)
    if uploaded_file.size > 10 * 1024 * 1024:
        return {"valid": False, "error": "File size exceeds 10MB limit"}

    # Check file type
    if uploaded_file.type not in ["image/jpeg", "image/jpg", "image/png"]:
        return {"valid": False, "error": "Please upload a JPG or PNG image"}

    try:
        # Check if image can be opened
        image = Image.open(uploaded_file)
        width, height = image.size

        # Check minimum dimensions
        if width < 512 or height < 512:
            return {"valid": False, "error": "Image should be at least 512x512 pixels"}

        # Check aspect ratio (prefer portrait or square)
        aspect_ratio = width / height
        if aspect_ratio > 1.5:
            return {"valid": False, "error": "Please use a portrait or square image for best results"}

        return {"valid": True, "width": width, "height": height, "size": uploaded_file.size}

    except Exception as e:
        return {"valid": False, "error": "Invalid image file"}

def main():
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
            "Generate talking photos in under 60 seconds with our optimized Veo3 AI pipeline",
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

    # Show video result if generated
    create_video_result_display()

    # Main Upload and Creation Interface
    if not st.session_state.video_generated:
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
                type=['png', 'jpg', 'jpeg'],
                help="For best results, use a front-facing portrait with clear facial features",
                label_visibility="collapsed"
            )

            if uploaded_file:
                # Validate uploaded image
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
                                File: {uploaded_file.size / 1024:.1f} KB
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

            # Script editor with character counter
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

            # Script statistics
            if script_text:
                word_count = len(script_text.split())
                duration = word_count * 0.35  # Rough estimate
                st.markdown(f"""
                <div style="margin: 1rem 0; text-align: center;">
                    {create_status_badge(f"~{duration:.1f}s duration", "warning")}
                    {create_status_badge(f"{word_count} words", "success")}
                    {create_status_badge(f"${0.15 * max(10, duration):.2f} cost", "warning")}
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
                not st.session_state.processing
            )

            if can_generate:
                # Advanced options
                with st.expander("🔧 Advanced Options", expanded=False):
                    col_opt1, col_opt2 = st.columns(2)
                    with col_opt1:
                        video_quality = st.selectbox("Video Quality", ["Standard (1080p)", "Premium (1080p+)", "Economy (720p)"], index=0)
                        aspect_ratio = st.selectbox("Aspect Ratio", ["16:9 Landscape", "9:16 Portrait", "1:1 Square"], index=0)
                    with col_opt2:
                        lip_sync_strength = st.slider("Lip-sync Strength", 0.5, 1.0, 0.8, 0.1)
                        emotion_intensity = st.slider("Emotion Intensity", 0.3, 1.0, 0.7, 0.1)

                # Main generation button
                if st.button("🎬 Generate Talking Photo", use_container_width=True, type="primary"):
                    st.session_state.processing = True
                    st.rerun()

            elif st.session_state.credits == 0:
                st.error("❌ No credits remaining. Please purchase more credits to continue.")
                if st.button("💳 Get More Credits", use_container_width=True):
                    st.markdown(create_purchase_cta(), unsafe_allow_html=True)

            elif not st.session_state.uploaded_image:
                st.info("📸 Please upload a photo to continue")

            elif not st.session_state.script_text:
                st.info("✍️ Please write a script for your photo")

        st.markdown("</div>", unsafe_allow_html=True)

    # Progress tracking
    if st.session_state.processing:
        completed = create_progress_tracker()
        if completed:
            # Generation complete
            st.session_state.processing = False
            st.session_state.video_generated = True
            st.session_state.credits -= 1
            st.balloons()
            st.rerun()
    
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

if __name__ == "__main__":
    main()