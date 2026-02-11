from sqlmodel import Session, select
from backend.database import engine
from backend.models import User
from backend.auth import get_password_hash

def create_test_student():
    with Session(engine) as session:
        email = "teststudent@example.com"
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            print(f"Creating student {email}...")
            user = User(
                full_name="Test Student", 
                email=email, 
                hashed_password=get_password_hash("student123"), 
                role="student",
                section="A"
            )
            session.add(user)
            session.commit()
            print("Student created.")
        else:
            print("Student already exists.")

if __name__ == "__main__":
    create_test_student()
