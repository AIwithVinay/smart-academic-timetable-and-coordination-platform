from sqlmodel import Session, select
from backend.database import engine
from backend.models import User

def list_users():
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        for u in users:
            print(f"ID: {u.id} | Email: {u.email} | Role: {u.role} | Section: {u.section}")

if __name__ == "__main__":
    list_users()
