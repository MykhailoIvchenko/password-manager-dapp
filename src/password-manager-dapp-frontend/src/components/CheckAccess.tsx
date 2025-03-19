import { useSelectUser } from '../redux/hooks/selectHooks/useSelectUser';
import LoginPage from './LoginPage';
import SetUserData from './SetUserData';

const CheckAccess = () => {
  const user = useSelectUser();

  if (!user) {
    return <LoginPage />;
  }

  if (!user?.username) {
    return <SetUserData />;
  }

  return <>User secrets</>;
};

export default CheckAccess;
