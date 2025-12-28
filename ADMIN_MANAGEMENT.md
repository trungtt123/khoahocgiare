# Quản lý Admin trong Database

## Tổng quan
Hệ thống đã được cập nhật để cho phép quản lý hoàn toàn tài khoản admin thông qua database và interface admin, không còn fix cứng trong code.

## Cách hoạt động

### 1. Admin khởi tạo
- Chỉ tạo admin đầu tiên khi database trống qua seed script
- Admin đầu tiên có thông tin:
  - Username: `admin`
  - Password: `admin123`
  - Role: `admin`

### 2. Quản lý admin qua interface
Sau khi có admin đầu tiên, tất cả các tài khoản (bao gồm admin) được quản lý hoàn toàn qua interface tại `/admin`:

#### Tạo Admin mới
1. Đăng nhập vào `/admin` với tài khoản admin hiện tại
2. Vào tab "Users" → "Create User"
3. Điền thông tin và chọn Role là "admin"
4. Click "Create User"

#### Chỉnh sửa Role Admin
1. Trong tab "Users", tìm admin muốn sửa
2. Click "Edit Role"
3. Chọn role mới (user/admin)
4. Click "Save"

#### Xóa Admin
1. Trong tab "Users", tìm admin muốn xóa
2. Click "Delete"
3. Xác nhận xóa

### 3. Quyền hạn
- **Admin có thể:**
  - Tạo user/admin mới
  - Thay đổi role của user/admin khác
  - Xóa user/admin khác
  - Không thể thay đổi role của chính mình
  - Không thể xóa chính mình

- **User có thể:**
  - Đăng nhập và xem video tại `/`
  - Không thể truy cập trang admin

### 4. Security
- Mọi admin được lưu trong database như user bình thường
- Không có admin nào được fix cứng trong code
- Seed script chỉ chạy khi database trống
- Authentication dựa trên JWT token với role

## Hướng dẫn sử dụng

### Khởi động hệ thống
```bash
# Backend
cd backend
npm run dev

# Frontend  
cd frontend
npm run dev
```

### Truy cập
- Frontend: http://localhost:3002
- Backend API: http://localhost:3001

### Tạo admin đầu tiên
Nếu database trống, chạy seed script:
```bash
cd backend
npm run seed
```

### Quản lý admin
1. Đăng nhập với admin/admin123
2. Truy cập http://localhost:3002/admin
3. Vào tab "Users" để quản lý tất cả tài khoản

### Lưu ý quan trọng
- Luôn có ít nhất một admin trong hệ thống
- Khi xóa admin, đảm bảo còn admin khác để quản lý
- Admin mới được tạo sẽ có toàn quyền quản lý như admin cũ
- Hệ thống phân quyền hoàn toàn dựa trên role trong database
