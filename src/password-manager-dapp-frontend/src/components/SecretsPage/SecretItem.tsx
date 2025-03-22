import React, { memo, useState } from 'react';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import Button from '../ui/Button';

interface ISecretItemProps {
  title: string;
}

const SecretItemComponent: React.FC<ISecretItemProps> = ({ title }) => {
  const [showSecret, setShowSecret] = useState<boolean>(false);

  const handleShowSecretClick = () => {
    setShowSecret(true);
  };

  return (
    <div className={'secret-item'}>
      <div className='secret-item__text'>
        <span className='secret-item__title'>{title}</span>
      </div>

      <Button
        type='button'
        className='secret-item__details-button'
        onClick={handleShowSecretClick}
        text={'Show secret'}
      />
    </div>
  );
};

const SecretItem = memo(SecretItemComponent);
export default SecretItem;
