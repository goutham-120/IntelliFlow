# IntelliFlow

<p align="center">
  <strong>A modern workflow and task management platform for teams, approvals, and organization-level collaboration.</strong>
</p>

<p align="center">
  <a href="https://intelli-flow-gamma.vercel.app/">Live Demo</a>
  ·
  <a href="#features">Features</a>
  ·
  <a href="#tech-stack">Tech Stack</a>
  ·
  <a href="#getting-started">Getting Started</a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111111" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=ffffff" />
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=ffffff" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=ffffff" />
</p>

## Overview

IntelliFlow is a full-stack MERN workflow management application designed to help organizations create workflows, assign tasks, manage teams, and track work through role-based dashboards.

The application supports organization registration, secure authentication, admin/user access control, group-based task assignment, workflow stages, inbox actions, analytics, and audit-oriented management views.

**Live deployment:** [https://intelli-flow-gamma.vercel.app/](https://intelli-flow-gamma.vercel.app/)

## Features

- **Organization onboarding** with organization verification and admin registration.
- **Secure authentication** using JWT-based protected routes.
- **Role-based access control** for admin and user workflows.
- **Workflow management** for creating, viewing, and managing approval flows.
- **Task lifecycle management** with stage completion and rejection actions.
- **Inbox view** for assigned or actionable work.
- **Groups and teams** for structured collaboration.
- **User management** for creating users and managing account status.
- **Analytics dashboard** for organization-level workflow insights.
- **Audit and admin views** for better operational visibility.
- **Responsive React interface** built for a clean dashboard experience.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Axios, Tailwind CSS |
| Backend | Node.js, Express 5, REST APIs |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Tooling | ESLint, PostCSS, Nodemon |
| Deployment | Vercel frontend, Node/Express backend compatible |

## Project Structure

```text
IntelliFlow/
|-- client/                 # React + Vite frontend
|   |-- src/
|   |   |-- components/     # Shared UI and feature components
|   |   |-- context/        # Auth, theme, and organization state
|   |   |-- layouts/        # Main app layout
|   |   |-- pages/          # Dashboard, auth, tasks, workflows, org pages
|   |   |-- routes/         # Application routing and route guards
|   |   `-- services/       # API client configuration
|   `-- package.json
|
|-- server/                 # Express backend
|   |-- config/             # Database configuration
|   |-- controllers/        # Request handlers
|   |-- middleware/         # Auth, RBAC, and error handling
|   |-- models/             # Mongoose schemas
|   |-- routes/             # REST route definitions
|   |-- services/           # Business logic
|   |-- validators/         # Request validation
|   `-- server.js
|
`-- README.md
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- MongoDB database URI, either local or hosted

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd IntelliFlow
```

### 2. Install dependencies

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd ../server
npm install
```

### 3. Configure environment variables

Create a `.env` file inside `server/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Create a `.env` file inside `client/`:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, set `VITE_API_URL` to the deployed backend API URL.

### 4. Run the application locally

Start the backend:

```bash
cd server
npm start
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

The frontend will run on the Vite development URL, usually:

```text
http://localhost:5173
```

## Available Scripts

### Frontend

```bash
npm run dev       # Start Vite development server
npm run build     # Build production frontend
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

### Backend

```bash
npm start         # Start Express server
```

## API Modules

The backend exposes REST API modules for:

- Authentication: `/api/auth`
- Analytics: `/api/analytics`
- Users: `/api/users`
- Groups: `/api/groups`
- Workflows: `/api/workflows`
- Tasks: `/api/tasks`
- Inbox: `/api/inbox`

## Deployment

The frontend is deployed here:

[https://intelli-flow-gamma.vercel.app/](https://intelli-flow-gamma.vercel.app/)

When deploying the full application, configure these environment variables in the hosting dashboards:

- `VITE_API_URL` for the frontend
- `MONGO_URI`, `JWT_SECRET`, and `PORT` for the backend

## Highlights

IntelliFlow focuses on practical workflow coordination:

- Admins can create and manage organization structures.
- Teams can collaborate through groups and assigned tasks.
- Users can act on workflow stages from their task and inbox views.
- Analytics and audit pages give admins visibility into operations.

## License

This project is currently licensed under the ISC license as defined in the backend package configuration.

---

<p align="center">
  Built with React, Express, MongoDB, and a focus on clear team workflows.
</p>
