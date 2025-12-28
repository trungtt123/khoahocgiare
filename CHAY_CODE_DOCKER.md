# 🚀 Hướng dẫn chạy code với Docker

## Bước 1: Khởi động Docker Desktop

1. **Mở Docker Desktop** từ Start Menu
2. **Đợi Docker khởi động** (icon Docker ở system tray sẽ hiển thị "Docker Desktop is running")
3. **Mở terminal mới** (quan trọng! để Docker được nhận diện)

---

## Bước 2: Khởi động PostgreSQL với Docker

Trong terminal mới (từ root directory):
```powershell
docker-compose up -d
```

Hoặc nếu lỗi, thử:
```powershell
docker compose up -d
```

✅ Bạn sẽ thấy:
```
Creating network "website-account_default" ... done
Creating videodb ... done
```

**Kiểm tra database đã chạy:**
```powershell
docker ps
```

Bạn sẽ thấy container `videodb` đang chạy.

---

## Bước 3: Cài đặt Dependencies

Mở **2 terminal windows mới**:

### Terminal 1 - Backend
```powershell
cd backend
npm install
```

### Terminal 2 - Frontend
```powershell
cd frontend
npm install
```

⏳ Đợi cài đặt xong (2-5 phút)

---

## Bước 4: Setup Database Schema

Trong **Terminal 1** (backend):
```powershell
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

Khi hỏi "Enter a name for the new migration:", nhấn **Enter**.

✅ Database tables đã được tạo!

---

## Bước 5: Kiểm tra file .env

Đảm bảo file `backend/.env` có nội dung:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/videodb"
JWT_SECRET="my-super-secret-jwt-key-change-this-in-production-123456789"
ABYSS_API_KEY=""
MAX_DEVICES=3
PORT=3001
NODE_ENV=development
```

---

## Bước 6: Chạy Backend Server

Trong **Terminal 1**:
```powershell
cd backend
npm run dev
```

✅ Bạn sẽ thấy:
```
🚀 Server running on http://localhost:3001
```

**Giữ terminal này mở!**

---

## Bước 7: Chạy Frontend Server

Trong **Terminal 2**:
```powershell
cd frontend
npm run dev
```

✅ Bạn sẽ thấy:
```
- ready started server on 0.0.0.0:3000
- Local:        http://localhost:3000
```

**Giữ terminal này mở!**

---

## Bước 8: Mở trình duyệt

Truy cập: **http://localhost:3000**

### Lần đầu sử dụng:
1. Click **"Don't have an account? Sign up"**
2. Nhập username và password (tối thiểu 6 ký tự)
3. Click **"Sign up"**
4. Tự động chuyển đến Dashboard

---

## ✅ Kiểm tra mọi thứ hoạt động:

1. ✅ Docker Desktop đang chạy
2. ✅ Database container chạy: `docker ps`
3. ✅ Backend chạy tại: http://localhost:3001
4. ✅ Frontend chạy tại: http://localhost:3000
5. ✅ Có thể đăng ký/đăng nhập

---

## 🔧 Troubleshooting

### Lỗi: "docker: command not found"
- **Giải pháp:** 
  1. Đảm bảo Docker Desktop đang chạy
  2. **Đóng và mở lại terminal/PowerShell mới**
  3. Hoặc restart máy

### Lỗi: "Cannot connect to Docker daemon"
- **Giải pháp:**
  1. Mở Docker Desktop
  2. Đợi Docker khởi động hoàn toàn
  3. Thử lại lệnh `docker ps`

### Lỗi: "Port 5432 already in use"
- **Giải pháp:**
```powershell
# Tìm process đang dùng port 5432
netstat -ano | findstr :5432

# Kill process (thay PID)
taskkill /PID <PID> /F

# Hoặc đổi port trong docker-compose.yml
```

### Lỗi: "Database connection"
```powershell
# Kiểm tra container
docker ps

# Xem logs
docker-compose logs postgres

# Restart database
docker-compose restart
```

### Lỗi: "Prisma Client not generated"
```powershell
cd backend
npx prisma generate
```

### Xem database với Prisma Studio:
```powershell
cd backend
npx prisma studio
```
Mở trình duyệt tại: http://localhost:5555

---

## 📝 Lưu ý:

- **Docker Desktop phải chạy** trước khi chạy `docker-compose`
- **Giữ 2 terminal mở** khi đang chạy (backend và frontend)
- **Database chạy trong Docker**, không cần cài PostgreSQL trên máy
- **Hot reload** tự động khi sửa code

---

## 🎉 Xong rồi!

Bây giờ bạn có thể:
- ✅ Đăng ký/Đăng nhập user
- ✅ Upload video (qua Abyss.to)
- ✅ Xem video
- ✅ Quản lý devices

Chúc bạn code vui vẻ! 🚀
