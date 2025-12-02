# Nest.js Backend API

This is a simple backend API I built for a technical assessment. It handles user authentication and basic CRUD operations for users.

## What it does

- Users can register and login
- After login, you get a JWT token
- You can create, read, update and delete users (need token for this)
- Passwords are hashed before saving to database

## Tech used

- Nest.js (TypeScript framework)
- PostgreSQL (database)
- TypeORM (for database operations)
- JWT for authentication
- bcrypt for password hashing
- Jest for testing

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Database setup

You need PostgreSQL installed and running. Create a database (I named mine `code_inbound`).

### 3. Environment variables

Create a `.env` file in the root folder:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=code_inbound

JWT_SECRET=someSecretKey
JWT_EXPIRES_IN=3600

PORT=3000
```

Make sure to replace `your_password` with your actual postgres password. The JWT_SECRET can be any random string.

### 4. Run the app

```bash
npm run start:dev
```

Server should start on `http://localhost:3000`

## API Endpoints

### Auth endpoints (no token needed)

#### Register
- POST `/auth/register`
- Body:
```json
{
  "name": "Pradhyum",
  "email": "png@gmail.com",
  "password": "pradhyum@123"
}
```

#### Login
- POST `/auth/login`
- Body:
```json
{
  "email": "png@gmail.com",
  "password": "pradhyum@123"
}
```
- Returns a token, save it for protected routes

### User endpoints (need token)

Add this header for all user endpoints:
```
Authorization: Bearer <your_token>
```

- POST `/users` - Create user
- GET `/users` - Get all users
- GET `/users/:id` - Get one user
- PATCH `/users/:id` - Update user
- DELETE `/users/:id` - Delete user

## Response format

Success responses look like:
```json
{
  "status": true,
  "message": "User created successfully",
  "data": {  }
}
```

Error responses:
```json
{
  "status": false,
  "message": "Email already in use"
}
```

## Testing

Run unit tests:
```bash
npm test
```

Run e2e tests (needs database):
```bash
npm run test:e2e
```

## Notes

- Passwords are hashed with bcrypt, never returned in responses
- All user routes are protected with JWT guard
- Uses TypeORM synchronize for dev (creates tables automatically)
- Error handling uses Nest built-in exceptions

## Testing with Postman

1. Register a user at POST `/auth/register`
2. Login at POST `/auth/login` and copy the token
3. Use the token in Authorization header for `/users` endpoints

