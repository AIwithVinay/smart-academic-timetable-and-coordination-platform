from sqlmodel import Session, select
from backend.database import engine
from backend.models import User

def check():
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == "student_h1@university.edu")).first()
        if user:
            print(f"FOUND: {user.email} Section: {user.section}")
        else:
            print("NOT FOUND: student_h1")

if __name__ == "__main__":
    check()
