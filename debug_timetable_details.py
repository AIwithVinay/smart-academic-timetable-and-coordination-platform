from sqlmodel import Session, select, create_engine
from backend.models import User, Schedule

# Setup DB connection
sqlite_url = f"sqlite:///./database.db"
engine = create_engine(sqlite_url)

def check_schedule_details():
    print("--- Checking Schedule Details ---")
    try:
        with Session(engine) as session:
            # Check a sample schedule
            schedules = session.exec(select(Schedule).limit(5)).all()
            for s in schedules:
                print(f"ID: {s.id} | Section: {s.section} | Day: '{s.day_of_week}' | Start: '{s.start_time}' | Published: {s.is_published}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_schedule_details()
