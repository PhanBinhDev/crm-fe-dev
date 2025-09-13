import {
  IconDotsVertical,
  IconGitBranch,
  IconHourglassEmpty,
  IconListCheck,
} from '@tabler/icons-react';
import { Button, Dropdown } from 'antd';

interface MoreActivityProps {
  showActions: {
    timeEstimate: boolean;
    subtasks: boolean;
    checklist: boolean;
  };
  onShowAction: (action: keyof MoreActivityProps['showActions']) => void;
}

const MoreActivity = ({ showActions, onShowAction }: MoreActivityProps) => {
  return (
    <>
      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            !showActions.timeEstimate
              ? {
                  key: 'timeEstimate',
                  label: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <IconHourglassEmpty size={16} color="#838383" />
                      Ước lượng thời gian
                    </span>
                  ),
                  onClick: () => onShowAction('timeEstimate'),
                }
              : null,
            {
              key: 'subtasks',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconGitBranch size={16} color="#838383" />
                  Công việc phụ
                </span>
              ),
              onClick: () => onShowAction('subtasks'),
            },
            {
              key: 'checklist',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconListCheck size={16} color="#838383" />
                  Danh sách việc
                </span>
              ),
              onClick: () => onShowAction('checklist'),
            },
          ],
        }}
      >
        <Button
          size="small"
          style={{
            borderRadius: 6,
            gap: 4,
            color: '#838383',
          }}
          styles={{
            icon: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
          icon={<IconDotsVertical size={12} />}
        />
      </Dropdown>
    </>
  );
};

export default MoreActivity;
