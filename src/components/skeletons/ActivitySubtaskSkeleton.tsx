import { Skeleton } from 'antd';

const ActivitySubtaskSkeleton = () => {
  return (
    <div
      style={{
        width: '100%',
        borderRadius: 8,
        border: '1px solid #f0f0f0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
          paddingBottom: 8,
          marginBottom: 8,
          padding: 8,
          overflowX: 'auto',
        }}
      >
        <Skeleton.Button
          active
          style={{
            width: 24,
            height: 24,
            minWidth: 0,
            marginRight: 8,
            borderRadius: 4,
          }}
        />
        <Skeleton.Input
          active
          style={{
            width: 180,
            minWidth: 0,
            height: 24,
            borderRadius: 4,
            marginRight: 8,
          }}
        />
        <Skeleton.Input
          active
          style={{
            width: 150,
            minWidth: 0,
            height: 24,
            borderRadius: 4,
            marginRight: 8,
          }}
        />
        <Skeleton.Input
          active
          style={{
            width: 150,
            minWidth: 0,
            height: 24,
            borderRadius: 4,
            marginRight: 8,
          }}
        />
        <div style={{ flex: 1 }} />
        <Skeleton.Button
          active
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            minWidth: 0,
          }}
        />
      </div>

      {/* Task rows skeleton */}
      <div style={{ overflowY: 'auto', maxHeight: 300 }}>
        {[1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: 8,
            }}
          >
            <Skeleton.Button
              active
              style={{
                width: 24,
                height: 24,
                marginRight: 8,
                minWidth: 0,
                borderRadius: 4,
              }}
            />
            <Skeleton.Input
              active
              style={{
                width: 180,
                borderRadius: 4,
                height: 24,
                marginRight: 8,
              }}
            />
            <Skeleton.Input
              active
              style={{
                width: 150,
                borderRadius: 4,
                height: 24,
                marginRight: 8,
                minWidth: 0,
              }}
            />
            <Skeleton.Input
              active
              style={{
                width: 150,
                borderRadius: 4,
                height: 24,
                marginRight: 8,
                minWidth: 0,
              }}
            />
            <div style={{ flex: 1 }} />
            <Skeleton.Button
              active
              style={{
                width: 24,
                height: 24,
                marginLeft: 8,
                borderRadius: 4,
                minWidth: 0,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivitySubtaskSkeleton;
