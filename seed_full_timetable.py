from sqlmodel import Session, select, SQLModel, delete
from backend.database import engine
from backend.models import Room, TimeSlot, Subject, CourseAllocation, User, Schedule
from backend.auth import get_password_hash

def seed_full_timetable():
    # Drop tables to force schema update
    try:
        Schedule.__table__.drop(engine)
        Subject.__table__.drop(engine) # Dropping Subject to add difficulty column
        TimeSlot.__table__.drop(engine) # Re-seeding slots
        CourseAllocation.__table__.drop(engine)
        print("Dropped tables for schema update.")
    except Exception as e:
        print(f"Could not drop tables (might not exist): {e}")

    # Ensure tables exist
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        print("--- SEEDING TIMETABLE DATA ---")

        # 2. Rooms
        if not session.exec(select(Room)).first():
            print("Seeding Rooms...")
            rooms = [
                Room(name="101", capacity=60),
                Room(name="102", capacity=60),
                Room(name="103", capacity=60),
                Room(name="Lab A", capacity=30),
                Room(name="Lab B", capacity=30)
            ]
            for r in rooms: session.add(r)
            session.commit()

        # 3. TimeSlots
        if not session.exec(select(TimeSlot)).first():
            print("Seeding TimeSlots...")
            days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            # 12:30 - 01:30 is LUNCH (No slot seeded)
            times = [
                ("09:30", "10:30"),
                ("10:30", "11:30"),
                ("11:30", "12:30"),
                # LUNCH GAP
                ("01:30", "02:30"),
                ("02:30", "03:30"),
                ("03:30", "04:30"),
                ("04:30", "05:30")
            ]
            for d in days:
                for s, e in times:
                    session.add(TimeSlot(day_of_week=d, start_time=s, end_time=e))
            session.commit()
            
        # 4. Subjects
        if not session.exec(select(Subject)).first():
            print("Seeding Subjects...")
            subjects = [
                Subject(name="Probability & Statistics", code="PS-217", credits=3, difficulty=3),
                Subject(name="Relational & Distributed Databases", code="RDD-204", credits=3, difficulty=3),
                Subject(name="Design & Analysis of Algorithms", code="DAA-302", credits=4, difficulty=3),
                Subject(name="Python Programming for AIML", code="PP-114", credits=3, difficulty=2),
                Subject(name="Applied Probability & Statistics", code="APS-305", credits=3, difficulty=3),
                Subject(name="Mentoring/House Visit", code="MENTORing", credits=1, difficulty=1),
                Subject(name="SKILL", code="SKILL", credits=1, difficulty=1),
                Subject(name="JR-PR", code="JR-PR", credits=2, difficulty=2)
            ]
            for s in subjects: session.add(s)
            session.commit()
            
        # 5. Teachers (Users)
        # Ensure we have some faculty
        teachers = session.exec(select(User).where(User.role == "faculty")).all()
        if len(teachers) < 3:
            print("Seeding Faculty...")
            new_teachers = [
                User(full_name="Dr. Smith", email="smith@example.com", hashed_password=get_password_hash("123"), role="faculty"),
                User(full_name="Prof. Johnson", email="johnson@example.com", hashed_password=get_password_hash("123"), role="faculty"),
                User(full_name="Dr. Williams", email="williams@example.com", hashed_password=get_password_hash("123"), role="faculty"),
            ]
            for t in new_teachers: 
                session.add(t)
            session.commit()
            teachers = session.exec(select(User).where(User.role == "faculty")).all()
        
        # 6. Allocations
        # This is CRITICAL for generation. We need to assign subjects to teachers for specific sections.
        # Let's clean existing allocations for clean testing? Maybe not.
        
        # 5. Course Allocations (Map to Teachers)
        # 5. Course Allocations (Map to Teachers)
        if not session.exec(select(CourseAllocation)).first():
            print("Seeding Course Allocations...")
            
            # Get IDs
            all_subjects = session.exec(select(Subject)).all()
            if not all_subjects:
                print("No subjects found!")
                return
                
            # Get Faculty Members
            faculty_list = session.exec(select(User).where(User.role == "faculty")).all()
            if len(faculty_list) < 3:
                 print("Not enough faculty seeded. Creating more...")
            
            # Map for consistent login credentials communication
            # We will reuse the same 3 emails we told the user about
            # Sec K Teacher: hoqptt@erp.edu (Index 0)
            # Sec A Teacher: gizciv@erp.edu (Index 1)
            # Sec B Teacher: fcqrmw@university.edu (Index 2)
            
            # RESET PASSWORDS for these teachers to '123'
            from backend.auth import get_password_hash
            default_pwd_hash = get_password_hash("123")
            
            used_faculty = []
            for idx in [0, 1, 2]:
                if idx < len(faculty_list):
                    user = faculty_list[idx]
                    user.hashed_password = default_pwd_hash
                    session.add(user)
                    used_faculty.append(user)
                    print(f"Reset password for {user.email} to '123'")
            session.commit()
            
            count = 0
            target_sections = ["K", "A", "B"] 
            
            # Distribute Subjects Round-Robin
            # This ensures one teacher doesn't teach EVERYTHING
            for sec in target_sections:
                print(f"Allocating subjects for Section {sec}...")
                for idx, sub in enumerate(all_subjects):
                    # Rotate between the 3 teachers
                    teacher = used_faculty[idx % len(used_faculty)]
                    
                    # Allocate based on CREDITS (Density Fix)
                    for _ in range(sub.credits):
                        session.add(CourseAllocation(
                            subject_id=sub.id,
                            teacher_id=teacher.id,
                            section_id=sec
                        ))
                        count += 1
            
            session.commit()
            print(f"Allocations seeded: {count} slots created.")
            print(f"!!! LOGIN DETAILS (All passwords '123') !!!")
            # Now "Subject Teachers" - Anyone can teach anything, but let's give the user one to check
            print(f"Teacher 1 (Math/CS/etc): {used_faculty[0].email}")
            print(f"Teacher 2 (Physics/etc): {used_faculty[1].email}")
            print(f"Teacher 3 (Eng/etc):     {used_faculty[2].email}")
            
        print("--- SEEDING COMPLETE ---")

if __name__ == "__main__":
    seed_full_timetable()
