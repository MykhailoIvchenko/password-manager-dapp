import { memo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ISecretUpdatableData } from '../utils/types';
import Button from './ui/Button';
import Input from './ui/Input';
import TextArea from './ui/TextArea';
import Loader from './ui/Loader';

interface IAddSecretFormProps {
  saveSecret: (
    title: string,
    website: string,
    description: string,
    secret: string
  ) => Promise<void>;
  externalAction: VoidFunction;
}

const AddSecretFormComponent: React.FC<IAddSecretFormProps> = ({
  saveSecret,
  externalAction,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<ISecretUpdatableData>();

  const saveTask = async (secretData: ISecretUpdatableData) => {
    setIsLoading(true);

    await saveSecret(
      secretData.title,
      secretData.website,
      secretData.description,
      secretData.secret
    );

    externalAction();

    setIsLoading(false);
  };

  return (
    <form className='add-secret-form' onSubmit={handleSubmit(saveTask)}>
      <h3 className='add-secret-form_title'>Add a secret</h3>

      <Controller
        name='title'
        control={control}
        rules={{
          required: 'Title is required',
          maxLength: {
            value: 15,
            message: 'The title can contain maximum 15 symbols',
          },
        }}
        render={({ field }) => (
          <Input
            {...field}
            label={'Secret title'}
            placeholder={'Enter a title...'}
            error={errors?.title?.message}
          />
        )}
      />

      <Controller
        name='website'
        control={control}
        rules={{
          required: 'Website is required',
        }}
        render={({ field }) => (
          <Input
            {...field}
            label={'Secret associated website'}
            placeholder={'Enter a website...'}
            error={errors?.website?.message}
          />
        )}
      />

      <Controller
        name='description'
        control={control}
        rules={{
          required: 'Description is required',
        }}
        render={({ field }) => (
          <TextArea
            {...field}
            rows={3}
            label={'Task description'}
            placeholder={'Enter a description...'}
            error={errors?.description?.message}
          />
        )}
      />

      <Controller
        name='secret'
        control={control}
        rules={{
          required: 'Secret to store is required',
        }}
        render={({ field }) => (
          <Input
            {...field}
            label={'Secret to store'}
            placeholder={'Enter a secret to store...'}
            error={errors?.secret?.message}
          />
        )}
      />

      {isLoading ? (
        <Loader isSmall />
      ) : (
        <Button
          text={'Save'}
          addClasses='add-secret-form_button'
          type='submit'
        />
      )}
    </form>
  );
};

const AddSecretForm = memo(AddSecretFormComponent);

export default AddSecretForm;
