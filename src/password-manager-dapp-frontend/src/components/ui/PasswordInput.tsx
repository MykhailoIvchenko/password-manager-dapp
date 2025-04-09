import { InputHTMLAttributes, memo, useCallback, useState } from 'react';
import clsx from 'clsx';
import FormFieldWrapper from './FormFieldWrapper';
import eyeIcon from '../../assets/img/eye-true.svg';
import eyeCrossedIcon from '../../assets/img/eye-false.svg';

interface IPasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const PasswordInputComponent: React.FC<IPasswordInputProps> = ({
  label,
  error,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleVisibilityChange = useCallback(
    (event: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
      event.stopPropagation();

      setIsVisible((prev) => !prev);
    },
    []
  );

  return (
    <FormFieldWrapper label={label || ''} error={error}>
      <div className='input-with-icon'>
        <input
          {...props}
          className={clsx('form-field', { error: !!error })}
          type={isVisible ? 'text' : 'password'}
        />

        <img
          src={isVisible ? eyeCrossedIcon : eyeIcon}
          alt={'Visibility icon'}
          className='visibility-icon'
          onClick={handleVisibilityChange}
        />
      </div>
    </FormFieldWrapper>
  );
};

const PasswordInput = memo(PasswordInputComponent);

export default PasswordInput;
