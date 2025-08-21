import React, { useEffect, useState } from 'react';
import { useGo, useResource, useRouterType } from '@refinedev/core';
import type { RefineErrorPageProps } from '@refinedev/ui-types';
import { Button, Result, Typography, Space, Tooltip } from 'antd';
import { useNavigation, useTranslate } from '@refinedev/core';
import { IconInfoCircle } from '@tabler/icons-react';

export const ErrorComponent: React.FC<RefineErrorPageProps> = () => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const translate = useTranslate();
  const { push } = useNavigation();
  const go = useGo();
  const routerType = useRouterType();

  const { resource, action } = useResource();

  useEffect(() => {
    if (resource) {
      if (action) {
        setErrorMessage(
          translate(
            'pages.error.info',
            {
              action: action,
              resource: resource?.name,
            },
            `Có thể bạn chưa thêm component "${action}" vào resource "${resource?.name}".`,
          ),
        );
      }
    }
  }, [resource, action]);

  return (
    <Result
      status="404"
      title="404"
      extra={
        <Space direction="vertical" size="middle">
          <Space>
            <Typography.Text>
              {translate('pages.error.404', 'Xin lỗi, trang bạn truy cập không tồn tại.')}
            </Typography.Text>
            {errorMessage && (
              <Tooltip title={errorMessage}>
                <IconInfoCircle data-testid="error-component-tooltip" />
              </Tooltip>
            )}
          </Space>
          <Button
            type="primary"
            onClick={() => {
              if (routerType === 'legacy') {
                push('/');
              } else {
                go({ to: '/' });
              }
            }}
          >
            {translate('pages.error.backHome', 'Quay lại trang chủ')}
          </Button>
        </Space>
      }
    />
  );
};
