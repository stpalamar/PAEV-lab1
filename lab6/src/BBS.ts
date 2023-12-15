function generateX(n: bigint): bigint {
  let x = getRandomCoprime(n);
  do {
    x = getRandomCoprime(n);
  } while (gcd(x, n) !== 1n);

  return x;
}

function getRandomCoprime(max: bigint): bigint {
  let result: bigint;
  do {
    result = BigInt(Math.floor(Math.random() * Number(max)));
  } while (gcd(result, max) !== 1n);
  return result;
}

function gcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

function squareModN(num: bigint, n: bigint): bigint {
  return (num * num) % n;
}

function getBit(x: bigint): bigint {
  return BigInt(x & 1n);
}

function stringToBits(input: string): bigint[] {
  const result: bigint[] = [];

  for (let i = 0; i < input.length; i++) {
    const charCode = BigInt(input.charCodeAt(i));

    for (let j = 7; j >= 0; j--) {
      result.push((charCode >> BigInt(j)) & BigInt(1));
    }
  }

  return result;
}

export function encrypt(
  message: string,
  n: bigint
): {
  encryptedMessage: number[];
  x0: number;
} {
  const result: number[] = [];

  const bits = stringToBits(message);
  const x = generateX(n);
  const x0 = squareModN(x, n);
  let xi = x0;
  for (let i = 0; i < bits.length; i++) {
    const mi = bits[i];
    xi = squareModN(xi, n);
    const bi = getBit(xi);
    result.push(Number(mi ^ bi));
  }

  return { encryptedMessage: result, x0: Number(x0) };
}

export function decrypt(
  bits: number[],
  x0: bigint,
  p: bigint,
  q: bigint
): string {
  x0 = BigInt(x0);
  const n = p * q;
  const result: bigint[] = [];
  const b0 = getBit(x0);
  let xi = x0;
  for (let i = 0; i < bits.length; i++) {
    const mi = BigInt(bits[i]);
    xi = squareModN(xi, n);
    const bi = getBit(xi);
    result.push(mi ^ bi);
  }

  let resultString = '';
  for (let i = 0; i < result.length; i += 8) {
    const charCode = result
      .slice(i, i + 8)
      .reduce((acc, bit, index) => acc + bit * 2n ** BigInt(7 - index), 0n);
    resultString += String.fromCharCode(Number(charCode));
  }

  return resultString;
}

function isPrime(num: number): boolean {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

export function generatePrimes(): [bigint, bigint] {
  let p: number = Math.floor(Math.random() * 900) + 100;
  let q: number = Math.floor(Math.random() * 900) + 100;

  while (!isPrime(p) || !isPrime(q) || p % 4 !== 3 || q % 4 !== 3) {
    p = Math.floor(Math.random() * 900) + 100;
    q = Math.floor(Math.random() * 900) + 100;
  }

  return [BigInt(p), BigInt(q)];
}
