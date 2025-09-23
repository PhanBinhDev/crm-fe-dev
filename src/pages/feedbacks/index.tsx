import { IconFilter2, IconStarFilled } from '@tabler/icons-react';
import { Button, Dropdown, Image, Input, Rate, Select, Space, Table, Typography } from 'antd';
import { useState } from 'react';

const { Text } = Typography;

const columnConfig = [
  { title: 'STT', dataIndex: 'stt', type: 'index', width: 50 },
  { title: 'Họ tên', dataIndex: 'name', type: 'text', width: 150 },
  { title: 'Mã SV', dataIndex: 'msv', type: 'text', width: 90 },
  { title: 'Email', dataIndex: 'email', type: 'text', width: 180 },
  { title: 'Số điện thoại', dataIndex: 'phone', type: 'text', width: 130 },
  { title: 'Rating', dataIndex: 'rating', type: 'rating', width: 130 },
  { title: 'Ảnh', dataIndex: 'image', type: 'image', width: 100 },
  { title: 'Góp ý', dataIndex: 'feedback', type: 'text' },
];

function generateColumns(config: any[], data: any[]) {
  return config
    .filter(col => {
      if (col.type === 'image') {
        return data.some(item => item[col.dataIndex]);
      }
      return true;
    })
    .map(col => {
      if (col.type === 'index') {
        return {
          ...col,
          render: (_: any, __: any, i: number) => i + 1,
        };
      }

      if (col.type === 'rating') {
        return {
          ...col,
          sorter: (a: any, b: any) => a.rating - b.rating,
          render: (value: number) =>
            value ? <Rate disabled defaultValue={value} style={{ fontSize: 12 }} /> : null,
        };
      }

      if (col.type === 'image') {
        return {
          ...col,
          render: (url: string) => (url ? <Image width={80} height={80} src={url} /> : null),
        };
      }

      return col;
    });
}

//đợi api
const events = [{ id: 'ev1', name: 'test' }];
const ratingsByEvent: Record<string, any[]> = {};

const FeedbackTable = () => {
  const [selectedEvent, setSelectedEvent] = useState<string>(events[0].id);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');

  const dataSource = ratingsByEvent[selectedEvent] || [];
  const columns = generateColumns(columnConfig, dataSource);

  const filteredData = dataSource.filter(item => {
    const matchesRating = filterRating ? item.rating === filterRating : true;

    const matchesSearch = searchText
      ? Object.values(item).some(val =>
          String(val).toLowerCase().includes(searchText.toLowerCase()),
        )
      : true;

    return matchesRating && matchesSearch;
  });

  return (
    <div>
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontWeight: 700, fontSize: 16 }}>Sự kiện:</Text>
          <Select
            value={selectedEvent}
            style={{ width: 220 }}
            onChange={value => {
              setSelectedEvent(value);
              setFilterRating(null);
              setSearchText('');
            }}
            options={events.map(ev => ({ value: ev.id, label: ev.name }))}
          />
        </div>

        <Space>
          <Input
            placeholder="Tìm kiếm..."
            allowClear
            style={{ width: 220 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />

          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            menu={{
              items: [
                { key: 'all', label: 'Tất cả' },
                {
                  key: '5',
                  label: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <IconStarFilled size={16} color="#faad14" />5 sao
                    </span>
                  ),
                },
                {
                  key: '4',
                  label: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <IconStarFilled size={16} color="#faad14" />4 sao
                    </span>
                  ),
                },
                {
                  key: '3',
                  label: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <IconStarFilled size={16} color="#faad14" />3 sao
                    </span>
                  ),
                },
                {
                  key: '2',
                  label: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <IconStarFilled size={16} color="#faad14" />2 sao
                    </span>
                  ),
                },
                {
                  key: '1',
                  label: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <IconStarFilled size={16} color="#faad14" />1 sao
                    </span>
                  ),
                },
              ],
              onClick: ({ key }) => {
                setFilterRating(key === 'all' ? null : Number(key));
              },
            }}
          >
            <Button icon={<IconFilter2 size={17} />}>Filter</Button>
          </Dropdown>
        </Space>
      </div>

      {filteredData.length > 0 ? (
        <Table
          rowKey="key"
          columns={columns}
          dataSource={filteredData}
          pagination={false}
          scroll={{ x: true }}
        />
      ) : (
        <div style={{ width: '100%', paddingTop: 50, textAlign: 'center' }}>
          <Text type="secondary">Chưa có đánh giá</Text>
        </div>
      )}
    </div>
  );
};
export default FeedbackTable;
