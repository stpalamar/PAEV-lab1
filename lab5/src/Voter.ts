import * as crypto from 'crypto';

export type Ballot = {
  id: number;
  firstMultiplierEncrypted: Buffer;
  secondMultiplierEncrypted: Buffer;
  signature: Buffer;
};

class Voter {
  id: number = 0;
  name: string;
  publicKey: crypto.KeyObject;
  private privateKey: crypto.KeyObject;

  constructor(name: string) {
    this.name = name;
    const keyPair = crypto.generateKeyPairSync('dsa', {
      modulusLength: 1024,
      divisorLength: 160,
    });
    this.publicKey = keyPair.publicKey;
    this.privateKey = keyPair.privateKey;

  }

  setId(id: number) {
    this.id = id;
  }

  vote(candidateId: number, publicKey: crypto.KeyObject): Ballot {
    const { firstMultiplier, secondMultiplier } =
      this.getMultipliers(candidateId);
    const firstMultiplierEncrypted = crypto.publicEncrypt(
      publicKey,
      Buffer.from(firstMultiplier.toString())
    );
    const secondMultiplierEncrypted = crypto.publicEncrypt(
      publicKey,
      Buffer.from(secondMultiplier.toString())
    );

    const hash = crypto
      .createHash('sha256')
      .update(this.id.toString())
      .digest();
    const signature = crypto.sign('sha256', hash, this.privateKey);
    return {
      id: this.id,
      firstMultiplierEncrypted,
      secondMultiplierEncrypted,
      signature,
    };
  }

  getMultipliers(id: number) {
    const firstMultiplier = Math.floor(Math.random() * (id - 1)) + 1;
    const secondMultiplier = id / firstMultiplier;
    return {
      firstMultiplier,
      secondMultiplier,
    };
  }
}

export default Voter;
