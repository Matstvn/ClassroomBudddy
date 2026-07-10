from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://teacher:secure_password@localhost:3306/teacher_companion"
    APP_NAME: str = "Teacher Classroom Companion"
    API_V1_PREFIX: str = "/api/v1"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
