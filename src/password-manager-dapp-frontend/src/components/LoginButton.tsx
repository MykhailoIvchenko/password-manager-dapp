import { HTMLProps } from 'react';
import Button from './ui/Button';

interface ILoginButtonProps extends HTMLProps<HTMLButtonElement> {}

const LoginButton: React.FC<ILoginButtonProps> = ({ ...props }) => {
  return (
    <Button
      text={'Login'}
      addClasses={'login-button'}
      onClick={props.onClick}
    />
  );
};

export default LoginButton;
