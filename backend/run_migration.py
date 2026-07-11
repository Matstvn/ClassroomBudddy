from app.core.database import engine, Base
from sqlalchemy import text
import app.models  # ensures all models are loaded

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Insert default row if not exists
with engine.connect() as conn:
    result = conn.execute(text("SELECT COUNT(*) FROM app_settings"))
    count = result.scalar()
    if count == 0:
        conn.execute(text(
            "INSERT INTO app_settings (id, school_year, term1_start, term1_end, term2_start, term2_end, term3_start, term3_end) "
            "VALUES (1, '2026-2027', '2026-08-01', '2026-10-31', '2026-11-01', '2027-01-31', '2027-02-01', '2027-05-31')"
        ))
        conn.commit()
        print("Default settings row inserted.")
    else:
        print("Settings row already exists.")

print("Settings migration complete.")