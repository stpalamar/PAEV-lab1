import * as crypto from 'crypto';

type Vote = {
  id: number;
  encryptedBallot: Buffer;
  signature: Buffer;
};

class ElectionCommission {
  ballots = new Map<number, Buffer>();

  addVote(
    { id, encryptedBallot, signature }: Vote,
    publicKey: crypto.KeyObject
  ) {
    const expectedHash = crypto
      .createHash('sha256')
      .update(id.toString())
      .digest();
    const verify = crypto.verify('sha256', expectedHash, publicKey, signature);
    if (!verify) {
      throw new Error('Invalid signature');
    }
    if (this.ballots.has(id)) {
      throw new Error('Voter already voted');
    }
    this.ballots.set(id, encryptedBallot);
    return true;
  }
}

export default ElectionCommission;
