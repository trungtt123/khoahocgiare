# Hướng dẫn Quản lý User và Devices

## Tổng quan
Hệ thống đã được cập nhật để quản lý user và devices một cách hiệu quả:
- **Admin** tạo user và quản lý thông qua admin panel
- **User** chỉ có thể đăng nhập và xem video
- **Device Management** tự động kiểm tra và giới hạn devices

## 1. Admin Management

### Truy cập Admin Panel
1. Đăng nhập với tài khoản admin
2. Truy cập `/admin`
3. Navigate đến tab "Users"

### Tạo User mới
1. Click "Create User" button
2. Điền thông tin:
   - **Username**: Tên đăng nhập
   - **Password**: Mật khẩu (tối thiểu 6 ký tự)
   - **Role**: Chọn "user" hoặc "admin"
   - **Max Devices**: Số thiết bị tối đa (1-10)
3. Click "Create User"

### Quản lý User
- **Edit Role**: Thay đổi quyền user/admin
- **Edit Max Devices**: Chỉnh sửa số thiết bị tối đa
- **View Devices**: Xem danh sách devices của user
- **Delete**: Xóa user (không thể xóa chính mình)

## 2. Device Management

### User Login và Device Check
Khi user đăng nhập, hệ thống sẽ:
1. **Kiểm tra device** hiện tại
2. **Ghi nhận device mới** nếu chưa đạt giới hạn
3. **Từ chối** nếu đã vượt quá giới hạn devices
4. **Auto-cleanup** device cũ nhất khi cần thiết

### Device Information
Mỗi device được ghi nhận với thông tin:
- **Fingerprint**: Unique identifier
- **Platform**: Hệ điều hành (Windows, Mac, Linux)
- **Browser**: Thông tin trình duyệt
- **Screen Resolution**: Độ phân giải màn hình
- **Language**: Ngôn ngữ browser
- **Timezone**: Múi giờ của user
- **Last Active**: Thời gian hoạt động cuối
- **Created**: Thời gian tạo device

### Xem Devices theo User
1. Trong admin panel → Tab "Users"
2. Click "View Devices" của user muốn xem
3. Xem thông tin chi tiết và quản lý devices

### Xóa Device
1. Trong device list của user
2. Click "Delete" button
3. Xác nhận xóa device

## 3. Device Limits và Security

### Giới hạn Devices
- **Mỗi user** có giới hạn devices do admin set
- **Mặc định**: 3 devices per user
- **Admin có thể**: Chỉnh sửa limit 1-10 devices

### Auto-cleanup Logic
Khi user vượt quá giới hạn:
1. **Hệ thống tự động** xóa device cũ nhất
2. **Thêm device mới** vào database
3. **Cảnh báo admin** trong device list

### Security Features
- **Device fingerprinting** để nhận diện thiết bị
- **Rate limiting** cho login attempts
- **Auto-blocking** khi vượt quá device limit
- **Admin tracking** cho tất cả devices

## 4. User Workflow

### Đối với User
1. **Nhận tài khoản** từ admin
2. **Đăng nhập** tại `/login`
3. **System tự động** kiểm tra và ghi nhận device
4. **Xem video** tại trang chủ
5. **Contact admin** nếu cần thêm devices

### Đối với Admin
1. **Tạo user** với phù hợp roles và limits
2. **Monitor devices** qua admin panel
3. **Adjust limits** khi cần thiết
4. **Manage user access** và permissions

## 5. Error Handling

### User Login Errors
- **Invalid credentials**: Sai username/password
- **Device limit exceeded**: Đã đạt giới hạn thiết bị
- **Contact admin**: Vui lòng liên hệ quản trị viên

### Admin Actions
- **Cannot delete yourself**: Không thể xóa tài khoản admin hiện tại
- **Cannot demote yourself**: Không thể hạ cấp chính mình
- **Access denied**: Cần admin permissions

## 6. Best Practices

### Đối với Admin
1. **Set appropriate limits** cho từng user type
2. **Regular cleanup** devices không hoạt động
3. **Monitor login attempts** và suspicious activities
4. **User education** về device management

### Đối với User
1. **Use official devices** và browsers
2. **Logout properly** khi không sử dụng
3. **Contact admin** khi cần support
4. **Secure credentials** và không chia sẻ tài khoản

## 7. Technical Details

### Backend APIs
- `POST /api/auth/login` - User login với device check
- `GET /api/auth/users` - Lấy danh sách users (admin only)
- `POST /api/auth/users` - Tạo user mới (admin only)
- `PUT /api/auth/users/:id/maxDevices` - Cập nhật device limit
- `GET /api/devices/user/:id` - Lấy devices theo user
- `DELETE /api/devices/:id` - Xóa device

### Frontend Components
- `UserManagement.tsx` - Quản lý users và devices
- `LoginPage.tsx` - Login với device validation
- Admin panel với integrated device management

### Database Schema
```sql
User {
  id, username, password, role, maxDevices
  createdAt, updatedAt
}

Device {
  id, userId, fingerprint, deviceInfo
  lastActive, createdAt
}
```

## 8. Troubleshooting

### Common Issues
1. **Device not recognized**: Clear browser cache/cookies
2. **Login blocked**: Contact admin để reset devices
3. **Admin access**: Verify admin role và permissions
4. **Device limit**: Admin cần tăng limit hoặc cleanup devices

### Support
- **Admin panel** để quản lý trực tiếp
- **Device logs** để troubleshooting
- **User communication** qua các kênh khác
- **System monitoring** cho suspicious activities

Hệ thống đã được thiết kế để quản lý user và devices một cách an toàn và hiệu quả!
