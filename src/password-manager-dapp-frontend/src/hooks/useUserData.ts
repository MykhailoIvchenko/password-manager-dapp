import { useEffect, useState } from 'react';
import { useSelectUser } from '../redux/hooks/selectHooks/useSelectUser';
import { useDfinityAgent } from './useDfinityAgent';
import useUserNameDispatch from '../redux/hooks/dispatchHooks/useUserNameDispatch';
import { toast } from 'react-toastify';
import { IUser } from '../utils/types';
//@ts-ignore
import { password_manager_dapp_backend } from '../../../declarations/password-manager-dapp-backend';

type UseUserData = () => {
  isLoading: boolean;
  username?: string;
  saveUserData?: (newUsername: string, userSecretKey: string) => Promise<void>;
};

export const useUserData: UseUserData = () => {
  const user = useSelectUser();

  const setUsername = useUserNameDispatch();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const principalId = user?.principalId;

  const actor = useDfinityAgent();

  const getUserDataAndSet = async () => {
    try {
      setIsLoading(true);

      if (principalId && actor) {
        // const userData = (await actor.get_user_by_id()) as IUser;
        const userDataArray =
          await password_manager_dapp_backend.get_user_by_id();

        if (userDataArray.length > 0) {
          const userData = userDataArray[0];
          console.log(userData);

          setUsername(userData!.username);
        }
      }
    } catch (error) {
      toast.error('An error occured during the user data retreiving');
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserData = async (newUsername: string, userSecretKey: string) => {
    try {
      setIsLoading(true);

      if (principalId && actor) {
        // await actor.register_user(newUsername, userSecretKey);

        await password_manager_dapp_backend.register_user(
          newUsername,
          userSecretKey
        );

        setUsername(newUsername);
      }
    } catch (error) {
      console.log(error);
      toast.error('An error occured during the registration');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.username && actor) {
      getUserDataAndSet();
    }
  }, [actor]);

  return { isLoading, saveUserData };
};
