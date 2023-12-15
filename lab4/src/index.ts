import ElGamal, { EncryptedValue } from 'elgamal';
import Voter from './Voter';
import assert from 'assert';

async function run() {
  const candidates = ['Candidate A', 'Candidate B'];
  const voterA = new Voter('Voter A', await ElGamal.generateAsync(1024));
  const voterB = new Voter('Voter B', await ElGamal.generateAsync(1024));
  const voterC = new Voter('Voter C', await ElGamal.generateAsync(1024));
  const voterD = new Voter('Voter D', await ElGamal.generateAsync(1024));

  const votersPublicKeys = [
    voterA.publicKey,
    voterB.publicKey,
    voterC.publicKey,
    voterD.publicKey,
  ];
  let ballots: any = [
    voterA.createBallot(candidates[0], votersPublicKeys),
    voterB.createBallot(candidates[0], votersPublicKeys),
    voterC.createBallot(candidates[1], votersPublicKeys),
    voterD.createBallot(candidates[1], votersPublicKeys),
  ];

  ballots = voterA.decryptBallotAndRemoveString(ballots);
  ballots = voterB.decryptBallotAndRemoveString(ballots);
  ballots = voterC.decryptBallotAndRemoveString(ballots);
  ballots = voterD.decryptBallotAndRemoveString(ballots);

  (ballots = await voterA.decryptAndSign({
    ballots: ballots,
    signature: null,
  })),
    (ballots = await voterB.decryptAndSign(ballots, voterA.eg)),
    (ballots = await voterC.decryptAndSign(ballots, voterB.eg)),
    (ballots = await voterD.decryptAndSign(ballots, voterC.eg));

  const ballotsA = await voterA.verifySignature(ballots, voterD.eg);
  const ballotsB = await voterB.verifySignature(ballots, voterD.eg);
  const ballotsC = await voterC.verifySignature(ballots, voterD.eg);

  assert.deepEqual(ballotsA, ballotsB);
  assert.deepEqual(ballotsA, ballotsC);

  ballotsA.forEach((ballot) => console.log(ballot.toString()));
}

// run();

async function runWithError() {
  const candidates = ['Candidate A', 'Candidate B'];
  const voterA = new Voter('Voter A', await ElGamal.generateAsync(1024));
  const voterB = new Voter('Voter B', await ElGamal.generateAsync(1024));
  const voterC = new Voter('Voter C', await ElGamal.generateAsync(1024));
  const voterD = new Voter('Voter D', await ElGamal.generateAsync(1024));

  const votersPublicKeys = [
    voterA.publicKey,
    voterB.publicKey,
    voterC.publicKey,
    voterD.publicKey,
  ];
  let ballots: any = [
    voterA.createBallot(candidates[0], votersPublicKeys),
    voterB.createBallot(candidates[0], votersPublicKeys),
    voterC.createBallot(candidates[1], votersPublicKeys),
    voterD.createBallot(candidates[1], votersPublicKeys),
  ];

  ballots = voterA.decryptBallotAndRemoveString(ballots);
  ballots = voterB.decryptBallotAndRemoveString(ballots);
  ballots = voterC.decryptBallotAndRemoveString(ballots);
  ballots = voterD.decryptBallotAndRemoveString(ballots);

  (ballots = await voterA.decryptAndSign({
    ballots: ballots,
    signature: null,
  })),
    (ballots = await voterB.decryptAndSign(ballots, voterA.eg)),
    (ballots = await voterC.decryptAndSign(ballots, voterB.eg)),
    // voterD decrypts with wrong signature
    (ballots = await voterD.decryptAndSign(
      {
        ballots: ballots,
        signature: null,
      },
      voterC.eg
    ));

  const ballotsA = await voterA.verifySignature(ballots, voterD.eg);
  const ballotsB = await voterB.verifySignature(ballots, voterD.eg);
  const ballotsC = await voterC.verifySignature(ballots, voterD.eg);

  assert.deepEqual(ballotsA, ballotsB);
  assert.deepEqual(ballotsA, ballotsC);

  ballotsA.forEach((ballot) => console.log(ballot.toString()));
}

runWithError();
