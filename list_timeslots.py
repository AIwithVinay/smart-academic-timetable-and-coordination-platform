from sqlmodel import Session, select, create_engine
from backend.models import TimeSlot

# Setup DB connection
sqlite_url = f"sqlite:///./database.db"
engine = create_engine(sqlite_url)

def list_timeslots():
    print("--- Listing Time Slots ---")
    try:
        with Session(engine) as session:
            slots = session.exec(select(TimeSlot)).all()
            for s in slots:
                print(f"ID: {s.id} | Start: '{s.start_time}' | End: '{s.end_time}'")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_timeslots()
