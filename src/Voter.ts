import generateRSAKeyPair from './RSAKeyGenerator';
import {
  stringToBinaryArray,
  publicKeyToBinaryArray,
  quadraticHash,
} from './utils';

class Voter {
  name: string;
  cvkPublicKey: { e: number; n: number };
  publicKey: { e: number; n: number };
  privateKey: { d: number; n: number };

  constructor(name: string, cvkPublicKey: { e: number; n: number }) {
    this.name = name;
    this.cvkPublicKey = cvkPublicKey;
    const { publicKey, privateKey } = generateRSAKeyPair();
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  getPublicKey(): { e: number; n: number } {
    return this.publicKey;
  }

  vote(canditateName: string): { encryptedVote: number[]; signature: bigint } {
    const encryptedVote = this.encryptVote(canditateName, this.cvkPublicKey);
    const signature = this.createSignature(encryptedVote, this.privateKey);
    return { encryptedVote, signature };
  }

  encryptVote(
    candidateName: string,
    cvkPublicKey: { e: number; n: number }
  ): number[] {
    // Перетворюємо голос у двійковий вигляд
    const message: number[] = stringToBinaryArray(candidateName);

    // Перетворюємо публічний ключ ЦВК у двійковий вигляд
    const cvkPublicKeyBits: number[] = publicKeyToBinaryArray(cvkPublicKey);

    // Гамуємо голос, використовуючи публічний ключ ЦВК як гамувальний ключ
    const encryptedVote: number[] = message.map(
      (bit, index) => bit ^ cvkPublicKeyBits[index]
    );

    return encryptedVote;
  }

  createSignature(
    encryptedVote: number[],
    privateKey: { d: number; n: number }
  ): bigint {
    const modulus = privateKey.n;
    const exponent = privateKey.d;

    // Обчислюємо хеш голосу за допомогою хеш-функції квадратичної згортки
    const voteHash = quadraticHash(encryptedVote, modulus);
    const signature = BigInt(voteHash) ** BigInt(exponent) % BigInt(modulus);
    return signature;
  }
}

export default Voter;
