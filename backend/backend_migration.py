from app.core.database import engine, Base
import app.models  # ensures all models are loaded

# Create all missing tables
Base.metadata.create_all(bind=engine)

# Add reading_level column to students if not exists
with engine.connect() as conn:
    try:
        conn.execute("ALTER TABLE students ADD COLUMN reading_level VARCHAR(50) DEFAULT NULL;")
        print("Added reading_level column to students.")
    except Exception as e:
        print("Column may already exist:", e)

print("Reading module tables created.")