# 🏦 BankResolve – Smart Grievance & Feedback Management System

BankResolve is a full-stack web application developed to streamline the grievance and feedback handling process for a banking organization. It enables customers to register complaints, track their progress, receive real-time updates, and submit feedback after resolution. The system provides secure role-based access for Customers, Staff, and Managers to efficiently manage the complete grievance lifecycle.

---

## 🚀 Features

### 👤 Customer
- Secure registration and login using JWT Authentication
- Submit grievances with category, priority, and attachments
- Track grievance status in real time
- Receive notifications for complaint updates
- Submit feedback after grievance resolution
- View grievance history

### 👨‍💼 Staff
- View assigned grievances
- Accept grievances
- Update grievance status
- Add remarks and progress updates
- Escalate grievances to Manager when required
- Receive real-time notifications

### 👨‍💻 Manager
- View all grievances
- Handle escalated grievances
- Resolve complaints
- Monitor complaint statistics
- View customer feedback
- Receive escalation notifications

---

# 📌 Grievance Workflow

```
Customer
     │
     ▼
Submit Grievance
     │
     ▼
Staff Reviews
     │
 ┌───┴────┐
 │        │
Resolved  Escalated
 │        │
 ▼        ▼
Customer  Manager
Feedback  Resolves
     │
     ▼
Completed
```

---

# 🔐 Authentication & Security

- JWT Authentication
- Spring Security
- Password Encryption using BCrypt
- Role-Based Authorization
- Protected REST APIs
- Secure API Access

---

# 🔔 Real-Time Notifications

The application uses **WebSocket (STOMP)** for instant notifications.

Examples:
- New grievance submitted
- Complaint accepted
- Status updated
- Complaint escalated
- Complaint resolved
- Feedback submitted

---

# 📊 Dashboard

### Customer Dashboard
- Total Complaints
- Pending Complaints
- Resolved Complaints
- Recent Notifications
- Feedback Status

### Staff Dashboard
- Assigned Complaints
- Pending Work
- In Progress
- Resolved Today

### Manager Dashboard
- Overall Complaints
- Escalated Complaints
- Resolution Statistics
- Customer Feedback

---

# 🛠 Tech Stack

## Backend

- Java 21
- Spring Boot 3
- Spring Security
- Spring Data JPA
- Hibernate
- JWT Authentication
- MySQL
- WebSocket (STOMP)
- Maven

---

## Frontend

- React 18
- Vite
- Redux Toolkit
- Axios
- React Router
- Tailwind CSS

---

## Database

- MySQL

---

## Tools

- IntelliJ IDEA
- VS Code
- Git
- GitHub
- Postman

---

# 📂 Project Structure

```
BankResolve
│
├── bank-backend
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   ├── dto
│   ├── security
│   ├── config
│   └── exception
│
└── bank-ui
    ├── src
    │   ├── components
    │   ├── pages
    │   ├── services
    │   ├── store
    │   ├── hooks
    │   └── layout
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/Naveen-Ponnuru/BankResolve.git
```

---

## Backend

```bash
cd bank-backend
```

Configure MySQL credentials in:

```
application.properties
```

Run:

```bash
mvn spring-boot:run
```

Backend runs at

```
http://localhost:8080
```

---

## Frontend

```bash
cd bank-ui
```

Install dependencies

```bash
npm install
```

Run

```bash
npm run dev
```

Frontend runs at

```
http://localhost:5173
```

---

# 🔑 Demo Roles

| Role | Description |
|-------|-------------|
| Customer | Register grievances and submit feedback |
| Staff | Process assigned grievances |
| Manager | Handle escalations and monitor the system |

---

# 📦 REST API Modules

- Authentication API
- User API
- Grievance API
- Feedback API
- Notification API
- Contact API

---

# 💡 Highlights

- Secure JWT Authentication
- Role-Based Access Control (RBAC)
- Real-Time Notifications
- Complaint Tracking
- Feedback Management
- Responsive User Interface
- Clean Layered Architecture
- RESTful APIs
- Spring Boot Best Practices

---

# 🎯 Future Enhancements

- Email Notifications
- SMS Notifications
- Analytics Dashboard
- Complaint Search & Filters
- File Upload Improvements
- Report Generation
- Docker Deployment
- Cloud Deployment (AWS)

---

# 👨‍💻 Developed By

**Ponnuru Venkata Naveen**

- Java Full Stack Developer
- Spring Boot | React | MySQL | REST APIs | JWT | WebSocket

---

# 📄 License

This project is developed for educational, internship, and portfolio purposes.
