import React from 'react';
import { useShow } from '@refinedev/core';
import { Card, Tag, Descriptions, List } from 'antd';
import { useParams } from 'react-router-dom';
import { ISemester } from '@/common/types/semester';
import { getSemesterColor, getSemesterLabel } from '@/utils';

const SemesterInfo: React.FC = () => {
  const { id } = useParams();
  const { query } = useShow<ISemester>({
    resource: 'semesters',
    id,
  });
  const { data, isLoading } = query;
  const semester = data?.data;

  console.log({ semester: semester?.endDate, start: semester?.startDate });

  return (
    <Card loading={isLoading} title={semester?.name}>
      <Descriptions column={2}>
        <Descriptions.Item label="Năm">{semester?.year}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={getSemesterColor(semester?.status!)}>
            {getSemesterLabel(semester?.status!)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày bắt đầu">
          {semester?.startDate
            ? new Date(semester.startDate).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
            : ''}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày kết thúc">
          {semester?.endDate
            ? new Date(semester.endDate).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
            : ''}
        </Descriptions.Item>
        <Descriptions.Item label="Mô tả" span={2}>
          {semester?.description}
        </Descriptions.Item>
      </Descriptions>
      <h3 style={{ marginTop: 24 }}>Danh sách Block</h3>
      <List
        dataSource={semester?.blocks || []}
        renderItem={block => (
          <List.Item>
            <List.Item.Meta title={block.name} />
          </List.Item>
        )}
        locale={{ emptyText: 'Không có block nào' }}
      />
    </Card>
  );
};

export default SemesterInfo;
