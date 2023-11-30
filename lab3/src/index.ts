import RegistationOffice from './RegistrationOffice';
import ElectionCommission from './ElectionCommission';
import Voter from './Voter';
import ElGamal from 'elgamal';

async function run() {
  const registrationOffice = new RegistationOffice();

  const voter1 = new Voter('John');
  const voter2 = new Voter('Frank');
  const voter3 = new Voter('Bob');
  const voter4 = new Voter('Alice');
  const voter5 = new Voter('Test1');
  const voter6 = new Voter('Test2');
  const voter7 = new Voter('Test3');

  voter1.registationNumber =
    registrationOffice.generateRegistationNumber(voter1);
  voter2.registationNumber =
    registrationOffice.generateRegistationNumber(voter2);
  voter3.registationNumber =
    registrationOffice.generateRegistationNumber(voter3);
  voter4.registationNumber =
    registrationOffice.generateRegistationNumber(voter4);
  voter5.registationNumber =
    registrationOffice.generateRegistationNumber(voter5);
  voter6.registationNumber =
    registrationOffice.generateRegistationNumber(voter6);
  voter7.registationNumber = 'Invalid registration number';

  const candidates = ['Candidate 1', 'Candidate 2'];

  const eg = await ElGamal.generateAsync(1024);
  const electionCommission = new ElectionCommission(
    candidates,
    registrationOffice.getRegistationNumbers(),
    eg
  );

  const voter1Message = await voter1.createMessage('Candidate 1', eg);
  const voter2Message = await voter2.createMessage('Candidate 2', eg);
  const voter3Message = await voter3.createMessage('Candidate 1', eg);
  const voter4Message = await voter4.createMessage('Candidate 1', eg);
  await electionCommission.addVote(voter1Message, voter1.publicKey);
  await electionCommission.addVote(voter2Message, voter2.publicKey);
  await electionCommission.addVote(voter3Message, voter3.publicKey);
  await electionCommission.addVote(voter4Message, voter4.publicKey);

  console.log('Results:', electionCommission.getResults());

  // Voter 1 tries to register again
  await catchErrorAsync(async () => {
    registrationOffice.generateRegistationNumber(voter1);
  });

  // Voter 1 tries to vote again
  await catchErrorAsync(async () => {
    await electionCommission.addVote(voter1Message, voter1.publicKey);
  });

  // Voter 1 tries to vote for a candidate that is not in the list
  await catchErrorAsync(async () => {
    const voter5Message = await voter5.createMessage('Candidate 3', eg);
    await electionCommission.addVote(voter5Message, voter5.publicKey);
  });

  // Voter 1 tries to vote with an invalid signature

  await catchErrorAsync(async () => {
    const voter6Message = await voter6.createMessage('Candidate 1', eg);
    voter6Message.signature = 'Invalid signature';
    await electionCommission.addVote(voter6Message, voter6.publicKey);
  });

  // Voter 1 tries to vote with an invalid registration number

  await catchErrorAsync(async () => {
    const voter7Message = await voter7.createMessage('Candidate 1', eg);
    await electionCommission.addVote(voter7Message, voter7.publicKey);
  });
}

async function catchErrorAsync(fn: Function) {
  try {
    await fn();
  } catch (e: any) {
    console.log('Error:', e.message);
  }
}

run();
