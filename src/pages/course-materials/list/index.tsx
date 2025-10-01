import { FolderFilled } from '@ant-design/icons';
import { List as RefineList } from '@refinedev/antd';
import { Card, List, Row, Space, Typography } from 'antd';
import React, { useMemo, useState } from 'react';
import MaterialFilter from './components/MeterialFilters';

const { Text } = Typography;

type Course = { id: string; name: string };

const mockData: Course[] = [
  { id: '1', name: 'Javascript' },
  { id: '2', name: 'FrontEnd-Framework' },
  { id: '3', name: 'TypeScript' },
  { id: '4', name: 'React' },
  { id: '5', name: 'Next.js' },
  { id: '6', name: 'Node.js' },
  { id: '7', name: 'Vue.js' },
  { id: '8', name: 'Angular' },
  { id: '9', name: 'Svelte' },
  { id: '10', name: 'Python' },
  { id: '11', name: 'Java' },
  { id: '12', name: 'C#' },
];

const MaterialsList: React.FC = () => {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const res = q ? mockData.filter(c => c.name.toLowerCase().includes(q)) : mockData;
    setCurrent(1);
    return res;
  }, [query]);

  const pagination = {
    current,
    pageSize,
    total: filtered.length,
    showSizeChanger: true,
    pageSizeOptions: [8, 12, 16, 24],
    showTotal: (t: number, [s, e]: [number, number]) => `${s}-${e} / ${t}`,
    onChange: (page: number, size?: number) => {
      if (size && size !== pageSize) setPageSize(size);
      setCurrent(page);
    },
  };

  return (
    <RefineList title="Tài liệu môn học" headerButtons={[]}>
      <Card
        styles={{
          body: { padding: 16, background: '#f5f5f5' },
        }}
        style={{ borderRadius: 12 }}
      >
        {/* Header */}
        <Row justify="end" style={{ marginBottom: 12 }}>
          <MaterialFilter
            query={query}
            onQueryChange={setQuery}
            view={view}
            onToggleView={() => setView(v => (v === 'grid' ? 'list' : 'grid'))}
            onAdd={() => console.log('Thêm môn học')}
          />
        </Row>

        {/* Content */}
        {view === 'grid' ? (
          <List
            dataSource={filtered}
            pagination={pagination}
            grid={{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }}
            renderItem={item => (
              <List.Item key={item.id}>
                <FolderCard title={item.name} onClick={() => console.log('open', item)} />
              </List.Item>
            )}
            style={{ padding: 12, background: '#e8e8e8', borderRadius: 8 }}
          />
        ) : (
          <List
            dataSource={filtered}
            pagination={pagination}
            renderItem={item => (
              <List.Item
                key={item.id}
                onClick={() => console.log('open', item)}
                style={{
                  background: '#fff',
                  borderRadius: 6,
                  padding: 8,
                  marginBottom: 6,
                  cursor: 'pointer',
                }}
              >
                <Space>
                  <FolderIcon size={32} />
                  <Text strong style={{ fontSize: 14 }}>
                    {item.name}
                  </Text>
                </Space>
              </List.Item>
            )}
            style={{ padding: 12 }}
          />
        )}
      </Card>
    </RefineList>
  );
};

export default MaterialsList;

function FolderCard({ title, onClick }: { title: string; onClick?: () => void }) {
  return (
    <Card
      hoverable
      onClick={onClick}
      style={{ borderRadius: 16, background: '#fff', textAlign: 'center' }}
      styles={{
        body: { padding: 16 },
      }}
    >
      <div
        style={{
          height: 110,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FolderIcon size={84} />
      </div>
      <Text style={{ display: 'block', marginTop: 8, fontWeight: 500 }}>{title}</Text>
    </Card>
  );
}

function FolderIcon({ size = 84 }: { size?: number }) {
  return <FolderFilled style={{ fontSize: size, color: '#111' }} />;
}
