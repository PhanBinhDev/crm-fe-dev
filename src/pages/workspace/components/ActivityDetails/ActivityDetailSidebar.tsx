import { IActivity } from '@/common/types';

interface ActivityDetailSidebarProps {
  activity: IActivity;
}

const ActivityDetailSidebar = ({ activity }: ActivityDetailSidebarProps) => {
  return <div>{activity.name}</div>;
};

export default ActivityDetailSidebar;
