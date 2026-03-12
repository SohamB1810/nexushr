NexusHR

NexusHR is a modern Human Resource Management System (HRMS) designed to streamline employee management, payroll tracking, and HR operations. The platform provides an intuitive interface for managing employees, salaries, and organizational data efficiently.

This project demonstrates a full-stack HR dashboard built using modern web technologies, focusing on clean architecture, scalability, and maintainability.

Features

Employee management (add, update, delete employees)

Employee profile tracking

Salary and payroll management

HR dashboard interface

RESTful API backend

Secure database integration

Scalable modular architecture

Tech Stack
Frontend

Next.js

React

Tailwind CSS

TypeScript / JavaScript

Backend

Spring Boot

Java

REST APIs

Database

MySQL

Tools

Git & GitHub

IntelliJ IDEA

Node.js & npm

Vercel (deployment)

Project Structure
nexushr
│
├── frontend
│   ├── components
│   ├── pages
│   ├── services
│   └── styles
│
├── backend
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   └── dto
│
└── database
    └── schema.sql
Installation
1 Clone the repository
git clone https://github.com/SohamB1810/nexushr.git
cd nexushr
Backend Setup

Open backend project in IntelliJ IDEA

Configure database in application.properties

spring.datasource.url=jdbc:mysql://localhost:3306/nexushr
spring.datasource.username=root
spring.datasource.password=yourpassword

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

Run the Spring Boot application

Frontend Setup

Navigate to the frontend folder:

cd frontend

Install dependencies:

npm install

Start development server:

npm run dev

Open in browser:

http://localhost:3000
Database Schema (Example)
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
API Endpoints
Method	Endpoint	Description
GET	/api/employees	Get all employees
GET	/api/employees/{id}	Get employee by ID
POST	/api/employees	Create new employee
PUT	/api/employees/{id}	Update employee
DELETE	/api/employees/{id}	Delete employee
Screenshots

Add screenshots of your application here:

/screenshots/dashboard.png
/screenshots/employees.png
/screenshots/payroll.png
Future Improvements

Authentication & role based access

Attendance management

Leave management system

Payroll automation

Analytics dashboard

Contributing

Contributions are welcome.

Fork the repository

Create a feature branch

Commit your changes

Submit a pull request

Author

Soham Biswas

GitHub:
https://github.com/SohamB1810

License

This project is licensed under the MIT License.

