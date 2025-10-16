interface ActivityDetailCollapseStatusProps {
  color: string;
}

const ActivityDetailCollapseStatus = ({ color }: ActivityDetailCollapseStatusProps) => {
  const size = 14; 
  const strokeWidth = 1.6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashCount = 8; 
  const dashLength = circumference / (dashCount * 2); 

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        cursor: 'pointer',
        flexShrink: 0,
        display: 'inline-block',
      }}
      onClick={e => e.stopPropagation()}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dashLength} ${dashLength}`} 
        strokeLinecap="round"
      />
    </svg>
  );
};

export default ActivityDetailCollapseStatus;
