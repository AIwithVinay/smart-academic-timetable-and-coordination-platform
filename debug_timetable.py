from sqlmodel import Session, select, create_engine
from backend.models import User, Schedule

# Setup DB connection
sqlite_url = f"sqlite:///./database.db"
engine = create_engine(sqlite_url)

def check_student_schedule_status():
    print("--- Checking Student Section & Schedule ---")
    try:
        with Session(engine) as session:
            # Check Student Section
            student = session.exec(select(User).where(User.email == "xjwrxg@college.edu")).first()
            if not student:
                 print("Student not found.")
                 return

            print(f"Student: {student.full_name} | Section: {student.section}")

            # Check Schedules for this section
            if student.section:
                schedules = session.exec(select(Schedule).where(Schedule.section == student.section)).all()
                print(f"Total Schedules for Section {student.section}: {len(schedules)}")
                
                published_count = sum(1 for s in schedules if s.is_published)
                print(f"Published Schedules: {published_count}")
                
            else:
                print("WARNING: Student has no section assigned!")

            # Check ALl Schedules to see if ANY are published
            all_schedules = session.exec(select(Schedule)).all()
            print(f"Total Schedules in DB (any section): {len(all_schedules)}")
            if all_schedules:
                 published_any = sum(1 for s in all_schedules if s.is_published)
                 print(f"Total Published in DB: {published_any}")
                 print(f"Sample: Section={all_schedules[0].section}, Published={all_schedules[0].is_published}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_student_schedule_status()
