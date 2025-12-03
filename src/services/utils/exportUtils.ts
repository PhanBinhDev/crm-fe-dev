import { IUser } from '@/common/types';
import * as XLSX from 'xlsx';

// Định nghĩa các trường đúng thứ tự backend yêu cầu
export const USER_IMPORT_FIELDS = [
  { key: 'name', label: 'Name', example: 'Nguyen Van A' },
  { key: 'username', label: 'Username', example: 'nguyenvana' },
  { key: 'email', label: 'Email', example: 'nguyenvana@example.com' },
  { key: 'phone', label: 'Phone', example: '0123456789' },
  { key: 'role', label: 'Role', example: 'GV' },
  { key: 'dateOfBirth', label: 'DateOfBirth', example: '1990-01-01' }, // optional
  { key: 'major', label: 'Major', example: 'Toan hoc' }, // optional
  { key: 'avatar', label: 'Avatar', example: 'https://example.com/avatar.jpg' }, // optional
];

// Các vai trò có thể chọn
const ROLE_OPTIONS = [
  { value: 'TM', label: 'Trưởng môn' },
  { value: 'CNBM', label: 'Chủ nhiệm bộ môn' },
  { value: 'GV', label: 'Giáo viên' },
];

export async function exportUsersToCSV(users: IUser[], selectedFields?: string[]) {
  // Danh sách field chuẩn
  const allFields = [
    { key: 'name', label: 'Name' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'role', label: 'Role' },
    { key: 'dateOfBirth', label: 'DateOfBirth' },
    { key: 'major', label: 'Major' },
    { key: 'isActive', label: 'Status' },
    { key: 'createdAt', label: 'CreatedAt' },
  ];
  // Nếu có selectedFields thì chỉ lấy các trường được chọn, đúng thứ tự
  const fields =
    selectedFields && selectedFields.length > 0
      ? allFields.filter(f => selectedFields.includes(f.key))
      : allFields;
  const data = users.map((user: any) => {
    const row: Record<string, any> = {};
    fields.forEach(f => {
      let value = user[f.key];
      if (f.key === 'isActive') value = value ? 'Active' : 'Inactive';
      row[f.label] = value ?? '';
    });
    return row;
  });

  // Tạo worksheet và workbook
  const ws = XLSX.utils.json_to_sheet(data, { header: fields.map(f => f.label) });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Giảng viên');
  XLSX.writeFile(wb, 'teacher_export.xlsx');
}

// Tạo file Excel mẫu cho import user
export function createUserImportTemplate() {
  // Tạo dữ liệu mẫu với header tiếng Việt và 2 dòng ví dụ (7 cột, đúng thứ tự backend)
  const templateData = [
    // Dòng header tiếng Việt đúng thứ tự backend yêu cầu
    ['Họ và tên', 'Username', 'Email', 'Số điện thoại', 'Vai trò', 'Ngày sinh', 'Chuyên ngành'],
    // Dòng ví dụ 1
    [
      'Nguyen Van',
      'nguyenvana',
      'nguyenvana@example.com',
      '0923456789',
      'GV',
      '1990-01-01',
      'Toan hoc',
    ],
    // Dòng ví dụ 2
    [
      'Anh em',
      'ssds',
      'huyyy@gm.co',
      '0776190234',
      'TM',
      '1990-01-01',
      'Hacker',
    ],
  ];

  // Tạo worksheet
  const ws = XLSX.utils.aoa_to_sheet(templateData);

  // Đặt độ rộng cột (7 cột)
  const colWidths = [15, 15, 25, 15, 10, 12, 15];
  ws['!cols'] = colWidths.map(wch => ({ wch }));

  // Tạo workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Import User');

  // Tạo sheet hướng dẫn
  const instructionData = [
    ['HƯỚNG DẪN IMPORT FILE NGƯỜI DÙNG'],
    [''],
    ['1. Các trường bắt buộc:'],
    ['   - Họ và tên: Tên đầy đủ của người dùng'],
    ['   - Username: Tên đăng nhập (tùy chọn, sẽ tự động tạo nếu để trống)'],
    ['   - Email: Địa chỉ email hợp lệ'],
    ['   - Số điện thoại: Số điện thoại liên hệ'],
    ['   - Vai trò: Một trong các giá trị: TM, CNBM, GV'],
    [''],
    ['2. Các trường tùy chọn:'],
    ['   - Ngày sinh: Định dạng YYYY-MM-DD (ví dụ: 1990-01-01)'],
    ['   - Chuyên ngành: Ví dụ: Lập trình web,...'],
    [''],
    ['3. Các vai trò được hỗ trợ:'],
    ...ROLE_OPTIONS.map(role => [`   - ${role.value}: ${role.label}`]),
    [''],
    ['4. Lưu ý:'],
    ['   - Xóa sheet hướng dẫn này trước khi import'],
    ['   - Chỉ giữ lại dòng header và dữ liệu thực tế'],
    ['   - Định dạng ngày phải là YYYY-MM-DD'],
    ['   - Email phải là duy nhất trong hệ thống'],
  ];

  const instructionWs = XLSX.utils.aoa_to_sheet(instructionData);
  instructionWs['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, instructionWs, 'Instruction');

  // Tải file
  XLSX.writeFile(wb, 'user_import_template.xlsx');
}
