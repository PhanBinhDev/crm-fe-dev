import React from 'react';
import { Show } from '@refinedev/antd';
import { Typography, Descriptions, Tag } from 'antd';
import { useShow } from '@refinedev/core';
import dayjs from 'dayjs';

const { Title } = Typography;

export const ActivitiesShowPage: React.FC = () => {
  const { query } = useShow();
  const { data, isLoading } = query;

  const record = data?.data;

  const priorityColors = {
    low: 'blue',
    medium: 'orange',
    high: 'red',
    urgent: 'purple',
  };

  const statusColors = {
    new: 'default',
    in_progress: 'processing',
    completed: 'success',
    overdue: 'error',
  };

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>Chi tiết hoạt động</Title>
      <Descriptions bordered>
        <Descriptions.Item label="Tên hoạt động" span={3}>
          {record?.name}
        </Descriptions.Item>
        <Descriptions.Item label="Mô tả" span={3}>
          {record?.description || 'Không có mô tả'}
        </Descriptions.Item>
        <Descriptions.Item label="Loại">
          {record?.type === 'task' ? 'Nhiệm vụ' : 'Sự kiện'}
        </Descriptions.Item>
        <Descriptions.Item label="Độ ưu tiên">
          {record?.priority && (
            <Tag color={priorityColors[record.priority as keyof typeof priorityColors]}>
              {record.priority.toUpperCase()}
            </Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={statusColors[record?.status as keyof typeof statusColors]}>
            {record?.status?.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian bắt đầu">
          {record?.startTime ? dayjs(record.startTime).format('DD/MM/YYYY HH:mm') : 'Chưa xác định'}
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian kết thúc">
          {record?.endTime ? dayjs(record.endTime).format('DD/MM/YYYY HH:mm') : 'Chưa xác định'}
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian ước tính">
          {record?.estimateTime ? `${record.estimateTime} phút` : 'Chưa xác định'}
        </Descriptions.Item>
        <Descriptions.Item label="Bắt buộc">
          <Tag color={record?.mandatory ? 'success' : 'default'}>
            {record?.mandatory ? 'Có' : 'Không'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Địa điểm" span={2}>
          {record?.location || 'Chưa xác định'}
        </Descriptions.Item>
        <Descriptions.Item label="Link online" span={3}>
          {record?.onlineLink || 'Không có'}
        </Descriptions.Item>
      </Descriptions>
    </Show>
  );
};
