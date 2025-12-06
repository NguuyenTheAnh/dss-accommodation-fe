# Hướng dẫn sử dụng Giao diện Quản lý

## 🎯 Tổng quan

Hệ thống quản lý DormFinder bao gồm:
- **Đăng nhập Admin**: Xác thực người dùng quản trị
- **Quản lý phòng**: CRUD operations cho danh sách phòng
- **Form khảo sát**: Thu thập phản hồi từ sinh viên

## 🚀 Cấu trúc Routes

### Routes Sinh viên (Có Header)
- `/` - Trang chủ
- `/search` - Tìm kiếm phòng
- `/rooms/:id` - Chi tiết phòng

### Routes Quản trị (Không có Header, có Sidebar)
- `/management/login` - Đăng nhập admin
- `/management/rooms` - Quản lý phòng (Protected)
- `/management/survey` - Form khảo sát (Protected)

## 🔐 Xác thực

### Trang đăng nhập (`LoginPage.jsx`)
- **URL**: `/management/login`
- **Thông tin đăng nhập mặc định**:
  - Username: `admin`
  - Password: `admin123`
- **Lưu trữ**: `localStorage.setItem('isAdminLoggedIn', 'true')`
- **Chuyển hướng**: Sau khi đăng nhập → `/management/rooms`

### Protected Routes (`ProtectedRoute.jsx`)
- Kiểm tra `localStorage.getItem('isAdminLoggedIn')`
- Nếu chưa đăng nhập → Redirect về `/management/login`
- Bảo vệ tất cả routes `/management/*` (trừ login)

## 🎨 Giao diện Quản lý

### ManagementLayout
- **Không có Header** (khác với giao diện sinh viên)
- **Sidebar cố định** bên trái (260px)
- **Main content** với `margin-left: 260px`

### ManagementSidebar
#### Logo
- Biểu tượng 🏠 với animation bounce
- Text "DormFinder" với gradient xanh
- Subtitle "Quản trị"

#### Menu (2 mục)
1. **Quản lý phòng** (`/management/rooms`)
   - Icon: HomeOutlined
   - Active state: Background xanh + box-shadow

2. **Form khảo sát** (`/management/survey`)
   - Icon: FormOutlined
   - Active state: Background xanh + box-shadow

#### Logout Button
- Nằm ở footer sidebar
- Modal xác nhận trước khi đăng xuất
- Xóa localStorage và redirect về `/management/login`

## 📋 Trang Quản lý Phòng

### Features
- **Danh sách phòng**: Table với pagination
- **Thêm phòng mới**: Button "Thêm phòng mới" → Modal
- **Chỉnh sửa**: Button "Sửa" → Modal với dữ liệu đã điền
- **Xóa**: Button "Xóa" → Modal xác nhận

### Form Fields
- Tên phòng (required)
- Địa chỉ (required)
- Giá thuê (required, number format)
- Diện tích (required)
- Khoảng cách (required)
- Trạng thái (available/rented)

### TODO
- Kết nối API thực tế (đang dùng mock data)
- Implement: `createRoomApi()`, `updateRoomApi()`, `deleteRoomApi()`

## 📝 Trang Form Khảo Sát

### Sections

#### 1. Thông tin cá nhân
- Họ và tên (required)
- Email (required, validation)
- Số điện thoại (required, 10 digits)
- Trường đang học (required)

#### 2. Nhu cầu tìm phòng
- Khoảng giá mong muốn (select)
- Diện tích mong muốn (select)
- Khoảng cách tối đa (select)
- Tiện ích quan trọng (multi-select)

#### 3. Đánh giá
- Mức độ hài lòng (Rate 1-5 stars với custom icons)
- Góp ý/Đề xuất (textarea)

### TODO
- Kết nối API: `submitSurveyApi(values)`
- Lưu dữ liệu khảo sát vào database

## 🎨 Theme & Styling

### Màu sắc nhất quán
- Primary: `#0DB14B`
- Dark: `#0A7A36`
- Gradient: `linear-gradient(135deg, #0DB14B 0%, #0A7A36 100%)`

### Sidebar Theme
- Background: Dark gradient (`#0A1F15` → `#0D2A1C`)
- Active item: Primary green với box-shadow
- Hover: Semi-transparent green

### Responsive
- Desktop: Sidebar cố định 260px
- Mobile: Sidebar drawer từ trái
- Mobile toggle button: Fixed top-left
- Overlay khi mở mobile menu

## 📂 Cấu trúc Files

```
src/
├── components/
│   ├── ManagementLayout.jsx      # Layout wrapper
│   ├── ManagementLayout.css
│   ├── ManagementSidebar.jsx     # Sidebar với logo + menu
│   ├── ManagementSidebar.css
│   └── ProtectedRoute.jsx        # Auth wrapper
├── pages/
│   ├── LoginPage.jsx             # Đăng nhập admin
│   ├── LoginPage.css
│   ├── RoomManagementPage.jsx    # CRUD phòng
│   ├── RoomManagementPage.css
│   ├── SurveyFormPage.jsx        # Form khảo sát
│   └── SurveyFormPage.css
└── main.jsx                      # Routes config
```

## 🔄 Luồng hoạt động

1. **Truy cập**: User vào `/management/rooms`
2. **Kiểm tra auth**: ProtectedRoute check localStorage
3. **Redirect nếu cần**: Chưa login → `/management/login`
4. **Đăng nhập**: Nhập username/password → localStorage
5. **Truy cập admin**: Vào ManagementLayout với sidebar
6. **Điều hướng**: Click menu → Navigate giữa các trang
7. **Đăng xuất**: Click logout → Modal confirm → Clear localStorage

## 🚧 Cần hoàn thiện

### Backend Integration
1. **API cho Quản lý phòng**:
   ```javascript
   // src/util/api.js
   export const createRoomApi = (data) => axios.post('/api/rooms/', data);
   export const updateRoomApi = (id, data) => axios.put(`/api/rooms//${id}`, data);
   export const deleteRoomApi = (id) => axios.delete(`/api/rooms//${id}`);
   ```

2. **API cho Khảo sát**:
   ```javascript
   export const submitSurveyApi = (data) => axios.post('/api/surveys', data);
   export const getSurveysApi = () => axios.get('/api/surveys');
   ```

### Authentication Enhancement
- JWT tokens thay vì localStorage đơn giản
- Refresh token mechanism
- Role-based access control (admin, moderator, etc.)
- Session timeout

### Features mở rộng
- Dashboard với thống kê
- Xuất báo cáo Excel/PDF
- Upload ảnh phòng
- Quản lý người dùng
- Lịch sử thay đổi (audit log)

## 📱 Responsive Design

- **Desktop (>991px)**: Sidebar cố định, full features
- **Tablet (768-991px)**: Sidebar drawer, toggle button
- **Mobile (<768px)**: Sidebar 280px, overlay, touch-friendly

## ✅ Checklist hoàn thành

- [x] Tạo LoginPage với gradient xanh
- [x] Tạo ManagementLayout với sidebar space
- [x] Tạo ManagementSidebar với logo + 2 menu items
- [x] Tạo ProtectedRoute wrapper
- [x] Tạo RoomManagementPage với CRUD
- [x] Tạo SurveyFormPage với form validation
- [x] Cập nhật main.jsx với management routes
- [x] Responsive mobile design
- [ ] Kết nối API backend
- [ ] Testing và bug fixes
