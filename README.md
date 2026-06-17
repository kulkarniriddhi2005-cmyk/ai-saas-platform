# QuickAI – AI SaaS Platform

QuickAI is a full-stack AI-powered SaaS application built with React, Vite, Node.js, Express, MongoDB, and Google Gemini AI. The platform provides multiple AI tools including content generation, resume analysis, text summarization, email generation, image generation, background removal, and object removal.

## Features

* Secure User Authentication (JWT)
* AI Article Generator
* AI Resume Analyzer
* AI Text Summarizer
* AI Title Generator
* AI Email Generator
* AI Image Generator
* Background Remover
* Object Removal Tool
* Responsive User Interface
* MongoDB Database Integration

## Tech Stack

### Frontend

* React.js
* Vite
* CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas

### AI Services

* Google Gemini API
* Remove.bg API

## Screenshots

### Application Preview

![Screenshot 1](screenshots/Screenshot%202026-06-17%20130739.png)

![Screenshot 2](screenshots/Screenshot%202026-06-17%20130801.png)

## Prerequisites

* Node.js 18+
* MongoDB (Local or Atlas)
* Google AI Studio API Key

## Installation

```bash
cd ai-saas-project
npm run install:all
```

### Environment Variables

Create:

* `server/.env`
* `client/.env`

Configure:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

Optional:

```env
REMOVEBG_API_KEY=your_removebg_api_key
```

## Running the Project

```bash
npm run dev
```

### Local URLs

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5001
```

## API Endpoints

| Method | Endpoint              |
| ------ | --------------------- |
| POST   | /api/auth/register    |
| POST   | /api/auth/login       |
| GET    | /api/auth/me          |
| POST   | /api/ai/article       |
| POST   | /api/ai/resume        |
| POST   | /api/ai/summary       |
| POST   | /api/ai/titles        |
| POST   | /api/ai/email         |
| POST   | /api/ai/image         |
| POST   | /api/ai/bg-remove     |
| POST   | /api/ai/remove-object |

## Production Build

```bash
npm run build
```

Deploy the frontend and backend separately using services such as Render and connect MongoDB Atlas for database storage.

## Author

Riddhi Kulkarni
