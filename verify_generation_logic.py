import requests

BASE_URL = "http://127.0.0.1:8001"

# Helper function for fetching schedule
def get_schedule(published_only=True):
    params = {"published_only": str(published_only).lower()}
    try:
        res = requests.get(f"{BASE_URL}/schedule", params=params)
        res.raise_for_status() # Raise an exception for bad status codes
        return res.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching schedule: {e}")
        return []

def verify_schedule():
    print("\n1. Triggering Timetable Generation...")
    # Trigger generation
    try:
        res = requests.post(f"{BASE_URL}/generate-timetable")
        print(f"Status: {res.status_code}")
    except Exception as e:
        print(f"Generation Failed: {e}")

    print("\n2. Checking Schedule (Default: Published Only)...")
    # By default, should satisfy filtering
    schedules = get_schedule()
    print(f"Found {len(schedules)} classes (Should be 0 if unpublished).")

    print("\n3. Checking Draft Schedule (Unpublished)...")
    # Verify Drafts exist
    drafts = get_schedule(published_only=False)
    print(f"Found {len(drafts)} draft classes.")

    if len(drafts) > 0:
        # Check for Conflicts
        print("\n--- CHECKING FOR CONFLICTS ---")
        param_conflict = []
        
        # Group by TimeSlot
        from collections import defaultdict
        slot_map = defaultdict(list)
        
        for d in drafts:
            # Key: Day + StartTime
            key = f"{d['day_of_week']} {d['start_time']}"
            slot_map[key].append(d)

        conflict_count = 0
        for key, classes in slot_map.items():
            # Check Teacher Conflicts
            teachers = [c['faculty_id'] for c in classes]
            if len(teachers) != len(set(teachers)):
                print(f"[CONFLICT] Teacher Double Booked at {key}: {teachers}")
                conflict_count += 1
            
            # Check Room Conflicts
            rooms = [c['room'] for c in classes]
            if len(rooms) != len(set(rooms)):
                print(f"[CONFLICT] Room Double Booked at {key}: {rooms}")
                conflict_count += 1
                
            # Check Section Conflicts
            sections = [c['section'] for c in classes]
            if len(sections) != len(set(sections)):
                 pass 
                 # Wait, multiple classes for Section A at same time?
                 # Actually, a section CANNOT have 2 classes at once.
                 if len(sections) != len(set(sections)):
                     print(f"[CONFLICT] Section Double Booked at {key}: {sections}")
                     conflict_count += 1
        
        if conflict_count == 0:
            print(">> NO CONFLICTS DETECTED <<")
        else:
            print(f">> FOUND {conflict_count} CONFLICTS <<")

    print("\n4. Publishing Timetable...")
    # Publish
    try:
        # Publish all
        pub_res = requests.post(f"{BASE_URL}/publish-timetable", json={}) 
        print(f"Publish Status: {pub_res.status_code}")
    except Exception as e:
        print(f"Publish Failed: {e}")

    print("\n5. Verifying Published Schedule...")
    published = get_schedule(published_only=True)
    print(f"Found {len(published)} published classes.")
    
    # Just print a few
    for s in published[:20]:
        print(f"- {s['course_name']} ({s['section']}) at {s['day_of_week']} {s['start_time']}")

if __name__ == "__main__":
    verify_schedule()
