import React, { memo } from 'react';
import Button from '../ui/Button';

interface ISecretItemProps {
  title: string;
  handleGetSecretClick: VoidFunction;
}

const SecretItemComponent: React.FC<ISecretItemProps> = ({
  title,
  handleGetSecretClick,
}) => {
  return (
    <div className={'secret-item'}>
      <div className='secret-item__text'>
        <span className='secret-item__title'>{title}</span>
      </div>

      <Button
        type='button'
        addClasses='secret-item__details-button'
        onClick={handleGetSecretClick}
        text={'Show secret'}
      />
    </div>
  );
};

const SecretItem = memo(SecretItemComponent);
export default SecretItem;
