from sqlmodel import Session, select, create_engine
from backend.models import User, Grade
import os

# Setup DB connection
sqlite_url = f"sqlite:///./database.db"
engine = create_engine(sqlite_url)

def find_failed_students():
    print("--- Searching for Failed Students ---")
    try:
        with Session(engine) as session:
            # Find grades < 33
            failed_grades = session.exec(select(Grade).where(Grade.marks < 33)).all()
            
            if not failed_grades:
                print("No failed students found.")
                return

            print(f"Found {len(failed_grades)} failed grades.")
            
            unique_students = {}
            for grade in failed_grades:
                if grade.student_id not in unique_students:
                    student = session.get(User, grade.student_id)
                    unique_students[grade.student_id] = {
                        "name": student.full_name if student else "Unknown",
                        "email": student.email if student else "Unknown",
                        "subjects": []
                    }
                unique_students[grade.student_id]["subjects"].append(f"{grade.course_id} ({grade.marks})")

            print("\nList of Failed Students:")
            for uid, data in unique_students.items():
                print(f"ID: {uid} | Name: {data['name']} | Email: {data['email']}")
                print(f"  Failed Subjects: {', '.join(data['subjects'])}")
                print("-" * 30)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_failed_students()
