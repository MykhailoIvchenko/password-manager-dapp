import { useSelectUser } from '../redux/hooks/selectHooks/useSelectUser';
import LoginPage from './LoginPage';
import SecretsPage from './SecretsPage/SecretsPage';
import SetUserData from './SetUserData';

const CheckAccess = () => {
  const user = useSelectUser();

  if (!user) {
    return <LoginPage />;
  }

  if (!user?.username) {
    return <SetUserData />;
  }

  return <SecretsPage />;
};

export default CheckAccess;
