from sqlmodel import Session, select, create_engine
from backend.models import User
from passlib.context import CryptContext

# Setup DB connection
sqlite_url = f"sqlite:///./database.db"
engine = create_engine(sqlite_url)

# Setup Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def reset_password(email, new_password):
    print(f"--- Resetting Password for {email} ---")
    try:
        with Session(engine) as session:
            user = session.exec(select(User).where(User.email == email)).first()
            if not user:
                print("User not found.")
                return

            print(f"User Found: {user.full_name}")
            user.hashed_password = get_password_hash(new_password)
            session.add(user)
            session.commit()
            session.refresh(user)
            
            print(f"Password successfully changed to: {new_password}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # The email from the previous step
    reset_password("xjwrxg@college.edu", "password123")
