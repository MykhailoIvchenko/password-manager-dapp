import { ReactNode } from 'react';

export interface IUser {
  username: string;
  principalId?: string;
  secretKey: string;
}

export interface ISecretUpdatableData {
  title: string;
  website: string;
  description: string;
  secret: string;
}

export interface ISecretData extends ISecretUpdatableData {
  principalId: string;
}

export type ReactChildren = ReactNode | ReactNode[];
