import crypto from 'crypto';

export default function generateRSAKeyPair(): {
  publicKey: { e: number; n: number };
  privateKey: { d: number; n: number };
} {
  const p = generatePrimeNumber(8); // Генеруємо перше просте число
  const q = generatePrimeNumber(8); // Генеруємо друге просте число
  const n = p * q; // Обраховуємо їхній добуток
  const phi = (p - 1) * (q - 1); // Обраховуємо функцію Ейлера

  const e = generatePublicKeyExponent(phi); // Генеруємо публічний експонент
  const d = generatePrivateKeyExponent(e, phi); // Генеруємо приватний експонент

  const publicKey = { e, n };
  const privateKey = { d, n };

  return { publicKey, privateKey };
}

function generatePrimeNumber(bitLength: number): number {
  const max = 2 ** bitLength - 1;

  while (true) {
    const randomBytes = crypto.randomBytes(Math.ceil(bitLength / 8));
    const randomNumber = parseInt('0x' + randomBytes.toString('hex'));

    if (randomNumber >= max) {
      // Пропускаємо значення, які більше максимально можливого для бажаної довжини
      continue;
    }

    if (isPrime(randomNumber)) {
      return randomNumber;
    }
  }
}

function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

  let i = 5;
  while (i * i <= n) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
    i += 6;
  }

  return true;
}

function generatePublicKeyExponent(phi: number): number {
  // Традиційно використовують значення 65537 як публічний експонент
  const publicKeyExponent = 65537;

  // Перевірити, чи publicKeyExponent є взаємно простим з phi
  if (gcd(publicKeyExponent, phi) === 1) {
    return publicKeyExponent;
  }

  throw new Error('Не вдалося знайти публічний експонент');
}

function gcd(a: number, b: number): number {
  if (b === 0) {
    return a;
  }
  return gcd(b, a % b);
}

function generatePrivateKeyExponent(e: number, phi: number): number {
  // Реалізуємо генерацію приватного експоненту за допомогою алгоритму розширеного Евкліда
  // Знаходимо такі числа x та y, що:
  //   e * x + phi * y = 1

  let d = 0; // Приватний експонент
  let x1 = 0; // Попереднє значення x
  let x2 = 1; // Поточне значення x
  let y1 = 1; // Попереднє значення y
  let tempPhi = phi; // Тимчасова змінна для функції Евкліда

  while (e > 0) {
    // Обчислюємо частку та залишок від ділення tempPhi на e
    const quotient = Math.floor(tempPhi / e);
    const remainder = tempPhi % e;

    // Оновлюємо значення tempPhi та e
    tempPhi = e;
    e = remainder;

    // Обчислюємо нові значення x та y
    const x = x2 - quotient * x1;
    const y = d - quotient * y1;

    // Оновлюємо значення x1, x2, d та y1
    x2 = x1;
    x1 = x;
    d = y1;
    y1 = y;
  }

  // Перевіряємо, чи є tempPhi рівним 1
  if (tempPhi === 1) {
    // Якщо tempPhi рівний 1, то ми знайшли приватний експонент
    // Приватний експонент може бути негативним, тому ми перевіряємо це
    if (d < 0) {
      d += phi;
    }
    return d;
  } else {
    // Якщо tempPhi не є рівним 1, то ми не змогли знайти приватний експонент
    throw new Error('Не вдалося знайти приватний експонент.');
  }
}
