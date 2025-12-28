# Hướng dẫn Setup Chi tiết

## Bước 1: Cài đặt Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Bước 2: Setup Database

### Khởi động PostgreSQL với Docker
```bash
# Từ root directory
docker-compose up -d
```

### Kiểm tra database đã chạy
```bash
docker ps
# Bạn sẽ thấy container 'videodb' đang chạy
```

### Tạo database schema
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

## Bước 3: Cấu hình Environment

### Backend (.env)
Tạo file `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/videodb"
JWT_SECRET="your-very-secret-key-minimum-32-characters-long"
ABYSS_API_KEY=""  # Optional, nếu có API key từ Abyss.to
MAX_DEVICES=3
PORT=3001
NODE_ENV=development
```

**Lưu ý:** 
- `JWT_SECRET`: Nên dùng string dài và random, ví dụ: `openssl rand -hex 32`
- `ABYSS_API_KEY`: Không bắt buộc, có thể để trống nếu user tự upload lên Abyss.to

### Frontend (.env.local)
Tạo file `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Bước 4: Chạy ứng dụng

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Bạn sẽ thấy:
```
🚀 Server running on http://localhost:3001
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Bạn sẽ thấy:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

## Bước 5: Truy cập ứng dụng

1. Mở trình duyệt: http://localhost:3000
2. Đăng ký tài khoản mới
3. Đăng nhập và bắt đầu sử dụng

## Troubleshooting

### Database connection error
```bash
# Kiểm tra Docker container
docker ps

# Xem logs
docker-compose logs postgres

# Restart container
docker-compose restart
```

### Port already in use
- Backend (3001): Đổi `PORT` trong `backend/.env`
- Frontend (3000): Đổi port trong `frontend/package.json` script: `"dev": "next dev -p 3001"`

### Prisma errors
```bash
cd backend
npx prisma generate
npx prisma migrate reset  # Warning: Xóa toàn bộ data
```

### Module not found
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

## Cấu trúc Database

Sau khi chạy migration, bạn sẽ có 3 tables:
- `users`: Thông tin user
- `devices`: Thiết bị đã đăng ký
- `videos`: Videos đã upload

Xem database bằng Prisma Studio:
```bash
cd backend
npx prisma studio
```

## Production Deployment

Khi deploy lên production:
1. Đổi `JWT_SECRET` thành secret mạnh
2. Đổi `DATABASE_URL` thành production database
3. Set `NODE_ENV=production`
4. Build frontend: `cd frontend && npm run build`
5. Build backend: `cd backend && npm run build`

