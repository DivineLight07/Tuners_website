# Hussein – Backend + Frontend (MIU Tuners Club)

## Project structure

```
Hussein-Backend/
├── controllers/
│   └── applicationController.js   # submit / get / update / delete
├── middleware/
│   ├── auth.js                    # JWT protect + authorize (stub — replace with Yasser's)
│   └── errorHandler.js
├── models/
│   └── Application.js             # Mongoose schema
├── public/                        # ← Frontend lives here (served as static files)
│   ├── tuners.html
│   ├── tuners.js                  # Updated to POST to /api/v1/applications
│   ├── tuners.css
│   ├── Tuners-Logo.png
│   └── picc.jpeg
├── routes/
│   └── applications.js
├── utils/
│   └── errorResponse.js
├── .env                           # NOT committed to GitHub
├── .env.example                   # Template — safe to commit
├── .gitignore
├── package.json
└── server.js                      # Entry point
```

## Prerequisites

- **Node.js** v18+
- **MongoDB** running locally (or a MongoDB Atlas URI)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (already filled in .env — edit if needed)
#    MONGO_URI defaults to: mongodb://127.0.0.1:27017/tuners_db

# 3. Start the server
npm start          # production
npm run dev        # development (auto-restart with nodemon)
```

## Test it

Open http://localhost:5000 in your browser — the application form loads directly.

Submit the form and check MongoDB:

```bash
mongosh
use tuners_db
db.applications.find().pretty()
```

## API Endpoints

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /api/v1/applications | Public | Submit a new application |
| GET | /api/v1/applications | Admin | Get all applications |
| PATCH | /api/v1/applications/:id | Admin | Update application status |
| DELETE | /api/v1/applications/:id | Admin | Delete an application |

## GitHub

```bash
git init
git add .
git commit -m "Initial commit – Hussein backend + frontend"
git remote add origin <your-repo-url>
git push -u origin main
```

> ⚠️ `.env` is in `.gitignore` — never commit it. Share credentials privately with teammates.
