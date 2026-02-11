# Smart Academic Platform 🎓

An AI-powered academic management system designed to streamline school and college operations. This platform features an **AI Timetable Generator**, a comprehensive **Student Dashboard**, and an **AI Study Companion** to enhance the learning experience.

## ✨ Key Features

### 👨‍💼 Admin Dashboard
-   **AI Timetable Generator:** Automatically generate conflict-free schedules for all sections using a genetic algorithm/heuristic approach.
-   **Course Allocation:** Drag-and-drop or select interface to assign faculty to subjects.
-   **User Management:** Manage Students, Faculty, and Admin accounts.
-   **Attendance & Stats:** View institution-wide statistics.

### 👨‍🎓 Student Dashboard
-   **AI Study Area:** Upload notes (PDF/Text) to get instant **Summaries**, **Video Recommendations**, and **Practice Quizzes**.
-   **Smart Timetable:** Interactive weekly schedule with "Today's Classes" highlight.
-   **Wallet & Fees:** Manage tuition fees and payments.
-   **Attendance Tracking:** Visual attendance records.

### 👩‍🏫 Faculty Dashboard
-   **Class Schedule:** View weekly teaching loads.
-   **Grading System:** Input and publish student grades.
-   **Attendance:** Mark attendance for assigned classes.

---

## 🛠️ Tech Stack

-   **Frontend:** React.js, Vite, Tailwind CSS, Framer Motion (for animations).
-   **Backend:** Python, FastAPI, SQLModel (SQLite).
-   **AI Features:** Simulated AI logic (ready for LLM integration).
-   **Icons:** Lucide React.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
-   Node.js (v16 or higher)
-   Python (v3.9 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/AIwithVinay/smart-academic-timetable-and-coordination-platform.git
cd smart-academic-timetable-and-coordination-platform
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies.

```bash
cd backend
# Create a virtual environment (optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlmodel
# (If you have a requirements.txt, use: pip install -r requirements.txt)

# Run the Server
uvicorn main:app --reload
```
*The backend will run at `http://127.0.0.1:8001`*

### 3. Frontend Setup
Open a new terminal, navigate to the frontend folder, and start the app.

```bash
cd frontend
npm install
npm run dev
```
*The frontend will run at `http://localhost:5173`*

---

## 📸 Screenshots

| Student Dashboard | AI Study Area |
| ----------------- | ------------- |
| ![Dashboard](https://placehold.co/600x400/violet/white?text=Student+Dashboard) | ![Study Area](https://placehold.co/600x400/indigo/white?text=AI+Study+Area) |

| Timetable Generator | Course Allocation |
| ------------------- | ----------------- |
| ![Timetable](https://placehold.co/600x400/orange/white?text=Timetable+Generator) | ![Allocation](https://placehold.co/600x400/green/white?text=Course+Allocation) |

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by Vinay
