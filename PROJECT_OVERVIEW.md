# Real-Time Project Board

- **Live Demo:** [https://real-time-project-board.vercel.app/projects](https://real-time-project-board.vercel.app/projects)
- **Monorepo:** [https://github.com/vireshkumarmistry/real-time-project-board](https://github.com/vireshkumarmistry/real-time-project-board)

---

## Demo Credentials

- **Admin**  
  Email: `admin@example.com`  
  Password: `test`

- **User**  
  Email: `user@example.com`  
  Password: `test`

---

## Features

- **Authentication:** JWT-based login/register, role-based access (admin/user)
- **Project Management:**
  - Create, edit, delete projects (**admin only**)
  - View all projects (all users)
- **Task Management:**
  - Create, edit, delete tasks within projects (**admin only**)
  - Assign tasks to users (**admin only**)
  - View task status (all users)
- **Real-Time Updates:**
  - Projects and tasks update live via Socket.io
- **Role-Based UI:**
  - Admins see management controls, users see only what they can access
- **Performance Optimizations:**
  - Virtualized lists for projects/tasks (react-window)
  - Memoization (`useMemo`, `useCallback`, `React.memo`)
  - Code splitting/lazy loading with `React.lazy` and `Suspense`
- **Robust Error Handling:**
  - Toast notifications for all actions
- **TypeScript:**
  - Full type safety in frontend
- **Security:**
  - CORS, JWT, environment-based config, secure API
- **Modern UI:**
  - Material-UI (MUI) and tailwind for a responsive, accessible interface

---

## What Admin and User Can Do

### Admin

- Create, edit, and delete projects
- Create, edit, delete, and assign tasks
- Manage all tasks in organizations
- See all projects and tasks

### User

- View all projects
- View all tasks
- Cannot create, edit, or delete projects or tasks

---

## Architecture

- **Frontend:** Vite + React + Redux Toolkit + MUI + tailwind + react-window
- **Backend:** Node.js + Express + MongoDB + Socket.io
- **Monorepo:** Both client and server in a single repository
- **Environment Config:** `.env.local` for local, `.env.production` for deployed URLs
- **Proxy:** Vite dev proxy for local API, axios baseURL for production

---

## Setup Instructions

### 1. Clone the Repository

```
git clone https://github.com/vireshkumarmistry/real-time-project-board.git
cd real-time-project-board
```

### 2. Environment Variables

- Edit `/client/.env.local` and `/client/.env.production` for frontend API URLs
- Edit `/server/.env` for backend MongoDB, JWT, and allowed origins

### 3. Install Dependencies

```
# In root, install for both client and server
cd client && npm install
cd ../server && npm install
```

### 4. Run Locally

```
# Start backend
cd server && npm run dev
# Start frontend
cd ../client && npm run dev
```

### 5. Deploy

- Frontend: Vercel
- Backend: Render
- Set environment variables in deployment dashboards

---

## Testing the Application End-to-End

1. **Register a new user** (admin or user role)
2. **Login** and access `/projects`
3. **Create a project** (admin only)
4. **Add tasks** to a project (admin only)
5. **Assign tasks** to users (admin only)
6. **Update task status** as a user
7. **Observe real-time updates** in multiple browser tabs
8. **Test role-based UI** by logging in as both admin and user
9. **Check error handling** (invalid login, forbidden actions, etc.)
10. **Verify performance** with large lists (virtualization)

---

## Key Decisions & Notes

- **Virtualization** is used for all large lists for performance
- **Socket.io** enables real-time collaboration
- **Role-based access** is enforced both in UI and API
- **TypeScript** ensures type safety and maintainability
- **CORS** and environment-based config for secure deployment
- **Monorepo** structure for easier development and deployment

---

## Contact

For questions or contributions, see the [GitHub repo](https://github.com/vireshkumarmistry/real-time-project-board)
