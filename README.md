# 🚀 Social Sync Engine API

Backend API for a social networking platform that allows users to create posts, upload images, interact through likes and comments, and manage user profiles.

## ✨ Features

### 🔐 Authentication & Authorization

- User Registration
- User Login
- JWT Authentication
- HTTP-Only Cookie Support
- Protected Routes

### 👤 User Management

- View User Profile
- Update User Profile
- View Public Profiles
- Search Users by Username

### 📝 Posts

- Create Posts with Caption
- Upload Images using ImageKit
- Delete Posts
- Fetch User Posts
- Fetch Feed Posts

### ❤️ Engagement

- Like / Unlike Posts
- Add Comments
- Fetch Comments

### ☁️ Media Upload

- Image Upload using ImageKit
- Cloud-Based Storage
- Optimized Image Delivery

### 🚧 Upcoming Features

- Follow / Unfollow Users
- Notifications
- Personalized Feed

---

## 🛠️ Tech Stack

### Backend

- Node.js
- Express.js
- TypeScript

### Database

- MongoDB
- Mongoose

### Authentication

- JWT
- HTTP-Only Cookies
- bcrypt

### Media Storage

- ImageKit

---

## 📂 Project Structure

```bash
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
└── index.ts
```

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_url_endpoint
```

## 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/your-username/social-sync-engine-api.git
```

Navigate to the project directory:

```bash
cd social-sync-engine-api
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

---

## 📡 API Endpoints

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Users

```http
GET    /api/users/:username
PATCH  /api/users/profile
GET    /api/users/search
```

### Posts

```http
POST    /api/posts
GET     /api/posts
DELETE  /api/posts/:id
```

### Likes

```http
POST /api/posts/:id/like
```

### Comments

```http
POST /api/posts/:id/comments
GET  /api/posts/:id/comments
```

---

## 🔒 Security Features

- JWT Authentication
- Password Hashing with bcrypt
- Protected Routes
- HTTP-Only Cookies
- Input Validation
- CORS Configuration

---

## 🎯 Learning Outcomes

- REST API Development
- Authentication & Authorization
- MongoDB Data Modeling
- Middleware Implementation
- Cloud Media Storage Integration
- API Security Best Practices

---

## 📄 License

This project is licensed under the MIT License.
