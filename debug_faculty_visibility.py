from sqlmodel import Session, select
from backend.database import engine
from backend.models import User, Schedule, CourseAllocation
from collections import Counter

def debug_faculty_schedule():
    with Session(engine) as session:
        # 1. List all Faculty
        faculty = session.exec(select(User).where(User.role == "faculty")).all()
        print(f"\n--- Faculty Users ({len(faculty)}) ---")
        for f in faculty:
            print(f"ID: {f.id} | Name: {f.full_name} | Email: {f.email}")

        # 2. Check Allocations
        allocations = session.exec(select(CourseAllocation)).all()
        print(f"\n--- Allocations ({len(allocations)}) ---")
        if allocations:
            # Group by teacher
            counts = Counter([a.teacher_id for a in allocations])
            for tid, count in counts.items():
                print(f"Teacher ID {tid}: {count} allocations")
        
        # 3. Check Schedules
        schedules = session.exec(select(Schedule)).all()
        print(f"\n--- Schedules ({len(schedules)}) ---")
        if schedules:
             counts = Counter([s.faculty_id for s in schedules])
             for fid, count in counts.items():
                 print(f"Faculty ID {fid}: {count} scheduled classes")

if __name__ == "__main__":
    debug_faculty_schedule()
