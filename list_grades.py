from sqlmodel import Session, select, create_engine
from backend.models import User, Grade

# Setup DB connection
sqlite_url = f"sqlite:///./database.db"
engine = create_engine(sqlite_url)

def list_grades():
    print("--- Listing Grades for Test User ---")
    try:
        with Session(engine) as session:
            student = session.exec(select(User).where(User.email == "xjwrxg@college.edu")).first()
            if not student:
                 print("Student not found.")
                 return

            grades = session.exec(select(Grade).where(Grade.student_id == student.id)).all()
            print(f"Grades for {student.full_name}:")
            for g in grades:
                print(f"Subject: {g.course_id} | Marks: {g.marks} | Grade: {g.grade}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_grades()
