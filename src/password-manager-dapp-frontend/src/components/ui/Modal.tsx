import { memo, ReactNode } from 'react';
import closeIcon from '../../assets/img/close-icon.svg';

interface IModalProps {
  children: ReactNode | ReactNode[];
  isOpen: boolean;
  onClose: VoidFunction;
}

const ModalComponent: React.FC<IModalProps> = ({
  children,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className={'modal'} onClick={onClose}>
      <div className='modal-content' onClick={(e) => e.stopPropagation()}>
        <button className='close-btn' onClick={onClose}>
          <img src={closeIcon} alt='Close icon' />
        </button>

        {children}
      </div>
    </div>
  );
};

const Modal = memo(ModalComponent);

export default Modal;
