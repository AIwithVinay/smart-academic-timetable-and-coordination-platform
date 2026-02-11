import requests

BASE_URL = "http://127.0.0.1:8001"

def verify_notification_system():
    print("1. Creating/Ensuring Test Student...")
    # Register/Login flow simplified
    # Lets Assume student ID 104 exists or use one from seed
    # We'll use a hardcoded ID or fetch one
    # For now, let's use the login endpoint to find a student, or just use a known one.
    # We will try to update profile for ID 1 (Admin) -> Fail? No, Admin is User.
    # Let's target a known student email from seed: student_A_1@test.com ? Or create new.
    
    # Create a new student to be sure
    # Using existing upload route is complex. Let's just use the profile update on a potentially existing user
    # or rely on seed/test data.
    
    # Let's try to login as a student if we know one, OR just assume ID=1 is admin and maybe ID=5 is student?
    # Better: Use the python shell logic via SQLModel if possible? No, stick to API.
    
    # Lets use the /login to get a valid student ID
    login_payload = {"email": "student_K_1@test.com", "password": "123"} # From seed logic
    # Wait, did we seed students? seed_full_timetable seeds FACULTY.
    # seed_csv seeds students.
    # Let's try to Login as a student from 'create_test_student.py' which I saw earlier!
    # "teststudent@example.com" / "student123"
    
    res = requests.post(f"{BASE_URL}/login", json={"email": "teststudent@example.com", "password": "student123"})
    if res.status_code != 200:
        print("Login failed, trying to create test student...")
        # Create student manually? No endpoint for raw register.
        # We rely on 'create_test_student.py' having run.
        # Ensure it runs.
        import subprocess
        subprocess.run(["python", "create_test_student.py"], check=False)
        res = requests.post(f"{BASE_URL}/login", json={"email": "teststudent@example.com", "password": "student123"})
    
    if res.status_code != 200:
        print("CRITICAL: Could not login as test student. Skipping.")
        return

    data = res.json()
    user_id = data['id']
    print(f"Logged in as Student ID: {user_id}")
    
    print("\n2. Updating Parent Phone...")
    # PUT /student/profile
    profile_payload = {
        "parent_phone": "+1-555-0199",
        "full_name": "Test Student (Failed)"
    }
    res = requests.put(f"{BASE_URL}/student/profile?user_id={user_id}", json=profile_payload)
    print(f"Update Status: {res.status_code}")
    print(res.json())
    
    print("\n3. Submitting a FAILING Grade...")
    # POST /grades/upload/{course_id} is for CSV.
    # Is there a direct JSON grade submit? 
    # POST /grades takes List[Grade]
    # Grade model: student_id, course_id, marks, total_marks, grade...
    
    grade_payload = [{
        "student_id": user_id,
        "course_id": "MATH-FAIL-101",
        "marks": 35,
        "total_marks": 100,
        "grade": "F",
        "comments": "Poor performance",
        "is_published": True
    }]
    
    res = requests.post(f"{BASE_URL}/grades", json=grade_payload)
    print(f"Grade Submit Status: {res.status_code}")
    
    print("\n4. Triggering Parent Notification...")
    # POST /notify/parents-report
    res = requests.post(f"{BASE_URL}/notify/parents-report")
    print(f"Notify Status: {res.status_code}")
    result = res.json()
    print("Result Log:", result)
    
    # Check if we are in the log
    found = False
    if 'log' in result:
        for entry in result['log']:
            if entry['parent_phone'] == "+1-555-0199":
                print("\nSUCCESS: Notification logged for test student!")
                found = True
                break
    
    if not found:
        print("\nFAILURE: Notification not found in log.")

if __name__ == "__main__":
    verify_notification_system()
