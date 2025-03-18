import { setPrincipalId } from '../../slices/userSlice';
import { useAppDispatch } from '../helperHooks';

type SetPrincipalIdAction = (principalId: string) => void;

const usePrincipalIdDispatch = (): SetPrincipalIdAction => {
  const dispatch = useAppDispatch();

  const setPrincipal = (principalId: string) => {
    dispatch(setPrincipalId(principalId));
  };

  return setPrincipal;
};

export default usePrincipalIdDispatch;
