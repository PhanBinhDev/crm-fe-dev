import React from 'react';

interface ActivityContentItemProps {
  startContent: React.ReactNode;
  endContent: React.ReactNode;
}

const ActivityContentItem = ({ startContent, endContent }: ActivityContentItemProps) => {
  return (
    <div
      style={{
        maxHeight: 36,
        display: 'flex',
        alignItems: 'center',
        lineHeight: '36px',
        width: '100%',
      }}
    >
      <div
        style={{
          width: 140,
          display: 'flex',
          alignItems: 'center',
          lineHeight: '36px',
          padding: '0 6px',
          height: 36,
          gap: 4,
          cursor: 'pointer',
        }}
      >
        {startContent}
      </div>
      <div
        style={{
          borderRadius: 6,
          height: 36,
          flex: 1,
          lineHeight: '40px',
          transition: 'background 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          paddingRight: 6,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#00000006';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '';
        }}
        onClick={e => {
          if (React.isValidElement(endContent) && typeof endContent.props.onClick === 'function') {
            endContent.props.onClick(e);
          }
        }}
      >
        {endContent}
      </div>
    </div>
  );
};

export default ActivityContentItem;
