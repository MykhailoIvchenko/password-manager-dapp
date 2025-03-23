import { useCallback, useState } from 'react';
import { useSelectUser } from '../../redux/hooks/selectHooks/useSelectUser';
import Loader from '../ui/Loader';
import { useSecrets } from '../../hooks/useSecrets';
import Button from '../ui/Button';
import SecretItem from './SecretItem';
import Modal from '../ui/Modal';
import AddSecretForm from '../AddSecretForm';
import ShowSecret from '../ShowSecret';

const SecretsPage: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedSecretTitle, setSelectedSecretTitle] = useState<string | null>(
    null
  );

  const openModal = () => {
    setShowAddModal(true);
  };

  const closeModal = useCallback(() => {
    setShowAddModal(false);
  }, []);

  const handleGetSecretClick = useCallback((title: string) => {
    setSelectedSecretTitle(title);
  }, []);

  const handleCloseGetSecretModal = useCallback(() => {
    setSelectedSecretTitle(null);
  }, []);

  const user = useSelectUser();

  const { secretsTitles, isLoading, createSecret, getSecret } = useSecrets();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className='secrets-list'>
      <h1 className='secrets-list__title'>{user?.username || 'Anonymous'}</h1>

      <div className='secrets-list__content'>
        <header className='secrets-list__header'>
          <span className='secrets-list__list-title'>
            Here is your secrets list
          </span>

          <Button text='Add' onClick={openModal} />
        </header>

        <section className='secrets-list__main'>
          {secretsTitles.map((title) => (
            <SecretItem
              key={title}
              title={title}
              handleGetSecretClick={() => handleGetSecretClick(title)}
            />
          ))}
        </section>

        <footer className='secrets-list__footer'>
          <span>{secretsTitles?.length} secrets stored</span>
        </footer>
      </div>

      {showAddModal && (
        <Modal isOpen={showAddModal} onClose={closeModal}>
          <AddSecretForm
            externalAction={closeModal}
            saveSecret={createSecret}
          />
        </Modal>
      )}

      {selectedSecretTitle && (
        <Modal
          isOpen={!!selectedSecretTitle}
          onClose={handleCloseGetSecretModal}
        >
          <ShowSecret title={selectedSecretTitle} getSecret={getSecret} />
        </Modal>
      )}
    </div>
  );
};

export default SecretsPage;
