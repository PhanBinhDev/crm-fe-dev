import { IStage } from '@/common/types/stage';
import { useModal } from '@/hooks/useModal';
import { useList } from '@refinedev/core';
import { IconBan, IconCheck } from '@tabler/icons-react';
import { Button, List, Popover, Space, Spin, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';

interface StageActivityProps {
  value: IStage | null;
  onChange: (stage: IStage | null) => void;
  error?: boolean;
}

const StageActivity = ({ value, onChange, error }: StageActivityProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const userSelected = useRef(false);
  const { data: modalData } = useModal();
  const { stageId } = modalData ?? {};

  const { data, isLoading } = useList<IStage>({
    resource: 'stages',
    pagination: { mode: 'off' },
  });

  const stages = data?.data ?? [];

  useEffect(() => {
    if (!userSelected.current && stageId && stages.length > 0) {
      const defaultStage = stages.find(s => s.id === stageId);
      if (defaultStage && (!value || value.id !== defaultStage.id)) {
        onChange(defaultStage);
      }
    }
  }, [stageId, stages, onChange, value]);

  const handleSelect = (stage: IStage | null) => {
    userSelected.current = true;
    setOpen(false);
    onChange(stage);
  };

  const content = (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Typography style={{ padding: '3px 12px 0', fontWeight: 600 }}>Chọn giai đoạn</Typography>
      <List style={{ paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <Spin size="small" />
          </div>
        ) : (
          stages.map(stage => (
            <div key={stage.id} style={{ padding: '0 8px' }}>
              <List.Item
                onClick={() => handleSelect(stage)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderBottom: '0',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  maxHeight: 28,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  justifyContent: 'flex-start',
                  background: value?.id === stage.id ? '#f5f7fa' : 'transparent',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#f1f1f1';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background =
                    value?.id === stage.id ? '#f5f7fa' : 'transparent';
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: stage.color ?? '#838383',
                    marginRight: 8,
                    display: 'inline-block',
                    fontSize: 14,
                  }}
                />
                {stage.title.toUpperCase()}

                {value?.id === stage.id && (
                  <IconCheck style={{ marginLeft: 'auto', color: '#202020' }} size={14} />
                )}
              </List.Item>
            </div>
          ))
        )}
      </List>
      <div style={{ padding: '0 8px' }}>
        <Button
          onClick={() => {
            setOpen(false);
            onChange(null);
          }}
          disabled={!value}
          type="text"
          size="small"
          style={{
            color: '#ff4d4f',
            fontSize: 14,
            width: '100%',
            height: 28,
            gap: 2,
            justifyContent: 'flex-start',
            borderRadius: 8,
          }}
          styles={{
            icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
          }}
          icon={<IconBan size={12} style={{ marginRight: 8 }} />}
        >
          Xóa giai đoạn
        </Button>
      </div>
    </Space>
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      styles={{
        body: {
          padding: '8px 0',
          width: 185,
        },
      }}
      trigger={['click']}
      placement="bottomLeft"
      arrow={false}
      content={content}
    >
      <Button
        size="small"
        style={{
          borderRadius: 6,
          gap: 4,
          color: error && !value ? '#ff4d4f' : '#fff',
          background: error && !value ? '#fff1f0' : (value?.color ?? '#838383'),
          minWidth: 'fit-content',
          outline: 'none',
          border: error ? '1px solid #ff4d4f' : '1px solid transparent',
          fontSize: 14,
        }}
      >
        {value ? (
          value.title.toUpperCase()
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
            <span>Chọn giai đoạn</span>
          </div>
        )}
      </Button>
    </Popover>
  );
};

export default StageActivity;
