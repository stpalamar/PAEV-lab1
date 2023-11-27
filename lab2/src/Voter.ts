import * as crypto from 'crypto';

import { Vote } from './Cvk';
const BlindSignature = require('blind-signatures');

export type Ballot = {
  id: string;
  candidate: string;
};

class Voter {
  name: string;
  cvkKey: any;
  cvkPublicKey: crypto.KeyObject;
  publicKey: crypto.KeyObject;
  privateKey: crypto.KeyObject;

  constructor(name: string, cvkKey: any, cvkPublicKey: crypto.KeyObject) {
    this.name = name;
    this.cvkKey = cvkKey;
    this.cvkPublicKey = cvkPublicKey;
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    this.publicKey = keyPair.publicKey;
    this.privateKey = keyPair.privateKey;
  }

  generateBlindedSets(
    candidates: string[]
  ): [Ballot[][], string[][], string[][]] {
    const ballotSets: Ballot[][] = [];
    const blindedSets = [];
    const rSets = [];
    for (let i = 0; i < 10; i++) {
      const ballotSet: Ballot[] = [];
      const blindedSet = [];
      const rSet = [];
      for (const candidate of candidates) {
        const id = this.generateID(this.name + i);
        const ballot = { id, candidate };
        const { blinded, r } = BlindSignature.blind({
          message: JSON.stringify(ballot),
          N: this.cvkKey.keyPair.n.toString(),
          E: this.cvkKey.keyPair.e.toString(),
        });
        ballotSet.push(ballot);
        blindedSet.push(blinded);
        rSet.push(r);
      }
      ballotSets.push(ballotSet);
      blindedSets.push(blindedSet);
      rSets.push(rSet);
    }
    return [ballotSets, blindedSets, rSets];
  }

  vote(
    canditateName: string,
    signedBallotSet: string[],
    ballotSetToSign: Ballot[],
    rSet: string[]
  ): Vote {
    for (let i = 0; i < signedBallotSet.length; i++) {
      const ballot = ballotSetToSign[i];
      const signedBallot = signedBallotSet[i];
      const r = rSet[i];
      if (ballot.candidate === canditateName) {
        const unblinded = BlindSignature.unblind({
          signed: signedBallot,
          N: this.cvkKey.keyPair.n.toString(),
          r,
        });
        const verifyResult = BlindSignature.verify({
          unblinded,
          N: this.cvkKey.keyPair.n.toString(),
          E: this.cvkKey.keyPair.e.toString(),
          message: JSON.stringify(ballot),
        });
        if (!verifyResult) {
          throw new Error(`Invalid ballot #${i} from CVK`);
        }
        const encryptedVote = crypto.publicEncrypt(
          this.cvkPublicKey,
          Buffer.from(JSON.stringify(ballot))
        );
        return { encryptedVote, unblinded };
      }
    }
    throw new Error(`Invalid vote`);
  }

  generateID(name: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(name);
    const hashedData = hash.digest('hex');
    return hashedData;
  }
}

export default Voter;
