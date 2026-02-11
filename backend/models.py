from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str
    email: str = Field(unique=True, index=True)
    hashed_password: str
    role: str  # Options: "admin", "faculty", "student"
    section: Optional[str] = None # For students: "A", "B", etc.
    class_id: Optional[str] = None # For students: "CS202" etc.
    parent_phone: Optional[str] = None # For notifications

class LoginRequest(SQLModel):
    email: str
    password: str

class Attendance(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="user.id")
    course_id: str # e.g., "CS101"
    date: str # YYYY-MM-DD
    status: str # "Present", "Absent", "Late"
    section: str # Store section for easy filtering

class Grade(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="user.id")
    course_id: str
    marks: int
    total_marks: int = 100
    grade: str # A, B, C, etc.
    comments: Optional[str] = None
    is_published: bool = False

class Schedule(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    course_id: str
    section: str = Field(index=True) # "A", "B"...
    course_name: str
    faculty_id: int = Field(foreign_key="user.id")
    day_of_week: str # Monday, Tuesday...
    start_time: str # 10:00
    end_time: str # 11:00
    room: str
    is_published: bool = Field(default=False)

class Assignment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    course_id: str
    title: str
    description: str
    due_date: str # YYYY-MM-DD
    target_section: str = Field(default="All") # "All", "A", "B"...
    teacher_id: int = Field(foreign_key="user.id")

class Submission(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    assignment_id: int = Field(foreign_key="assignment.id")
    student_id: int = Field(foreign_key="user.id")
    content: str # Text or URL
    submission_date: str # YYYY-MM-DD HH:MM
    grade: Optional[int] = None
    feedback: Optional[str] = None

class Complaint(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="user.id")
    title: str
    description: str
    category: str # "Academic", "Facility", etc.
    target_type: str # "Admin", "Faculty"
    target_fac_id: Optional[int] = Field(default=None, foreign_key="user.id")
    status: str = "Pending" # Pending, Resolved, Dismissed
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    section: str = Field(index=True)
    sender_id: int = Field(foreign_key="user.id")
    content: str
    image_url: Optional[str] = None
    timestamp: str # ISO format
    is_anonymous: bool = Field(default=False)

# --- Timetable / Admin Models ---

class Room(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True) # e.g., "101", "Lab A"
    capacity: int

class TimeSlot(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    day_of_week: str # "Monday", "Tuesday"...
    start_time: str # "09:00"
    end_time: str # "10:00"

class Subject(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str # "Mathematics"
    code: str = Field(index=True) # "MATH101"
    credits: int = 3

class CourseAllocation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    subject_id: int = Field(foreign_key="subject.id")
    teacher_id: int = Field(foreign_key="user.id")
    section_id: str # "A", "B"...
    # Constraint: One teacher per subject per section usually, but let's keep it flexible
    # We might add constraints later or via logic.

class Wallet(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    balance: float = 0.0

class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    wallet_id: int = Field(foreign_key="wallet.id")
    amount: float
    type: str  # "CREDIT", "DEBIT"
    description: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)