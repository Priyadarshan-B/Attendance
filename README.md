# Attendance Portal

## 📌 Project Overview
The **Attendance Portal** is a web-based application designed for college attendance management. It supports slot-wise attendance tracking, role-based dashboards for students, mentors, and admins, and automated attendance validation every seven days. The portal also enables report generation in Excel format for absent, present, and consolidated records. Admins have full CRUD (Create, Read, Update, Delete) privileges over the system.

## 🛠 Tech Stack
- **Frontend:** React(vite), CSS
- **Backend:** Node.js, Express
- **Database:** MySQL

## ✨ Features
### 🎯 General Features
- User-friendly and responsive UI
- Role-based authentication and authorization
- Secure login system

### 📌 Student Dashboard
- View attendance records
- Check slot-wise attendance

### 📌 Mentor Dashboard
- Validate attendance every 7 days
- Generate attendance reports (Excel format)

### 📌 Admin Dashboard
- Full control with CRUD operations
- Generate and download reports:
  - **Absent Report**
  - **Present Report**
  - **Consolidated Report**

## 🚀 Live Demo
🔗 [Attendance Portal](https://learnathon.bitsathy.ac.in/attendance)

## 🔧 Installation and Setup
Follow these steps to run the project locally:

### 📥 Clone the Repository
```bash
git clone https://github.com/Priyadarshan-B/Attendance.git
cd Attendance
```

### 🏗 Backend Setup (Node.js & Express)
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Create a `.env` file in the `backend` directory and add your database credentials.
4. Navigate to src folder:
   ```bash
   cd src
   ```
5. Start the server:
   ```bash
   node app.js
   ```

### 🎨 Frontend Setup (React - vite)
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend server:
   ```bash
   npm run dev
   ```
4. Open the application in your browser at `http://localhost:5173`

## 📸 Screenshots
### 🔹 Student Dashboard
![Student Dashboard](https://raw.githubusercontent.com/Priyadarshan-B/Attendance/main/screenshots/student.png)

### 🔹 Mentor Dashboard
![Mentor Dashboard](https://raw.githubusercontent.com/Priyadarshan-B/Attendance/main/screenshots/mentor.png)


## 🏗 My Role
I developed both the **frontend** and **backend** of this project, integrating React for the UI and Node.js with Express for backend logic.

## 🤝 Contributing
Contributions are welcome! Feel free to fork the repository and submit a pull request.

---
### 📧 Contact
If you have any questions or suggestions, feel free to reach out!

