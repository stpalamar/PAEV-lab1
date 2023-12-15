import { Token } from './RegistrationOffice';
import * as BBS from './BBS';

class Voter {
  firstName: string;
  lastName: string;
  token: Token | null = null;

  constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  async vote(token: Token, vote: string) {
    const encryptedVote = BBS.encrypt(vote, token.publicKey);
    const message = {
      encryptedBallot: encryptedVote.encryptedMessage,
      x0: encryptedVote.x0,
      id: token.id,
    };
    const encrypted = await token.eg.encryptAsync(JSON.stringify(message));
    return encrypted;
  }
}

export default Voter;
