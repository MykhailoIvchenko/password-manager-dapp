import { Controller, useForm } from 'react-hook-form';
import Input from './ui/Input';
import Button from './ui/Button';
import Loader from './ui/Loader';
import { useUserData } from '../hooks/useUserData';

interface IUserDataForm {
  username: string;
  secretKey: string;
}

const AddUserName: React.FC = () => {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<IUserDataForm>();

  const { isLoading, saveUserData } = useUserData();

  const registerUser = async (data: IUserDataForm) => {
    if (saveUserData) {
      await saveUserData(data.username, data.secretKey);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <h3 className='add-userdata_title'>Add your data</h3>

      <form className='userdata-form' onSubmit={handleSubmit(registerUser)}>
        <Controller
          name='username'
          control={control}
          rules={{
            required: 'Username is required',
          }}
          render={({ field }) => (
            <Input
              {...field}
              placeholder={'Enter your username...'}
              error={errors?.username?.message}
            />
          )}
        />

        <Controller
          name='secretKey'
          control={control}
          rules={{
            required: 'Secret key is required',
          }}
          render={({ field }) => (
            <Input
              {...field}
              placeholder={'Enter your secret key...'}
              error={errors?.secretKey?.message}
              type='password'
            />
          )}
        />

        <Button text={'Save'} addClasses='userdata-form_button' type='submit' />
      </form>
    </>
  );
};

export default AddUserName;
