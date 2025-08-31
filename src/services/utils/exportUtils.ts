import { IUser } from '@/common/types';
import * as XLSX from 'xlsx';

export async function exportUsersToCSV(users: IUser[], fields: string[]) {
  // Tạo dữ liệu cho sheet: chỉ lấy các field đã chọn
  const data = users.map((user: any) => {
    const row: Record<string, any> = {};
    fields.forEach((f: string) => {
      let value = user[f];
      if (typeof value === 'boolean') value = value ? 'Active' : 'Inactive';
      row[f] = value ?? '';
    });
    return row;
  });

  // Tạo worksheet và workbook
  const ws = XLSX.utils.json_to_sheet(data, { header: fields });
  // Đặt tên cột là label tiếng Việt nếu muốn
  const colLabels = fields.map((f: string) => {
    switch (f) {
      case 'name':
        return 'Họ tên';
      case 'username':
        return 'Username';
      case 'email':
        return 'Email';
      case 'major':
        return 'Chuyên ngành';
      case 'dateOfBirth':
        return 'Ngày sinh';
      case 'phone':
        return 'Số điện thoại';
      case 'role':
        return 'Vai trò';
      case 'isActive':
        return 'Trạng thái';
      case 'createdAt':
        return 'Ngày tạo';
      default:
        return f;
    }
  });
  XLSX.utils.sheet_add_aoa(ws, [colLabels], { origin: 'A1' });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Giảng viên');
  XLSX.writeFile(wb, 'teacher_export.xlsx');
}
