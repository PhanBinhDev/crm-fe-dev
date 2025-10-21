import { getColorFromName, getInitials } from '@/utils/activity';
import { Avatar, AvatarProps } from 'antd';
import { useState } from 'react';

interface CustomAvatarProps extends AvatarProps {
  name: string;
  src?: string;
}

const CustomAvatar = ({ name, src, ...props }: CustomAvatarProps) => {
  const [imgError, setImgError] = useState(false);

  console.log('Rendering CustomAvatar for', name, 'with src', src, 'imgError:', imgError);

  if (src && !imgError) {
    console.log('Using image source for avatar:', src);

    return (
      <Avatar
        src={src}
        size={props.size || 38}
        {...props}
        onError={() => {
          setImgError(true);
          return true;
        }}
      >
        {getInitials(name)}
      </Avatar>
    );
  }

  console.log('color:', getColorFromName(name));

  return (
    <Avatar size={props.size || 38} style={{ background: getColorFromName(name) }} {...props}>
      {getInitials(name)}
    </Avatar>
  );
};

export default CustomAvatar;
