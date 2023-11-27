import * as crypto from 'crypto';
import Voter from './Voter';
import { Ballot } from './Voter';
const BlindSignature = require('blind-signatures');

export type Vote = {
  encryptedVote: Buffer;
  unblinded: string;
};

class Cvk {
  key: any;
  publicKey: crypto.KeyObject;
  privateKey: crypto.KeyObject;
  candidates: string[];
  voters: Voter[] = [];
  votersWithSignedBallots: Voter[] = [];
  signedBallotSets: string[][] = [];
  votes: Vote[] = [];

  constructor(candidates: string[]) {
    this.key = BlindSignature.keyGeneration();
    const keyPair = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    this.publicKey = keyPair.publicKey;
    this.privateKey = keyPair.privateKey;
    this.candidates = candidates;
  }

  signBlindly(
    voter: Voter,
    ballotSets: Ballot[][],
    blindedSets: string[][],
    rSets: string[][]
  ): [string[], Ballot[], string[]] {
    if (this.votersWithSignedBallots.find((v) => v.name === voter.name)) {
      throw new Error('This voter has already signed ballots');
    }

    if (!this.voters.find((v) => v.name === voter.name)) {
      throw new Error('This voter is not registered');
    }

    const ballotSetIndexToSign = Math.round(
      Math.random() * (blindedSets.length - 1)
    );
    let signedUnverifiedBallotSet: string[] = [];
    let ballotSetToSign: Ballot[] = [];
    let rSetToSign: string[] = [];

    for (let i = 0; i < blindedSets.length; i++) {
      const ballotSet = ballotSets[i];
      const blindedSet = blindedSets[i];
      const rSet = rSets[i];

      if (blindedSet.length !== this.candidates.length) {
        throw new Error('Invalid ballot set');
      }

      if (i === ballotSetIndexToSign) {
        rSetToSign = rSet;
        ballotSetToSign = ballotSet;
        signedUnverifiedBallotSet = blindedSet.map((blindedBallot) =>
          BlindSignature.sign({ blinded: blindedBallot, key: this.key })
        );
        this.signedBallotSets.push(signedUnverifiedBallotSet);
      } else {
        let signedBallotSet: string[] = [];
        for (let j = 0; j < blindedSet.length; j++) {
          const ballot = ballotSet[j];
          const blindedBallot = blindedSet[j];
          const r = rSet[j];
          const signedBallot = BlindSignature.sign({
            blinded: blindedBallot,
            key: this.key,
          });
          const unblinded = BlindSignature.unblind({
            signed: signedBallot,
            N: this.key.keyPair.n.toString(),
            r,
          });
          const verifyResult = BlindSignature.verify2({
            unblinded,
            key: this.key,
            message: JSON.stringify(ballot),
          });
          if (!verifyResult) {
            throw new Error(
              `Invalid ballot #${j} in set #${i} received from ${voter.name}`
            );
          }
          if (!ballot.id || !ballot.candidate) {
            throw new Error(
              `Ballot set #${i} received from ${voter.name} have not valid ballot #${j}`
            );
          }
          if (!this.candidates.includes(ballot.candidate)) {
            throw new Error(
              `Ballot set #${i} received from ${voter.name} have not registered candidate`
            );
          }
          signedBallotSet.push(signedBallot);
        }
        this.signedBallotSets.push(signedBallotSet);
      }
    }
    this.votersWithSignedBallots.push(voter);
    return [signedUnverifiedBallotSet, ballotSetToSign, rSetToSign];
  }

  getVotingResult(): { result: Map<string, string>; errors: string[] } {
    const errors = [];
    const ballotIdCandidateMap = new Map<string, string>();
    for (let i = 0; i < this.votes.length; i++) {
      const { unblinded, encryptedVote } = this.votes[i];
      try {
        const voteMessage = crypto
          .privateDecrypt(this.privateKey, encryptedVote)
          .toString();
        const verifyResult = BlindSignature.verify2({
          unblinded,
          key: this.key,
          message: voteMessage,
        });
        if (!verifyResult) {
          throw new Error(`Invalid vote #${i}`);
        }

        const vote = JSON.parse(voteMessage);
        if (ballotIdCandidateMap.get(vote.id)) {
          throw new Error(`Duplicate vote with ID ${vote.id}`);
        }
        ballotIdCandidateMap.set(vote.id, vote.candidate);
      } catch (error: any) {
        errors.push(error.message);
      }
    }

    return { result: ballotIdCandidateMap, errors };
  }

  addVote(vote: Vote): void {
    this.votes.push(vote);
  }

  registerVoter = (voter: Voter): void => {
    this.voters.push(voter);
  };
}

export default Cvk;
