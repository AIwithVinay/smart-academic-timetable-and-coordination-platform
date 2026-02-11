from sqlmodel import Session, select, create_engine
from backend.models import Schedule

sqlite_url = f"sqlite:///./database.db"
engine = create_engine(sqlite_url)

def check_schedules():
    print("--- Checking Schedules ---")
    with Session(engine) as session:
        for section in ['A', 'E']:
            schedules = session.exec(select(Schedule).where(Schedule.section == section)).all()
            published = [s for s in schedules if s.is_published]
            print(f"Section {section}: Total Slots = {len(schedules)}, Published = {len(published)}")
            if schedules:
                print(f"  Sample: {schedules[0].day_of_week} {schedules[0].start_time} - {schedules[0].course_name}")

if __name__ == "__main__":
    check_schedules()
