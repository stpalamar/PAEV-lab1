import Voter from './Voter';
import Candidate from './Candidate';
import ElectionCommission from './ElectionCommission';
import CentralElectionCommission from './CentralElectionCommission';
import { Ballot } from './Voter';


const voter1 = new Voter('Voter 1');
const voter2 = new Voter('Voter 2');
const voter3 = new Voter('Voter 3');
const voter4 = new Voter('Voter 4');
const voter5 = new Voter('Voter 5');
voter5.id = 49343;
const voter6 = new Voter('Voter 6');
const voter7 = new Voter('Voter 7');

const candidate1 = new Candidate('Candidate 1');
const candidate2 = new Candidate('Candidate 2');
const candidate3 = new Candidate('Candidate 3');

const electionCommission1 = new ElectionCommission();
const electionCommission2 = new ElectionCommission();

const centralElectionCommission = new CentralElectionCommission();

const voters = [voter1, voter2, voter3, voter4, voter6, voter7];
voters.map((voter) => centralElectionCommission.registerVoter(voter));
const candidates = [candidate1, candidate2];
candidates.map((candidate) =>
  centralElectionCommission.registerCandidate(candidate)
);

const ballot1 = voter1.vote(
  candidate1.id!,
  centralElectionCommission.publicKey
);
const ballot2 = voter2.vote(
  candidate1.id!,
  centralElectionCommission.publicKey
);
const ballot3 = voter3.vote(
  candidate1.id!,
  centralElectionCommission.publicKey
);
const ballot4 = voter4.vote(
  candidate2.id!,
  centralElectionCommission.publicKey
);

// Voter 5 is not registered
const ballot5 = voter5.vote(
  candidate2.id!,
  centralElectionCommission.publicKey
);

// Voter 6 votes for non registered candidate
const ballot6 = voter6.vote(
  candidate3.id!,
  centralElectionCommission.publicKey
);

// Voter 7 votes with invalid signature
const ballot7 = voter7.vote(
  candidate3.id!,
  centralElectionCommission.publicKey
);

// Voter 1 votes again
const ballot8 = voter1.vote(
  candidate1.id!,
  centralElectionCommission.publicKey
);

const sendBallot = (ballot: Ballot, voter: Voter) => {
  try {
    const {
      id,
      firstMultiplierEncrypted,
      secondMultiplierEncrypted,
      signature,
    } = ballot;
    electionCommission1.addVote(
      { id, encryptedBallot: firstMultiplierEncrypted, signature },
      voter.publicKey
    );
    electionCommission2.addVote(
      { id, encryptedBallot: secondMultiplierEncrypted, signature },
      voter.publicKey
    );
  } catch (e: any) {
    console.log('Error from EC: ' + e.message);
  }
};

sendBallot(ballot1, voter1);
sendBallot(ballot2, voter2);
sendBallot(ballot3, voter3);
sendBallot(ballot4, voter4);
sendBallot(ballot5, voter5); // Voter 5 is not registered
sendBallot(ballot6, voter6); // Voter 6 votes for non registered candidate
ballot7.signature = Buffer.from('invalid signature');
sendBallot(ballot7, voter7); // Voter 7 votes with invalid signature
sendBallot(ballot8, voter1); // Voter 1 votes again

console.log(electionCommission1.ballots);
console.log(electionCommission2.ballots);

const errors = centralElectionCommission.collectBallots(
  electionCommission1.ballots,
  electionCommission2.ballots
);
errors.forEach((error) =>
  console.log('Error during collecting ballots: ' + error)
);
console.log('Votes: ', centralElectionCommission.votes);



