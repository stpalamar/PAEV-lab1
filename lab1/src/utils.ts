export function stringToBinaryArray(str: string): number[] {
  const binaryArray: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    const binaryString = charCode.toString(2).padStart(8, '0');
    binaryArray.push(...binaryString.split('').map(Number));
  }
  return binaryArray;
}

export function binaryArrayToString(binaryArray: number[]): string {
  let str = '';
  for (let i = 0; i < binaryArray.length; i += 8) {
    const byte = binaryArray.slice(i, i + 8).join('');
    const charCode = parseInt(byte, 2);
    str += String.fromCharCode(charCode);
  }
  return str;
}

export function publicKeyToBinaryArray(publicKey: {
  e: number;
  n: number;
}): number[] {
  const publicKeyBits: number[] = [];
  const eBinary = intToBinaryArray(publicKey.e);
  const nBinary = intToBinaryArray(publicKey.n);

  // Додаємо біти публічного ключа до масиву
  publicKeyBits.push(...eBinary);
  publicKeyBits.push(...nBinary);
  return publicKeyBits;
}

export function privateKeyToBinaryArray(privateKey: {
  d: number;
  n: number;
}): number[] {
  const privateKeyBits: number[] = [];

  // Конвертуємо параметр `d` в бінарний масив
  const dBinary = intToBinaryArray(privateKey.d);

  // Конвертуємо параметр `n` в бінарний масив
  const nBinary = intToBinaryArray(privateKey.n);

  // Додаємо біти кожного параметра до масиву
  privateKeyBits.push(...dBinary);
  privateKeyBits.push(...nBinary);

  return privateKeyBits;
}

function intToBinaryArray(num: number): number[] {
  const binaryString = num.toString(2);
  return binaryString.split('').map(Number);
}

export function quadraticHash(input: number[], n: number): number {
  let hash = 0;
  let H = 0; // Початкове значення H0

  for (let i = 0; i < input.length; i++) {
    const M = input[i]; // Номер букви в алфавіті
    H = (H + M) % n; // Обчислення Hi за формулою

    hash = (hash + H * H) % n;
  }

  return hash;
}
