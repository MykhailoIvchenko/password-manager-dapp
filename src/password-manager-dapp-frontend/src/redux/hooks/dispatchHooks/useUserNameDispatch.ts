import { setUsername } from '../../slices/userSlice';
import { useAppDispatch } from '../helperHooks';

type SetUsernameAction = (username: string) => void;

const useUserNameDispatch = (): SetUsernameAction => {
  const dispatch = useAppDispatch();

  const setName = (username: string) => {
    dispatch(setUsername(username));
  };

  return setName;
};

export default useUserNameDispatch;
