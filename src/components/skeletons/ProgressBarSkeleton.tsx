import { Card, Skeleton } from 'antd';

const ProgressBarSkeleton = () => (
  <Card
    styles={{
      body: {
        padding: '8px',
        paddingBottom: 0,
        borderRadius: 10,
        boxShadow: 'none',
        width: '100%',
      },
    }}
    style={{
      boxShadow: 'none',
      border: '1px solid #f0f0f0',
      textAlign: 'left',
    }}
  >
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Skeleton.Input style={{ width: 150, height: 20, borderRadius: 4 }} active size="small" />
        <Skeleton.Button
          style={{ width: 24, height: 24, borderRadius: 6, minWidth: 0 }}
          active
          size="small"
        />
      </div>
      <Skeleton.Input
        style={{
          width: 280,
          height: 16,
          minHeight: 16,
          borderRadius: 4,
          minWidth: 0,
        }}
        active
        size="small"
      />
      <Skeleton.Button
        style={{ width: '100%', height: 8, borderRadius: 7, minHeight: 0 }}
        active
        size="small"
      />
    </div>
  </Card>
);

export default ProgressBarSkeleton;
