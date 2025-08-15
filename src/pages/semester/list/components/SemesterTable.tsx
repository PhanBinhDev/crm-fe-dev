import { SemesterStatus } from '@/common/enum/semester';
import { ISemester } from '@/common/types/semester';
import { paginationConfigOptions } from '@/config/pagination';
import { semesterStatusFilterOptions } from '@/constants/semester';
import { getSemesterColor, getSemesterLabel } from '@/utils';
import { Table, TableProps, Tag, Tooltip } from 'antd';
import { ColumnType } from 'antd/lib/table';

interface SemesterTableProps {
  tableProps: TableProps<any>;
  onPageSizeChange?: (size: number) => void;
}

const SemesterTable: React.FC<SemesterTableProps> = ({ tableProps, onPageSizeChange }) => {
  const paginationConfig = paginationConfigOptions(tableProps, onPageSizeChange);

  const columns: ColumnType<ISemester>[] = [
    {
      title: 'Tên kỳ học',
      dataIndex: 'name',
      sorter: true,
      render: (name: string) => <span>{name}</span>,
    },
    {
      title: 'Năm',
      dataIndex: 'year',
      sorter: true,
      render: (year: number) => <span>{year}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      filters: semesterStatusFilterOptions,
      render: (status: SemesterStatus) => (
        <Tag
          color={getSemesterColor(status)}
          style={{
            fontSize: 14,
            padding: '3px 6px',
            fontWeight: 500,
            borderRadius: 6,
          }}
        >
          {getSemesterLabel(status)}
        </Tag>
      ),
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      sorter: true,
      render: (startDate: string) => {
        const date = startDate ? new Date(startDate) : null;
        return (
          <span>
            {date
              ? date.toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })
              : ''}
          </span>
        );
      },
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      sorter: true,
      render: (endDate: string) => {
        const date = endDate ? new Date(endDate) : null;
        return (
          <span>
            {date
              ? date.toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })
              : ''}
          </span>
        );
      },
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      render: (description: string) => (
        <Tooltip title={description}>
          <span>
            {description && description.length > 50
              ? `${description.slice(0, 50)}...`
              : description}
          </span>
        </Tooltip>
      ),
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      rowKey="id"
      scroll={{ x: 1000 }}
      pagination={paginationConfig}
    />
  );
};

export default SemesterTable;
