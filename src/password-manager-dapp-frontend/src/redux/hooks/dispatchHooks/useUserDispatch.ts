import { IUser } from '../../../utils/types';
import { setUser } from '../../slices/userSlice';
import { useAppDispatch } from '../helperHooks';

type SetUserAction = (user: IUser | null) => void;

const useUserDispatch = (): SetUserAction => {
  const dispatch = useAppDispatch();

  const setUserData = (user: IUser | null) => {
    dispatch(setUser(user));
  };

  return setUserData;
};

export default useUserDispatch;
