import clsx from 'clsx';
import { memo, TextareaHTMLAttributes } from 'react';
import FormFieldWrapper from './FormFieldWrapper';

interface ITextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextAreaComponent: React.FC<ITextAreaProps> = ({
  label,
  error,
  ...props
}) => {
  return (
    <FormFieldWrapper label={label || ''} error={error}>
      <textarea
        {...props}
        className={clsx('form-field', { error: !!error })}
      ></textarea>
    </FormFieldWrapper>
  );
};

const TextArea = memo(TextAreaComponent);

export default TextArea;
