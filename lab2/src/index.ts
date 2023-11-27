import Voter from './Voter';
import Cvk from './Cvk';

const cvk = new Cvk(['Canditate A', 'Canditate B']);

const voter1 = new Voter('Voter 1', cvk.key, cvk.publicKey);
const voter2 = new Voter('Voter 2', cvk.key, cvk.publicKey);
const voter3 = new Voter('Voter 3', cvk.key, cvk.publicKey);
const voter4 = new Voter('Voter 4', cvk.key, cvk.publicKey);
const voter5 = new Voter('Voter 5', cvk.key, cvk.publicKey);
const voterUnregistered = new Voter(
  'Voter Unregistered',
  cvk.key,
  cvk.publicKey
);

cvk.registerVoter(voter1);
cvk.registerVoter(voter2);
cvk.registerVoter(voter3);
cvk.registerVoter(voter4);
cvk.registerVoter(voter5);

// Voter 1 vote candidate A
const blindedSets1 = voter1.generateBlindedSets(cvk.candidates);
const signedResult1 = cvk.signBlindly(voter1, ...blindedSets1);
const vote1 = voter1.vote(cvk.candidates[0], ...signedResult1);
cvk.addVote(vote1);

// Voter 2 vote candidate B
const blindedSets2 = voter2.generateBlindedSets(cvk.candidates);
const signedResult2 = cvk.signBlindly(voter2, ...blindedSets2);
const vote2 = voter2.vote(cvk.candidates[1], ...signedResult2);
cvk.addVote(vote2);

// Voter 3 vote candidate A
const blindedSets3 = voter3.generateBlindedSets(cvk.candidates);
const signedResult3 = cvk.signBlindly(voter3, ...blindedSets3);
const vote3 = voter3.vote(cvk.candidates[0], ...signedResult3);
cvk.addVote(vote3);

// Voter 4 vote candidate A
const blindedSets4 = voter4.generateBlindedSets(cvk.candidates);
const signedResult4 = cvk.signBlindly(voter4, ...blindedSets4);
const vote4 = voter4.vote(cvk.candidates[0], ...signedResult4);
cvk.addVote(vote4);

// ERROR CASES
// Voter unregistered try to vote
const blindedSets5 = voterUnregistered.generateBlindedSets(cvk.candidates);
catchError(() => cvk.signBlindly(voterUnregistered, ...blindedSets5));

// Voter 4 try to sign ballots again
const blindedSets6 = voter4.generateBlindedSets(cvk.candidates);
catchError(() => cvk.signBlindly(voter4, ...blindedSets6));

// Voter 5 try to vote with three candidates
const blindedSets7 = voter5.generateBlindedSets([
  ...cvk.candidates,
  'Candidate C',
]);
catchError(() => cvk.signBlindly(voter5, ...blindedSets7));

// Voter 5 try to vote with not registered candidate
const blindedSets8 = voter5.generateBlindedSets([
  ...cvk.candidates.slice(0, 1),
  'Candidate X',
]);
catchError(() => cvk.signBlindly(voter5, ...blindedSets8));

// Voter 4 vote again candidate B
const vote5 = voter4.vote(cvk.candidates[1], ...signedResult4);
cvk.addVote(vote5);

// CVK receive invalid vote
cvk.addVote({
  unblinded: vote5.unblinded,
  encryptedVote: vote1.encryptedVote,
});

// CVK receive duplicate vote
cvk.addVote(vote1);

// Finish voting
const votingResult = cvk.getVotingResult();
console.log(votingResult);

function catchError(fn: Function) {
  try {
    fn();
  } catch (e: any) {
    console.log(e.message);
  }
}
