import { Skeleton } from 'antd';

export const SelectActivityTypeSkeleton = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
    <Skeleton.Button
      active
      size="small"
      style={{
        height: 27,
        width: 95,
        borderRadius: 6,
        marginRight: 2,
        borderEndEndRadius: 0,
        borderStartEndRadius: 0,
      }}
    />
    <Skeleton.Button
      active
      size="small"
      style={{
        height: 27,
        width: 82,
        borderRadius: 6,
        borderEndStartRadius: 0,
        borderStartStartRadius: 0,
      }}
    />
  </div>
);
