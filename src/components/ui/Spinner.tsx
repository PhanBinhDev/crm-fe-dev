import { IconLoader } from '@tabler/icons-react';

interface SpinnerProps {
  size?: number;
  color?: string;
}

const Spinner = ({ size = 16, color = '#838383' }: SpinnerProps) => {
  return (
    <IconLoader
      size={size}
      color={color}
      style={{
        animation: 'spin 1s linear infinite',
        display: 'inline-block',
      }}
    />
  );
};

const styleElement = document.createElement('style');
styleElement.innerHTML = `
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// Đảm bảo chỉ thêm style một lần
if (!document.head.contains(styleElement)) {
  document.head.appendChild(styleElement);
}

export default Spinner;
