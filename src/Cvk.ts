import generateRSAKeyPair from './RSAKeyGenerator';
import {
  binaryArrayToString,
  publicKeyToBinaryArray,
  quadraticHash,
} from './utils';

export type Vote = {
  encryptedVote: number[];
  signature: bigint;
  publicKey: { e: number; n: number };
};

class Cvk {
  publicKey: { e: number; n: number };
  privateKey: { d: number; n: number };
  candidates: string[];
  voterPublicKeys: { e: number; n: number }[] = [];
  votes: Vote[] = [];

  constructor(candidates: string[]) {
    const { publicKey, privateKey } = generateRSAKeyPair();
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.candidates = candidates;
  }

  addVote(vote: Vote): Vote {
    if (!this.voterPublicKeys.find((v) => v === vote.publicKey)) {
      throw new Error('This voter is not registered');
    }

    if (this.votes.find((v) => v.publicKey === vote.publicKey)) {
      throw new Error('This voter has already voted');
    }

    const verifySignature = this.verifySignature(
      vote.encryptedVote,
      vote.signature,
      vote.publicKey
    );
    if (!verifySignature) {
      throw new Error('Invalid signature');
    }

    const decryptedVote = this.decryptVote(vote.encryptedVote);
    if (!this.candidates.includes(decryptedVote)) {
      throw new Error('Invalid vote');
    }

    this.votes.push(vote);
    return vote;
  }

  registerVoter = (voterPublicKey: { e: number; n: number }): void => {
    this.voterPublicKeys.push(voterPublicKey);
  };

  checkMyVote = (voterPublicKey: { e: number; n: number }): string => {
    const vote = this.votes.find((v) => v.publicKey === voterPublicKey);
    if (!vote) {
      return 'Your vote is not counted';
    }
    return 'Your vote is counted';
  };

  verifySignature(
    encryptedVote: number[],
    signature: bigint,
    publicVoterKey: { e: number; n: number }
  ): boolean {
    const decryptedSignature =
      signature ** BigInt(publicVoterKey.e) % BigInt(publicVoterKey.n);
    const hash = quadraticHash(encryptedVote, publicVoterKey.n);
    return hash === Number(decryptedSignature);
  }

  decryptVote(encryptedVote: number[]): string {
    // Отримуємо бінарний вигляд приватного ключа ЦВК
    const cvkPublicKeyBits: number[] = publicKeyToBinaryArray(this.publicKey);

    // Розшифровуємо гамований голос, використовуючи публічний ключ ЦВК як розшифровувальний ключ
    const decryptedVote: number[] = encryptedVote.map(
      (bit, index) => bit ^ cvkPublicKeyBits[index]
    );

    // Перетворюємо бінарний масив назад в рядок
    const candidateName = binaryArrayToString(decryptedVote);

    return candidateName;
  }
}

export default Cvk;
