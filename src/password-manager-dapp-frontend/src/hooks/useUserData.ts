import { useEffect, useState } from 'react';
import { useSelectUser } from '../redux/hooks/selectHooks/useSelectUser';
import { useDfinityAgent } from './useDfinityAgent';
import useUserNameDispatch from '../redux/hooks/dispatchHooks/useUserNameDispatch';
import { toast } from 'react-toastify';
import { IUser } from '../utils/types';

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
        const userData = (await actor.get_user_by_id()) as IUser;

        if (userData) {
          setUsername(userData.username);
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
        setUsername(newUsername);
      }
    } catch (error) {
      toast.error('An error occured during the username saving');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.username && actor) {
      getUserDataAndSet();
    }
  }, [actor]);

  return { isLoading, setUserName: saveUserData };
};
