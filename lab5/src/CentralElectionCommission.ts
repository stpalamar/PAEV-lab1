import * as crypto from 'crypto';
import Candidate from './Candidate';
import Voter from './Voter';

class CentralElectionCommission {
  candidates: Candidate[] = [];
  voters: Voter[] = [];
  publicKey: crypto.KeyObject;
  private privateKey: crypto.KeyObject;
  votes = new Map<number, string>();

  constructor() {
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 1024,
    });
    this.publicKey = keyPair.publicKey;
    this.privateKey = keyPair.privateKey;
  }


  registerCandidate(candidate: Candidate) {
    const id = this.generateId();
    candidate.setId(id);
    this.candidates.push(candidate);
    return id;
  }

  registerVoter(voter: Voter) {
    const id = this.generateId();
    voter.setId(id);
    this.voters.push(voter);
    return id;
  }

  collectBallots(ballots1: Map<number, Buffer>, ballots2: Map<number, Buffer>) {
    const errors: string[] = [];
    const ballots = new Map<
      number,
      { firstPart: Buffer; secondPart: Buffer }
    >();
    ballots1.forEach((ballot, id) => {
      const ballot2 = ballots2.get(id);
      if (ballot2) {
        ballots.set(id, { firstPart: ballot, secondPart: ballot2 });
      }
    });
    ballots.forEach((ballot, id) => {
      if (!this.voters.find((voter) => voter.id === id)) {
        errors.push('Unregistered voter with ID: ' + id);
        return;
      }

      const firstPartDecrypted = crypto.privateDecrypt(
        this.privateKey,
        ballot.firstPart
      );
      const secondPartDecrypted = crypto.privateDecrypt(
        this.privateKey,
        ballot.secondPart
      );

      const candidateId = Math.round(
        +firstPartDecrypted * +secondPartDecrypted
      );
      if (!this.candidates.find((candidate) => candidate.id === candidateId)) {
        errors.push('Invalid candidate with ID: ' + candidateId);
        return;
      }

      this.votes.set(
        id,
        this.candidates.find((candidate) => candidate.id === candidateId)!.name
      );
    });

    return errors;
  }

  generateId() {
    return Math.floor(1000 * Math.random() * 9000);
  }
}

export default CentralElectionCommission;
