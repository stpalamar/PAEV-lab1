import ElGamal, { EncryptedValue } from 'elgamal';
import * as crypto from 'crypto';

class Voter {
  name: string;
  encryptedBallotSet: Set<string> = new Set();
  randomStringSet: Set<string> = new Set();
  eg: ElGamal;
  publicKey: crypto.KeyObject;
  privateKey: crypto.KeyObject;
  randomString: Buffer = Buffer.alloc(0);

  constructor(name: string, eg: ElGamal) {
    this.name = name;
    this.eg = eg;
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 1024,
    });
    this.publicKey = keyPair.publicKey;
    this.privateKey = keyPair.privateKey;
  }

  createBallot(
    candidate: string,
    votersPublicKeys: crypto.KeyObject[]
  ): Buffer {
    this.randomString = crypto.randomBytes(8);
    let ballot = Buffer.concat([this.randomString, Buffer.from(candidate)]);
    for (let i = votersPublicKeys.length - 1; i >= 0; i--) {
      ballot = this.encrypt(ballot, votersPublicKeys[i]);
      this.encryptedBallotSet.add(ballot.toString('hex'));
    }
    for (let i = votersPublicKeys.length - 1; i >= 0; i--) {
      const randomString = crypto.randomBytes(8);
      this.randomStringSet.add(randomString.toString('hex'));
      ballot = this.encrypt(
        Buffer.concat([randomString, ballot]),
        votersPublicKeys[i]
      );
    }
    return ballot;
  }

  decryptBallotAndRemoveString(ballots: Buffer[]): Buffer[] {
    const decryptedBallots = [];
    let isOwnBallot = false;
    for (const encryptedBallot of ballots) {
      const decrypted = this.decrypt(encryptedBallot, this.privateKey);
      const randomString = decrypted.subarray(0, 8);
      const ballot = decrypted.subarray(8);
      isOwnBallot ||= this.randomStringSet.has(randomString.toString('hex'));
      decryptedBallots.push(ballot);
    }
    if (!isOwnBallot) {
      throw new Error(`${this.name}: Own ballot not found`);
    }

    return decryptedBallots.sort(() => Math.random() - 0.5);
  }

  async decryptAndSign(
    signedBallots: { ballots: Buffer[]; signature: EncryptedValue | null },
    eg?: ElGamal
  ): Promise<{
    ballots: Buffer[];
    signature: EncryptedValue;
  }> {
    if (signedBallots.signature && eg) {
      this.verifySignedBallots(signedBallots.signature, eg);
    }
    const decryptedBallots = [];
    let isOwnBallot = false;
    for (const encryptedBallot of signedBallots.ballots) {
      isOwnBallot ||= this.encryptedBallotSet.has(
        encryptedBallot.toString('hex')
      );
      const ballot = this.decrypt(encryptedBallot, this.privateKey);
      decryptedBallots.push(ballot);
    }
    if (!isOwnBallot) {
      throw new Error(`${this.name}: Own ballot not found`);
    }
    return {
      ballots: decryptedBallots.sort(() => Math.random() - 0.5),
      signature: await this.signBallots(decryptedBallots),
    };
  }

  async verifySignature(
    signedBallots: {
      ballots: Buffer[];
      signature: EncryptedValue;
    },
    eg: ElGamal
  ) {
    this.verifySignedBallots(signedBallots.signature, eg);
    let isOwnBallot = false;
    const verifiedBallots = [];
    for (const ballotWithRandomString of signedBallots.ballots) {
      const randomString = ballotWithRandomString.subarray(0, 8);
      const ballot = ballotWithRandomString.subarray(8);
      isOwnBallot ||= this.randomString.equals(randomString);
      verifiedBallots.push(ballot);
    }
    if (!isOwnBallot) {
      throw new Error(`${this.name}: Own ballot not found`);
    }
    return verifiedBallots;
  }

  private async signBallots(ballots: Buffer[]) {
    return await this.eg.encryptAsync(ballots.toString());
  }

  private async verifySignedBallots(signature: EncryptedValue, eg: ElGamal) {
    const verification = await eg.decryptAsync(signature);
    if (!verification) {
      throw new Error('Signature verification failed');
    }
  }

  private encrypt(data: Buffer, publicKey: crypto.KeyObject) {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encryptedData = Buffer.concat([
      iv,
      cipher.update(data),
      cipher.final(),
    ]);
    const encryptedKey = crypto.publicEncrypt(publicKey, key);
    return Buffer.from(
      JSON.stringify({
        encryptedKeyHex: encryptedKey.toString('hex'),
        encryptedDataHex: encryptedData.toString('hex'),
      })
    );
  }

  private decrypt(data: Buffer, privateKey: crypto.KeyObject) {
    const parsed = JSON.parse(data.toString());
    const encryptedKey = Buffer.from(parsed.encryptedKeyHex, 'hex');
    const encryptedData = Buffer.from(parsed.encryptedDataHex, 'hex');
    const key = crypto.privateDecrypt(privateKey, encryptedKey);
    const iv = encryptedData.subarray(0, 16);
    const encrypted = encryptedData.subarray(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }
}

export default Voter;
