import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/constants/app';
import { TablePaginationConfig, TableProps } from 'antd';

export const paginationConfigOptions = (
  tableProps: TableProps,
  onPageSizeChange?: (size: number) => void,
): TablePaginationConfig => ({
  ...tableProps.pagination,
  showSizeChanger: true,
  showQuickJumper: false,
  showTotal: (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} của ${total} bản ghi`,
  pageSizeOptions: PAGE_SIZE_OPTIONS,
  defaultPageSize: DEFAULT_PAGE_SIZE,
  onShowSizeChange: (_current: number, size: number) => {
    onPageSizeChange?.(size);
  },
});
