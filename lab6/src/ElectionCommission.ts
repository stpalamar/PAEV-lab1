import { generatePrimes } from './BBS';
import { Token } from './RegistrationOffice';
import * as BBS from './BBS';
import ElGamal, { EncryptedValue } from 'elgamal';

class ElectionCommission {
  idAndPrivateKeyMap: Map<string, { p: bigint; q: bigint }> = new Map();
  tokens: Token[] = [];
  candidates: string[];
  votes: EncryptedValue[] = [];
  eg: ElGamal | null = null;

  constructor(candidates: string[]) {
    this.candidates = candidates;
  }

  async generateTokens(idSet: Set<string>) {
    const eg = await ElGamal.generateAsync();
    this.eg = eg;
    idSet.forEach((id) => {
      const [p, q] = generatePrimes();
      this.idAndPrivateKeyMap.set(id, { p, q });
      this.tokens.push({ id: id, publicKey: BigInt(p * q), eg: eg });
    });
    return this.tokens;
  }

  addVote(vote: EncryptedValue) {
    this.votes.push(vote);
  }

  async finishElection(): Promise<{ results: string[]; errors: string[] }> {
    const results: string[] = [];
    const ids: string[] = [];
    const errors: string[] = [];
    for (let i = 0; i < this.votes.length; i++) {
      try {
        const decrypted = await this.eg!.decryptAsync(this.votes[i]);
        const parsed = JSON.parse(decrypted.toString());

        const { encryptedBallot, x0, id } = parsed;

        if (this.idAndPrivateKeyMap.has(id) === false) {
          errors.push(`Voter ${id} is not registered`);
          continue;
        }

        const { p, q } = this.idAndPrivateKeyMap.get(id)!;
        const decryptedBallot = BBS.decrypt(encryptedBallot, x0, p, q);

        if (
          !this.candidates.find((candidate) => candidate === decryptedBallot)
        ) {
          errors.push(`Candidate is invalid for voter ${id}`);
          continue;
        }
        if (ids.find((id) => id === parsed.id)) {
          errors.push(`${decryptedBallot} is duplicated for voter ${id}`);
          continue;
        }

        results.push(decryptedBallot);
        ids.push(id);
      } catch (e) {
        errors.push(`Invalid encrypted message`);
        continue;
      }
    }
    return {
      results,
      errors,
    };
  }
}

export default ElectionCommission;
