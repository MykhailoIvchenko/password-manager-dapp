import { useSelectUser } from '../redux/hooks/selectHooks/useSelectUser';
import LoginPage from './LoginPage';

const CheckAccess = () => {
  const user = useSelectUser();

  if (!user) {
    return <LoginPage />;
  }

  if (!user?.username) {
    return <></>;
  }

  return <></>;
};

export default CheckAccess;
