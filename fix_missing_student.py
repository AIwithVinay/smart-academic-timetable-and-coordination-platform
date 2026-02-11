from sqlmodel import Session, select
from backend.database import engine
from backend.models import User
from backend.auth import get_password_hash

def fix():
    email = "student_h1@university.edu"
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        if user:
            print(f"User {email} already exists.")
            return

        print(f"Creating {email}...")
        new_user = User(
            full_name="Student H-1",
            email=email,
            hashed_password=get_password_hash("student123"),
            role="student",
            section="H",
            class_id="CS101"
        )
        session.add(new_user)
        session.commit()
        print("Done.")

if __name__ == "__main__":
    fix()
