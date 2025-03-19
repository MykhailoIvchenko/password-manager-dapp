import { ReactChildren } from '../../utils/types';
import logoutIcon from '../../assets/img/logout.svg';
import { useSelectUser } from '../../redux/hooks/selectHooks/useSelectUser';
import useUserDispatch from '../../redux/hooks/dispatchHooks/useUserDispatch';
import Loader from './Loader';
import { useState } from 'react';
// @ts-ignore
import { useAuth } from '@nfid/identitykit/react';

interface IDefaultPageLayoutProps {
  children: ReactChildren;
}

const DefaultPageLayout: React.FC<IDefaultPageLayoutProps> = ({ children }) => {
  const user = useSelectUser();
  const setUser = useUserDispatch();

  const { disconnect, isConnecting } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await disconnect();

      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isConnecting || isLoading) {
    return (
      <div className='default-page-layout'>
        <Loader />
      </div>
    );
  }

  return (
    <div className='default-page-layout'>
      {user && (
        <button type='button' className='logout-button' onClick={handleLogout}>
          <img alt='Logout icon' src={logoutIcon} />
        </button>
      )}

      {children}
    </div>
  );
};

export default DefaultPageLayout;
