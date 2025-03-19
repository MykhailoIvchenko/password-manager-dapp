import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  addClasses?: string;
  text: string;
}

const Button: React.FC<IButtonProps> = ({ addClasses, text, ...props }) => {
  return (
    <button className={clsx('btn', addClasses)} {...props}>
      {text}
    </button>
  );
};

export default Button;
