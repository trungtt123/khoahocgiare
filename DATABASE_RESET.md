# Database Reset Guide

## Overview
Script này dùng để xóa toàn bộ dữ liệu trong database và khởi tạo lại tài khoản admin từ đầu.

## Commands

### 1. Reset Database (Clear all data & create admin)
```bash
cd backend
npm run reset
```

### 2. Generate Prisma Client (Fix TypeScript errors)
```bash
cd backend
npm run prisma:generate
```

### 3. Seed Data (Create sample data)
```bash
cd backend
npm run seed
```

## What Reset Script Does

### 🗑️ Delete All Data
- Xóa tất cả devices
- Xóa tất cả videos  
- Xóa tất cả users

### 👤 Create Default Accounts

#### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** `admin`
- **Max Devices:** `999` (unlimited)

#### Sample User Account
- **Username:** `user1`
- **Password:** `password123`
- **Role:** `user`
- **Max Devices:** `3`

## When to Use Reset

### ✅ Use Reset When:
- Database bị corrupted
- Cần test với data sạch
- Quên admin password
- Cần reset device limits
- Testing device management

### ⚠️ Warning
- **ALL DATA WILL BE LOST**
- Videos, users, devices sẽ bị xóa hoàn toàn
- Chỉ dùng khi thực sự cần thiết

## After Reset

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Test Admin Login
- URL: `http://localhost:3000/admin`
- Username: `admin`
- Password: `admin123`

### 3. Test User Login
- URL: `http://localhost:3000/login`
- Username: `user1`
- Password: `password123`

## Manual Reset Steps

Nếu npm script không hoạt động, chạy thủ công:

```bash
cd backend

# 1. Generate Prisma Client
npx prisma generate

# 2. Run Reset Script
npx ts-node src/reset.ts
```

## Troubleshooting

### TypeScript Errors
```bash
npm run prisma:generate
```

### Database Connection Issues
```bash
# Check if database file exists
ls backend/prisma/dev.db

# Recreate database
npx prisma migrate dev --name init
```

### Permission Issues
```bash
# On Windows (run as Administrator)
# On macOS/Linux (use sudo)
sudo npm run reset
```

## File Locations

### Reset Script
```
backend/src/reset.ts
```

### Database File
```
backend/prisma/dev.db
```

### Package.json Scripts
```json
{
  "scripts": {
    "reset": "ts-node src/reset.ts",
    "seed": "ts-node src/seed.ts",
    "prisma:generate": "prisma generate"
  }
}
```

## Security Notes

- Default passwords chỉ dành cho development
- Production hãy đổi passwords ngay sau reset
- Admin unlimited devices cho debugging convenience
- User devices limited để test security features
