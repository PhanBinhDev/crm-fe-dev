import { ICategory } from '@/common/types';
import { useList } from '@refinedev/core';
import { IconCheck } from '@tabler/icons-react';
import { List, Space, Tooltip, Typography } from 'antd';
import Spinner from '../ui/Spinner';

interface ActivityCategoryContentProps {
  category: ICategory | undefined;
  onCategoryChange: (category: ICategory) => void;
}

const ActivityCategoryContent = ({ category, onCategoryChange }: ActivityCategoryContentProps) => {
  const { data: categories, isLoading: isLoadingCategories } = useList<ICategory>({
    resource: 'activities/category',
    queryOptions: {
      retry: false,
    },
    pagination: {
      mode: 'off',
    },
  });

  return (
    <Space
      direction="vertical"
      style={{
        width: '100%',
      }}
    >
      <Typography
        style={{
          padding: '3px 12px 0',
          fontWeight: 600,
        }}
      >
        Chọn loại hoạt động
      </Typography>

      <List
        size="small"
        style={{
          padding: '0 8px',
          minHeight: isLoadingCategories ? 72 : 'fit-content',
        }}
      >
        {isLoadingCategories ? (
          <div
            style={{
              padding: '28px 8px',
              background: '#f0f0f0',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Spinner size={24} />
          </div>
        ) : categories?.data.length === 0 ? (
          <div
            style={{
              padding: '28px 8px',
              background: '#f0f0f0',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography.Text type="secondary">Không có loại hoạt động</Typography.Text>
          </div>
        ) : (
          <>
            {categories?.data.map(item => (
              <Tooltip
                key={item.id}
                title={
                  item?.description?.charAt(0).toUpperCase() + item?.description?.slice(1) || ''
                }
                placement="right"
              >
                <List.Item
                  key={item.id}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 7,
                    cursor: 'pointer',
                    border: 0,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.background = '#f5f5f5';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                  onClick={() => onCategoryChange(item)}
                >
                  <Typography.Text>{item.name}</Typography.Text>

                  {category?.id === item.id && (
                    <IconCheck size={16} style={{ marginLeft: 'auto' }} color="#838383" />
                  )}
                </List.Item>
              </Tooltip>
            ))}
          </>
        )}
      </List>
    </Space>
  );
};

export default ActivityCategoryContent;
