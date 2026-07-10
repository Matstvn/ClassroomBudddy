from app.core.database import engine

with engine.connect() as conn:
    # Add session column
    try:
        conn.execute("ALTER TABLE attendance ADD COLUMN session ENUM('AM','PM') NOT NULL DEFAULT 'AM';")
        print("Added session column.")
    except Exception as e:
        print("Session column already exists or error:", e)

    # Drop subject_id if it exists (attendance is whole-class)
    # First drop foreign key constraint if present
    try:
        conn.execute("ALTER TABLE attendance DROP FOREIGN KEY attendance_ibfk_2;")  # adjust name as needed
    except:
        pass
    try:
        conn.execute("ALTER TABLE attendance DROP COLUMN subject_id;")
        print("Dropped subject_id column.")
    except Exception as e:
        print("subject_id may not exist:", e)

    # Update unique constraint
    try:
        conn.execute("ALTER TABLE attendance DROP INDEX uq_attendance;")
    except:
        pass
    try:
        conn.execute("ALTER TABLE attendance ADD UNIQUE KEY uq_attendance_session (student_id, date, session);")
        print("Updated unique constraint.")
    except Exception as e:
        print("Unique constraint update error:", e)

    print("Migration complete.")