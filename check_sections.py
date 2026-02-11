from sqlmodel import Session, select, create_engine
from backend.models import User

sqlite_url = f"sqlite:///./database.db"
engine = create_engine(sqlite_url)

def check_student_section():
    print("--- Checking Student Sections ---")
    with Session(engine) as session:
        # Check specific user "Student One" or similar
        students = session.exec(select(User).where(User.role == "student")).all()
        for s in students:
            print(f"ID: {s.id} | Name: {s.full_name} | Email: {s.email} | Section: '{s.section}'")

if __name__ == "__main__":
    check_student_section()
