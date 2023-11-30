import { get } from 'http';
import { Ballot } from './types';
import ElGamal from 'elgamal';
import * as crypto from 'crypto';

class ElectionCommission {
  eg: ElGamal;
  voterIds: string[] = [];
  votes: Map<string, string> = new Map();
  candidates: string[];
  registrationNumbers: string[] = [];

  constructor(
    candidates: string[],
    registrationNumbers: string[],
    eg: ElGamal
  ) {
    this.candidates = candidates;
    this.eg = eg;
    this.registrationNumbers = registrationNumbers;
  }

  async addVote(ballot: Ballot, publicKey: crypto.KeyObject) {
    const { encrypted, signature } = ballot;
    const decrypted = await this.eg.decryptAsync(encrypted);
    const message = JSON.parse(decrypted.toString());
    const hash = crypto.createHash('SHA256').update(message.voterId).digest();
    const verify = crypto
      .createVerify('SHA256')
      .update(hash)
      .verify(publicKey, signature, 'hex');
    if (!verify) {
      throw new Error('Invalid signature');
    }
    const registationNumber = this.registrationNumbers.find(
      (number) => number === message.registationNumber
    );
    if (this.voterIds.includes(message.voterId)) {
      throw new Error('Already voted');
    }

    if (!registationNumber) {
      throw new Error('Invalid registration number or voter not registered');
    }

    if (!this.candidates.includes(message.candidate)) {
      throw new Error('Invalid candidate');
    }

    this.registrationNumbers = this.registrationNumbers.filter(
      (number) => number !== registationNumber
    );
    this.voterIds.push(message.voterId);
    this.votes.set(message.voterId, message.candidate);
    return 'Vote added';
  }

  getResults() {
    return this.votes;
  }
}

export default ElectionCommission;
