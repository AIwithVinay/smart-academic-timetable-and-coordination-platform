from sqlmodel import Session, select, create_engine
from backend.models import User
from backend.auth import get_password_hash

# Setup DB connection
sqlite_url = f"sqlite:///./database.db"
engine = create_engine(sqlite_url)

def check_create_faculty():
    print("--- Checking for Faculty Users ---")
    try:
        with Session(engine) as session:
            faculty = session.exec(select(User).where(User.role == "faculty")).all()
            if faculty:
                print(f"Found {len(faculty)} faculty members.")
                for f in faculty:
                    print(f"- {f.full_name} ({f.email})")
            else:
                print("No faculty found. Creating a test faculty member...")
                new_faculty = User(
                    full_name="Dr. Alan Turing",
                    email="alan@college.edu",
                    hashed_password=get_password_hash("password"),
                    role="faculty"
                )
                session.add(new_faculty)
                session.commit()
                print("Created test faculty: Dr. Alan Turing (alan@college.edu)")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_create_faculty()
