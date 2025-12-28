# Hướng dẫn cài đặt Database

## Option 1: Dùng Docker (Khuyến nghị - Không cần cài PostgreSQL)

### Bước 1: Cài Docker Desktop

1. **Download Docker Desktop cho Windows:**
   - Truy cập: https://www.docker.com/products/docker-desktop/
   - Hoặc: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

2. **Cài đặt:**
   - Chạy file installer
   - Chọn "Use WSL 2 instead of Hyper-V" (nếu có)
   - Restart máy nếu được yêu cầu

3. **Khởi động Docker Desktop:**
   - Mở Docker Desktop từ Start Menu
   - Đợi Docker khởi động (icon Docker ở system tray)

4. **Kiểm tra:**
   ```powershell
   docker --version
   docker-compose --version
   ```

### Bước 2: Chạy Database với Docker

```powershell
# Từ root directory
docker-compose up -d
```

✅ Xong! PostgreSQL đã chạy trong Docker, không cần cài trên máy.

---

## Option 2: Dùng SQLite (Đơn giản hơn - Không cần Docker)

Nếu bạn không muốn cài Docker, có thể đổi sang SQLite (file database).

### Bước 1: Đổi Prisma schema sang SQLite

Sửa file `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"      // Đổi từ "postgresql"
  url      = "file:./dev.db"  // Đổi từ env("DATABASE_URL")
}
```

### Bước 2: Update .env

Sửa `backend/.env`:
```env
# Không cần DATABASE_URL nữa
JWT_SECRET="my-super-secret-jwt-key-change-this-in-production-123456789"
ABYSS_API_KEY=""
MAX_DEVICES=3
PORT=3001
NODE_ENV=development
```

### Bước 3: Chạy migration

```powershell
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

✅ Xong! Database sẽ là file `backend/prisma/dev.db`

---

## So sánh:

| | Docker + PostgreSQL | SQLite |
|---|---|---|
| **Cài đặt** | Cần cài Docker Desktop | Không cần gì |
| **Phức tạp** | Phức tạp hơn | Đơn giản |
| **Hiệu năng** | Tốt cho production | Đủ cho dev |
| **1000 users** | ✅ Tốt | ⚠️ Có thể chậm |

---

## Khuyến nghị:

- **Nếu chỉ dev/test:** Dùng SQLite (Option 2) - nhanh, đơn giản
- **Nếu muốn giống production:** Dùng Docker + PostgreSQL (Option 1)

Bạn muốn dùng cách nào?

