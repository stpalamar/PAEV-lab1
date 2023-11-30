import * as crypto from 'crypto';
import Voter from './Voter';

class RegistrationOffice {
  registrationNumberMap: Map<string, string> = new Map();

  generateRegistationNumber(voter: Voter): string {
    const values = [...this.registrationNumberMap.values()];
    if (values.includes(voter.name)) {
      throw new Error('Voter already registered');
    }
    const registationNumber = crypto.randomBytes(16).toString('hex');
    this.registrationNumberMap.set(registationNumber, voter.name);
    return registationNumber;
  }

  getRegistationNumbers(): string[] {
    return Array.from(this.registrationNumberMap.keys());
  }
}

export default RegistrationOffice;
