import time
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi import BackgroundTasks, FastAPI
from app.Helper.B2fileManager import B2FileManager
from app.api.api_routers import api_router
from app.api.datasets.tasks import auto_refresh_datasets
from app.core.config import settings
from starlette.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, RedirectResponse
from apscheduler.schedulers.background import BackgroundScheduler

from app.database.database import SessionLocal



app = FastAPI()
scheduler = BackgroundScheduler()

# Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",         
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)


app.include_router(api_router)


@app.get("/")
def read_root():
    return {"status": "I am running"}

# def start_auto_refresh():
#     with SessionLocal() as db:  # Ensure correct db session management
#         file_manager = B2FileManager()
#         auto_refresh_datasets(db, file_manager)

# Run the check every minute
# scheduler.add_job(start_auto_refresh, 'interval', minutes=1)

# @app.on_event("startup")
# def on_startup():
#     scheduler.start()

# @app.on_event("shutdown")
# def on_shutdown():
#     scheduler.shutdown()
