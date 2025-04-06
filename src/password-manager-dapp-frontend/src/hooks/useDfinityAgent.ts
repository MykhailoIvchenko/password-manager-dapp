import { Actor, ActorMethod, ActorSubclass, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
// @ts-ignore
import { useIdentity } from '@nfid/identitykit/react';

type UseDfinityAgent = () => ActorSubclass<
  Record<string, ActorMethod<unknown[], unknown>>
> | null;

const host = 'https://icp-api.io';
// const host = 'http://127.0.0.1:4943';

const canisterId = import.meta.env.VITE_CANISTER_ID_BACKEND;

export const useDfinityAgent: UseDfinityAgent = () => {
  const identity = useIdentity();

  const [actor, setActor] = useState<ActorSubclass<
    Record<string, ActorMethod<unknown[], unknown>>
  > | null>(null);

  const idlFactory = ({ IDL }: { IDL: any }) =>
    IDL.Service({
      get_user_encryption_key: IDL.Func([IDL.Text], [IDL.Text], []),
      get_encrypted_symmetric_key: IDL.Func(
        [IDL.Text, IDL.Vec(IDL.Nat8), IDL.Text],
        [IDL.Text],
        []
      ),
      get_user_by_id: IDL.Func(
        [],
        [
          IDL.Opt(
            IDL.Record({
              principal_id: IDL.Text,
              username: IDL.Text,
              secret_key: IDL.Text,
            })
          ),
        ],
        ['query']
      ),
      register_user: IDL.Func(
        [IDL.Text, IDL.Text],
        [
          IDL.Record({
            principal_id: IDL.Text,
            username: IDL.Text,
            secret_key: IDL.Text,
          }),
        ],
        []
      ),
      get_secret_data: IDL.Func(
        [IDL.Text],
        [
          IDL.Opt(
            IDL.Record({
              principal_id: IDL.Text,
              title: IDL.Text,
              website: IDL.Text,
              description: IDL.Text,
              secret: IDL.Text,
            })
          ),
        ],
        ['query']
      ),
      get_user_secrets_titles: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
      get_secret_phrase: IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
      create_user_secret: IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [IDL.Text],
        []
      ),
    });

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
