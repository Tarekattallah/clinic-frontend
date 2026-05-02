# MediCare — Frontend

React.js frontend for the MediCare clinic management system.

## Quick Start

```bash
npm install
cp .env.example .env.local    # Fill in your backend URL
npm start                      # Development
npm run build                  # Production build
```

## Environment Variables

| Variable              | Description                        |
|-----------------------|------------------------------------|
| `REACT_APP_API_URL`   | Backend API URL (no trailing slash) |

## Deployment (Vercel)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variable: `REACT_APP_API_URL=https://your-backend.onrender.com/api`
4. Deploy

## Roles

| Role    | Access                                              |
|---------|-----------------------------------------------------|
| Guest   | Home, Doctors list (read-only)                      |
| Patient | Book appointments, view history, medical records    |
| Doctor  | Manage schedule, add medical records, upload avatar |
| Admin   | Full access — users, appointments, reports          |

## Admin Access

On the Register page, click the **MediCare logo 5 times** to reveal the admin access panel.  
Default code: `MEDICARE_ADMIN_2024` (change this in `RegisterPage.jsx` before deploying).
