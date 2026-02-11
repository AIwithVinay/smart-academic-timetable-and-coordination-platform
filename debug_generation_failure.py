from sqlmodel import Session, select
from backend.database import engine
from backend.models import Room, TimeSlot, Subject, CourseAllocation, User, Schedule
from backend.timetable_algorithm import TimetableGeneticAlgorithm

def debug_generation():
    with Session(engine) as session:
        print("--- Debugging Data State ---")
        rooms = session.exec(select(Room)).all()
        slots = session.exec(select(TimeSlot)).all()
        subjects = session.exec(select(Subject)).all()
        allocs = session.exec(select(CourseAllocation)).all()
        
        print(f"Rooms: {len(rooms)}")
        print(f"TimeSlots: {len(slots)}")
        print(f"Subjects: {len(subjects)}")
        print(f"Allocations: {len(allocs)}")
        
        if len(allocs) == 0:
            print("CRITICAL: No allocations found. Algorithm has nothing to schedule.")
            return

        print("\n--- Running Algorithm ---")
        try:
            ga = TimetableGeneticAlgorithm(session)
            print("Running generation...")
            # The class has a generate() method that does everything
            schedules = ga.generate()
            
            if schedules:
                print(f"Success! Generated {len(schedules)} slots.")
                for s in schedules[:3]:
                    print(f"- {s.course_name} at {s.start_time} (Day: {s.day_of_week})")
            else:
                print("Evolution finished but returned empty list.")
                
        except Exception as e:
            print(f"Algorithm Exception: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    debug_generation()
