import os
import openpyxl
from sqlmodel import Session, select
from backend.database import engine, create_db_and_tables
from backend.models import User
from backend.auth import hash_password

def seed_users():
    create_db_and_tables()
    
    excel_file = r"C:\Users\vinay\Downloads\users.xlsx"
    # excel_file = "backend/users.xlsx" # Fallback or original location
    users_to_add = []

    if os.path.exists(excel_file):
        print(f"Found {excel_file}, importing users...")
        try:
            workbook = openpyxl.load_workbook(excel_file)
            sheet = workbook.active
            
            # Assuming headers are in row 1: Full Name, Email, Password, Role
            for row in sheet.iter_rows(min_row=2, values_only=True):
                if not row or not row[1]: # Skip empty rows or rows without email
                    continue
                
                full_name = row[0]
                email = row[1]
                password = str(row[2]) # Ensure password is string
                role = row[3].lower() if row[3] else "student"
                
                users_to_add.append(
                    User(
                        full_name=full_name, 
                        email=email, 
                        hashed_password=hash_password(password), 
                        role=role
                    )
                )
            print(f"Loaded {len(users_to_add)} users from Excel.")
        except Exception as e:
            print(f"Error reading Excel file: {e}")
            return
    else:
        print(f"No {excel_file} found. Using default test users.")
        users_to_add = [
            User(full_name="Admin User", email="admin@example.com", hashed_password=hash_password("admin123"), role="admin"),
            User(full_name="Faculty User", email="faculty@example.com", hashed_password=hash_password("faculty123"), role="faculty"),
            User(full_name="Student User", email="student@example.com", hashed_password=hash_password("student123"), role="student")
        ]

    with Session(engine) as session:
        # Check specific users to avoid duplicates or clear format
        # For this script, we'll check if email exists
        for user in users_to_add:
            existing = session.exec(select(User).where(User.email == user.email)).first()
            if not existing:
                session.add(user)
                print(f"Added user: {user.email}")
            else:
                print(f"User already exists: {user.email}")
        
        session.commit()
    print("Database seeding completed!")

if __name__ == "__main__":
    seed_users()
