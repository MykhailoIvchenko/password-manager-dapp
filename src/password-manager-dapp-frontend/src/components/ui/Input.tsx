import { InputHTMLAttributes, memo } from 'react';
import clsx from 'clsx';
import FormFieldWrapper from './FormFieldWrapper';

interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const InputComponent: React.FC<IInputProps> = ({ label, error, ...props }) => {
  return (
    <FormFieldWrapper label={label || ''} error={error}>
      <input {...props} className={clsx('form-field', { error: !!error })} />
    </FormFieldWrapper>
  );
};

const Input = memo(InputComponent);

export default Input;
