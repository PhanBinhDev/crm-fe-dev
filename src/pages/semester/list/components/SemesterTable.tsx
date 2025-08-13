import { FC } from 'react';
import { Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import type { ColumnType } from 'antd/lib/table';

import { paginationConfigOptions } from '@/config/pagination';
import { ISemester } from '@/common/types/semester';
import { SemesterRowActions } from './SemesterRowActions';

interface SemesterTableProps {
  tableProps: TableProps<any>;
  onPageSizeChange?: (size: number) => void;
}

export const SemesterTable: FC<SemesterTableProps> = ({ tableProps, onPageSizeChange }) => {
  const paginationConfig = paginationConfigOptions(tableProps, onPageSizeChange);

  const columns: ColumnType<ISemester>[] = [
    {
      title: 'Năm',
      dataIndex: 'year',
      sorter: true,
    },
    {
      title: 'Tên kỳ học',
      dataIndex: 'name',
      sorter: true,
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status', 
      filters: [
        { text: 'Đang diễn ra', value: 'Ongoing' },
        { text: 'Sắp diễn ra', value: 'Upcoming' },
        { text: 'Đã kết thúc', value: 'Completed' },
      ],
      render: (status: string) => {
        let color = 'default';
        let text = status;

        switch (status) {
          case 'Ongoing':
            color = 'success';
            text = 'Đang diễn ra';
            break;
          case 'Upcoming':
            color = 'warning';
            text = 'Sắp diễn ra';
            break;
          case 'Completed':
            color = 'error';
            text = 'Đã kết thúc';
            break;
          default:
            text = status;
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },

    {
      title: 'Thao tác',
      key: 'actions',
      width: 80,
      render: (_: any, record: ISemester) => <SemesterRowActions semester={record} />,
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      rowKey="id"
      scroll={{ x: 800 }}
      pagination={paginationConfig}
    />
  );
};
