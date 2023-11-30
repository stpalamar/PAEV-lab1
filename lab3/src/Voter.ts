import * as crypto from 'crypto';
import { Ballot } from './types';
import ElGamal from 'elgamal';

class Voter {
  name: string;
  registationNumber: string | null = null;
  publicKey: crypto.KeyObject;
  privateKey: crypto.KeyObject;

  constructor(name: string) {
    this.name = name;
    const keyPair = crypto.generateKeyPairSync('dsa', {
      modulusLength: 1024,
      divisorLength: 160,
    });
    this.publicKey = keyPair.publicKey;
    this.privateKey = keyPair.privateKey;
  }

  async createMessage(candidate: string, eg: ElGamal) {
    if (this.registationNumber === null) {
      throw new Error('Voter must be registered before voting');
    }

    const voterId = this.generateID(this.name);
    const hash = crypto.createHash('SHA256').update(voterId).digest();
    const signature = crypto
      .createSign('SHA256')
      .update(hash)
      .sign(this.privateKey, 'hex');

    const message = {
      voterId: voterId,
      registationNumber: this.registationNumber,
      candidate: candidate,
    };
    const messageString = JSON.stringify(message);
    const encryptedMessage = await eg.encryptAsync(messageString);
    const ballot: Ballot = {
      encrypted: encryptedMessage,
      signature: signature,
    };

    return ballot;
  }

  generateID(name: string): string {
    return crypto.randomBytes(8).toString('hex');
  }
}

export default Voter;
