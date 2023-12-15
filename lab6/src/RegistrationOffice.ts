import * as crypto from 'crypto';

import Voter from './Voter';
import ElGamal from 'elgamal';

export type Token = {
  id: string;
  publicKey: bigint;
  eg: ElGamal;
};

class RegistrationOffice {
  voters: Map<Token, Voter> = new Map();
  idSet: Set<string> = new Set();
  tokens: Token[] = [];

  generateIdSet(amount: number) {
    for (let i = 0; i < amount; i++) {
      this.idSet.add(this.generateId());
    }
  }

  generateId(): string {
    return crypto.randomBytes(8).toString('hex');
  }

  setTokens(tokens: Token[]) {
    this.tokens = tokens;
  }

  registerVoter(voter: Voter) {
    if (
      voter.token != null &&
      this.tokens.find((token) => token === voter.token)
    ) {
      throw new Error('Voter already registered');
    }
    const [first] = this.idSet;
    if (first == null) {
      throw new Error('No more ids');
    }
    this.idSet.delete(first);
    this.tokens.forEach((token) => {
      if (token.id === first) {
        voter.token = token;
        this.voters.set(token, voter);
      }
    });

    return true;
  }
}
export default RegistrationOffice;
