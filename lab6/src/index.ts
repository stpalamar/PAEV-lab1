import RegistrationOffice from './RegistrationOffice';
import ElectionCommission from './ElectionCommission';
import Voter from './Voter';
import { EncryptedValue } from 'elgamal';
import { BigInteger as BigInteger } from 'jsbn';



const run = async () => {
  const registrationOffice = new RegistrationOffice();
  registrationOffice.generateIdSet(8);

  const electionCommission = new ElectionCommission([
    'Candidate A',
    'Candidate B',
  ]);
  const tokens = await electionCommission.generateTokens(
    registrationOffice.idSet
  );
  registrationOffice.setTokens(tokens);

  const voter1 = new Voter('Jan', 'Kowalski');
  const voter2 = new Voter('Orion', 'Blackwood');
  const voter3 = new Voter('Elara', 'Frost');
  const voter4 = new Voter('Asher', 'Mercer');
  const voter5 = new Voter('Isla', 'Wren');
  const voter6 = new Voter('Atticus', 'Steele');
  const voter7 = new Voter('Nova', 'Everhart');
  const voter8 = new Voter('Jasper', 'Nightshade');
  const voter9 = new Voter('Lila', 'Rainier');

  registrationOffice.registerVoter(voter1);
  registrationOffice.registerVoter(voter2);
  registrationOffice.registerVoter(voter3);
  registrationOffice.registerVoter(voter4);
  registrationOffice.registerVoter(voter5);
  registrationOffice.registerVoter(voter6);
  registrationOffice.registerVoter(voter7);
  registrationOffice.registerVoter(voter8);

  const encryptedVote1 = await voter1.vote(voter1.token!, 'Candidate A');
  const encryptedVote2 = await voter2.vote(voter2.token!, 'Candidate A');
  const encryptedVote3 = await voter3.vote(voter3.token!, 'Candidate B');
  const encryptedVote4 = await voter4.vote(voter4.token!, 'Candidate B');

  const encryptedVote5 = await voter4.vote(voter4.token!, 'Candidate A'); // duplicated

  const encryptedVote6 = await voter5.vote(voter6.token!, 'Candidate X'); // invalid candidate

  const token7 = voter7.token!;
  token7.publicKey = BigInt(123456789); // invalid public key
  const encryptedVote7 = await voter5.vote(token7, 'Candidate A'); // invalid public key
  let encryptedVote8 = await voter8.vote(voter8.token!, 'Candidate B');
  encryptedVote8 = new EncryptedValue(
    new BigInteger([434, 434]),
    new BigInteger([433, 43])
  ); // invalid encrypted message

  const encryptedVote9 = await voter9.vote(
    { id: 'FAKE-ID', publicKey: BigInt(453), eg: electionCommission.eg! },
    'Candidate A'
  ); // not registered

  electionCommission.addVote(encryptedVote1);
  electionCommission.addVote(encryptedVote2);
  electionCommission.addVote(encryptedVote3);
  electionCommission.addVote(encryptedVote4);
  electionCommission.addVote(encryptedVote5); // duplicated
  electionCommission.addVote(encryptedVote6); // invalid candidate
  electionCommission.addVote(encryptedVote7); // invalid public key
  electionCommission.addVote(encryptedVote8); // invalid encrypted message
  electionCommission.addVote(encryptedVote9); // not registered

  const result = await electionCommission.finishElection();
  result.results.map((result) => console.log(result));
  result.errors.map((error) => console.log(`Error: ${error}`));
};

run();
