import { Popover } from 'antd';

interface ActivityDetailCollapseStatusProps {
  color: string;
}

const ActivityDetailCollapseStatus = ({ color }: ActivityDetailCollapseStatusProps) => {
  const contentStatus = <div>Hello</div>;

  return (
    <Popover
      trigger={['click']}
      placement="bottomLeft"
      content={contentStatus}
      style={{
        width: 200,
      }}
      arrow={false}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: 999,
          border: `1px solid ${color}`,
          cursor: 'pointer',
          transition: '0.2s',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: color,
          }}
        ></div>
      </div>
    </Popover>
  );
};

export default ActivityDetailCollapseStatus;
