import Voter from './Voter';
import Cvk from './Cvk';

const cvk = new Cvk(['Canditate A', 'Canditate B', 'Canditate C']);

const voter1 = new Voter('Voter 1', cvk.publicKey);
const voter2 = new Voter('Voter 2', cvk.publicKey);
const voter3 = new Voter('Voter 3', cvk.publicKey);
const voter4 = new Voter('Voter 4', cvk.publicKey);

cvk.registerVoter(voter1.publicKey);
cvk.registerVoter(voter2.publicKey);
cvk.registerVoter(voter3.publicKey);
cvk.registerVoter(voter4.publicKey);

cvk.addVote(voter1.vote(cvk.candidates[0]));
cvk.addVote(voter2.vote(cvk.candidates[0]));
cvk.addVote(voter3.vote(cvk.candidates[1]));
cvk.addVote(voter4.vote(cvk.candidates[2]));

console.log(
  cvk.votes.map((vote) => {
    const isValidSignature = cvk.verifySignature(
      vote.encryptedVote,
      vote.signature,
      vote.publicKey
    );
    const decryptedVote = cvk.decryptVote(vote.encryptedVote);
    return { decryptedVote, isValidSignature };
  })
);
