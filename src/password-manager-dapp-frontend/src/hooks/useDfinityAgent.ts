import { Actor, ActorMethod, ActorSubclass, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
// @ts-ignore
import { useIdentity } from '@nfid/identitykit/react';
import { idlFactory } from '../../../declarations/password-manager-dapp-backend';

type UseDfinityAgent = () => ActorSubclass<
  Record<string, ActorMethod<unknown[], unknown>>
> | null;

const host = 'https://icp-api.io';

const canisterId = import.meta.env.VITE_CANISTER_ID_BACKEND;

export const useDfinityAgent: UseDfinityAgent = () => {
  const identity = useIdentity();

  const [actor, setActor] = useState<ActorSubclass<
    Record<string, ActorMethod<unknown[], unknown>>
  > | null>(null);

  if (!identity) {
    return null;
  }

  const getActorAndSet = async () => {
    try {
      const agent = await HttpAgent.create({
        host,
        identity,
      });

      const generatedActor = Actor.createActor(idlFactory, {
        agent,
        canisterId: Principal.fromText(canisterId),
      });

      setActor(generatedActor);
    } catch (error) {
      toast.error('An error occured during the agent initialization');
    }
  };

  useEffect(() => {
    getActorAndSet();
  }, [identity]);

  return actor;
};
