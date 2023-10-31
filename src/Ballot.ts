type Vote = { encryptedVote: number[]; signature: bigint };

class Ballot {
  candidates: string[];
  votes: Vote[] = [];

  constructor(candidates: string[]) {
    this.candidates = candidates;
  }

  addVote(vote: { encryptedVote: number[]; signature: bigint }): Vote {
    this.votes.push(vote);
    return vote;
  }
}

export default Ballot;
