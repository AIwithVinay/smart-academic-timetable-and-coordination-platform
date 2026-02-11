
import pandas as pd
from backend.database import engine, create_db_and_tables
from backend.models import User
from backend.auth import get_password_hash
from sqlmodel import Session, select

def seed_users():
    csv_path = r"C:\Users\vinay\Downloads\erp_users_with_sections.csv"
    print(f"Reading from {csv_path}...")
    
    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return

    create_db_and_tables()
    
    with Session(engine) as session:
        count = 0
        updated = 0
        for index, row in df.iterrows():
            email = row.get('Email')
            if not email:
                continue

            # Standardize keys from CSV if necessary (e.g. 'Full Name' vs 'name')
            full_name = row.get('Full Name') or row.get('Name') or 'Unknown'
            password = str(row.get('Password') or 'student123')
            role = str(row.get('Role') or 'student').lower()
            section = str(row.get('Section') or 'A')
            class_id = str(row.get('ClassID') or '')

            statement = select(User).where(User.email == email)
            existing_user = session.exec(statement).first()

            if existing_user:
                existing_user.section = section
                existing_user.class_id = class_id
                session.add(existing_user)
                updated += 1
            else:
                user = User(
                    full_name=full_name,
                    email=email,
                    hashed_password=get_password_hash(password),
                    role=role,
                    section=section,
                    class_id=class_id
                )
                session.add(user)
                count += 1
        
        session.commit()
        print(f"Done! Added {count} new users, Updated {updated} existing users.")

if __name__ == "__main__":
    seed_users()
