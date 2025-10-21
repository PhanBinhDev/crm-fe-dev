import { getColorFromName, getInitials } from '@/utils/activity';
import { Avatar, AvatarProps } from 'antd';
import { useState } from 'react';

interface CustomAvatarProps extends AvatarProps {
  name: string;
  src?: string;
}

const CustomAvatar = ({ name, src, ...props }: CustomAvatarProps) => {
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <Avatar
        {...props}
        src={src}
        size={props.size || 38}
        onError={() => {
          setImgError(true);
          return true;
        }}
      >
        {getInitials(name)}
      </Avatar>
    );
  }

  return (
    <Avatar
      {...props}
      size={props.size || 38}
      style={{ background: getColorFromName(name), ...props.style }}
    >
      {getInitials(name)}
    </Avatar>
  );
};

export default CustomAvatar;
