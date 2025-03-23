import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Input from './ui/Input';
import Loader from './ui/Loader';
import Button from './ui/Button';
import { toast } from 'react-toastify';
import copyIcon from '../assets/img/copy.svg';

interface IShowSecretProps {
  title: string;
  getSecret: (title: string, secretKey: string) => Promise<string | undefined>;
}

const ShowSecret: React.FC<IShowSecretProps> = ({ title, getSecret }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [decryptedSecret, setDecryptedSecret] = useState<string | null>(null);

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<{ secretKey: string }>();

  const getSecretInfo = async ({ secretKey }: { secretKey: string }) => {
    setIsLoading(true);
    const secret = await getSecret(title, secretKey);

    if (secret) {
      setDecryptedSecret(secret);
    }

    setIsLoading(false);
  };

  const handleCopyClick = async () => {
    try {
      if (decryptedSecret) {
        await navigator.clipboard.writeText(decryptedSecret);

        toast.info('Your secret was copied to the clipboard');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (decryptedSecret) {
    return (
      <div className='show-secret'>
        <h3 className='show-secret_title'>{title}</h3>

        <p className='show-secret_decrypted'>
          <span>{decryptedSecret}</span>

          <button
            type='button'
            className='show-secret_copy-button'
            onClick={handleCopyClick}
          >
            <img src={copyIcon} alt={'Copy icon'} />
          </button>
        </p>
      </div>
    );
  }

  return (
    <form className='show-secret' onSubmit={handleSubmit(getSecretInfo)}>
      <h3 className='show-secret_title'>{title}</h3>
      <p className='show-secret_subtitle'>To get a secret enter your key</p>

      <Controller
        name='secretKey'
        control={control}
        rules={{
          required: 'Secret key is required',
        }}
        render={({ field }) => (
          <Input
            {...field}
            label={'Secret key'}
            placeholder={'Enter the key...'}
            error={errors?.secretKey?.message}
          />
        )}
      />

      {isLoading ? (
        <Loader isSmall />
      ) : (
        <Button
          text={'Show secret'}
          addClasses='show-secret_button'
          type='submit'
        />
      )}
    </form>
  );
};

export default ShowSecret;
