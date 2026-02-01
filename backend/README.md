# Backend (Flask + MongoDB Atlas)

This folder contains a minimal Flask backend that connects to MongoDB Atlas and exposes two endpoints:

- GET `/user-info` — returns saved users (email, created_at)
- POST `/user-info` — accepts JSON { email, password } and stores a user (password is stored hashed)

Quick start (Windows PowerShell):

1. Copy `.env.example` to `.env` and set `MONGO_URI` to your MongoDB Atlas connection string.
2. python -m venv venv
3. venv\Scripts\Activate.ps1
4. pip install -r requirements.txt
5. python app.py

The server listens on port 5000 by default. CORS is enabled for `http://localhost:4200` (the Angular dev server).
