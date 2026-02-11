from sqlmodel import Session, select, create_engine
from backend.models import User, Grade
import random

# Setup DB connection
sqlite_url = f"sqlite:///./database.db"
engine = create_engine(sqlite_url)

def add_passed_grades():
    print("--- Adding Passed Grades ---")
    try:
        with Session(engine) as session:
            # Get the test student
            # Assuming id=1 from previous steps, but let's be safe and search by email
            student = session.exec(select(User).where(User.email == "xjwrxg@college.edu")).first()
            if not student:
                # Fallback to id=1
                student = session.get(User, 1)
            
            if not student:
                 print("Student not found.")
                 return

            print(f"Adding passed grades to: {student.full_name}")
            
            # Create passed grades
            subjects = ["CS101", "ENG101", "HIST101"]
            for sub in subjects:
                grade = Grade(
                    student_id=student.id,
                    course_id=sub,
                    marks=random.randint(60, 95), # Pass marks
                    grade="A",
                    is_published=True
                )
                session.add(grade)
            
            session.commit()
            print("Successfully added passed grades.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_passed_grades()
