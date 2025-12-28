# 🚀 Hướng dẫn chạy code (Dùng SQLite - Không cần Docker)

## ✅ Đã đổi sang SQLite - Không cần cài PostgreSQL hay Docker!

---

## Bước 1: Cài đặt Dependencies

Mở **2 terminal windows**:

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

## Bước 2: Setup Database (SQLite - Tự động tạo file)

Trong **Terminal 1** (backend):
```powershell
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

Khi hỏi "Enter a name for the new migration:", nhấn **Enter**.

✅ Database file sẽ được tạo tại: `backend/prisma/dev.db`

---

## Bước 3: Chạy Backend Server

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

## Bước 4: Chạy Frontend Server

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

## Bước 5: Mở trình duyệt

Truy cập: **http://localhost:3000**

### Lần đầu:
1. Click **"Don't have an account? Sign up"**
2. Nhập username và password (tối thiểu 6 ký tự)
3. Click **"Sign up"**
4. Tự động vào Dashboard

---

## ✅ Xong rồi!

Bây giờ bạn có thể:
- ✅ Đăng ký/Đăng nhập
- ✅ Upload video (qua Abyss.to)
- ✅ Xem video
- ✅ Quản lý devices

---

## 🔧 Troubleshooting

### Lỗi: "Cannot find module"
```powershell
cd backend  # hoặc cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Lỗi: "Prisma Client not generated"
```powershell
cd backend
npx prisma generate
```

### Lỗi: Database migration
```powershell
cd backend
npx prisma migrate reset  # Xóa database và tạo lại
npx prisma migrate dev --name init
```

### Xem database:
```powershell
cd backend
npx prisma studio
```
Mở trình duyệt tại: http://localhost:5555

---

## 📝 Lưu ý:

- **SQLite database** nằm tại: `backend/prisma/dev.db`
- **Không cần Docker** hay PostgreSQL
- **Giữ 2 terminal mở** khi đang chạy
- **Hot reload** tự động khi sửa code

---

Chúc bạn code vui vẻ! 🚀

