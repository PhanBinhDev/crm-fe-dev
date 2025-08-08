# CRM CNTT - Hệ thống quản lý giáo viên

<div align="center" style="margin: 30px;">
    <h2>🎓 Hệ thống CRM cho Khoa Công nghệ Thông tin</h2>
    <p>Dành cho Giáo viên • Chủ nhiệm Bộ môn • Trưởng môn</p>
</div>
<br/>

Hệ thống CRM được xây dựng trên nền tảng [Refine](https://github.com/refinedev/refine) để quản lý hoạt động giảng dạy và nghiên cứu trong khoa Công nghệ Thông tin.

## Mô tả dự án

Hệ thống CRM CNTT là một ứng dụng web hiện đại được thiết kế để hỗ trợ việc quản lý và điều phối các hoạt động giảng dạy, nghiên cứu và hành chính trong khoa. Hệ thống cung cấp các công cụ mạnh mẽ cho:

- **Giáo viên**: Quản lý lịch giảng dạy, nhiệm vụ, hoạt động nghiên cứu
- **Chủ nhiệm Bộ môn (CNBM)**: Điều phối công việc, phân công nhiệm vụ, theo dõi tiến độ
- **Trưởng môn (TM)**: Quản lý tổng thể, báo cáo, đánh giá hiệu suất

## Tính năng chính

### 🎯 Quản lý Nhiệm vụ & Hoạt động

- Tạo và phân công nhiệm vụ theo kỳ học
- Theo dõi tiến độ thực hiện
- Hệ thống thông báo và nhắc nhở

### 👥 Quản lý Người dùng

- Phân quyền theo vai trò (GV, CNBM, TM)
- Quản lý thông tin cá nhân và liên hệ
- Hệ thống xác thực an toàn

### 📊 Báo cáo & Thống kê

- Dashboard tổng quan hoạt động
- Báo cáo tiến độ theo kỳ học
- Phân tích hiệu suất công việc

### 🗓️ Quản lý Kỳ học

- Tổ chức theo kỳ học và khối
- Lập kế hoạch dài hạn
- Theo dõi deadline quan trọng

## Các lệnh sử dụng

### Chạy môi trường phát triển

```bash
    npm run dev
```

### Build cho production

```bash
    npm run build
```

### Chạy server production

```bash
    npm run start
```

### Chạy JSON Server (Backend giả lập)

```bash
    npm run server
```

## Công nghệ sử dụng

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Ant Design
- **State Management**: Refine Core
- **Routing**: React Router v7
- **Authentication**: Custom Auth Provider
- **Data Provider**: REST API với json-server

## Cấu trúc dự án

```
src/
├── common/           # Types, enums, utilities chung
├── components/       # Components tái sử dụng
├── pages/           # Các trang chính của ứng dụng
├── providers/       # Auth & Data providers
├── tasks/           # Quản lý nhiệm vụ (Kanban board)
└── utilities/       # Các hàm tiện ích
```

## Hướng dẫn phát triển

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd crm-frontend
   ```

2. **Cài đặt dependencies**

   ```bash
   npm install
   ```

3. **Chạy development server**

   ```bash
   npm run dev
   ```

4. **Chạy backend server (terminal khác)**
   ```bash
   npm run server
   ```

Ứng dụng sẽ chạy tại `http://localhost:5173` và API server tại `http://localhost:4000`

## Tài liệu tham khảo

Để tìm hiểu thêm về **Refine Framework**, vui lòng tham khảo [Tài liệu chính thức](https://refine.dev/docs)

- **REST Data Provider** [Docs](https://refine.dev/docs/core/providers/data-provider/#overview)
- **Ant Design Integration** [Docs](https://refine.dev/docs/ui-frameworks/antd/tutorial/)
- **React Router Provider** [Docs](https://refine.dev/docs/core/providers/router-provider/)
- **Custom Auth Provider** [Docs](https://refine.dev/docs/core/providers/auth-provider/)

## License

MIT
