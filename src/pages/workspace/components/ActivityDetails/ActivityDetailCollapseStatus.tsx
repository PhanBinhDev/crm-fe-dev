interface ActivityDetailCollapseStatusProps {
  color: string;
}

const ActivityDetailCollapseStatus = ({ color }: ActivityDetailCollapseStatusProps) => {
  return (
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
      onClick={e => e.stopPropagation()}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          backgroundColor: color,
        }}
      />
    </div>
  );
};

export default ActivityDetailCollapseStatus;
