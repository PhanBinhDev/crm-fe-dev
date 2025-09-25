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
          height: 36,
          gap: 4,
          cursor: 'pointer',
        }}
      >
        {startContent}
      </div>
      <div
        style={{
          background: '#f5f5f5',
          borderRadius: 6,
          height: 36,
          flex: 1,
          padding: '0 6px',
          lineHeight: '40px',
          transition: 'background 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#f5f5f5';
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
