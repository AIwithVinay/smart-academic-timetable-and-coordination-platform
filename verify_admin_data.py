import requests
from sqlmodel import Session, select, create_engine
from backend.models import User, Subject
import os

# Setup DB connection
sqlite_url = f"sqlite:///./database.db"
engine = create_engine(sqlite_url)

def check_db():
    print("--- Database Check ---")
    try:
        with Session(engine) as session:
            students = session.exec(select(User).where(User.role == "student")).all()
            faculty = session.exec(select(User).where(User.role == "faculty")).all()
            subjects = session.exec(select(Subject)).all()
            
            print(f"DB Students: {len(students)}")
            print(f"DB Faculty: {len(faculty)}")
            print(f"DB Subjects: {len(subjects)}")
            
            return len(students), len(faculty), len(subjects)
    except Exception as e:
        print(f"DB Error: {e}")
        return 0, 0, 0

def check_api():
    print("\n--- API Check ---")
    try:
        response = requests.get("http://127.0.0.1:8001/admin/stats")
        if response.status_code == 200:
            print("API Response:", response.json())
        else:
            print(f"API Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"API Connection Error: {e}")

if __name__ == "__main__":
    db_s, db_f, db_sub = check_db()
    check_api()
