# Hướng dẫn chạy code nhanh

## Bước 1: Cài đặt Dependencies

Mở 2 terminal windows:

### Terminal 1 - Backend
```bash
cd backend
npm install
```

### Terminal 2 - Frontend  
```bash
cd frontend
npm install
```

## Bước 2: Khởi động Database

Trong terminal mới hoặc Terminal 1:
```bash
# Từ root directory (d:\TOOL\website-account)
docker-compose up -d
```

Kiểm tra database đã chạy:
```bash
docker ps
```

## Bước 3: Setup Database Schema

Trong Terminal 1 (backend):
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

## Bước 4: Tạo file .env

### Backend
Tạo file `backend/.env` (copy từ .env.example):
```bash
cd backend
copy .env.example .env
```

Sau đó mở file `.env` và chỉnh sửa:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/videodb"
JWT_SECRET="my-super-secret-jwt-key-change-this-123456789"
ABYSS_API_KEY=""
MAX_DEVICES=3
PORT=3001
NODE_ENV=development
```

**Lưu ý:** Đổi `JWT_SECRET` thành một chuỗi bất kỳ (nên dài hơn 32 ký tự)

### Frontend
Tạo file `frontend/.env.local`:
```bash
cd frontend
copy .env.local.example .env.local
```

File `.env.local` sẽ có nội dung:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Bước 5: Chạy Backend

Trong Terminal 1:
```bash
cd backend
npm run dev
```

Bạn sẽ thấy:
```
🚀 Server running on http://localhost:3001
```

## Bước 6: Chạy Frontend

Trong Terminal 2:
```bash
cd frontend
npm run dev
```

Bạn sẽ thấy:
```
- ready started server on 0.0.0.0:3000
```

## Bước 7: Mở trình duyệt

Truy cập: **http://localhost:3000**

1. Đăng ký tài khoản mới
2. Đăng nhập
3. Bắt đầu sử dụng!

## Troubleshooting

### Lỗi: Cannot find module
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: Database connection
```bash
# Kiểm tra Docker
docker ps
docker-compose logs postgres

# Restart database
docker-compose restart
```

### Lỗi: Port already in use
- Port 3001 (backend): Đổi PORT trong `backend/.env`
- Port 3000 (frontend): Đổi trong `frontend/package.json` script

### Lỗi: Prisma
```bash
cd backend
npx prisma generate
npx prisma migrate reset  # Warning: Xóa data
```

