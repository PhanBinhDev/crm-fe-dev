import { Skeleton } from 'antd';

const ItemSkeleton = () => (
  <div
    style={{
      maxHeight: 36,
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      marginBottom: 0,
      gap: 4,
    }}
  >
    <Skeleton.Input style={{ width: 140, height: 24, borderRadius: 4 }} active size="small" />
    <div style={{ flex: 1 }}>
      <Skeleton.Button
        style={{ height: 26, borderRadius: 6, width: '100%', minWidth: '100%' }}
        active
        size="small"
        rootClassName="w-full"
      />
    </div>
  </div>
);

const ActivityMainContentSkeleton = ({ isContentNarrow = false, isEvent = false }) => {
  const itemCount = isEvent ? 9 : 5;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isContentNarrow ? '1fr' : 'repeat(2, 1fr)',
        gridTemplateRows: `repeat(${Math.ceil(itemCount / (isContentNarrow ? 1 : 2))}, auto)`,
        gap: 16,
        width: '100%',
      }}
    >
      {Array.from({ length: itemCount }).map((_, idx) => (
        <ItemSkeleton key={idx} />
      ))}
    </div>
  );
};

export default ActivityMainContentSkeleton;
