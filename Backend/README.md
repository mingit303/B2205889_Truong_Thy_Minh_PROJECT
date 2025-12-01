# Library Management System - Backend API

Hệ thống quản lý thư viện xây dựng bằng Node.js + Express + MongoDB

## 📋 Mục lục
- [Cài đặt](#cài-đặt)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [API Endpoints](#api-endpoints)
- [Models](#models)

## 🚀 Cài đặt

### Yêu cầu
- Node.js >= 14.x
- MongoDB >= 4.x

### Các bước cài đặt

1. Clone repository và cài đặt dependencies:
```bash
cd Backend
npm install
```

2. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

3. Cấu hình file `.env`:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/library_management
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

4. Khởi động MongoDB

5. Chạy server:
```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:3000`

## 📁 Cấu trúc dự án

```
Backend/
├── src/
│   ├── config/          # Cấu hình database và env
│   ├── controllers/     # Xử lý logic nghiệp vụ
│   ├── middleware/      # Authentication, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── utils/           # Helper functions
│   └── validators/      # Request validation
├── app.js              # Express app setup
├── server.js           # Server entry point
├── package.json
└── .env
```

## 🔐 Authentication

API sử dụng JWT (JSON Web Token) để xác thực. Có 2 loại user:

### 1. Employee (Nhân viên)
- **Roles**: `ADMIN`, `SUPERADMIN`
- **Quyền**: Quản lý sách, độc giả, phiếu mượn, thống kê
- **SuperAdmin**: Quản lý nhân viên, cấu hình hệ thống

### 2. Reader (Độc giả)
- **Quyền**: Xem lịch sử mượn, gia hạn sách của mình

**Header format:**
```
Authorization: Bearer <your_jwt_token>
```

## 📚 API Endpoints

### Auth Routes (`/api/auth`)

#### POST `/api/auth/employee/login`
Đăng nhập nhân viên
```json
Request:
{
  "MSNV": "NV001",
  "Password": "password123"
}

Response:
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "MSNV": "NV001",
      "HoTenNV": "Nguyễn Văn A",
      "ChucVu": "Thủ thư",
      "VaiTro": "ADMIN"
    }
  }
}
```

#### POST `/api/auth/reader/login`
Đăng nhập độc giả
```json
Request:
{
  "Email": "reader@example.com",
  "MatKhau": "password123"
}
```

#### POST `/api/auth/reader/register`
Đăng ký tài khoản độc giả
```json
Request:
{
  "MaDocGia": "DG001",
  "HoLot": "Nguyễn Văn",
  "Ten": "B",
  "NgaySinh": "2000-01-01",
  "Phai": "Nam",
  "DiaChi": "123 ABC",
  "DienThoai": "0123456789",
  "Email": "reader@example.com",
  "MatKhau": "password123"
}
```

#### GET `/api/auth/me`
Lấy thông tin user hiện tại (Protected)

---

### Book Routes (`/api/books`)

#### GET `/api/books`
Lấy danh sách sách (có phân trang, tìm kiếm)
```
Query params:
- page: số trang (default: 1)
- limit: số lượng/trang (default: 10)
- search: tìm kiếm theo tên sách
- MaNXB: lọc theo nhà xuất bản
```

#### GET `/api/books/:id`
Lấy chi tiết một sách (bao gồm tác giả)

#### POST `/api/books` 🔒 Employee
Tạo sách mới
```json
{
  "MaSach": "S001",
  "TenSach": "Sách hay",
  "DonGia": 100000,
  "SoQuyen": 10,
  "NamXuatBan": 2023,
  "MaNXB": "NXB001",
  "MoTa": "Mô tả sách",
  "AnhBia": "url_anh",
  "authors": ["TG001", "TG002"]
}
```

#### PUT `/api/books/:id` 🔒 Employee
Cập nhật sách

#### DELETE `/api/books/:id` 🔒 Employee
Xóa sách

---

### Borrow Routes (`/api/borrow`)

#### GET `/api/borrow` 🔒 Employee
Lấy danh sách phiếu mượn
```
Query params:
- page, limit: phân trang
- MaDocGia: lọc theo độc giả
- MaSach: lọc theo sách
- TrangThai: DA_MUON | DA_TRA | TRE_HAN
```

#### POST `/api/borrow` 🔒 Employee
Tạo phiếu mượn mới
```json
{
  "MaDocGia": "DG001",
  "MaSach": "S001"
}
```

#### PUT `/api/borrow/:id/return` 🔒 Employee
Trả sách (tự động tính phí phạt nếu trễ)

#### PUT `/api/borrow/:id/extend` 🔒 Employee/Reader
Gia hạn sách

#### GET `/api/borrow/my-history` 🔒 Reader
Lấy lịch sử mượn của độc giả

#### GET `/api/borrow/overdue` 🔒 Employee
Lấy danh sách sách quá hạn

---

### Reader Routes (`/api/readers`)

#### GET `/api/readers` 🔒 Employee
Lấy danh sách độc giả
```
Query params:
- page, limit: phân trang
- search: tìm kiếm theo tên, email, mã
- TrangThai: 0 (khóa) | 1 (hoạt động)
```

#### GET `/api/readers/:id` 🔒 Employee
Lấy thông tin một độc giả

#### POST `/api/readers` 🔒 Employee
Tạo độc giả mới

#### PUT `/api/readers/:id` 🔒 Employee/Reader
Cập nhật thông tin độc giả

#### PUT `/api/readers/:id/toggle-status` 🔒 Employee
Khóa/Mở khóa độc giả

#### DELETE `/api/readers/:id` 🔒 Employee
Xóa độc giả

---

### Employee Routes (`/api/employees`)

#### GET `/api/employees` 🔒 SuperAdmin
Lấy danh sách nhân viên

#### POST `/api/employees` 🔒 SuperAdmin
Tạo nhân viên mới
```json
{
  "MSNV": "NV002",
  "HoTenNV": "Trần Thị B",
  "Password": "password123",
  "ChucVu": "Thủ thư",
  "DiaChi": "456 XYZ",
  "SoDienThoai": "0987654321",
  "VaiTro": "ADMIN"
}
```

#### PUT `/api/employees/:id` 🔒 SuperAdmin
Cập nhật nhân viên

#### PUT `/api/employees/:id/toggle-status` 🔒 SuperAdmin
Khóa/Mở khóa nhân viên

---

### Author Routes (`/api/authors`)

#### GET `/api/authors`
Lấy danh sách tác giả

#### POST `/api/authors` 🔒 Employee
Tạo tác giả mới

#### PUT `/api/authors/:id` 🔒 Employee
Cập nhật tác giả

#### DELETE `/api/authors/:id` 🔒 Employee
Xóa tác giả

---

### Publisher Routes (`/api/publishers`)

#### GET `/api/publishers`
Lấy danh sách nhà xuất bản

#### POST `/api/publishers` 🔒 Employee
Tạo nhà xuất bản mới

#### PUT `/api/publishers/:id` 🔒 Employee
Cập nhật nhà xuất bản

#### DELETE `/api/publishers/:id` 🔒 Employee
Xóa nhà xuất bản

---

### Config Routes (`/api/config`)

#### GET `/api/config`
Lấy tất cả cấu hình hệ thống
```json
Response:
{
  "success": true,
  "data": {
    "SO_SACH_MUON_TOI_DA": "5",
    "SO_NGAY_MUON": "30",
    "SO_NGAY_GIA_HAN": "15",
    "TIEN_PHAT_MOI_NGAY": "5000"
  }
}
```

#### POST `/api/config` 🔒 SuperAdmin
Cập nhật cấu hình
```json
{
  "Ten": "SO_SACH_MUON_TOI_DA",
  "GiaTri": "7"
}
```

#### POST `/api/config/init` 🔒 SuperAdmin
Khởi tạo cấu hình mặc định

---

### Statistics Routes (`/api/statistics`)

#### GET `/api/statistics/dashboard` 🔒 Employee
Thống kê tổng quan
```json
Response:
{
  "totalBooks": 1000,
  "totalReaders": 500,
  "currentBorrows": 120,
  "overdueBorrows": 15,
  "totalFines": 500000
}
```

#### GET `/api/statistics/dashboard/advanced` 🔒 Employee
Thống kê tổng quan nâng cao (theo kỳ)
```
Query: ?period=day|week|month|year
Response:
{
  "period": "month",
  "currentPeriod": {
    "startDate": "2024-11-01",
    "endDate": "2024-11-26",
    "borrows": 45,
    "returns": 38,
    "fines": 150000,
    "newReaders": 12
  },
  "comparison": {
    "borrowsChange": "15.5",
    "borrowsChangeText": "increase"
  }
}
```

#### GET `/api/statistics/most-borrowed-books` 🔒 Employee
Top sách được mượn nhiều nhất
```
Query: ?limit=10
```

#### GET `/api/statistics/most-active-readers` 🔒 Employee
Top độc giả mượn nhiều nhất

#### GET `/api/statistics/by-month` 🔒 Employee
Thống kê mượn sách theo tháng trong năm
```
Query: ?year=2024
Response:
{
  "year": 2024,
  "data": [
    {
      "month": 1,
      "monthName": "Tháng 1",
      "totalBorrows": 50,
      "returned": 45,
      "overdue": 3,
      "borrowing": 2
    },
    ...
  ]
}
```

#### GET `/api/statistics/by-date-range` 🔒 Employee
Thống kê theo khoảng ngày
```
Query: ?startDate=2024-11-01&endDate=2024-11-30
Response:
[
  {
    "date": "2024-11-01",
    "totalBorrows": 5,
    "returned": 3,
    "overdue": 1,
    "borrowing": 1
  },
  ...
]
```

#### GET `/api/statistics/by-year` 🔒 Employee
Thống kê theo năm
```
Response:
[
  {
    "year": 2024,
    "totalBorrows": 580,
    "returned": 520,
    "overdue": 35,
    "borrowing": 25,
    "totalFines": 1250000
  },
  ...
]
```

#### GET `/api/statistics/by-week` 🔒 Employee
Thống kê theo tuần trong tháng
```
Query: ?year=2024&month=11
Response:
{
  "year": 2024,
  "month": 11,
  "monthName": "Tháng 11",
  "data": [...]
}
```

#### GET `/api/statistics/fines` 🔒 Employee
Thống kê tiền phạt chi tiết
```
Query: ?startDate=2024-01-01&endDate=2024-12-31&groupBy=month|day|year
Response:
{
  "summary": {
    "totalFines": 2500000,
    "totalRecords": 125,
    "averageFine": 20000,
    "maxFine": 150000,
    "minFine": 5000
  },
  "byTime": [...],
  "recentRecords": [...]
}
```

---

## 📊 Models

### Book (Sách)
- MaSach (String, unique)
- TenSach (String)
- DonGia (Number)
- SoQuyen (Number)
- NamXuatBan (Number)
- MaNXB (ref: Publisher)
- MoTa (String)
- AnhBia (String)

### Reader (Độc giả)
- MaDocGia (String, unique)
- HoLot (String)
- Ten (String)
- NgaySinh (Date)
- Phai (String)
- DiaChi (String)
- DienThoai (String)
- Email (String, unique)
- MatKhau (String, hashed)
- TrangThai (Number: 0|1)

### BorrowRecord (Phiếu mượn)
- MaDocGia (ref: Reader)
- MaSach (ref: Book)
- NgayMuon (Date)
- NgayTra (Date)
- HanTra (Date)
- TienPhat (Number)
- TrangThai (String: DA_MUON|DA_TRA|TRE_HAN)
- MSNV (ref: Employee)

### Employee (Nhân viên)
- MSNV (String, unique)
- HoTenNV (String)
- Password (String, hashed)
- ChucVu (String)
- DiaChi (String)
- SoDienThoai (String)
- VaiTro (String: ADMIN|SUPERADMIN)
- TrangThai (Number: 0|1)

### Config (Cấu hình)
- Ten (String, unique)
- GiaTri (String)

### Author (Tác giả)
- MaTacGia (String, unique)
- TenTacGia (String)

### Publisher (Nhà xuất bản)
- MaNXB (String, unique)
- TenNXB (String)
- DiaChi (String)

---

## ⚙️ Quy tắc nghiệp vụ

1. **Mượn sách**:
   - Độc giả tối đa mượn 5 cuốn cùng lúc (có thể cấu hình)
   - Thời hạn mượn mặc định: 30 ngày
   - Kiểm tra sách còn trong kho (SoQuyen > 0)

2. **Trả sách**:
   - Tự động tính phí phạt nếu trễ hạn
   - Phí phạt: 5,000đ/ngày (có thể cấu hình)
   - Tăng số lượng sách trong kho

3. **Gia hạn**:
   - Thời gian gia hạn: 15 ngày (có thể cấu hình)
   - Chỉ gia hạn được sách đang mượn (TrangThai = DA_MUON)

4. **Phân quyền**:
   - **SuperAdmin**: Full quyền
   - **Admin**: Quản lý sách, độc giả, phiếu mượn
   - **Reader**: Xem lịch sử, gia hạn sách của mình

---

## 🔧 Development

### Test API
Sử dụng Postman hoặc Thunder Client để test API endpoints.

### Scripts
```bash
npm run dev      # Chạy với nodemon (auto-reload)
npm start        # Chạy production
```

---

## 📝 Notes

- Tất cả password đều được hash bằng bcrypt
- Token JWT có thời hạn 7 ngày
- Response format chuẩn:
```json
{
  "success": true/false,
  "message": "...",
  "data": {...}
}
```

---

## 🤝 Contributing

Phát triển bởi team PTUD Web
