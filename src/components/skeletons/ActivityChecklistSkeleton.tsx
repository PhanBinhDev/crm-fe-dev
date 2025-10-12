import { Skeleton, Space } from 'antd';

const ChecklistItemSkeleton = () => (
  <div
    style={{
      width: '100%',
      borderRadius: 8,
      border: '1px solid #f0f0f0',
      background: '#fff',
      marginBottom: 8,
      padding: '0 0 8px 0',
    }}
  >
    {/* Header */}
    <div
      style={{
        height: 42,
        backgroundColor: '#00000006',
        padding: 8,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flex: 1,
        }}
      >
        <Skeleton.Input style={{ width: 120, height: 22, borderRadius: 6 }} active size="small" />
        <Skeleton.Input
          style={{ width: 30, height: 22, borderRadius: 6, minWidth: 0 }}
          active
          size="small"
        />
      </div>

      <Skeleton.Button
        shape="square"
        style={{
          borderRadius: 6,
          width: 24,
          height: 24,
          minWidth: 0,
          flexShrink: 0,
        }}
        active
      />
    </div>
    {/* Checklist items */}
    <Space direction="vertical" style={{ width: '100%', padding: '8px 8px 0 12px' }} size={8}>
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Skeleton.Button
              shape="square"
              style={{
                borderRadius: 6,
                width: 20,
                height: 20,
                minWidth: 0,
                flexShrink: 0,
              }}
              active
            />
            <Skeleton.Input
              style={{ width: (idx + 1) * 40 + 80, height: 20, borderRadius: 4 }}
              active
              size="small"
            />
          </div>

          <Skeleton.Button
            shape="square"
            style={{
              borderRadius: 6,
              width: 24,
              height: 24,
              minWidth: 0,
              flexShrink: 0,
            }}
            active
          />
        </div>
      ))}
    </Space>
  </div>
);

const ActivityChecklistSkeleton = () => (
  <Space direction="vertical" style={{ width: '100%' }} size={12}>
    {Array.from({ length: 2 }).map((_, idx) => (
      <ChecklistItemSkeleton key={idx} />
    ))}
  </Space>
);

export default ActivityChecklistSkeleton;
