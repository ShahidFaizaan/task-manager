# TeamFlow Enterprise

TeamFlow is a full-stack, enterprise-grade project management application designed to facilitate real-time team collaboration. It features a modern, responsive UI with strict Role-Based Access Control (RBAC), multi-methodology board support, and detailed productivity analytics.

## 🚀 Live Demo

_Currently deployed on Railway. Add your live URL here!_

---

## 🛠️ Tech Stack

This project uses a monolithic **3-Tier Architecture**:

- **Frontend**: React (Vite) + Tailwind CSS v4 + Lucide Icons
- **Backend**: Python (Flask) + REST API
- **Database**: PostgreSQL (via Supabase)

---

## ✨ Key Features

- **Strict Role-Based Access Control (RBAC)**: Secure separation between `Admin` and `Member` roles.
  - _Admins_ can create/delete projects and tasks, and have global visibility.
  - _Members_ can only view projects they are assigned to, and can only update task statuses.
- **Scrum & Kanban Support**: Dynamically create projects tailored to your team's specific agile methodology.
- **Analytics Dashboard**: High-level overview of workspace productivity, featuring critical alerts for overdue tasks.
- **Task Management**: Assign tasks to specific team members and set strict deadlines.
- **Premium UI/UX**: Designed with a sleek "Dark Velvet Red" theme, responsive split-screen authentication, and fluid micro-animations.

---

## 💻 Local Development Setup

To run this project locally, you will need Node.js and Python installed.

### 1. Database Setup (Supabase)

1. Create a new project on [Supabase](https://supabase.com/).
2. Run the provided SQL script (`update_schema.sql`) in your Supabase SQL Editor to generate the necessary tables, columns, and security triggers.
3. In your Supabase Dashboard, navigate to **Authentication -> Providers -> Email** and toggle **OFF** "Confirm email" to allow instant logins for the MVP.

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Backend Setup (Flask)

```bash
# Create and activate a virtual environment
python -m venv venv
source venv/Scripts/activate # Windows

# Install dependencies
pip install -r requirements.txt

# Run the Flask API on port 5000
python backend/app.py
```

### 4. Frontend Setup (React)

Open a new terminal window:

```bash
npm install
npm run dev
```

The React frontend will start on port `5173` and automatically proxy API requests to your Flask backend.

---

## 🚀 Production Deployment (Railway)

This repository is pre-configured for monolithic deployment on [Railway](https://railway.app/).

1. Build the production React assets:
   ```bash
   npm run build
   ```
2. Move the output to the backend static folder:
   - Rename/move the `dist/` folder to `backend/static/`.
3. Commit and push the changes to GitHub.
4. Connect the repository to Railway.
5. Railway will automatically detect the `requirements.txt` and `Procfile`, install dependencies, and serve the application via `gunicorn`.
6. Add your environment variables in the Railway project settings.

---

_Developed by Mohammed Shahid Faizaan._
