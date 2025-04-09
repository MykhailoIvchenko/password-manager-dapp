import { ReactNode } from 'react';

export interface IUserFromBackend {
  username: string;
  principalId?: string;
}

export interface IUser {
  username?: string;
  principalId?: string;
}

export interface ISecretUpdatableData {
  title: string;
  website: string;
  description: string;
  secret: string;
}

export interface ISecretData extends ISecretUpdatableData {
  id: bigint;
  principalId: string;
}

export type ReactChildren = ReactNode | ReactNode[];
