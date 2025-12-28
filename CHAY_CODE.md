# 🚀 Hướng dẫn chạy code

## Bước 1: Cài đặt Dependencies

Mở **2 terminal windows** (hoặc PowerShell):

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

⏳ Đợi cài đặt xong (có thể mất 2-5 phút)

---

## Bước 2: Khởi động Database

Trong **Terminal mới** (hoặc Terminal 1 sau khi cài xong):
```powershell
# Từ root directory
docker-compose up -d
```

Kiểm tra database đã chạy:
```powershell
docker ps
```
Bạn sẽ thấy container `videodb` đang chạy.

---

## Bước 3: Setup Database Schema

Trong **Terminal 1** (backend):
```powershell
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

Khi hỏi "Enter a name for the new migration:", nhấn Enter để dùng tên mặc định.

---

## Bước 4: Chạy Backend Server

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

## Bước 5: Chạy Frontend Server

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

## Bước 6: Mở trình duyệt

Truy cập: **http://localhost:3000**

### Lần đầu sử dụng:
1. Click **"Don't have an account? Sign up"**
2. Nhập username và password (tối thiểu 6 ký tự)
3. Click **"Sign up"**
4. Tự động chuyển đến Dashboard

### Đăng nhập lại:
1. Nhập username và password
2. Click **"Sign in"**

---

## ✅ Kiểm tra mọi thứ hoạt động:

1. ✅ Backend chạy tại: http://localhost:3001
2. ✅ Frontend chạy tại: http://localhost:3000
3. ✅ Database chạy trong Docker
4. ✅ Có thể đăng ký/đăng nhập
5. ✅ Dashboard hiển thị

---

## 🔧 Troubleshooting

### Lỗi: "Cannot find module"
```powershell
# Xóa và cài lại
cd backend  # hoặc cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Lỗi: "Port 3001 already in use"
```powershell
# Tìm process đang dùng port 3001
netstat -ano | findstr :3001

# Kill process (thay PID bằng số bạn tìm được)
taskkill /PID <PID> /F
```

### Lỗi: "Database connection"
```powershell
# Kiểm tra Docker
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

### Lỗi: "Module not found" trong frontend
```powershell
cd frontend
npm install
```

---

## 📝 Lưu ý:

- **Giữ 2 terminal mở** khi đang chạy (backend và frontend)
- **Database** chạy trong Docker, không cần tắt
- **Hot reload**: Code tự động reload khi bạn sửa file
- **Logs**: Xem logs trong terminal để debug

---

## 🎉 Xong rồi!

Bây giờ bạn có thể:
- ✅ Đăng ký/Đăng nhập user
- ✅ Upload video (qua Abyss.to)
- ✅ Xem video
- ✅ Quản lý devices

Chúc bạn code vui vẻ! 🚀

