from sqlmodel import Session, select
from backend.database import engine
from backend.models import User

def check_user():
    email = "xjwrxg@college.edu"
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        if user:
            print(f"FOUND: {user.email} (ID: {user.id}, Section: {user.section})")
        else:
            print(f"NOT FOUND: {email}")
            
        # Check total count
        count = len(session.exec(select(User)).all())
        print(f"Total Users in DB: {count}")

if __name__ == "__main__":
    check_user()
