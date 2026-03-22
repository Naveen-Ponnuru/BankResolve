# 🏦 BankResolve - Enterprise Grievance Management System

BankResolve is a robust, full-stack enterprise application designed to streamline and automate customer grievance workflows across multiple partner banks. Built to replace legacy tracking systems, BankResolve enables real-time compliance tracking, intelligent escalation, and seamless communication between customers, bank staff, and managers.

## ✨ Key Features

- **Role-Based Workflows (RBAC)**: Secure access control tailored for 4 distinct roles (Customer, Staff, Manager, Admin).
- **Multi-Bank Architecture**: Segregated data environments tied to specific bank codes (e.g., SBI, HDFC, Axis). Staff and managers only have visibility into grievances registered under their specific bank branch/code.
- **Real-Time Notifications**: Powered by WebSocket (STOMP), instantly alerting staff to SLA breaches, managers to escalations, and customers to resolution updates without requiring page refreshes.
- **Intelligent Escalation & SLA Tracking**: Priorities (Low, Normal, High, Urgent) automatically map to Service Level Agreements. The system tracks resolution times and triggers breach alerts if deadlines are missed.
- **Transparent Customer Tracking**: A dedicated interactive timeline map where customers can trace the life-cycle of their submitted grievances (Filed → Accepted → In Progress → Resolved).
- **Dynamic Dashboards**: Role-specific dashboard hubs offering KPI metrics, pending tickets count, high-priority issues, and quick-action response forms.

## 🛠️ Tech Stack

### Backend (Core API)
- **Java 21 & Spring Boot 3**: Core framework ensuring high performance and security.
- **Spring Security & JWT**: Stateless authentication enforcing strict authorization rules.
- **Spring Data JPA & Hibernate**: Robust ORM mapped to the relational database.
- **MySQL**: Persistent relational data storage.
- **WebSocket (STOMP)**: Real-time asynchronous messaging protocol.

### Frontend (Client SPA)
- **React 18 & Vite**: Lightning-fast, optimized UI rendering and building.
- **Redux Toolkit**: Centralized state management for authentication, banking context, and active notifications.
- **TailwindCSS**: Utility-first CSS framework providing a sleek, responsive, and dark-mode compatible design.
- **Axios & React Router**: Efficient data fetching and seamless client-side single-page routing.
- **SockJS-client & @stomp/stompjs**: Frontend drivers for establishing persistent real-time socket connections.

## 📂 Project Structure

```text
bank-grievance/
├── bank-backend/         # Spring Boot 3 Java API
│   ├── src/main/java...  # Controllers, Services, Security, DTOs, Repositories
│   └── application.yml   # Environment profiles and DB configurations
│
└── bank-ui/              # React + Vite Frontend
    ├── src/components/   # Reusable UI elements and real-time Notification Bell
    ├── src/pages/        # Role-specific Views (Admin, Customer, specific Dashboards)
    ├── src/services/     # API Integration layers (grievanceService, authService)
    └── src/store/        # Redux slices
```

## 🚀 Getting Started

### Prerequisites
- **Java 21+** installed
- **Node.js (v18+)** installed
- **MySQL 8.0+** running locally or via Docker

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd bank-backend
   ```
2. Update the database properties in `src/main/resources/application.yml` with your local MySQL credentials.
3. Start the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The API will start at `http://localhost:8080/api`*

### 2. Frontend Setup
1. Open a new terminal and navigate to the UI directory:
   ```bash
   cd bank-ui
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```
   *The UI will run on `http://localhost:5173`*

## 🛡️ Authentication & Postman Testing
When testing API routes via Postman or Curl, BankResolve uses token-based Bearer authentication. After executing the `/api/auth/login` endpoint, extract the JWT from the JSON response and include it as an `Authorization: Bearer <token>` header in subsequent requests.

## 📄 License
This project is proprietary and intended as an enterprise template for financial service organizations.
