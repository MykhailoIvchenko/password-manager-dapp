import Loader from './ui/Loader';
import usePrincipalIdDispatch from '../redux/hooks/dispatchHooks/usePrincipalIdDispatch';
// @ts-ignore
import { ConnectWallet, useIdentityKit } from '@nfid/identitykit/react';
import { useEffect } from 'react';

const LoginPage: React.FC = () => {
  const setPrincipalId = usePrincipalIdDispatch();
  const { isInitializing, isUserConnecting, identity } = useIdentityKit();

  const handleLoginCompleted = () => {
    if (identity) {
      alert('Logged in');
      console.log(identity);
      const principalId = identity.getPrincipal().toString();

      setPrincipalId(principalId);
    }
  };

  useEffect(() => {
    handleLoginCompleted();
  }, [identity]);

  return (
    <>{isInitializing || isUserConnecting ? <Loader /> : <ConnectWallet />}</>
  );
};

export default LoginPage;
