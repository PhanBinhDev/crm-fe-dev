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
  // Tạo dữ liệu mẫu với 2 dòng: header và dòng ví dụ (đủ 8 cột, đúng thứ tự backend)
  const templateData = [
    // Dòng header đúng thứ tự backend yêu cầu
    ['Name', 'Username', 'Email', 'Phone', 'Role', 'DateOfBirth', 'Major', 'Avatar'],
    // Dòng ví dụ với dữ liệu mẫu
    [
      'Nguyen Van A',
      'nguyenvana',
      'nguyenvana@example.com',
      '0123456789',
      'GV',
      '1990-01-01',
      'Toan hoc',
      'https://example.com/avatar.jpg',
    ],
  ];

  // Tạo worksheet
  const ws = XLSX.utils.aoa_to_sheet(templateData);

  // Đặt độ rộng cột
  const colWidths = [10, 15, 25, 15, 10, 12, 15, 30];
  ws['!cols'] = colWidths.map(wch => ({ wch }));

  // Tạo workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Import User');

  // Tạo sheet hướng dẫn
  const instructionData = [
    ['INSTRUCTION FOR USER IMPORT FILE'],
    [''],
    ['1. Required fields:'],
    ['   - Name: Full name of the user'],
    ['   - Username: Username (optional, will be auto-generated if blank)'],
    ['   - Email: Valid email address'],
    ['   - Phone: Contact phone number'],
    ['   - Role: One of: TM, CNBM, GV'],
    [''],
    ['2. Optional fields:'],
    ['   - DateOfBirth: Format YYYY-MM-DD (e.g., 1990-01-01)'],
    ['   - Major: e.g., Math, Physics...'],
    ['   - Avatar: Avatar image URL (can be blank)'],
    [''],
    ['3. Supported roles:'],
    ...ROLE_OPTIONS.map(role => [`   - ${role.value}: ${role.label}`]),
    [''],
    ['4. Notes:'],
    ['   - Delete this sheet and instruction rows before import'],
    ['   - Only keep the header row and actual data'],
    ['   - Date format must be YYYY-MM-DD'],
    ['   - Email must be unique in the system'],
  ];

  const instructionWs = XLSX.utils.aoa_to_sheet(instructionData);
  instructionWs['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, instructionWs, 'Instruction');

  // Tải file
  XLSX.writeFile(wb, 'user_import_template.xlsx');
}
