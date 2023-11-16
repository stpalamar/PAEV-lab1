import Voter from './Voter';
import Cvk from './Cvk';
import generateRSAKeyPair from './RSAKeyGenerator';

const cvk = new Cvk(['Canditate A', 'Canditate B', 'Canditate C']);

const voter1 = new Voter('Voter 1', cvk.publicKey);
const voter2 = new Voter('Voter 2', cvk.publicKey);
const voter3 = new Voter('Voter 3', cvk.publicKey);
const voter4 = new Voter('Voter 4', cvk.publicKey);

cvk.addVote(voter1.vote('Canditate A'));
cvk.addVote(voter1.vote('Canditate A'));
cvk.addVote(voter2.vote('Canditate A'));
cvk.addVote(voter3.vote('Canditate B'));
cvk.addVote(voter4.vote('Canditate C'));

console.log(cvk.votes);
