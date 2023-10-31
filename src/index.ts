import Voter from './Voter';
import Ballot from './Ballot';
import generateRSAKeyPair from './RSAKeyGenerator';
import {
  binaryArrayToString,
  privateKeyToBinaryArray,
  quadraticHash,
} from './utils';

function verifySignature(
  encryptedVote: number[],
  signature: bigint,
  publicVoterKey: { e: number; n: number }
): boolean {
  const decryptedSignature =
    signature ** BigInt(publicVoterKey.e) % BigInt(publicVoterKey.n);
  const hash = quadraticHash(encryptedVote, publicVoterKey.n);
  return hash === Number(decryptedSignature);
}

function decryptVote(
  encryptedVote: number[],
  cvkPrivateKey: { d: number; n: number }
): string {
  // Отримуємо бінарний вигляд приватного ключа ЦВК
  const cvkPrivateKeyBits: number[] = privateKeyToBinaryArray(cvkPrivateKey);

  // Розшифровуємо гамований голос, використовуючи приватний ключ ЦВК як розшифровувальний ключ
  const decryptedVote: number[] = encryptedVote.map(
    (bit, index) => bit ^ cvkPrivateKeyBits[index]
  );

  // Перетворюємо бінарний масив назад в рядок
  const candidateName = binaryArrayToString(decryptedVote);

  return candidateName;
}

const candidates = ['Canditate A', 'Canditate B', 'Canditate C'];

const ballot = new Ballot(candidates);

const cvkKeys = generateRSAKeyPair();

const voter1 = new Voter('Voter 1', cvkKeys.publicKey);
const voter2 = new Voter('Voter 2', cvkKeys.publicKey);
const voter3 = new Voter('Voter 3', cvkKeys.publicKey);

ballot.addVote(voter1.vote('Canditate A'));
// ballot.addVote(voter2.vote('Canditate A'));
// ballot.addVote(voter3.vote('Canditate B'));

const verifySignatureResult = verifySignature(
  ballot.votes[0].encryptedVote,
  ballot.votes[0].signature,
  voter1.publicKey
);

const decryptedVote = decryptVote(
  ballot.votes[0].encryptedVote,
  cvkKeys.privateKey
);

console.log(verifySignatureResult);
console.log('decryptedVote:', decryptedVote);
