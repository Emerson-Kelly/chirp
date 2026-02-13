# Full Stack Social Media App

A minimalist full-stack social media application inspired by modern platforms. Users can create accounts, follow others, share posts with images, and interact through likes and comments.

This project demonstrates full-stack development skills including authentication, relational database modeling, RESTful API design, protected routes, and modern UI implementation.

---

## Project Overview

The application follows a Jamstack-inspired architecture, separating business logic and presentation logic within a monorepo structure:

/chirp
/client → React SPA (Frontend)
/server → Node.js + Express + PostgreSQL API (Backend)

---

## Core Features

### Authentication & Authorization
- User authentication via Passport Local Strategy
- JWT-based authorization (JSON Web Tokens)
- Hashed passwords using Bcrypt
- Protected routes (feed, profile, follow actions, create post, etc.)

---

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Passport.js
- JSON Web Tokens (JWT)
- Bcryptjs
- Express Validator
- Multer (file uploads)
- Faker (seed data)
- Supertest (route/controller tests)
- Dotenv
- ES6 Modules

### Frontend
- React (SPA)
- Tailwind CSS
- ShadcnUI

### Utilities & Services
- Supabase (image storage)
- Prisma Studio (schema visualization)
