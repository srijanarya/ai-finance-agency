"""
Health Check and Monitoring System for Streamlit Cloud Deployment
Monitors app performance, API status, and resource usage
"""

import streamlit as st
import time
import psutil
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import json
import logging
from dataclasses import dataclass
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HealthStatus(Enum):
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
    UNKNOWN = "unknown"

@dataclass
class HealthCheck:
    name: str
    status: HealthStatus
    message: str
    response_time: Optional[float] = None
    timestamp: datetime = None
    details: Dict[str, Any] = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()
        if self.details is None:
            self.details = {}

class HealthMonitor:
    """
    Comprehensive health monitoring for TalkingPhoto MVP
    Monitors APIs, system resources, and application performance
    """

    def __init__(self):
        self.checks_history: List[Dict[str, HealthCheck]] = []
        self.max_history = 100

    def check_system_resources(self) -> HealthCheck:
        """Check system resource usage"""
        try:
            # Memory usage
            memory = psutil.virtual_memory()
            cpu_percent = psutil.cpu_percent(interval=1)

            # Determine status based on resource usage
            if memory.percent > 90 or cpu_percent > 90:
                status = HealthStatus.CRITICAL
                message = f"High resource usage: Memory {memory.percent:.1f}%, CPU {cpu_percent:.1f}%"
            elif memory.percent > 70 or cpu_percent > 70:
                status = HealthStatus.WARNING
                message = f"Moderate resource usage: Memory {memory.percent:.1f}%, CPU {cpu_percent:.1f}%"
            else:
                status = HealthStatus.HEALTHY
                message = f"Resource usage normal: Memory {memory.percent:.1f}%, CPU {cpu_percent:.1f}%"

            return HealthCheck(
                name="System Resources",
                status=status,
                message=message,
                details={
                    "memory_percent": memory.percent,
                    "memory_available": memory.available,
                    "memory_total": memory.total,
                    "cpu_percent": cpu_percent
                }
            )
        except Exception as e:
            logger.error(f"System resource check failed: {e}")
            return HealthCheck(
                name="System Resources",
                status=HealthStatus.UNKNOWN,
                message=f"Failed to check resources: {str(e)}"
            )

    def check_api_endpoint(self, name: str, url: str, headers: Dict = None, timeout: int = 10) -> HealthCheck:
        """Check API endpoint health"""
        start_time = time.time()

        try:
            response = requests.get(url, headers=headers or {}, timeout=timeout)
            response_time = (time.time() - start_time) * 1000  # Convert to milliseconds

            if response.status_code == 200:
                status = HealthStatus.HEALTHY
                message = f"API responsive ({response.status_code})"
            elif 400 <= response.status_code < 500:
                status = HealthStatus.WARNING
                message = f"Client error ({response.status_code})"
            else:
                status = HealthStatus.CRITICAL
                message = f"Server error ({response.status_code})"

            return HealthCheck(
                name=name,
                status=status,
                message=message,
                response_time=response_time,
                details={
                    "status_code": response.status_code,
                    "response_time_ms": response_time,
                    "url": url
                }
            )

        except requests.exceptions.Timeout:
            response_time = (time.time() - start_time) * 1000
            return HealthCheck(
                name=name,
                status=HealthStatus.CRITICAL,
                message="Request timeout",
                response_time=response_time,
                details={"error": "timeout", "url": url}
            )
        except requests.exceptions.ConnectionError:
            response_time = (time.time() - start_time) * 1000
            return HealthCheck(
                name=name,
                status=HealthStatus.CRITICAL,
                message="Connection failed",
                response_time=response_time,
                details={"error": "connection_error", "url": url}
            )
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            logger.error(f"API check failed for {name}: {e}")
            return HealthCheck(
                name=name,
                status=HealthStatus.UNKNOWN,
                message=f"Check failed: {str(e)}",
                response_time=response_time,
                details={"error": str(e), "url": url}
            )

    def check_video_generation_apis(self) -> List[HealthCheck]:
        """Check all video generation API endpoints"""
        checks = []

        # Get API configurations from secrets
        api_configs = []

        # HeyGen API
        if "heygen" in st.secrets:
            api_configs.append({
                "name": "HeyGen API",
                "url": st.secrets["heygen"].get("api_endpoint", "https://api.heygen.com") + "/health",
                "headers": {"X-API-KEY": st.secrets["heygen"].get("api_key", "")}
            })

        # D-ID API
        if "d_id" in st.secrets:
            api_configs.append({
                "name": "D-ID API",
                "url": st.secrets["d_id"].get("api_endpoint", "https://api.d-id.com") + "/health",
                "headers": {"Authorization": f"Basic {st.secrets['d_id'].get('api_key', '')}"}
            })

        # Synthesia API
        if "synthesia" in st.secrets:
            api_configs.append({
                "name": "Synthesia API",
                "url": st.secrets["synthesia"].get("api_endpoint", "https://api.synthesia.io") + "/health",
                "headers": {"Authorization": f"Bearer {st.secrets['synthesia'].get('api_key', '')}"}
            })

        for config in api_configs:
            check = self.check_api_endpoint(
                name=config["name"],
                url=config["url"],
                headers=config["headers"]
            )
            checks.append(check)

        return checks

    def check_payment_apis(self) -> List[HealthCheck]:
        """Check payment API endpoints"""
        checks = []

        # Stripe API
        if "stripe" in st.secrets:
            checks.append(self.check_api_endpoint(
                name="Stripe API",
                url="https://api.stripe.com/v1/account",
                headers={"Authorization": f"Bearer {st.secrets['stripe'].get('secret_key', '')}"}
            ))

        # Razorpay API
        if "razorpay" in st.secrets:
            checks.append(self.check_api_endpoint(
                name="Razorpay API",
                url="https://api.razorpay.com/v1/payments",
                headers={"Authorization": f"Basic {st.secrets['razorpay'].get('key_id', '')}"}
            ))

        return checks

    def check_storage_services(self) -> List[HealthCheck]:
        """Check cloud storage service availability"""
        checks = []

        # Cloudinary
        if "cloudinary" in st.secrets:
            cloudinary_url = f"https://api.cloudinary.com/v1_1/{st.secrets['cloudinary'].get('cloud_name', '')}/image/upload"
            checks.append(self.check_api_endpoint(
                name="Cloudinary API",
                url=cloudinary_url,
                headers={}
            ))

        # AWS S3 (basic connectivity check)
        if "aws" in st.secrets:
            checks.append(self.check_api_endpoint(
                name="AWS S3",
                url="https://s3.amazonaws.com",
                headers={}
            ))

        return checks

    def run_all_checks(self) -> Dict[str, List[HealthCheck]]:
        """Run comprehensive health checks"""
        results = {
            "system": [self.check_system_resources()],
            "video_apis": self.check_video_generation_apis(),
            "payment_apis": self.check_payment_apis(),
            "storage": self.check_storage_services(),
            "timestamp": datetime.now()
        }

        # Store in history
        self.checks_history.append(results)
        if len(self.checks_history) > self.max_history:
            self.checks_history.pop(0)

        return results

    def get_overall_status(self, checks: Dict[str, List[HealthCheck]]) -> HealthStatus:
        """Determine overall system health status"""
        all_checks = []
        for category_checks in checks.values():
            if isinstance(category_checks, list):
                all_checks.extend(category_checks)

        if not all_checks:
            return HealthStatus.UNKNOWN

        # Count statuses
        critical_count = sum(1 for check in all_checks if check.status == HealthStatus.CRITICAL)
        warning_count = sum(1 for check in all_checks if check.status == HealthStatus.WARNING)

        if critical_count > 0:
            return HealthStatus.CRITICAL
        elif warning_count > 0:
            return HealthStatus.WARNING
        else:
            return HealthStatus.HEALTHY

    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get performance metrics from recent checks"""
        if not self.checks_history:
            return {}

        recent_checks = self.checks_history[-10:]  # Last 10 check cycles

        # Calculate average response times
        api_response_times = {}
        for check_cycle in recent_checks:
            for category, checks in check_cycle.items():
                if isinstance(checks, list):
                    for check in checks:
                        if check.response_time is not None:
                            if check.name not in api_response_times:
                                api_response_times[check.name] = []
                            api_response_times[check.name].append(check.response_time)

        # Calculate averages
        performance_metrics = {
            "avg_response_times": {
                name: sum(times) / len(times)
                for name, times in api_response_times.items()
            },
            "total_checks": len(recent_checks),
            "time_period": "Last 10 checks"
        }

        return performance_metrics

# Streamlit UI Components
def render_health_dashboard():
    """Render the health monitoring dashboard"""
    st.title("🏥 System Health Dashboard")

    # Initialize health monitor
    if 'health_monitor' not in st.session_state:
        st.session_state.health_monitor = HealthMonitor()

    monitor = st.session_state.health_monitor

    # Control buttons
    col1, col2, col3 = st.columns(3)

    with col1:
        if st.button("🔄 Run Health Checks", type="primary"):
            with st.spinner("Running health checks..."):
                results = monitor.run_all_checks()
                st.session_state.latest_health_results = results

    with col2:
        auto_refresh = st.checkbox("🔄 Auto-refresh (30s)", value=False)

    with col3:
        if st.button("📊 View Performance"):
            st.session_state.show_performance = True

    # Auto-refresh logic
    if auto_refresh:
        time.sleep(30)
        results = monitor.run_all_checks()
        st.session_state.latest_health_results = results
        st.rerun()

    # Display results
    if 'latest_health_results' in st.session_state:
        results = st.session_state.latest_health_results
        overall_status = monitor.get_overall_status(results)

        # Overall status badge
        status_colors = {
            HealthStatus.HEALTHY: "#10b981",
            HealthStatus.WARNING: "#f59e0b",
            HealthStatus.CRITICAL: "#ef4444",
            HealthStatus.UNKNOWN: "#6b7280"
        }

        st.markdown(f"""
        <div style="
            text-align: center;
            padding: 2rem;
            background: {status_colors.get(overall_status, '#6b7280')}22;
            border: 2px solid {status_colors.get(overall_status, '#6b7280')};
            border-radius: 15px;
            margin: 2rem 0;
        ">
            <h2 style="color: {status_colors.get(overall_status, '#6b7280')};">
                System Status: {overall_status.value.title()}
            </h2>
            <p>Last updated: {results['timestamp'].strftime('%Y-%m-%d %H:%M:%S')}</p>
        </div>
        """, unsafe_allow_html=True)

        # Category-wise results
        categories = [
            ("System Resources", "system"),
            ("Video Generation APIs", "video_apis"),
            ("Payment APIs", "payment_apis"),
            ("Storage Services", "storage")
        ]

        for category_name, category_key in categories:
            if category_key in results and results[category_key]:
                st.subheader(f"📊 {category_name}")

                for check in results[category_key]:
                    render_health_check_card(check)

        # Performance metrics
        if st.session_state.get('show_performance', False):
            st.subheader("📈 Performance Metrics")
            metrics = monitor.get_performance_metrics()

            if metrics:
                col1, col2 = st.columns(2)

                with col1:
                    st.json(metrics["avg_response_times"])

                with col2:
                    st.metric("Total Checks", metrics["total_checks"])
                    st.caption(metrics["time_period"])

def render_health_check_card(check: HealthCheck):
    """Render individual health check result"""
    status_colors = {
        HealthStatus.HEALTHY: "#10b981",
        HealthStatus.WARNING: "#f59e0b",
        HealthStatus.CRITICAL: "#ef4444",
        HealthStatus.UNKNOWN: "#6b7280"
    }

    status_icons = {
        HealthStatus.HEALTHY: "✅",
        HealthStatus.WARNING: "⚠️",
        HealthStatus.CRITICAL: "❌",
        HealthStatus.UNKNOWN: "❓"
    }

    color = status_colors.get(check.status, "#6b7280")
    icon = status_icons.get(check.status, "❓")

    with st.expander(f"{icon} {check.name} - {check.message}", expanded=check.status != HealthStatus.HEALTHY):
        col1, col2 = st.columns(2)

        with col1:
            st.write(f"**Status:** {check.status.value.title()}")
            st.write(f"**Message:** {check.message}")
            st.write(f"**Timestamp:** {check.timestamp.strftime('%H:%M:%S')}")

        with col2:
            if check.response_time:
                st.metric("Response Time", f"{check.response_time:.0f} ms")

            if check.details:
                st.json(check.details)

# Lightweight health check for embedding in main app
def get_quick_health_status() -> Dict[str, Any]:
    """Get quick health status for main app display"""
    monitor = HealthMonitor()

    # Quick checks (limited to avoid impact on main app)
    system_check = monitor.check_system_resources()

    # Mock API check (replace with actual lightweight checks)
    api_status = HealthStatus.HEALTHY  # Assume healthy unless proven otherwise

    return {
        "overall_status": system_check.status,
        "memory_percent": system_check.details.get("memory_percent", 0),
        "cpu_percent": system_check.details.get("cpu_percent", 0),
        "api_status": api_status,
        "timestamp": datetime.now()
    }

def render_health_widget():
    """Render compact health widget for main app"""
    try:
        health = get_quick_health_status()

        status_colors = {
            HealthStatus.HEALTHY: "#10b981",
            HealthStatus.WARNING: "#f59e0b",
            HealthStatus.CRITICAL: "#ef4444"
        }

        color = status_colors.get(health["overall_status"], "#6b7280")

        st.sidebar.markdown(f"""
        <div style="
            background: {color}22;
            border: 1px solid {color};
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        ">
            <h4 style="color: {color}; margin: 0;">System Health</h4>
            <p style="margin: 0.5rem 0; font-size: 0.9rem;">
                CPU: {health['cpu_percent']:.1f}% |
                RAM: {health['memory_percent']:.1f}%
            </p>
            <small style="color: #666;">
                {health['timestamp'].strftime('%H:%M:%S')}
            </small>
        </div>
        """, unsafe_allow_html=True)

    except Exception as e:
        st.sidebar.error(f"Health check failed: {str(e)}")

# Main function for standalone health dashboard
def main():
    st.set_page_config(
        page_title="TalkingPhoto Health Monitor",
        page_icon="🏥",
        layout="wide"
    )

    render_health_dashboard()

if __name__ == "__main__":
    main()