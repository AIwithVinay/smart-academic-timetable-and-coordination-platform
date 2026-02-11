from sqlmodel import Session, select, create_engine
from backend.models import User, Grade
import random

# Setup DB connection
sqlite_url = f"sqlite:///./database.db"
engine = create_engine(sqlite_url)

def create_failed_student():
    print("--- Creating Failed Student Data ---")
    try:
        with Session(engine) as session:
            # Get the first student
            student = session.exec(select(User).where(User.role == "student")).first()
            if not student:
                print("No students found in DB.")
                return

            print(f"Assigning failed grades to: {student.full_name} (ID: {student.id}, Email: {student.email})")
            
            # Create failed grades
            subjects = ["MATH101", "PHY101"]
            for sub in subjects:
                grade = Grade(
                    student_id=student.id,
                    course_id=sub,
                    marks=random.randint(10, 30), # Fail marks
                    grade="F",
                    is_published=True
                )
                session.add(grade)
            
            session.commit()
            print("Successfully assigned failed grades.")
            print(f"Login as: {student.email}")
            print("Password: password123 (assuming default)")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_failed_student()
