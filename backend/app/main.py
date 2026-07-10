from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Import endpoint modules directly (each exposes a `router` attribute)
import app.api.v1.endpoints.learners as learners
import app.api.v1.endpoints.subjects as subjects
import app.api.v1.endpoints.attendance as attendance
import app.api.v1.endpoints.lessons as lessons
import app.api.v1.endpoints.assessments as assessments
import app.api.v1.endpoints.assessment_subtypes as assessment_subtypes
import app.api.v1.endpoints.grades as grades
import app.api.v1.endpoints.curriculum as curriculum
import app.api.v1.endpoints.learning_objectives as learning_objectives




app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(
    learners.router,
    prefix=f"{settings.API_V1_PREFIX}/learners",
    tags=["learners"]
)
app.include_router(
    subjects.router,
    prefix=f"{settings.API_V1_PREFIX}/subjects",
    tags=["subjects"]
)
app.include_router(
    attendance.router,
    prefix=f"{settings.API_V1_PREFIX}/attendance",
    tags=["attendance"]
)
app.include_router(
    lessons.router,
    prefix=f"{settings.API_V1_PREFIX}/lessons",
    tags=["lessons"]
)
app.include_router(
    assessments.router,
    prefix=f"{settings.API_V1_PREFIX}/assessments",
    tags=["assessments"]
)
app.include_router(
    assessment_subtypes.router,
    prefix=f"{settings.API_V1_PREFIX}/assessment-subtypes",
    tags=["assessment-subtypes"]
)
app.include_router(
    grades.router,
    prefix=f"{settings.API_V1_PREFIX}/grades",
    tags=["grades"]
)

app.include_router(
    curriculum.router,
    prefix=f"{settings.API_V1_PREFIX}/curriculum",
    tags=["curriculum"]
)

app.include_router(
    learning_objectives.router,
    prefix=f"{settings.API_V1_PREFIX}/learning-objectives",
    tags=["learning-objectives"]
)

@app.get("/health")
def health():
    return {"status": "ok"}