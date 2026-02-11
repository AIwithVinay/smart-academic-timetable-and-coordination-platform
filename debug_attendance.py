from sqlmodel import Session, select
from backend.database import engine
from backend.models import User, Attendance

def debug_check():
    with Session(engine) as session:
        # 1. Check distinct sections
        sections = session.exec(select(User.section).distinct()).all()
        print(f"Available sections: {sections}")

        # 2. Check students in Section G specifically
        target_section = 'G'
        students_g = session.exec(select(User).where(User.section == target_section)).all()
        print(f"Total users in Section {target_section}: {len(students_g)}")
        
        # 3. Check their roles
        students_role_g = [s for s in students_g if s.role == 'student']
        print(f"Users with role 'student' in Section {target_section}: {len(students_role_g)}")
        
        if len(students_role_g) > 0:
            print(f"Sample student: {students_role_g[0]}")
            print(f"Section type: {type(students_role_g[0].section)}")

        # 4. Check if there are any trailing spaces in sections
        raw_sections = session.exec(select(User.section)).all()
        suspicious = [s for s in raw_sections if s and len(s) != len(s.strip())]
        if suspicious:
            print(f"WARNING: Found sections with whitespace: {suspicious[:5]}")

if __name__ == "__main__":
    debug_check()
