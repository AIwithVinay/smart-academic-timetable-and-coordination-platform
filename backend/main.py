import uvicorn
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Body
from sqlmodel import SQLModel, Session, select, Field
from backend.database import engine, get_session, create_db_and_tables
from backend.models import User, LoginRequest, Attendance, Grade, Schedule, Assignment, Submission, Message, Room, TimeSlot, Subject, CourseAllocation, Complaint
from backend.timetable_algorithm import TimetableGeneticAlgorithm
from backend.auth import verify_password
from typing import List, Optional
from fastapi.staticfiles import StaticFiles
import os
import shutil
import uuid
from datetime import datetime

app = FastAPI()

print("------- BACKEND_MAIN_LOADED -------")

@app.get("/test")
def test_route():
    return {"message": "Test route working"}

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origin_regex='https?://(localhost|127\.0\.0\.1)(:\d+)?',
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    print("------- REGISTERED ROUTES -------")
    for route in app.routes:
        print(f"Route: {route.path} [{route.name}]")
    print("---------------------------------")

@app.post("/login")
def login(login_data: LoginRequest, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == login_data.email)
    user = session.exec(statement).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid Email or Password")
    return {"message": "Login successful", "role": user.role, "section": user.section, "full_name": user.full_name, "id": user.id}

from fastapi import UploadFile, File
import pandas as pd
import io
from backend.auth import get_password_hash

# ... existing imports ...

@app.post("/upload-students")
async def upload_students(file: UploadFile = File(...), session: Session = Depends(get_session)):
    contents = await file.read()
    
    if file.filename.endswith('.csv'):
        df = pd.read_csv(io.BytesIO(contents))
    else:
        df = pd.read_excel(io.BytesIO(contents))
    
    # Expected columns: Full Name, Email, Password, Section, Role (optional, default student)
    
    count = 0
    for _, row in df.iterrows():
        email = row.get('Email')
        if not email:
            continue
            
        # Check if user exists
        statement = select(User).where(User.email == email)
        existing_user = session.exec(statement).first()
        
        if existing_user:
            # Update existing user's section if provided
            if 'Section' in row:
                existing_user.section = str(row.get('Section'))
            if 'ClassID' in row:
                existing_user.class_id = str(row.get('ClassID'))
            session.add(existing_user)
            continue 
            
        user = User(
            full_name=row.get('Full Name', 'Unknown'),
            email=email,
            hashed_password=get_password_hash(str(row.get('Password', 'student123'))),
            role=row.get('Role', 'student').lower(),
            section=str(row.get('Section', 'A')), # Default to A
            class_id=str(row.get('ClassID', ''))
        )
        session.add(user)
        count += 1
        
    session.commit()
    return {"message": f"Successfully processed {count} new students (and updated existing ones)"}

@app.post("/grades/upload/{course_id}")
async def upload_grades(course_id: str, file: UploadFile = File(...), session: Session = Depends(get_session)):
    import csv
    import io
    import chardet
    import traceback
    
    print(f"--- Uploading Grade CSV for Course: {course_id} ---")
    
    try:
        content = await file.read()
        print(f"Received file content length: {len(content)} bytes")
        
        # Detect encoding
        result = chardet.detect(content)
        encoding = result['encoding'] or 'utf-8'
        print(f"Detected encoding: {encoding}")
        
        try:
            # Decode logs to string
            text_content = content.decode(encoding)
        except UnicodeDecodeError:
            print("UnicodeDecodeError with detected encoding, trying utf-8 ignore")
            text_content = content.decode('utf-8', errors='ignore')

        stream = io.StringIO(text_content)
        reader = csv.DictReader(stream)
        
        # Normalize headers
        if reader.fieldnames:
            original_headers = list(reader.fieldnames)
            reader.fieldnames = [name.strip().replace('\ufeff', '') for name in reader.fieldnames]
            print(f"Headers: {reader.fieldnames} (Original: {original_headers})")

        count = 0
        updated = 0
        errors = []
        
        for row in reader:
            # Flexible key matching
            email = row.get("Email") or row.get("email")
            marks = row.get("Marks") or row.get("marks")
            grade_letter = row.get("Grade") or row.get("grade")
            comments = row.get("Comments") or row.get("comments")
            
            # Debug log first few rows
            if count + updated < 3:
                print(f"Processing Row: Email={email}, Marks={marks}")

            if not email:
                continue
                
            if not marks:
                continue
                
            # Find student
            user_statement = select(User).where(User.email == email.strip())
            student = session.exec(user_statement).first()
            
            if not student:
                print(f"Student NOT FOUND for email: {email}")
                errors.append(f"Student not found: {email}")
                continue
                
            # Update/Create Grade
            grade_statement = select(Grade).where(
                Grade.student_id == student.id,
                Grade.course_id == course_id
            )
            existing_grade = session.exec(grade_statement).first()
            
            try:
                marks_float = float(marks)
            except ValueError:
                print(f"Invalid marks for {email}: {marks}")
                errors.append(f"Invalid marks for {email}: {marks}")
                continue

            if existing_grade:
                existing_grade.marks = int(marks_float)
                if grade_letter: existing_grade.grade = grade_letter
                if comments: existing_grade.comments = comments
                session.add(existing_grade)
                updated += 1
            else:
                new_grade = Grade(
                    student_id=student.id,
                    course_id=course_id,
                    marks=int(marks_float),
                    total_marks=100,
                    grade=grade_letter if grade_letter else "F", 
                    comments=comments,
                    is_published=False
                )
                session.add(new_grade)
                count += 1
                
        session.commit()
        
        message = f"Processed {count + updated} grades ({count} new, {updated} updated)."
        print(f"Success: {message}")
        
        if errors:
            message += f" {len(errors)} errors occurred."
            # Append first 3 errors to message for visibility
            message += "\nFirst few errors:\n" + "\n".join(errors[:3])
            print("Upload Errors:", errors)
            
        return {"message": message, "details": errors}
        
    except Exception as e:
        print(f"CRITICAL ERROR in upload_grades: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")

@app.post("/attendance")
def mark_attendance(attendance_data: List[Attendance], session: Session = Depends(get_session)):
    for record in attendance_data:
        # Check if record exists for this student, course, and date
        statement = select(Attendance).where(
            Attendance.student_id == record.student_id,
            Attendance.course_id == record.course_id,
            Attendance.date == record.date
        )
        existing = session.exec(statement).first()
        
        if existing:
            existing.status = record.status
            session.add(existing)
        else:
            session.add(record)
            
    session.commit()
    return {"message": "Attendance marked successfully"}

# --- Assignments Endpoints ---

@app.post("/assignments")
def create_assignment(assignment: Assignment, session: Session = Depends(get_session)):
    session.add(assignment)
    session.commit()
    session.refresh(assignment)
    return assignment

@app.get("/assignments/{course_id}")
def get_assignments(course_id: str, section: str = None, session: Session = Depends(get_session)):
    query = select(Assignment).where(Assignment.course_id == course_id)
    if section and section != "All":
        # If a section is specified, return assignments for that section OR "All"
        # Logic: Assignment.target_section IN [section, "All"]
        query = query.where(Assignment.target_section.in_([section, "All"]))
    
    results = session.exec(query).all()
    return results

@app.post("/submissions")
def submit_assignment(submission: Submission, session: Session = Depends(get_session)):
    # Check if already submitted? For now allow multiple, or update existing?
    # Simple logic: Allow re-submission by checking if one exists for student+assignment
    statement = select(Submission).where(
        Submission.assignment_id == submission.assignment_id,
        Submission.student_id == submission.student_id
    )
    existing = session.exec(statement).first()
    
    if existing:
        existing.content = submission.content
        existing.submission_date = submission.submission_date
        session.add(existing)
    else:
        session.add(submission)
        
    session.commit()
    return {"message": "Assignment submitted successfully"}

@app.get("/submissions/{assignment_id}")
def get_submissions(assignment_id: int, session: Session = Depends(get_session)):
    # Return submissions with student details (need join or simple fetch)
    # Simple fetch for now, frontend can map student names if needed, or we explicitly join
    # Let's return a joined structure for convenience
    statement = select(Submission, User).where(
        Submission.assignment_id == assignment_id,
        Submission.student_id == User.id
    )
    results = session.exec(statement).all()
    
    # Format: [{submission: ..., student_name: ...}]
    data = []
    for sub, user in results:
        data.append({
            "id": sub.id,
            "assignment_id": sub.assignment_id,
            "student_id": sub.student_id,
            "student_name": user.full_name,
            "content": sub.content,
            "submission_date": sub.submission_date,
            "grade": sub.grade,
            "feedback": sub.feedback
        })
    return data

@app.put("/submissions/{submission_id}/grade")
def grade_submission(submission_id: int, grade: int, feedback: str = None, session: Session = Depends(get_session)):
    submission = session.get(Submission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    submission.grade = grade
    submission.feedback = feedback
    session.add(submission)
    session.commit()
    return {"message": "Submission graded"}

@app.get("/student/assignments/{student_id}")
def get_student_assignments(student_id: int, session: Session = Depends(get_session)):
    # 1. Get student's courses (from Grade or Attendance? Or Section?)
    #    User has 'section'. We can infer courses from section if we had that mapping.
    #    For now, assume we fetch ALL assignments for the student's section? 
    #    OR easier: Frontend sends course_ids. 
    #    BETTER: Fetch user, get section, get all assignments for courses in that section?
    #    Since we don't have Section->Course mapping table, we'll rely on the frontend passing the course_id view,
    #    OR we just return ALL assignments for now and filter in frontend?
    #    Let's stick to /assignments/{course_id} which we already added.
    #    But student might want to see "My Assignments" across all courses.
    #    Let's add a "pending assignments" logical endpoint? 
    #    Actually, User -> Section. But Assignment -> Course. Missing link: Which courses are in a Section?
    #    We haven't modeled that.
    #    Workaround: Student Dashboard knows their courses (hardcoded or from attendance/grades).
    #    So Student will call /assignments/{course_id} for each course they are enrolled in.
    pass

# --- Messages / Chat Endpoints ---

# Mount static directory for uploads
os.makedirs("backend/uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="backend/uploads"), name="uploads")

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    file_ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_ext}"
    path = f"backend/uploads/{filename}"
    
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"http://127.0.0.1:8001/uploads/{filename}"}

@app.post("/messages")
def send_message(message: Message, session: Session = Depends(get_session)):
    session.add(message)
    session.commit()
    return {"message": "Message sent"}

@app.get("/messages/{section}")
def get_messages(section: str, user_id: int, session: Session = Depends(get_session)):
    # Verify user exists to determine role
    viewer = session.get(User, user_id)
    if not viewer:
        return []
        
    statement = select(Message, User).where(
        Message.section == section,
        Message.sender_id == User.id
    ).order_by(Message.timestamp)
    
    results = session.exec(statement).all()
    
    chat_data = []
    for msg, sender in results:
        # Determine Display Name based on privacy rules
        display_name = sender.full_name
        is_me = (msg.sender_id == user_id)
        
        if viewer.role == "student":
            if is_me:
                display_name = "You"
            elif sender.role == "teacher":
                display_name = sender.full_name # Teachers are always visible
            elif msg.is_anonymous:
                display_name = "Anonymous Student"
            else:
                display_name = sender.full_name # If they chose not to be anonymous (future proof)
                
        chat_data.append({
            "id": msg.id,
            "content": msg.content,
            "image_url": msg.image_url,
            "timestamp": msg.timestamp,
            "sender_name": display_name,
            "is_me": is_me,
            "role": sender.role
        })
        
    return chat_data

@app.get("/attendance/{course_id}/{date}/{section}")
def get_attendance(course_id: str, date: str, section: str, session: Session = Depends(get_session)):
    # Get all students in this section/class first
    student_stmt = select(User).where(User.section == section) # Add class_id filter later if needed
    students = session.exec(student_stmt).all()
    
    attendance_map = {}
    att_stmt = select(Attendance).where(
        Attendance.course_id == course_id,
        Attendance.date == date,
        Attendance.section == section
    )
    records = session.exec(att_stmt).all()
    for r in records:
        attendance_map[r.student_id] = r.status
        
    result = []
    for student in students:
        if student.role == 'student':
            result.append({
                "student_id": student.id,
                "name": student.full_name,
                "status": attendance_map.get(student.id, "Pending") # Default to Pending
            })
            
    return result

@app.get("/student/attendance/{student_id}")
def get_student_attendance(student_id: int, session: Session = Depends(get_session)):
    statement = select(Attendance).where(Attendance.student_id == student_id)
    records = session.exec(statement).all()
    # Enriched data could be better (fetching course names), but for now this works.
    return records

@app.post("/grades")
def submit_grades(grades: List[Grade], session: Session = Depends(get_session)):
    for grade in grades:
        statement = select(Grade).where(
            Grade.student_id == grade.student_id,
            Grade.course_id == grade.course_id
        )
        existing = session.exec(statement).first()
        
        if existing:
            existing.marks = grade.marks
            existing.total_marks = grade.total_marks
            existing.grade = grade.grade
            existing.comments = grade.comments
            existing.is_published = grade.is_published
            session.add(existing)
        else:
            session.add(grade)
            
    session.commit()
    return {"message": "Grades submitted successfully"}

@app.get("/grades/{course_id}")
def get_grades_by_course(course_id: str, session: Session = Depends(get_session)):
    statement = select(Grade).where(Grade.course_id == course_id)
    grades = session.exec(statement).all()
    return grades

@app.get("/student/grades/{student_id}")
def get_student_grades(student_id: int, session: Session = Depends(get_session)):
    # Only show published grades to students
    statement = select(Grade).where(
        Grade.student_id == student_id,
        Grade.is_published == True
    )
    grades = session.exec(statement).all()
    return grades

@app.get("/schedule")
def get_schedule(
    section: Optional[str] = None, 
    faculty_id: Optional[int] = None, 
    published_only: bool = True, # Default to showing only published
    session: Session = Depends(get_session)
):
    statement = select(Schedule)
    
    if section:
        statement = statement.where(Schedule.section == section)
        
    if faculty_id:
        statement = statement.where(Schedule.faculty_id == faculty_id)
        
    if published_only:
        statement = statement.where(Schedule.is_published == True)
        
    schedule = session.exec(statement).all()
    # Sort by Day and Start Time usually happening in frontend, but we can do it here too
    return schedule

class PublishRequest(SQLModel):
    section: Optional[str] = None

@app.post("/publish-timetable")
def publish_timetable(req: PublishRequest, session: Session = Depends(get_session)):
    statement = select(Schedule)
    if req.section:
        statement = statement.where(Schedule.section == req.section)
        
    schedules = session.exec(statement).all()
    for s in schedules:
        s.is_published = True
        session.add(s)
    
    session.commit()
    return {"status": "success", "message": f"Published {len(schedules)} slots."}

# --- Timetable Setup Endpoints ---

@app.post("/rooms")
def create_room(room: Room, session: Session = Depends(get_session)):
    session.add(room)
    session.commit()
    session.refresh(room)
    return room

@app.get("/rooms")
def get_rooms(session: Session = Depends(get_session)):
    return session.exec(select(Room)).all()

@app.post("/subjects")
def create_subject(subject: Subject, session: Session = Depends(get_session)):
    session.add(subject)
    session.commit()
    session.refresh(subject)
    return subject

@app.get("/subjects")
def get_subjects(session: Session = Depends(get_session)):
    return session.exec(select(Subject)).all()

@app.delete("/subjects/{subject_id}")
def delete_subject(subject_id: int, session: Session = Depends(get_session)):
    subject = session.get(Subject, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    session.delete(subject)
    session.commit()
    return {"message": "Subject deleted"}

@app.post("/timeslots")
def create_timeslot(timeslot: TimeSlot, session: Session = Depends(get_session)):
    session.add(timeslot)
    session.commit()
    session.refresh(timeslot)
    return timeslot

@app.get("/timeslots")
def get_timeslots(session: Session = Depends(get_session)):
    return session.exec(select(TimeSlot)).all()

@app.post("/allocations")
def create_allocation(allocation: CourseAllocation, session: Session = Depends(get_session)):
    session.add(allocation)
    session.commit()
    session.refresh(allocation)
    return allocation

@app.get("/allocations")
def get_allocations(session: Session = Depends(get_session)):
    return session.exec(select(CourseAllocation)).all()

@app.post("/generate-timetable")
def generate_timetable(session: Session = Depends(get_session)):
    """
    Generate timetable using Genetic Algorithm for optimization.
    """
    # clear existing?
    session.exec(Schedule.__table__.delete())
    session.commit()

    try:
        optimizer = TimetableGeneticAlgorithm(session, population_size=100, generations=200)
        optimized_schedule = optimizer.generate()
        
        for sched in optimized_schedule:
            session.add(sched)
        session.commit()
        
        return {
            "message": f"Optimization Complete. Generated {len(optimized_schedule)} slots.",
            "mode": "Genetic Algorithm"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Optimization failed")

# ... existing code ...

class UserProfileUpdate(SQLModel):
    parent_phone: Optional[str] = None
    full_name: Optional[str] = None

@app.put("/student/profile")
def update_student_profile(profile: UserProfileUpdate, user_id: int, session: Session = Depends(get_session)):
    # In real app, get user_id from token. Here trusting params/context
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if profile.parent_phone:
        user.parent_phone = profile.parent_phone
    if profile.full_name:
        user.full_name = profile.full_name
        
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

# --- Complaints Endpoints ---

@app.post("/complaints")
def create_complaint(complaint: Complaint, session: Session = Depends(get_session)):
    # Validation
    if complaint.target_type == "Faculty" and not complaint.target_fac_id:
        raise HTTPException(status_code=400, detail="Target Faculty ID is required for Faculty complaints.")
        
    session.add(complaint)
    session.commit()
    session.refresh(complaint)
    return complaint

@app.get("/complaints/my/{student_id}")
def get_student_complaints(student_id: int, session: Session = Depends(get_session)):
    return session.exec(select(Complaint).where(Complaint.student_id == student_id).order_by(Complaint.created_at.desc())).all()

@app.get("/admin/complaints")
def get_admin_complaints(session: Session = Depends(get_session)):
    # Fetch all complaints for Admin to oversee, or just those targeting Admin
    # Let's return all for now, maybe filter in frontend or add query param
    return session.exec(select(Complaint).order_by(Complaint.created_at.desc())).all()

@app.get("/faculty/complaints/{faculty_id}")
def get_faculty_complaints(faculty_id: int, session: Session = Depends(get_session)):
    return session.exec(select(Complaint).where(Complaint.target_type == "Faculty", Complaint.target_fac_id == faculty_id).order_by(Complaint.created_at.desc())).all()

@app.put("/complaints/{id}/resolve")
def resolve_complaint(id: int, status: str = Body(embed=True), session: Session = Depends(get_session)):
    complaint = session.get(Complaint, id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    complaint.status = status
    session.add(complaint)
    session.commit()
    return {"message": "Complaint updated", "status": status}

    if profile.parent_phone:
        user.parent_phone = profile.parent_phone
    if profile.full_name:
        user.full_name = profile.full_name
        
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"message": "Profile updated", "user": user}

@app.post("/notify/parents-report")
def notify_parents_report(session: Session = Depends(get_session)):
    """
    Checks for failed subjects and sends report card to parents.
    """
    # 1. Find all students
    students = session.exec(select(User).where(User.role == "student")).all()
    
    report_log = []
    
    for student in students:
        if not student.parent_phone:
            continue
            
        # Get Grades
        grades = session.exec(select(Grade).where(Grade.student_id == student.id)).all()
        if not grades:
            continue
            
        # Check for failures
        failed_subjects = [g for g in grades if g.grade == 'F' or g.marks < 40]
        
        if failed_subjects:
            # Construct Message
            subject_names = [g.course_id for g in failed_subjects]
            
            # Generate Report Card Summary
            report_card = "\n".join([f"{g.course_id}: {g.marks}/100 ({g.grade})" for g in grades])
            
            message = (
                f"ALERT: Your ward {student.full_name} has failed in: {', '.join(subject_names)}. "
                f"Full Report:\n{report_card}\n"
                f"Please contact administration."
            )
            
            # Mock Send Logic
            print(f"--- SMS SENT TO {student.parent_phone} ---")
            print(message)
            print("----------------------------------------")
            
            report_log.append({
                "student": student.full_name,
                "parent_phone": student.parent_phone,
                "status": "Sent",
                "failures": len(failed_subjects)
            })
            
    return {"message": "Notification process completed", "log": report_log}

@app.get("/users")
def get_users(role: Optional[str] = None, session: Session = Depends(get_session)):
    statement = select(User)
    if role:
        statement = statement.where(User.role == role)
    return session.exec(statement).all()

@app.put("/admin/users/{user_id}")
def admin_update_user(user_id: int, profile: UserProfileUpdate, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if profile.parent_phone is not None:
        user.parent_phone = profile.parent_phone
    if profile.full_name is not None:
        user.full_name = profile.full_name
        
    session.add(user)
    session.commit()
    session.refresh(user)
    return user



@app.get("/student/stats/{user_id}")
def get_student_stats(user_id: int, session: Session = Depends(get_session)):
    # 1. Attendance
    att_stmt = select(Attendance).where(Attendance.student_id == user_id)
    att_records = session.exec(att_stmt).all()
    total_classes = len(att_records)
    present_classes = len([r for r in att_records if r.status == 'Present'])
    attendance_pct = int((present_classes / total_classes * 100)) if total_classes > 0 else 0
    
    # 2. Grades / GPA
    # Assuming GPA on 4.0 scale roughly based on marks? Or just return Avg Marks.
    # Let's return Avg Grade for now.
    grade_stmt = select(Grade).where(Grade.student_id == user_id, Grade.is_published == True)
    grades = session.exec(grade_stmt).all()
    
    total_marks = 0
    count_grades = len(grades)
    # GPA calc (approx): >90=4.0, >80=3.0 etc.
    # Or just returning average marks for display if GPA is hard.
    # Let's do a simple calculation: (Marks/100) * 4
    gpa_sum = 0
    for g in grades:
        gpa_sum += (g.marks / 100) * 4.0
    
    gpa = round(gpa_sum / count_grades, 2) if count_grades > 0 else 0.0
    
    # 3. Active Courses & Credits
    # Join Subject to get credits. 
    # Valid courses are those where student has attendance OR grades OR is enrolled (User.class_id/section).
    # Since we don't have explicit enrollment table, we'll infer from Grades/Attendance or Section.
    # Logic: Get all subjects for student's section? "K", "A", "B".
    # We don't have Section->Subject mapping easily in DB (it's in CourseAllocation but that's Teacher->Subject->Section).
    # So: Find Allocations where section == user.section.
    
    user = session.get(User, user_id)
    active_courses_count = 0
    total_credits = 0
    
    if user and user.section:
        # Find subjects allocated to this section
        alloc_stmt = select(CourseAllocation).where(CourseAllocation.section_id == user.section)
        allocs = session.exec(alloc_stmt).all()
        # Unique subjects
        subject_ids = list(set([a.subject_id for a in allocs]))
        active_courses_count = len(subject_ids)
        
        # Sum credits
        if subject_ids:
            sub_stmt = select(Subject).where(Subject.id.in_(subject_ids))
            subjects = session.exec(sub_stmt).all()
            total_credits = sum([s.credits for s in subjects])
            
    return {
        "gpa": gpa,
        "attendance": f"{attendance_pct}%",
        "active_courses": active_courses_count,
        "credits": total_credits
    }

@app.get("/admin/stats")
def get_admin_stats(session: Session = Depends(get_session)):
    total_students = len(session.exec(select(User).where(User.role == "student")).all())
    total_faculty = len(session.exec(select(User).where(User.role == "faculty")).all())
    total_subjects = len(session.exec(select(Subject)).all())
    
    return {
        "students": total_students,
        "faculty": total_faculty,
        "subjects": total_subjects
    }

    return {
        "students": total_students,
        "faculty": total_faculty,
        "subjects": total_subjects
    }

# --- Wallet & EOD Endpoints ---

@app.get("/wallet/{user_id}")
def get_wallet(user_id: int, session: Session = Depends(get_session)):
    wallet = session.exec(select(Wallet).where(Wallet.user_id == user_id)).first()
    if not wallet:
        # Create wallet if not exists
        wallet = Wallet(user_id=user_id, balance=0.0)
        session.add(wallet)
        session.commit()
        session.refresh(wallet)
    
    transactions = session.exec(select(Transaction).where(Transaction.wallet_id == wallet.id).order_by(Transaction.timestamp.desc())).all()
    return {"balance": wallet.balance, "transactions": transactions, "wallet_id": wallet.id}

class AddMoneyRequest(SQLModel):
    user_id: int
    amount: float

@app.post("/wallet/add")
def add_money(req: AddMoneyRequest, session: Session = Depends(get_session)):
    wallet = session.exec(select(Wallet).where(Wallet.user_id == req.user_id)).first()
    if not wallet:
        wallet = Wallet(user_id=req.user_id, balance=0.0)
        session.add(wallet)
        session.commit()
        session.refresh(wallet)
    
    wallet.balance += req.amount
    session.add(wallet)
    
    # Log transaction
    txn = Transaction(
        wallet_id=wallet.id,
        amount=req.amount,
        type="CREDIT",
        description="Added money to wallet"
    )
    session.add(txn)
    session.commit()
    return {"message": "Money added successfully", "new_balance": wallet.balance}

@app.get("/student/eod-dues/{user_id}")
def get_eod_dues(user_id: int, session: Session = Depends(get_session)):
    # Logic: Find failed subjects (assuming < 33 marks)
    failed_grades = session.exec(select(Grade).where(Grade.student_id == user_id, Grade.marks < 33)).all()
    
    dues = []
    total_amount = 0
    EOD_FEE_PER_SUBJECT = 500
    
    for grade in failed_grades:
        # Check if already paid? (Complex logic, for now assume always due if failed and not re-passed)
        # In real app, we would check a "Payment" table linked to this grade/subject.
        # Simplification: Just list them. Use Frontend to simulate "Paid".
        dues.append({
            "subject": grade.course_id,
            "marks": grade.marks,
            "fee": EOD_FEE_PER_SUBJECT
        })
        total_amount += EOD_FEE_PER_SUBJECT
        
    return {"dues": dues, "total_amount": total_amount}

class PayEODRequest(SQLModel):
    user_id: int
    amount: float
    subjects: list[str]

@app.post("/student/pay-eod")
def pay_eod(req: PayEODRequest, session: Session = Depends(get_session)):
    wallet = session.exec(select(Wallet).where(Wallet.user_id == req.user_id)).first()
    if not wallet or wallet.balance < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")
        
    wallet.balance -= req.amount
    session.add(wallet)
    
    txn = Transaction(
        wallet_id=wallet.id,
        amount=req.amount,
        type="DEBIT",
        description=f"Paid EOD Fees for: {', '.join(req.subjects)}"
    )
    session.add(txn)
    session.commit()
    return {"message": "Payment successful", "new_balance": wallet.balance}

# ADD THIS AT THE VERY BOTTOM
if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8001, reload=True)