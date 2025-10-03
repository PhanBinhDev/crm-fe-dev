import { IconBell, IconBellOff, IconCheck, IconUser, IconUserCheck } from '@tabler/icons-react';
import { Avatar, Button, Divider, Input, Popover, Space } from 'antd';
import { useState } from 'react';

const ActivityDetailFollowLog = () => {
  const [showFilter, setShowFilter] = useState(false);
  // const [selected, setSelected] = useState<string[]>(
  //   activityLogFilterOptions.map(opt => opt.value),
  // );

  // const allSelected = selected.length === activityLogFilterOptions.length;

  // const handleToggle = (value: string) => {
  //   setSelected(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));
  // };

  // const handleSelectAll = () => setSelected(activityLogFilterOptions.map(opt => opt.value));
  // const handleUnselectAll = () => setSelected([]);

  const contentFilter = (
    <Space
      direction="vertical"
      style={{
        width: '100%',
      }}
    >
      <Space
        direction="vertical"
        style={{
          width: '100%',
        }}
      >
        <Space
          direction="vertical"
          style={{
            gap: 0,
            padding: '8px',
            paddingBottom: '0px',
            width: '100%',
          }}
          styles={{
            item: {
              width: '100%',
            },
          }}
        >
          <Button
            style={{
              width: '100%',
              justifyContent: 'space-between',
              padding: '0 6px',
              alignItems: 'center',
            }}
            type="text"
            size="middle"
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <IconBell size={14} color="#838383" />
              Theo dõi
            </div>
            {true && <IconCheck size={14} color="#838383" />}
          </Button>
          <Button
            style={{
              width: '100%',
              justifyContent: 'space-between',
              padding: '6px',
              alignItems: 'center',
            }}
            type="text"
            size="middle"
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <IconBellOff size={14} color="#838383" />
              Bỏ theo dõi
            </div>
            {true && <IconCheck size={14} color="#838383" />}
          </Button>
        </Space>

        <Divider
          size="small"
          style={{
            margin: 0,
          }}
        />

        <Space
          direction="vertical"
          style={{
            gap: 8,
            padding: '8px',
            width: '100%',
          }}
          styles={{
            item: {
              width: '100%',
            },
          }}
        >
          <Input placeholder="Tìm kiếm..." />
          <span
            style={{
              color: '#838383',
              marginLeft: 8,
            }}
          >
            1 Theo dõi
          </span>
          <Button
            type="text"
            style={{
              padding: '20px 4px',
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
          >
            <Avatar icon={<IconUserCheck />} />
            <div
              style={{
                display: 'flex',
                textAlign: 'left',
              }}
            >
              Invite people via email
            </div>
          </Button>
          <Button
            type="text"
            style={{
              padding: '20px 4px',
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
          >
            <Avatar icon={<IconUser />} />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
              }}
            >
              <span>Me</span>
              <span>16 mins</span>
            </div>
          </Button>
        </Space>
      </Space>
    </Space>
  );

  return (
    <Popover
      placement="bottomRight"
      arrow={false}
      open={showFilter}
      trigger={['click']}
      onOpenChange={setShowFilter}
      content={contentFilter}
      styles={{
        body: {
          padding: '0',
          width: 250,
        },
      }}
    >
      <Button
        type="text"
        style={{
          borderRadius: 8,
          justifyContent: 'flex-start',
          gap: 4,
          padding: '0 8px',
        }}
      >
        <IconBell size={16} stroke={1.5} color="#646464" />
        <span style={{ fontSize: 14, color: '#646464', fontWeight: 500 }}>4</span>
      </Button>
    </Popover>
  );
};

export default ActivityDetailFollowLog;
