import { useEffect, useState } from 'react';
import { useSelectUser } from '../redux/hooks/selectHooks/useSelectUser';
import { useDfinityAgent } from './useDfinityAgent';
import useUserNameDispatch from '../redux/hooks/dispatchHooks/useUserNameDispatch';
import { toast } from 'react-toastify';
import { IUserFromBackend } from '../utils/types';
//@ts-ignore
// import { password_manager_dapp_backend } from '../../../declarations/password-manager-dapp-backend';
import useUserDispatch from '../redux/hooks/dispatchHooks/useUserDispatch';

type UseUserData = () => {
  isLoading: boolean;
  username?: string;
  saveUserData?: (newUsername: string, userSecretKey: string) => Promise<void>;
};

export const useUserData: UseUserData = () => {
  const user = useSelectUser();

  const setUsername = useUserNameDispatch();
  const setUserData = useUserDispatch();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const principalId = user?.principalId;

  const actor = useDfinityAgent();

  const getUserDataAndSet = async () => {
    try {
      setIsLoading(true);

      if (principalId && actor) {
        const userDataArray =
          (await actor.get_user_by_id()) as IUserFromBackend[];
        // const userDataArray = await password_manager_dapp_backend.get_user_by_id();

        if (userDataArray.length > 0) {
          const userData = userDataArray[0];

          const dataToSet = {
            username: userData!.username,
            principalId: principalId,
            secretKey: userData!.secret_key,
          };

          setUserData(dataToSet);
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
        await actor.register_user(newUsername, userSecretKey);

        // await password_manager_dapp_backend.register_user(
        //   newUsername,
        //   userSecretKey
        // );

        setUsername(newUsername);
      }
    } catch (error) {
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
