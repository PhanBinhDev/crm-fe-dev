import { StageGroup } from '@/common/enum/stage';
import { IStage } from '@/common/types';
import { getStageGroupLabel } from '@/utils/stage';
import {
  IconCheck,
  IconCircleCheckFilled,
  IconCircleDashed,
  IconDots,
  IconPencil,
} from '@tabler/icons-react';
import { Button, Popover, Typography } from 'antd';

interface StatusContentProps {
  stages: IStage[];
  currentStage: IStage | null;
  onChangeStage: (stage: IStage) => void;
}

const { Text } = Typography;

const StatusContent = ({ stages, currentStage, onChangeStage }: StatusContentProps) => {
  const stageGroups = [StageGroup.NOT_STARTED, StageGroup.ACTIVE, StageGroup.DONE];

  return (
    <div
      style={{
        width: '248px',
      }}
    >
      {stageGroups.map(group => {
        const groupStages = stages.filter(s => s.stageGroup === group);

        return (
          <div
            key={group}
            style={{
              padding: '8px 12px 8px 8px',
              borderBottom: group !== StageGroup.CLOSED ? '1px solid #f0f0f0' : 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: 12,
                fontWeight: 500,
                justifyContent: 'space-between',
                paddingRight: 4,
              }}
            >
              <Text
                style={{
                  paddingLeft: 8,
                }}
              >
                {getStageGroupLabel(group)}
              </Text>
              <Popover
                placement="right"
                trigger={['click']}
                styles={{
                  body: { padding: 8 },
                }}
                arrow={false}
                content={
                  <Button
                    type="text"
                    style={{
                      height: 28,
                      padding: '0 8px',
                    }}
                    icon={<IconPencil size={14} color="#888" />}
                    styles={{
                      icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
                    }}
                  >
                    Chỉnh sửa trạng thái
                  </Button>
                }
              >
                <Button
                  icon={<IconDots size={14} />}
                  type="text"
                  size="small"
                  styles={{
                    icon: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  }}
                  style={{
                    borderRadius: 7,
                  }}
                />
              </Popover>
            </div>

            {groupStages.map(stage => {
              const isActive = currentStage?.id === stage.id;
              return (
                <Button
                  key={stage.id}
                  type="text"
                  onClick={() => onChangeStage(stage)}
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    height: 30,
                    padding: '0 8px',
                  }}
                  ghost={isActive}
                >
                  <div style={{ gap: 4, alignItems: 'center', display: 'flex' }}>
                    {stage.isCompleted ? (
                      <IconCircleCheckFilled size={14} color={stage.color} />
                    ) : (
                      <IconCircleDashed size={14} color={stage.color} />
                    )}
                    {stage.title}
                  </div>

                  {isActive && <IconCheck size={14} color={'#838383'} />}
                </Button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default StatusContent;
