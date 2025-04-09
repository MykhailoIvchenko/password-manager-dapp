import { useCallback, useEffect, useState } from 'react';
import { useSelectUser } from '../redux/hooks/selectHooks/useSelectUser';
import { useDfinityAgent } from './useDfinityAgent';
import { toast } from 'react-toastify'; //@ts-ignore
import { vetKeyService } from '../services/vetkeyService';
import { ISecretData } from '../utils/types';

type UseSecrets = () => {
  secretsTitles: string[];
  isLoading: boolean;
  createSecret: (
    title: string,
    website: string,
    description: string,
    secret: string
  ) => Promise<void>;
  getSecret: (title: string, secretKey: string) => Promise<string | undefined>;
};

export const useSecrets: UseSecrets = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [secretsTitles, setSecretsTitles] = useState<string[]>([]);

  const actor = useDfinityAgent();

  const user = useSelectUser();

  const principalId = user?.principalId;

  const getSecretsTitlesAndSet = async () => {
    if (principalId && actor) {
      try {
        let userSecretsTitles: string[] =
          (await actor.get_user_secrets_titles()) as string[];

        userSecretsTitles.sort((prev, next) => prev.localeCompare(next));

        setSecretsTitles(userSecretsTitles);
      } catch (error) {
        toast.error('An error occured during the secrets titles retreiving');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const createSecret = useCallback(
    async (
      title: string,
      website: string,
      description: string,
      secret: string
    ) => {
      try {
        setSecretsTitles((prev) =>
          [title, ...prev].sort((prev, next) => prev.localeCompare(next))
        );

        if (!principalId || !actor) {
          return;
        }

        const newSecretId = (await actor.get_new_secret_id()) as bigint;

        const encryptedSecretPhrase = await vetKeyService.encryptWithSecretKey(
          newSecretId,
          principalId,
          secret,
          actor
        );

        if (actor && encryptedSecretPhrase) {
          await actor.create_user_secret(
            title,
            website,
            description,
            encryptedSecretPhrase
          );

          toast.success('Congratulations! The secret was saved');
          await getSecretsTitlesAndSet();
        }
      } catch (error) {
        toast.error('Something went wrong during the secret saving');
      }
    },
    [actor]
  );

  const getSecret = async (
    title: string,
    secretKey: string
  ): Promise<string | undefined> => {
    try {
      if (actor) {
        const secretFromBackend = (await actor.get_secret_data(
          title,
          secretKey
        )) as ISecretData[];

        if (secretFromBackend && secretFromBackend[0] && principalId) {
          const decryptedSecret = vetKeyService.decryptWithSecretKey(
            secretFromBackend[0].id,
            principalId,
            secretFromBackend[0].secret,
            actor
          );

          return decryptedSecret;
        }
      }
    } catch (error) {
      toast.error('Something went wrong during the secret retreiving');
    }
  };

  useEffect(() => {
    if (principalId && actor) {
      getSecretsTitlesAndSet();
    }
  }, [actor, principalId]);

  return {
    secretsTitles,
    isLoading,
    createSecret,
    getSecret,
  };
};
