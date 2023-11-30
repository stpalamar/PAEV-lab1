import { EncryptedValue } from 'elgamal';

export type Ballot = {
  encrypted: EncryptedValue;
  signature: string;
};
