from sqlmodel import Session, select
from backend.database import engine, create_db_and_tables
from backend.models import User
from backend.auth import get_password_hash
import random

def seed_extra_sections():
    create_db_and_tables()
    
    sections = ['H', 'I', 'J', 'K']
    
    with Session(engine) as session:
        count = 0
        for section in sections:
            print(f"Seeding Section {section}...")
            for i in range(1, 6): # 5 students per section
                email = f"student_{section.lower()}{i}@university.edu"
                
                # Check if exists
                statement = select(User).where(User.email == email)
                existing = session.exec(statement).first()
                
                if not existing:
                    user = User(
                        full_name=f"Student {section}-{i}",
                        email=email,
                        hashed_password=get_password_hash("student123"),
                        role="student",
                        section=section,
                        class_id="CS101"
                    )
                    session.add(user)
                    count += 1
        
        session.commit()
        print(f"Successfully added {count} new students for sections H-K.")

if __name__ == "__main__":
    seed_extra_sections()
