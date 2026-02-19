# AuraLive Hostel Management System 🏢

AuraLive is a comprehensive, full-stack Hostel Management System built with the MERN stack (MongoDB, Express.js, React, Node.js). It is designed to streamline university accommodation operations by providing dedicated, role-based dashboards for students, administrators, and external service providers.

## 🌟 Key Features

* **Role-Based Access Control (RBAC):** Secure login system supporting 5 distinct user roles (Student, Admin, Maintainer, Laundry Supplier, Meal Supplier) using JWT authentication.
* **Student Portal:** Dynamic room browsing, online booking, and access to daily hostel services.
* **Admin Dashboard:** Full control over room creation, capacity management, and user oversight.
* **Kitchen & Meal Management:** Daily menu updates, active order tracking, and kitchen access limits.
* **Maintenance Ticketing:** Technicians can view assigned repair tasks, update job statuses, and track history.
* **Laundry Service:** Track incoming loads, set pricing per Kg, and notify students of ready pickups.

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* React Router DOM (for secure routing)
* Tailwind CSS (for styling)
* Axios (for API communication)

**Backend:**
* Node.js & Express.js
* MongoDB Atlas & Mongoose (Database & ORM)
* JSON Web Tokens (JWT) & bcryptjs (Authentication & Security)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/) installed on your machine. You will also need a MongoDB Atlas cluster URI.

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/your-username/AuraLive-Hostel-Management.git
cd AuraLive-Hostel-Management
\`\`\`

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and set up your environment variables.
\`\`\`bash
cd backend
npm install
\`\`\`
Create a `.env` file in the `backend` folder and add the following:
\`\`\`env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_secret_key_here
NODE_ENV=development
\`\`\`
Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies.
\`\`\`bash
cd frontend
npm install
\`\`\`
Start the React development server:
\`\`\`bash
npm run dev
# OR if using Create React App: npm start
\`\`\`

## 📂 Project Structure

\`\`\`text
AuraLive/
├── backend/
│   ├── controllers/      # API Logic (authController, roomController)
│   ├── models/           # MongoDB Schemas (User.js, Room.js)
│   ├── routes/           # API Endpoints
│   └── server.js         # Entry point for Node.js server
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI elements (Navbar)
│   │   ├── pages/        # Main views (Home, Login, Register)
│   │   │   └── dashboards/ # 5 specific role-based portals
│   │   ├── App.jsx       # Routing logic
│   │   └── main.jsx      # React entry point
\`\`\`

## 🔒 User Roles Overview
When registering or creating a user, assign one of the following roles to trigger the correct dashboard routing:
1.  `student`: Books rooms and requests services.
2.  `admin`: Manages the entire hostel system and adds rooms.
3.  `meal_supplier`: Manages the daily food menu and kitchen access.
4.  `maintainer`: Receives and updates repair tickets.
5.  `laundry`: Manages washing schedules and pricing.
