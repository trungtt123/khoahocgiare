# Video Streaming Website với Device Management

Website xem video với quản lý user theo số lượng thiết bị, tích hợp Abyss.to để lưu trữ video.

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Video.js
- Axios

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

### Video Hosting
- Abyss.to API

## Cấu trúc Project

```
website-account/
├── frontend/          # Next.js app
├── backend/           # Express API
├── docker-compose.yml # PostgreSQL database
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+ và npm
- Docker và Docker Compose
- Abyss.to account (để upload video)

### 1. Clone và cài đặt dependencies

```bash
# Cài đặt backend
cd backend
npm install

# Cài đặt frontend
cd ../frontend
npm install
```

### 2. Start PostgreSQL với Docker

```bash
# Từ root directory
docker-compose up -d

# Kiểm tra container đang chạy
docker ps
```

### 3. Setup Database

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Chạy migration để tạo tables
npx prisma migrate dev --name init

# (Optional) Mở Prisma Studio để xem database
npx prisma studio
```

### 4. Cấu hình Environment Variables

**Backend - Tạo file `.env` trong thư mục `backend/`:**

```bash
cd backend
cp .env.example .env
```

Sau đó chỉnh sửa `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/videodb"
JWT_SECRET="your-secret-key-change-this-in-production-min-32-chars"
ABYSS_API_KEY="your-abyss-api-key-optional"
MAX_DEVICES=3
PORT=3001
NODE_ENV=development
```

**Frontend - Tạo file `.env.local` trong thư mục `frontend/`:**

```bash
cd frontend
cp .env.local.example .env.local
```

Sau đó chỉnh sửa `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5. Chạy Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Backend sẽ chạy tại: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

### 6. Sử dụng

1. Mở http://localhost:3000
2. Đăng ký tài khoản mới hoặc đăng nhập
3. Upload video:
   - Vào Abyss.to và upload video của bạn
   - Copy embed code (format: `https://abyss.to/e/xxxxx`)
   - Paste vào form "Upload Video" trong dashboard
4. Xem video và quản lý devices

## Tính năng

- ✅ User authentication (Login/Register)
- ✅ Device management (giới hạn số thiết bị)
- ✅ Video upload qua Abyss.to API
- ✅ Video player với embed code
- ✅ Device tracking và management
- ✅ Dashboard quản lý videos

## API Endpoints

### Auth
- `POST /api/auth/register` - Đăng ký user
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Devices
- `POST /api/devices/check` - Check và register device
- `GET /api/devices` - Lấy danh sách devices
- `DELETE /api/devices/:id` - Xóa device

### Videos
- `POST /api/videos` - Upload video lên Abyss.to
- `GET /api/videos` - Lấy danh sách videos
- `GET /api/videos/:id` - Lấy video detail
- `DELETE /api/videos/:id` - Xóa video

## Lưu ý

- Cần có Abyss.to API key để upload video
- MAX_DEVICES mặc định là 3 thiết bị
- Database sẽ tự động cleanup devices cũ khi vượt giới hạn

