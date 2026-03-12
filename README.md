# 🚀 NexusHR  
### Modern Human Resource Management System

![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)
![Spring Boot](https://img.shields.io/badge/Backend-SpringBoot-green)
![MySQL](https://img.shields.io/badge/Database-MySQL-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)
![GitHub stars](https://img.shields.io/github/stars/SohamB1810/nexushr?style=social)

NexusHR is a full-stack **Human Resource Management System (HRMS)** designed to simplify employee management, payroll tracking, and HR operations.

The system provides a modern dashboard that allows organizations to manage employees, salaries, and company records efficiently.

This project demonstrates **enterprise-level full-stack architecture using Spring Boot and Next.js.**

---

# 🌐 Live Demo

Frontend Deployment

https://nexushr-git-main-sohamb1810s-projects.vercel.app

Backend API

http://localhost:8080/api

---

# ✨ Features

### 👥 Employee Management
- Add new employees
- Update employee details
- Delete employees
- View employee profiles

### 💰 Payroll Management
- Manage employee salary data
- Track payroll information

### 📊 HR Dashboard
- Centralized HR interface
- View employee records

### 🔗 REST API Backend
- Clean RESTful API architecture
- Communication between frontend and backend

---

# 🛠 Tech Stack

## Frontend
- Next.js
- React
- Tailwind CSS
- Axios

## Backend
- Spring Boot
- Java
- Spring Data JPA
- REST APIs

## Database
- MySQL

## Development Tools
- Git
- GitHub
- IntelliJ IDEA
- VS Code
- Postman

---

# 🏗 Project Architecture

            ┌──────────────────┐
            │     Frontend     │
            │     Next.js      │
            │ React + Tailwind │
            └─────────┬────────┘
                      │ REST API
                      ▼
            ┌──────────────────┐
            │     Backend      │
            │   Spring Boot    │
            │ Controllers      │
            │ Services         │
            │ Repositories     │
            └─────────┬────────┘
                      │ JPA
                      ▼
            ┌──────────────────┐
            │     Database     │
            │      MySQL       │
            │ Employee Table   │
            └──────────────────┘

---

# 🧠 System Design

NexusHR follows a **layered architecture pattern** commonly used in enterprise applications.

## 1 Controller Layer

Handles incoming HTTP requests.

Example:


EmployeeController


Responsibilities:

- Receive API requests
- Validate inputs
- Return responses

---

## 2 Service Layer

Contains business logic.

Example:


EmployeeService


Responsibilities:

- Process employee operations
- Handle payroll logic
- Communicate with repositories

---

## 3 Repository Layer

Handles database operations.

Example:


EmployeeRepository


Responsibilities:

- CRUD operations
- Database access using JPA

---

## 4 Entity Layer

Represents database tables.

Example:


Employee.java


Defines employee attributes mapped to database columns.

---

# 📂 Project Structure


nexushr
│
├── backend
│ ├── controller
│ │ └── EmployeeController.java
│ │
│ ├── service
│ │ └── EmployeeService.java
│ │
│ ├── repository
│ │ └── EmployeeRepository.java
│ │
│ ├── entity
│ │ └── Employee.java
│ │
│ └── dto
│
├── frontend
│ ├── components
│ ├── pages
│ ├── services
│ └── styles
│
└── database
└── schema.sql


---

# ⚙ Installation

## 1 Clone Repository

```bash
git clone https://github.com/SohamB1810/nexushr.git
cd nexushr
🔧 Backend Setup

Configure database in:

src/main/resources/application.properties

Example configuration:

spring.datasource.url=jdbc:mysql://localhost:3306/nexushr
spring.datasource.username=root
spring.datasource.password=yourpassword

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

Run backend:

mvn spring-boot:run

Backend runs on

http://localhost:8080
💻 Frontend Setup
cd frontend
npm install
npm run dev

Frontend runs on

http://localhost:3000
🗄 Database Example
CREATE TABLE employee (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(20),
    hire_date DATE,
    basic_salary DOUBLE,
    status VARCHAR(20)
);
🔗 API Endpoints
Method	Endpoint	Description
GET	/api/employees	Get all employees
GET	/api/employees/{id}	Get employee
POST	/api/employees	Create employee
PUT	/api/employees/{id}	Update employee
DELETE	/api/employees/{id}	Delete employee
🚧 Future Enhancements

Authentication with JWT

Role-based access control

Leave management system

Attendance tracking

Payroll automation

HR analytics dashboard

👨‍💻 Author

Soham Biswas

GitHub
https://github.com/SohamB1810

📄 License

This project is licensed under the MIT License.


---

✅ This version is **cleaner, portfolio-ready, and professional** (no screenshot/demo section).

If you want, I can also show you **how to add a GitHub README Table of Contents automatically
