import { IActivity } from '@/common/types';
import { getProgressColor, getProgressText } from '@/utils/colors';
import { useOne } from '@refinedev/core';
import { IconChevronDown } from '@tabler/icons-react';
import { Button, Card, Progress, Typography } from 'antd';
import confetti from 'canvas-confetti';
import { useEffect, useRef } from 'react';

interface ProgressBarProps {
  activity: IActivity;
}

const ProgressBar = ({ activity }: ProgressBarProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousProgressRef = useRef<number | null>(null);

  // const {} = useOne

  useEffect(() => {
    const progress = activity.progress || 0;

    if (
      progress === 100 &&
      previousProgressRef.current !== null &&
      previousProgressRef.current < 100
    ) {
      fireConfetti();
    }

    previousProgressRef.current = progress;
  }, [activity.progress]);

  const fireConfetti = () => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    const myCanvas = document.createElement('canvas');
    myCanvas.style.position = 'fixed';
    myCanvas.style.top = '0';
    myCanvas.style.left = '0';
    myCanvas.style.width = '100vw';
    myCanvas.style.height = '100vh';
    myCanvas.style.pointerEvents = 'none';
    myCanvas.style.zIndex = '9999';

    document.body.appendChild(myCanvas);

    const myConfetti = confetti.create(myCanvas, {
      resize: true,
      useWorker: true,
    });

    const originX = (rect.left + rect.width / 2) / window.innerWidth;
    const originY = rect.bottom / window.innerHeight;

    myConfetti({
      particleCount: 80,
      spread: 60,
      origin: { x: originX, y: originY },
      colors: ['#1677ff', '#52c41a', '#faad14', '#f759ab', '#722ed1'],
      gravity: 1.2,
      scalar: 1.2,
    });

    setTimeout(() => {
      document.body.removeChild(myCanvas);
    }, 3000);
  };

  return (
    <Card
      styles={{
        body: {
          padding: '8px',
          paddingBottom: 4,
          borderRadius: 10,
          boxShadow: 'none',
          width: '100%',
        },
      }}
      style={{
        boxShadow: 'none',
        border: '1px solid #f0f0f0',
        textAlign: 'left',
      }}
    >
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            Tiến độ hoàn thành
          </Typography.Title>

          <Button
            type="text"
            size="small"
            style={{
              alignSelf: 'flex-start',
              padding: '0 6px',
              borderRadius: 6,
              gap: 4,
            }}
            styles={{
              icon: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}
            icon={<IconChevronDown size={14} color="#838383" />}
          />
        </div>

        <Typography.Text
          type="secondary"
          style={{ fontSize: 13, marginBottom: 4, display: 'block' }}
        >
          {getProgressText(activity.progress || 0)}
        </Typography.Text>

        <div style={{ marginTop: 'auto' }}>
          <Progress
            percent={activity.progress || 0}
            strokeColor={getProgressColor(activity.progress || 0)}
            strokeWidth={8}
            style={{ borderRadius: 8, height: 'fit-content' }}
          />
        </div>
      </div>
    </Card>
  );
};

export default ProgressBar;
