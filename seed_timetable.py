from sqlmodel import Session, select, SQLModel
from backend.database import engine
from backend.models import Room, TimeSlot, Subject, CourseAllocation, User
from backend.main import app # Triggers main to load models?

def seed_timetable():
    # Create tables
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        # 1. Rooms
        if not session.exec(select(Room)).first():
            print("Seeding Rooms...")
            session.add(Room(name="101", capacity=60))
            session.add(Room(name="102", capacity=60))
            session.add(Room(name="Lab A", capacity=30))
            session.commit()
            
        # 2. TimeSlots
        if not session.exec(select(TimeSlot)).first():
            print("Seeding TimeSlots...")
            days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
            times = [
                ("09:00", "10:00"),
                ("10:00", "11:00"),
                ("11:00", "12:00"),
                ("13:00", "14:00"),
                ("14:00", "15:00")
            ]
            for d in days:
                for s, e in times:
                    session.add(TimeSlot(day_of_week=d, start_time=s, end_time=e))
            session.commit()
            
        # 3. Subjects
        if not session.exec(select(Subject)).first():
            print("Seeding Subjects...")
            session.add(Subject(name="Mathematics", code="MATH101", credits=3))
            session.add(Subject(name="Physics", code="PHY101", credits=3))
            session.add(Subject(name="Computer Science", code="CS101", credits=4))
            session.commit()
            
        print("Timetable data seeded!")

if __name__ == "__main__":
    seed_timetable()
