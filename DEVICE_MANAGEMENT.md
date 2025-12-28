# Quản lý Devices theo User

## Tổng quan
Hệ thống đã được cập nhật để quản lý devices theo từng user với giới hạn số devices cho mỗi user.

## Tính năng mới

### 1. Giới hạn Devices theo User
- Mỗi user có giới hạn số devices tối đa (maxDevices)
- Admin có thể đặt maxDevices khi tạo user
- Default: 3 devices cho user thường
- Admin: 10 devices

### 2. Quản lý Devices trong Admin Panel
- Admin có thể xem devices của bất kỳ user nào
- Hiển thị thông tin chi tiết của từng device
- Có thể xóa devices của user
- Hiển thị cảnh warning khi user vượt quá giới hạn

### 3. Interface Quản lý Devices
- **User Selector**: Chọn user để xem devices
- **User Info**: Hiển thị thông tin user và giới hạn devices
- **Device List**: Danh sách devices của user được chọn
- **Device Details**: Fingerprint, browser, last active, created date
- **Delete Function**: Xóa devices không cần thiết

## Hướng dẫn sử dụng

### Đối với Admin

#### 1. Tạo User với Giới hạn Devices
1. Vào `/admin` → Tab "Users" → "Create User"
2. Điền thông tin:
   - Username: Tên đăng nhập
   - Password: Mật khẩu (ít nhất 6 ký tự)
   - Role: User hoặc Admin
   - **Max Devices**: Số devices tối đa (1-10)
3. Click "Create User"

#### 2. Xem Devices của User
1. Vào `/admin` → Tab "Devices"
2. Chọn user từ dropdown
3. Xem thông tin:
   - Username và role của user
   - Max devices được phép
   - Current devices hiện tại
   - Cảnh báo nếu vượt quá giới hạn

#### 3. Quản lý Devices
1. Trong danh sách devices:
   - Xem thông tin chi tiết (fingerprint, browser, etc.)
   - Click "Delete" để xóa device
   - Xác nhận xóa trong dialog

#### 4. Monitor Giới hạn Devices
- System tự động kiểm tra giới hạn khi user đăng nhập
- Nếu vượt quá giới hạn, device cũ nhất sẽ bị xóa
- Hiển thị warning color trong admin interface

### Đối với User

#### 1. Giới hạn Devices
- Mỗi user chỉ được đăng nhập trên số devices tối đa
- Giới hạn được admin thiết lập khi tạo tài khoản
- Mặc định: 3 devices

#### 2. Device Tracking
- Mỗi lần đăng nhập trên device mới sẽ được ghi nhận
- Device thông tin: browser, OS, screen resolution, etc.
- Device cũ nhất sẽ bị xóa nếu vượt quá giới hạn

## Technical Details

### Database Schema
```sql
-- User table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user',
  maxDevices INTEGER DEFAULT 3,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Device table
CREATE TABLE devices (
  id INTEGER PRIMARY KEY,
  userId INTEGER,
  fingerprint TEXT,
  deviceInfo TEXT,
  lastActive DATETIME DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### API Endpoints
- `POST /api/devices/check` - Kiểm tra và tạo device
- `GET /api/devices/user/:userId` - Lấy devices theo user (admin)
- `GET /api/devices` - Lấy devices của user hiện tại
- `DELETE /api/devices/:id` - Xóa device

### Security Features
- Admin có thể xem devices của bất kỳ user nào
- User chỉ có thể xem devices của chính mình
- Giới hạn devices được thực hiện server-side
- Device fingerprinting để track devices

## Troubleshooting

### Common Issues
1. **User không thể đăng nhập trên nhiều devices**
   - Kiểm tra maxDevices setting của user
   - Admin cần tăng giới hạn trong user management

2. **Device không được ghi nhận**
   - Kiểm tra browser blocking device info
   - Verify API endpoint đang hoạt động

3. **Warning trong admin interface**
   - User hiện tại vượt quá maxDevices
   - Cần xóa devices cũ hoặc tăng giới hạn

### Best Practices
1. **Set appropriate limits**:
   - User thường: 3-5 devices
   - Power user: 5-10 devices
   - Admin: 10+ devices

2. **Monitor device usage**:
   - Regular check trong admin panel
   - Xóa devices không hoạt động

3. **User education**:
   - Hướng dẫn user về device limits
   - Explain device tracking cho security

Hệ thống quản lý devices đã sẵn sàng để sử dụng!
