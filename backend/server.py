from fastapi import FastAPI, APIRouter, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager

# Import rate limiter
from middleware.rate_limiter import limiter, rate_limit_exceeded_handler
from middleware.security_headers import SecurityHeadersMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Import routes
from routes.auth import router as auth_router, set_db as set_auth_db
from routes.widgets import router as widgets_router, set_db as set_widgets_db
from routes.pages import router as pages_router, set_db as set_pages_db
from routes.posts import router as posts_router, set_db as set_posts_db
from routes.settings import router as settings_router, set_db as set_settings_db
from routes.audit_logs import router as audit_logs_router, set_db as set_audit_logs_db
from routes.dashboard import router as dashboard_router, set_db as set_dashboard_db
from routes.user_auth import router as user_auth_router
from routes.demo import router as demo_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME', 'timelov_admin')

client = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle"""
    global client, db
    
    # Startup
    logger.info("Starting up...")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Set database for routes
    set_auth_db(db)
    set_widgets_db(db)
    set_pages_db(db)
    set_posts_db(db)
    set_settings_db(db)
    set_audit_logs_db(db)
    set_dashboard_db(db)
    
    # Create indexes
    await db.admin_users.create_index("email", unique=True)
    await db.admin_users.create_index("id", unique=True)
    await db.audit_logs.create_index("created_at")
    await db.audit_logs.create_index("admin_id")
    await db.audit_logs.create_index("action")
    await db.widgets.create_index("id", unique=True)
    await db.widgets.create_index("section_name")
    await db.pages.create_index("id", unique=True)
    await db.pages.create_index("slug", unique=True)
    await db.posts.create_index("id", unique=True)
    await db.posts.create_index("slug", unique=True)
    await db.settings.create_index("setting_key", unique=True)
    
    # App user indexes
    await db.app_users.create_index("email", unique=True)
    await db.app_users.create_index("id", unique=True)
    await db.demo_requests.create_index("id", unique=True)
    await db.demo_requests.create_index("email")
    await db.demo_requests.create_index("created_at")
    
    logger.info("Database connected and indexes created")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    if client:
        client.close()

# Create the main app
app = FastAPI(
    title="TimeLov Admin API",
    description="Admin panel API for TimeLov landing page management",
    version="1.0.0",
    lifespan=lifespan
)

# Add rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Create API router
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "TimeLov Admin API", "status": "healthy"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected" if db is not None else "disconnected"
    }

# Include routers
api_router.include_router(auth_router)
api_router.include_router(user_auth_router)
api_router.include_router(demo_router)
api_router.include_router(widgets_router)
api_router.include_router(pages_router)
api_router.include_router(posts_router)
api_router.include_router(settings_router)
api_router.include_router(audit_logs_router)
api_router.include_router(dashboard_router)

# Include API router in main app
app.include_router(api_router)

# Add Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    return response
