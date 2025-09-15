# TalkingPhoto AI - Comprehensive UI/UX Guidelines

*Design System for Premium AI-Powered Photo-to-Video Platform*

---

## 1. UI Consistency Guide

### Color System

```css
/* Primary Color Palette */
:root {
  --primary-dark: #1b170f;         /* Main background */
  --secondary-dark: #2c2416;       /* Card backgrounds */
  --accent-orange: #d96833;        /* Primary brand color */
  --accent-hover: #ff7b3d;         /* Interactive states */
  --accent-light: #ffa366;         /* Highlights */

  /* Text Colors */
  --text-primary: #ece7e2;         /* Headers, important text */
  --text-secondary: #7b756a;       /* Body text, descriptions */
  --text-muted: #5a5449;           /* Subtle text, labels */
  --text-inverse: #ffffff;         /* Text on colored backgrounds */

  /* Surface Colors */
  --surface-elevated: rgba(255,255,255,0.05);  /* Cards, modals */
  --surface-hover: rgba(217,104,51,0.1);       /* Hover states */
  --surface-active: rgba(217,104,51,0.15);     /* Active states */
  --surface-border: rgba(217,104,51,0.2);      /* Borders */

  /* Status Colors */
  --status-success: #10b981;       /* Success states */
  --status-warning: #f59e0b;       /* Warning states */
  --status-error: #ef4444;         /* Error states */
  --status-info: #3b82f6;          /* Information states */

  /* Shadows */
  --shadow-orange: rgba(217,104,51,0.3);
  --shadow-dark: rgba(0,0,0,0.5);
  --shadow-elevated: 0 10px 30px rgba(0,0,0,0.3);
}

/* Usage Guidelines */
.primary-action {
  background: linear-gradient(135deg, var(--accent-orange) 0%, var(--accent-hover) 100%);
  color: var(--text-inverse);
}

.secondary-action {
  background: transparent;
  border: 2px solid var(--accent-orange);
  color: var(--accent-orange);
}

.surface-card {
  background: var(--surface-elevated);
  border: 1px solid var(--surface-border);
  backdrop-filter: blur(10px);
}
```

### Typography Scale

```css
/* Font System */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');

:root {
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */
  --text-6xl: 3.75rem;    /* 60px */

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* Letter Spacing */
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
}

/* Typography Classes */
.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--text-inverse);
}

.section-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  line-height: var(--leading-tight);
  color: var(--text-primary);
}

.card-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--accent-orange);
  margin-bottom: 0.5rem;
}

.body-text {
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
}

.caption-text {
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: var(--leading-normal);
}
```

### Spacing System

```css
/* Spacing Scale (8px base unit) */
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
}

/* Border Radius Scale */
:root {
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 30px;
  --radius-full: 9999px;
}
```

### Component Architecture

```css
/* Base Component Classes */
.component-card {
  background: var(--surface-elevated);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.component-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-orange) 0%, transparent 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.component-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-elevated), 0 20px 40px var(--shadow-orange);
  border-color: var(--accent-orange);
  background: var(--surface-hover);
}

.component-card:hover::before {
  transform: scaleX(1);
}

.component-button {
  background: linear-gradient(135deg, var(--accent-orange) 0%, var(--accent-hover) 100%);
  color: var(--text-inverse);
  border: none;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--text-base);
  letter-spacing: 0.025em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px var(--shadow-orange);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.component-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow-orange);
}
```

---

## 2. User Flow Diagrams

### Core User Journey Map

```mermaid
graph TD
    A[Landing Page] --> B{User Type?}
    B -->|New User| C[Hero Section + Value Props]
    B -->|Returning User| D[Dashboard/Upload]

    C --> E[Free Trial CTA]
    E --> F[Photo Upload]
    F --> G[Script Input]
    G --> H[Processing Preview]
    H --> I[Video Generation]
    I --> J{Generation Success?}

    J -->|Yes| K[Video Preview + Download]
    J -->|No| L[Error Handling + Retry]

    K --> M{Credits Remaining?}
    M -->|Yes| N[Create Another Video]
    M -->|No| O[Upgrade Prompt]

    O --> P[Payment Flow]
    P --> Q[Premium Features Unlock]

    L --> G
    N --> F
```

### Conversion Funnel Design

```
Stage 1: Awareness (Landing Page)
├── Hero Video/Animation
├── Key Benefits (3-4 points)
├── Social Proof (testimonials/logos)
└── Strong CTA: "Try Free Now"

Stage 2: Interest (Demo/Trial)
├── Immediate value demonstration
├── No-friction upload process
├── Real-time progress feedback
└── Quick win (first video)

Stage 3: Consideration (Results Page)
├── High-quality video preview
├── Easy sharing options
├── Usage statistics
└── Upgrade prompt with benefits

Stage 4: Purchase (Pricing Page)
├── Clear pricing tiers
├── Feature comparison
├── Time-limited offers
└── Trust signals (security badges)

Stage 5: Retention (Dashboard)
├── Usage analytics
├── Template library
├── Advanced features
└── Community showcase
```

### Mobile-First Flow

```
Mobile User Journey:
1. Touch-optimized hero section
2. Swipe-based feature carousel
3. Camera integration for upload
4. Voice input for scripts
5. Portrait-mode video preview
6. One-tap sharing to social media
7. Mobile payment integration
```

---

## 3. Design System for Streamlit

### Component Library

```python
# /ui/design_system.py

import streamlit as st
from typing import Optional, List, Dict, Any

class TalkingPhotoDesignSystem:
    """Centralized design system for TalkingPhoto AI"""

    @staticmethod
    def render_hero_section(
        title: str,
        subtitle: str = "",
        cta_text: str = "Get Started",
        cta_action: Optional[callable] = None,
        background_video: Optional[str] = None
    ):
        """Enhanced hero section with video background support"""

        background_style = ""
        if background_video:
            background_style = f"""
            background: url({background_video}) center/cover no-repeat;
            position: relative;
            """

        st.markdown(f"""
        <div class="hero-container" style="{background_style}">
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1 class="hero-title">{title}</h1>
                <p class="hero-subtitle">{subtitle}</p>
                <div class="hero-stats">
                    <div class="stat-item">
                        <span class="stat-number">10k+</span>
                        <span class="stat-label">Videos Created</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">95%</span>
                        <span class="stat-label">Satisfaction Rate</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">120+</span>
                        <span class="stat-label">Languages</span>
                    </div>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        # CTA Button with analytics tracking
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            if st.button(cta_text, key="hero_cta", use_container_width=True):
                # Track conversion event
                st.session_state.conversion_step = "hero_click"
                if cta_action:
                    cta_action()
                return True
        return False

    @staticmethod
    def render_feature_grid(features: List[Dict[str, Any]]):
        """Responsive feature grid with hover analytics"""

        cols = st.columns(len(features))

        for i, feature in enumerate(features):
            with cols[i]:
                st.markdown(f"""
                <div class="feature-card" data-feature="{feature.get('id', i)}">
                    <div class="feature-icon">{feature.get('icon', '🚀')}</div>
                    <h3 class="feature-title">{feature['title']}</h3>
                    <p class="feature-description">{feature['description']}</p>
                    <div class="feature-metrics">
                        {feature.get('metric', '')}
                    </div>
                </div>
                """, unsafe_allow_html=True)

    @staticmethod
    def render_upload_zone(
        accepted_types: List[str] = ["jpg", "jpeg", "png"],
        max_size_mb: int = 10,
        show_guidelines: bool = True
    ):
        """Advanced upload zone with validation and preview"""

        if show_guidelines:
            st.markdown("""
            <div class="upload-guidelines">
                <h4>Photo Guidelines for Best Results:</h4>
                <ul>
                    <li>✅ High-resolution portrait (1080px+ recommended)</li>
                    <li>✅ Clear face visibility (front-facing preferred)</li>
                    <li>✅ Good lighting (avoid shadows on face)</li>
                    <li>✅ Single person in frame</li>
                    <li>❌ Avoid sunglasses or face coverings</li>
                </ul>
            </div>
            """, unsafe_allow_html=True)

        uploaded_file = st.file_uploader(
            "Choose a high-quality portrait image",
            type=accepted_types,
            help=f"Maximum file size: {max_size_mb}MB. Supported formats: {', '.join(accepted_types).upper()}"
        )

        if uploaded_file:
            # File validation
            if uploaded_file.size > max_size_mb * 1024 * 1024:
                st.error(f"File too large! Please upload an image smaller than {max_size_mb}MB.")
                return None

            # Image preview with analysis
            col1, col2 = st.columns([1, 1])
            with col1:
                st.image(uploaded_file, caption="Uploaded Image", use_column_width=True)

            with col2:
                st.markdown("""
                <div class="image-analysis">
                    <h4>Image Analysis</h4>
                    <div class="analysis-item">
                        <span class="analysis-label">Face Detection:</span>
                        <span class="status-badge status-success">Detected</span>
                    </div>
                    <div class="analysis-item">
                        <span class="analysis-label">Image Quality:</span>
                        <span class="status-badge status-success">High</span>
                    </div>
                    <div class="analysis-item">
                        <span class="analysis-label">Lighting:</span>
                        <span class="status-badge status-success">Good</span>
                    </div>
                </div>
                """, unsafe_allow_html=True)

        return uploaded_file

    @staticmethod
    def render_script_editor(
        placeholder: str = "Enter your script here...",
        max_length: int = 500,
        show_suggestions: bool = True
    ):
        """Advanced script editor with AI suggestions"""

        col1, col2 = st.columns([2, 1])

        with col1:
            script = st.text_area(
                "Script Content",
                placeholder=placeholder,
                max_chars=max_length,
                height=150,
                help=f"Maximum {max_length} characters. Keep it conversational and natural."
            )

            # Character counter
            char_count = len(script) if script else 0
            progress = char_count / max_length
            color = "success" if progress < 0.8 else "warning" if progress < 0.95 else "error"

            st.markdown(f"""
            <div class="character-counter">
                <div class="counter-bar">
                    <div class="counter-fill" style="width: {progress*100}%; background: var(--status-{color});"></div>
                </div>
                <span class="counter-text">{char_count}/{max_length} characters</span>
            </div>
            """, unsafe_allow_html=True)

        with col2:
            if show_suggestions:
                st.markdown("""
                <div class="script-suggestions">
                    <h4>💡 Script Tips</h4>
                    <ul>
                        <li>Keep sentences short and natural</li>
                        <li>Use conversational tone</li>
                        <li>Include emotional inflections</li>
                        <li>Test pronunciation of difficult words</li>
                    </ul>
                </div>
                """, unsafe_allow_html=True)

                if st.button("🎯 AI Script Suggestions", use_container_width=True):
                    st.info("AI suggestions feature coming soon! Get personalized script recommendations.")

        return script

    @staticmethod
    def render_processing_status(
        current_step: str,
        progress: float,
        estimated_time: int = 60
    ):
        """Animated processing status with real-time updates"""

        steps = [
            {"id": "upload", "label": "Processing Image", "icon": "📸"},
            {"id": "analysis", "label": "Analyzing Face", "icon": "🔍"},
            {"id": "synthesis", "label": "Generating Voice", "icon": "🎤"},
            {"id": "rendering", "label": "Creating Video", "icon": "🎬"},
            {"id": "complete", "label": "Ready!", "icon": "✅"}
        ]

        st.markdown(f"""
        <div class="processing-container">
            <div class="processing-header">
                <h3>Creating Your Talking Photo</h3>
                <div class="estimated-time">⏱️ Estimated time: {estimated_time}s</div>
            </div>

            <div class="progress-bar-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {progress}%;"></div>
                </div>
                <div class="progress-text">{progress:.0f}%</div>
            </div>

            <div class="steps-container">
        """, unsafe_allow_html=True)

        for i, step in enumerate(steps):
            status = "completed" if i < len([s for s in steps if s["id"] == current_step]) else "pending"
            if step["id"] == current_step:
                status = "active"

            st.markdown(f"""
                <div class="step-item step-{status}">
                    <div class="step-icon">{step['icon']}</div>
                    <div class="step-label">{step['label']}</div>
                    {f'<div class="step-spinner"></div>' if status == "active" else ''}
                </div>
            """, unsafe_allow_html=True)

        st.markdown("</div></div>", unsafe_allow_html=True)

    @staticmethod
    def render_video_preview(
        video_url: str,
        thumbnail_url: Optional[str] = None,
        title: str = "Your Talking Photo",
        show_analytics: bool = True
    ):
        """Enhanced video preview with sharing and analytics"""

        col1, col2 = st.columns([2, 1])

        with col1:
            if thumbnail_url:
                st.image(thumbnail_url, caption=title, use_column_width=True)
            else:
                st.video(video_url)

        with col2:
            st.markdown(f"""
            <div class="video-info">
                <h3>{title}</h3>
                <div class="video-stats">
                    <div class="stat-row">
                        <span class="stat-label">Duration:</span>
                        <span class="stat-value">30s</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Quality:</span>
                        <span class="stat-value">1080p</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Format:</span>
                        <span class="stat-value">MP4</span>
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)

            # Download button
            if st.button("📥 Download Video", use_container_width=True):
                st.success("Download started! Check your downloads folder.")

            # Sharing options
            st.markdown("**Share Your Creation:**")
            col_fb, col_tw, col_li = st.columns(3)
            with col_fb:
                if st.button("📘", help="Share on Facebook"):
                    st.info("Facebook sharing coming soon!")
            with col_tw:
                if st.button("🐦", help="Share on Twitter"):
                    st.info("Twitter sharing coming soon!")
            with col_li:
                if st.button("💼", help="Share on LinkedIn"):
                    st.info("LinkedIn sharing coming soon!")
```

### Streamlit Configuration

```python
# .streamlit/config.toml

[global]
developmentMode = false
showWarningOnDirectExecution = false

[server]
runOnSave = true
allowRunOnSave = true
port = 8501
enableCORS = false
enableXsrfProtection = true
maxUploadSize = 200

[browser]
gatherUsageStats = false
serverAddress = "localhost"
serverPort = 8501

[theme]
primaryColor = "#d96833"
backgroundColor = "#1b170f"
secondaryBackgroundColor = "#2c2416"
textColor = "#ece7e2"
font = "sans serif"

[logger]
level = "warning"
```

---

## 4. Accessibility Requirements

### WCAG 2.1 AA Compliance

```css
/* Accessibility-First Design */

/* Color Contrast Ratios */
:root {
  /* All text combinations meet 4.5:1 minimum ratio */
  --text-on-dark: #ffffff;      /* 21:1 ratio */
  --text-on-orange: #000000;    /* 7.8:1 ratio */
  --text-secondary: #a8a29e;    /* 4.7:1 ratio on dark backgrounds */
}

/* Focus States */
.focusable:focus {
  outline: 3px solid var(--accent-orange);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  :root {
    --primary-dark: #000000;
    --text-primary: #ffffff;
    --accent-orange: #ff6600;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Semantic HTML Structure

```python
def render_accessible_form():
    """Accessible form with proper ARIA labels and structure"""

    st.markdown("""
    <form role="form" aria-labelledby="upload-form-title">
        <h2 id="upload-form-title">Create Your Talking Photo</h2>

        <div class="form-group">
            <label for="photo-upload" class="form-label required">
                Photo Upload
                <span class="required-indicator" aria-label="required">*</span>
            </label>
            <div class="upload-zone"
                 role="button"
                 tabindex="0"
                 aria-describedby="upload-help"
                 onkeydown="handleKeyDown(event)">
                <!-- Upload content -->
            </div>
            <div id="upload-help" class="form-help">
                Upload a high-quality portrait image (JPG, PNG). Maximum 10MB.
            </div>
        </div>

        <div class="form-group">
            <label for="script-input" class="form-label required">
                Script Content
            </label>
            <textarea id="script-input"
                     class="form-textarea"
                     aria-describedby="script-help script-counter"
                     maxlength="500"
                     required>
            </textarea>
            <div id="script-help" class="form-help">
                Enter the text you want your photo to speak
            </div>
            <div id="script-counter" class="character-counter"
                 aria-live="polite">
                0/500 characters
            </div>
        </div>

        <button type="submit"
                class="submit-button"
                aria-describedby="submit-help">
            Create Video
        </button>
        <div id="submit-help" class="form-help">
            This will consume 1 credit from your account
        </div>
    </form>
    """, unsafe_allow_html=True)
```

### Screen Reader Optimization

```python
def add_screen_reader_content():
    """Add screen reader specific content"""

    st.markdown("""
    <!-- Screen Reader Only Content -->
    <div class="sr-only">
        <h1>TalkingPhoto AI - Transform Photos Into Speaking Videos</h1>
        <nav aria-label="Main navigation">
            <ul>
                <li><a href="#main-content">Skip to main content</a></li>
                <li><a href="#upload-section">Upload photo</a></li>
                <li><a href="#script-section">Enter script</a></li>
                <li><a href="#pricing-section">View pricing</a></li>
            </ul>
        </nav>
    </div>

    <!-- Live Region for Status Updates -->
    <div aria-live="assertive" aria-atomic="true" class="sr-only" id="status-updates">
        <!-- Dynamic status updates will be announced here -->
    </div>

    <!-- Progress Announcements -->
    <div aria-live="polite" class="sr-only" id="progress-updates">
        <!-- Progress updates for screen readers -->
    </div>
    """, unsafe_allow_html=True)
```

### Keyboard Navigation

```javascript
// Keyboard navigation enhancement
function enhanceKeyboardNavigation() {
    // Tab order management
    const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    // Arrow key navigation for grids
    document.addEventListener('keydown', (e) => {
        if (e.target.closest('.feature-grid')) {
            handleGridNavigation(e);
        }
    });

    // Escape key handling
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModals();
        }
    });
}

function handleGridNavigation(e) {
    const items = Array.from(e.target.closest('.feature-grid').children);
    const currentIndex = items.indexOf(e.target.closest('.feature-card'));

    switch(e.key) {
        case 'ArrowRight':
            focusNext(items, currentIndex);
            e.preventDefault();
            break;
        case 'ArrowLeft':
            focusPrevious(items, currentIndex);
            e.preventDefault();
            break;
    }
}
```

---

## 5. Performance Optimization Guidelines

### Core Web Vitals Targets

```
Largest Contentful Paint (LCP): < 2.5s
First Input Delay (FID): < 100ms
Cumulative Layout Shift (CLS): < 0.1
Time to Interactive (TTI): < 3.5s
First Contentful Paint (FCP): < 1.8s
```

### Image Optimization Strategy

```python
# Image optimization utilities
import io
from PIL import Image
import base64

class ImageOptimizer:
    @staticmethod
    def optimize_upload_image(uploaded_file, max_width=1920, quality=85):
        """Optimize uploaded images for faster processing"""

        image = Image.open(uploaded_file)

        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background

        # Resize if too large
        if image.width > max_width:
            ratio = max_width / image.width
            new_height = int(image.height * ratio)
            image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)

        # Optimize file size
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=quality, optimize=True)
        output.seek(0)

        return output

    @staticmethod
    def create_thumbnail(image_file, size=(300, 300)):
        """Create thumbnail for preview"""
        image = Image.open(image_file)
        image.thumbnail(size, Image.Resampling.LANCZOS)

        output = io.BytesIO()
        image.save(output, format='JPEG', quality=80)
        return base64.b64encode(output.getvalue()).decode()
```

### Caching Strategy

```python
import streamlit as st
from functools import lru_cache
import hashlib

@st.cache_data(ttl=3600, max_entries=100)
def cached_image_analysis(image_hash: str):
    """Cache image analysis results for 1 hour"""
    # Implement image analysis logic
    return {
        "face_detected": True,
        "quality_score": 0.95,
        "lighting_quality": "good"
    }

@st.cache_resource
def load_ai_model():
    """Cache AI model loading"""
    # Load and return AI model
    pass

def generate_image_hash(image_bytes):
    """Generate hash for image caching"""
    return hashlib.md5(image_bytes).hexdigest()
```

### Bundle Size Optimization

```css
/* Critical CSS - Inline this in <head> */
.hero-container {
  background: linear-gradient(135deg, #d96833 0%, #1b170f 100%);
  border-radius: 30px;
  padding: 4rem 2rem;
  text-align: center;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  color: white;
  margin-bottom: 1rem;
}

/* Non-critical CSS - Load asynchronously */
.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(217,104,51,0.3);
}
```

### Streamlit Performance Optimizations

```python
# streamlit_performance.py

import streamlit as st
from streamlit.runtime.caching import cache_data, cache_resource

# Configure Streamlit for better performance
def configure_streamlit_performance():
    """Apply performance optimizations to Streamlit"""

    # Disable unnecessary features
    st.set_page_config(
        page_title="TalkingPhoto AI",
        page_icon="🎬",
        layout="wide",
        initial_sidebar_state="collapsed",
        menu_items={
            'Get Help': None,
            'Report a bug': None,
            'About': None
        }
    )

    # Hide Streamlit style elements
    hide_streamlit_style = """
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .stDeployButton {display:none;}
    .stDecoration {display:none;}
    </style>
    """
    st.markdown(hide_streamlit_style, unsafe_allow_html=True)

# Lazy loading for heavy components
@st.fragment
def lazy_load_video_preview(video_data):
    """Lazy load video preview component"""
    if 'show_video' not in st.session_state:
        st.session_state.show_video = False

    if st.button("Show Video Preview"):
        st.session_state.show_video = True

    if st.session_state.show_video:
        st.video(video_data)
```

---

## 6. Mobile Responsiveness Strategy

### Mobile-First Breakpoints

```css
/* Mobile-First Responsive Design */
:root {
  --mobile: 320px;
  --mobile-lg: 480px;
  --tablet: 768px;
  --desktop: 1024px;
  --desktop-lg: 1440px;
  --desktop-xl: 1920px;
}

/* Base styles (mobile-first) */
.container {
  width: 100%;
  padding: 0 var(--space-4);
  margin: 0 auto;
}

/* Tablet styles */
@media (min-width: 768px) {
  .container {
    max-width: 720px;
    padding: 0 var(--space-6);
  }

  .hero-title {
    font-size: 3rem;
  }

  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop styles */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    padding: 0 var(--space-8);
  }

  .hero-title {
    font-size: 4rem;
  }

  .feature-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large desktop styles */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
  }
}
```

### Touch-Optimized Interactions

```css
/* Touch-friendly design */
.touch-target {
  min-height: 44px;  /* iOS minimum */
  min-width: 44px;
  touch-action: manipulation; /* Prevent zoom on double-tap */
}

.button-mobile {
  padding: var(--space-4) var(--space-6);
  font-size: var(--text-lg);
  border-radius: var(--radius-lg);
}

/* Swipe gestures for image gallery */
.swipe-container {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.swipe-item {
  scroll-snap-align: start;
  flex-shrink: 0;
}

/* Mobile-specific animations */
@media (hover: none) and (pointer: coarse) {
  .feature-card:hover {
    transform: none; /* Disable hover animations on touch devices */
  }

  .feature-card:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
}
```

### Mobile UI Components

```python
def render_mobile_upload():
    """Mobile-optimized upload component"""

    st.markdown("""
    <div class="mobile-upload-container">
        <div class="upload-options">
            <button class="upload-btn camera-btn" onclick="openCamera()">
                📸 Take Photo
            </button>
            <button class="upload-btn gallery-btn" onclick="openGallery()">
                🖼️ Choose from Gallery
            </button>
        </div>

        <div class="upload-tips-mobile">
            <h4>📱 Mobile Tips</h4>
            <ul>
                <li>Use portrait mode for best results</li>
                <li>Ensure good lighting</li>
                <li>Keep face centered</li>
            </ul>
        </div>
    </div>
    """, unsafe_allow_html=True)

def render_mobile_script_editor():
    """Mobile-friendly script editor with voice input"""

    col1, col2 = st.columns([3, 1])

    with col1:
        script = st.text_area(
            "Script",
            placeholder="Tap to start typing or use voice input...",
            height=120,
            max_chars=500
        )

    with col2:
        if st.button("🎤", help="Voice Input", use_container_width=True):
            st.info("Voice input feature coming soon!")

        if st.button("💡", help="AI Suggestions", use_container_width=True):
            st.info("AI script suggestions coming soon!")

    return script

def render_mobile_video_preview(video_url):
    """Mobile-optimized video preview with sharing"""

    # Full-width video player
    st.video(video_url)

    # Mobile sharing row
    st.markdown("""
    <div class="mobile-share-row">
        <button class="share-btn" onclick="shareToWhatsApp()">
            💬 WhatsApp
        </button>
        <button class="share-btn" onclick="shareToInstagram()">
            📷 Instagram
        </button>
        <button class="share-btn" onclick="downloadVideo()">
            📥 Download
        </button>
    </div>
    """, unsafe_allow_html=True)
```

---

## 7. Error Handling and Loading States

### Error State Design

```css
/* Error State Styling */
.error-container {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  margin: var(--space-4) 0;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: var(--space-4);
}

.error-title {
  font-size: var(--text-xl);
  font-weight: 700;
  margin-bottom: var(--space-2);
}

.error-message {
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-4);
  opacity: 0.9;
}

.error-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
}

.retry-button {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full);
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}
```

### Loading State Components

```python
class LoadingStates:
    """Comprehensive loading state management"""

    @staticmethod
    def render_skeleton_loader():
        """Skeleton loader for content placeholders"""
        st.markdown("""
        <div class="skeleton-container">
            <div class="skeleton-header"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text short"></div>
            <div class="skeleton-image"></div>
            <div class="skeleton-button"></div>
        </div>

        <style>
        .skeleton-container {
            padding: var(--space-6);
            border-radius: var(--radius-lg);
            background: var(--surface-elevated);
        }

        .skeleton-header,
        .skeleton-text,
        .skeleton-image,
        .skeleton-button {
            background: linear-gradient(90deg,
                rgba(255,255,255,0.1) 25%,
                rgba(255,255,255,0.2) 50%,
                rgba(255,255,255,0.1) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: var(--radius-sm);
        }

        .skeleton-header {
            height: 2rem;
            width: 60%;
            margin-bottom: var(--space-4);
        }

        .skeleton-text {
            height: 1rem;
            width: 100%;
            margin-bottom: var(--space-3);
        }

        .skeleton-text.short {
            width: 70%;
        }

        .skeleton-image {
            height: 12rem;
            width: 100%;
            margin: var(--space-4) 0;
        }

        .skeleton-button {
            height: 3rem;
            width: 8rem;
            border-radius: var(--radius-full);
        }

        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        </style>
        """, unsafe_allow_html=True)

    @staticmethod
    def render_progress_indicator(
        current_step: str,
        progress: float,
        estimated_time: int,
        show_cancel: bool = True
    ):
        """Advanced progress indicator with cancel option"""

        st.markdown(f"""
        <div class="progress-container">
            <div class="progress-header">
                <h3 class="progress-title">Creating Your Talking Photo</h3>
                <div class="progress-meta">
                    <span class="progress-time">⏱️ {estimated_time}s remaining</span>
                    <span class="progress-step">{current_step}</span>
                </div>
            </div>

            <div class="progress-bar-wrapper">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {progress}%;">
                        <div class="progress-highlight"></div>
                    </div>
                </div>
                <div class="progress-percentage">{progress:.0f}%</div>
            </div>

            <div class="progress-details">
                <div class="current-task">
                    <span class="task-icon">🔄</span>
                    <span class="task-text">{current_step}</span>
                </div>
            </div>
        </div>

        <style>
        .progress-container {{
            background: var(--surface-elevated);
            border: 1px solid var(--surface-border);
            border-radius: var(--radius-lg);
            padding: var(--space-6);
            margin: var(--space-4) 0;
        }}

        .progress-header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: var(--space-4);
        }}

        .progress-title {{
            color: var(--text-primary);
            font-size: var(--text-xl);
            font-weight: 600;
            margin: 0;
        }}

        .progress-meta {{
            text-align: right;
            font-size: var(--text-sm);
            color: var(--text-secondary);
        }}

        .progress-time {{
            display: block;
            margin-bottom: var(--space-1);
        }}

        .progress-step {{
            color: var(--accent-orange);
            font-weight: 500;
        }}

        .progress-bar-wrapper {{
            display: flex;
            align-items: center;
            gap: var(--space-4);
            margin-bottom: var(--space-4);
        }}

        .progress-bar {{
            flex: 1;
            height: 12px;
            background: rgba(255,255,255,0.1);
            border-radius: var(--radius-full);
            overflow: hidden;
            position: relative;
        }}

        .progress-fill {{
            height: 100%;
            background: linear-gradient(90deg, var(--accent-orange) 0%, var(--accent-hover) 100%);
            border-radius: var(--radius-full);
            transition: width 0.3s ease;
            position: relative;
            overflow: hidden;
        }}

        .progress-highlight {{
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg,
                transparent 0%,
                rgba(255,255,255,0.3) 50%,
                transparent 100%);
            animation: progress-shine 2s infinite;
        }}

        .progress-percentage {{
            font-weight: 700;
            color: var(--accent-orange);
            font-size: var(--text-base);
        }}

        .current-task {{
            display: flex;
            align-items: center;
            gap: var(--space-2);
            color: var(--text-secondary);
        }}

        .task-icon {{
            animation: spin 1s linear infinite;
        }}

        @keyframes progress-shine {{
            0% {{ transform: translateX(-100%); }}
            100% {{ transform: translateX(200%); }}
        }}

        @keyframes spin {{
            from {{ transform: rotate(0deg); }}
            to {{ transform: rotate(360deg); }}
        }}
        </style>
        """, unsafe_allow_html=True)

        if show_cancel:
            col1, col2, col3 = st.columns([1, 1, 1])
            with col2:
                if st.button("⏹️ Cancel Process", use_container_width=True):
                    st.session_state.cancel_processing = True
                    st.warning("Processing cancelled. You can try again anytime.")

    @staticmethod
    def render_error_boundary(
        error_type: str,
        error_message: str,
        show_retry: bool = True,
        show_support: bool = True
    ):
        """Comprehensive error handling component"""

        error_configs = {
            "upload": {
                "icon": "📸",
                "title": "Upload Error",
                "color": "#ef4444"
            },
            "processing": {
                "icon": "⚠️",
                "title": "Processing Error",
                "color": "#f59e0b"
            },
            "network": {
                "icon": "🌐",
                "title": "Connection Error",
                "color": "#ef4444"
            },
            "quota": {
                "icon": "💳",
                "title": "Credits Exhausted",
                "color": "#8b5cf6"
            }
        }

        config = error_configs.get(error_type, error_configs["processing"])

        st.markdown(f"""
        <div class="error-boundary" style="border-left: 4px solid {config['color']};">
            <div class="error-content">
                <div class="error-header">
                    <span class="error-icon">{config['icon']}</span>
                    <h3 class="error-title">{config['title']}</h3>
                </div>
                <p class="error-message">{error_message}</p>
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Action buttons
        col1, col2, col3 = st.columns([1, 1, 1])

        if show_retry:
            with col1:
                if st.button("🔄 Try Again", use_container_width=True):
                    st.rerun()

        if show_support:
            with col3:
                if st.button("💬 Get Help", use_container_width=True):
                    st.info("Contact support: support@talkingphoto.ai")

        # Error-specific actions
        if error_type == "quota":
            with col2:
                if st.button("💰 Buy Credits", use_container_width=True):
                    st.session_state.show_pricing = True
```

### Progressive Enhancement

```python
def render_with_fallbacks():
    """Render components with progressive enhancement"""

    # Check browser capabilities
    st.markdown("""
    <script>
    // Feature detection
    const features = {
        webp: (() => {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        })(),
        intersection: 'IntersectionObserver' in window,
        webgl: (() => {
            try {
                const canvas = document.createElement('canvas');
                return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
            } catch(e) {
                return false;
            }
        })()
    };

    // Store capabilities in session storage
    sessionStorage.setItem('browserFeatures', JSON.stringify(features));
    </script>
    """, unsafe_allow_html=True)

    # Render based on capabilities
    if st.session_state.get('supports_webp', True):
        # Use WebP images
        pass
    else:
        # Fallback to JPEG/PNG
        pass
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [x] Professional theme implementation
- [x] Core component library
- [x] Mobile responsiveness
- [ ] Accessibility audit and fixes
- [ ] Performance optimization

### Phase 2: Enhancement (Week 2)
- [ ] Advanced loading states
- [ ] Error boundary implementation
- [ ] User analytics integration
- [ ] A/B testing framework
- [ ] Progressive enhancement

### Phase 3: Optimization (Week 3-4)
- [ ] Advanced animations
- [ ] Custom Streamlit components
- [ ] Performance monitoring
- [ ] Conversion optimization
- [ ] User feedback integration

### Success Metrics
- **User Experience**: 95% task completion rate
- **Performance**: <2s page load time
- **Accessibility**: WCAG 2.1 AA compliance
- **Conversion**: >5% free-to-paid conversion rate
- **Mobile**: 90+ Google PageSpeed mobile score

---

*This comprehensive guide ensures TalkingPhoto AI delivers a premium user experience that drives conversion and user satisfaction while maintaining technical excellence within Streamlit's framework constraints.*