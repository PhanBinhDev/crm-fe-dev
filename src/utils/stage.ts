import { StageGroup } from '@/common/enum/stage';
import { IStage } from '@/common/types';

export const getStageGroupLabel = (stageGroup: StageGroup) => {
  switch (stageGroup) {
    case StageGroup.NOT_STARTED:
      return 'Chưa bắt đầu';
    case StageGroup.ACTIVE:
      return 'Đang tiến hành';
    case StageGroup.DONE:
      return 'Hoàn thành';
    case StageGroup.CLOSED:
      return 'Đã đóng';
  }
};

export const getStageGroupColor = (stageGroup: StageGroup) => {
  switch (stageGroup) {
    case StageGroup.NOT_STARTED:
      return '#bdbdbd';
    case StageGroup.ACTIVE:
      return '#1677ff';
    case StageGroup.DONE:
      return '#52c41a';
    case StageGroup.CLOSED:
      return '#ff4d4f';
    default:
      return '#bdbdbd';
  }
};

export const getStageGroupTextColor = (stageGroup: StageGroup) => {
  switch (stageGroup) {
    case StageGroup.NOT_STARTED:
      return '#222';
    case StageGroup.ACTIVE:
      return '#fff';
    case StageGroup.DONE:
      return '#fff';
    case StageGroup.CLOSED:
      return '#fff';
    default:
      return '#222';
  }
};

export const getNextStage = (currentStage: IStage, stages: IStage[]) => {
  const groupOrder = [StageGroup.NOT_STARTED, StageGroup.ACTIVE, StageGroup.DONE];

  const sortedStages = [...stages].sort((a, b) => {
    const groupDiff = groupOrder.indexOf(a.stageGroup) - groupOrder.indexOf(b.stageGroup);
    if (groupDiff !== 0) return groupDiff;
    return (a.groupPosition ?? 0) - (b.groupPosition ?? 0);
  });

  const idx = sortedStages.findIndex(s => s.id === currentStage?.id);

  return idx >= 0 && idx < sortedStages.length - 1 ? sortedStages[idx + 1] : null;
};
