import requests
import sys
from sqlmodel import Session, select
from backend.database import engine
from backend.models import User

BASE_URL = "http://127.0.0.1:8001"

def get_user_id(email):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        if user:
            return user.id
    return None

def run_test():
    student_email = "student_h1@university.edu"
    teacher_email = "faculty@college.edu" # or whatever seed_csv created
    
    # Check if faculty exists, if not try another known one or just skip teacher check for ID
    # seed_csv creates "faculty@college.edu"
    
    student_id = get_user_id(student_email)
    teacher_id = get_user_id(teacher_email)
    
    print(f"Student ID: {student_id}")
    print(f"Teacher ID: {teacher_id}")
    
    if not student_id:
        print("Student H-1 not found! Run fix_missing_student.py")
        return

    # 1. Post a message as Student H-1 (Section H)
    print("1. Posting message as Student H-1...")
    msg_payload = {
        "section": "H",
        "sender_id": student_id,
        "content": "I have a doubt about Binary Search.",
        "timestamp": "2026-02-11T10:00:00Z",
        "is_anonymous": True
    }
    
    try:
        res = requests.post(f"{BASE_URL}/messages", json=msg_payload)
        print(f"Post Status: {res.status_code}")
        print(res.json())
    except Exception as e:
        print(f"Post Failed: {e}")

    # 2. Fetch messages as Teacher
    if teacher_id:
        print(f"\n2. Fetching as Teacher (ID {teacher_id})...")
        res = requests.get(f"{BASE_URL}/messages/H?user_id={teacher_id}")
        data = res.json()
        print(f"Found {len(data)} messages.")
        if len(data) > 0:
            print(f"First message sender (Teacher View): {data[0]['sender_name']}")

    # 3. Fetch as Student H-1
    print(f"\n3. Fetching as Student H-1 (ID {student_id})...")
    res = requests.get(f"{BASE_URL}/messages/H?user_id={student_id}")
    data = res.json()
    if len(data) > 0:
        print(f"First message sender (Student View): {data[0]['sender_name']}")

if __name__ == "__main__":
    run_test()
