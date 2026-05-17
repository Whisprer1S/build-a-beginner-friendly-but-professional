const QR_VERSION = 2;
const QR_SIZE = 25;
const DATA_CODEWORDS = 34;
const ERROR_CODEWORDS = 10;
const MASK_PATTERN = 0;

function getUtf8Bytes(value) {
  if (typeof TextEncoder !== 'undefined') return Array.from(new TextEncoder().encode(value));

  return Array.from(unescape(encodeURIComponent(value)), (character) => character.charCodeAt(0));
}

function appendBits(bits, value, length) {
  for (let index = length - 1; index >= 0; index -= 1) {
    bits.push(((value >>> index) & 1) === 1);
  }
}

function createDataCodewords(value) {
  const bytes = getUtf8Bytes(value);
  const bitCapacity = DATA_CODEWORDS * 8;
  const bits = [];

  if (bytes.length > 29) {
    throw new Error('QR version 2-L byte mode supports up to 29 bytes.');
  }

  appendBits(bits, 0b0100, 4);
  appendBits(bits, bytes.length, 8);
  bytes.forEach((byte) => appendBits(bits, byte, 8));
  appendBits(bits, 0, Math.min(4, bitCapacity - bits.length));

  while (bits.length % 8 !== 0) bits.push(false);

  const codewords = [];
  for (let index = 0; index < bits.length; index += 8) {
    let codeword = 0;
    for (let offset = 0; offset < 8; offset += 1) {
      codeword = (codeword << 1) | (bits[index + offset] ? 1 : 0);
    }
    codewords.push(codeword);
  }

  const padBytes = [0xec, 0x11];
  let padIndex = 0;
  while (codewords.length < DATA_CODEWORDS) {
    codewords.push(padBytes[padIndex % 2]);
    padIndex += 1;
  }

  return codewords;
}

function createGaloisTables() {
  const exp = Array(512).fill(0);
  const log = Array(256).fill(0);
  let value = 1;

  for (let index = 0; index < 255; index += 1) {
    exp[index] = value;
    log[value] = index;
    value <<= 1;
    if (value & 0x100) value ^= 0x11d;
  }

  for (let index = 255; index < exp.length; index += 1) {
    exp[index] = exp[index - 255];
  }

  return { exp, log };
}

const GALOIS = createGaloisTables();

function gfMultiply(left, right) {
  if (left === 0 || right === 0) return 0;
  return GALOIS.exp[GALOIS.log[left] + GALOIS.log[right]];
}

function createGeneratorPolynomial(degree) {
  let generator = [1];

  for (let index = 0; index < degree; index += 1) {
    const next = Array(generator.length + 1).fill(0);
    generator.forEach((coefficient, coefficientIndex) => {
      next[coefficientIndex] ^= coefficient;
      next[coefficientIndex + 1] ^= gfMultiply(coefficient, GALOIS.exp[index]);
    });
    generator = next;
  }

  return generator;
}

function createErrorCodewords(dataCodewords) {
  const generator = createGeneratorPolynomial(ERROR_CODEWORDS);
  const remainder = Array(ERROR_CODEWORDS).fill(0);

  dataCodewords.forEach((codeword) => {
    const factor = codeword ^ remainder.shift();
    remainder.push(0);
    for (let index = 0; index < ERROR_CODEWORDS; index += 1) {
      remainder[index] ^= gfMultiply(generator[index + 1], factor);
    }
  });

  return remainder;
}

function createMatrix(size) {
  return Array.from({ length: size }, () => Array(size).fill(false));
}

function isInside(size, x, y) {
  return x >= 0 && x < size && y >= 0 && y < size;
}

function getFormatBits(maskPattern) {
  const levelBits = 0b01; // Error correction level L.
  const data = (levelBits << 3) | maskPattern;
  let remainder = data << 10;

  for (let bit = 14; bit >= 10; bit -= 1) {
    if (((remainder >>> bit) & 1) !== 0) remainder ^= 0x537 << (bit - 10);
  }

  return ((data << 10) | remainder) ^ 0x5412;
}

export function createQrModules(value) {
  const modules = createMatrix(QR_SIZE);
  const reserved = createMatrix(QR_SIZE);

  function setFunctionModule(x, y, isDark) {
    if (!isInside(QR_SIZE, x, y)) return;
    modules[y][x] = isDark;
    reserved[y][x] = true;
  }

  function drawFinderPattern(x, y) {
    for (let dy = -1; dy <= 7; dy += 1) {
      for (let dx = -1; dx <= 7; dx += 1) {
        const xx = x + dx;
        const yy = y + dy;
        if (!isInside(QR_SIZE, xx, yy)) continue;

        const isFinderArea = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
        const isBorder = dx === 0 || dx === 6 || dy === 0 || dy === 6;
        const isCenter = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
        setFunctionModule(xx, yy, isFinderArea && (isBorder || isCenter));
      }
    }
  }

  function drawAlignmentPattern(centerX, centerY) {
    for (let dy = -2; dy <= 2; dy += 1) {
      for (let dx = -2; dx <= 2; dx += 1) {
        setFunctionModule(centerX + dx, centerY + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }

  drawFinderPattern(0, 0);
  drawFinderPattern(QR_SIZE - 7, 0);
  drawFinderPattern(0, QR_SIZE - 7);
  drawAlignmentPattern(18, 18);

  for (let index = 8; index < QR_SIZE - 8; index += 1) {
    const isDark = index % 2 === 0;
    setFunctionModule(index, 6, isDark);
    setFunctionModule(6, index, isDark);
  }

  setFunctionModule(8, 4 * QR_VERSION + 9, true);

  const formatBits = getFormatBits(MASK_PATTERN);
  for (let index = 0; index <= 5; index += 1) setFunctionModule(8, index, ((formatBits >>> index) & 1) === 1);
  setFunctionModule(8, 7, ((formatBits >>> 6) & 1) === 1);
  setFunctionModule(8, 8, ((formatBits >>> 7) & 1) === 1);
  setFunctionModule(7, 8, ((formatBits >>> 8) & 1) === 1);
  for (let index = 9; index < 15; index += 1) setFunctionModule(14 - index, 8, ((formatBits >>> index) & 1) === 1);
  for (let index = 0; index < 8; index += 1) setFunctionModule(QR_SIZE - 1 - index, 8, ((formatBits >>> index) & 1) === 1);
  for (let index = 8; index < 15; index += 1) setFunctionModule(8, QR_SIZE - 15 + index, ((formatBits >>> index) & 1) === 1);

  const dataCodewords = createDataCodewords(value);
  const codewords = [...dataCodewords, ...createErrorCodewords(dataCodewords)];
  const dataBits = codewords.flatMap((codeword) => (
    Array.from({ length: 8 }, (_, index) => ((codeword >>> (7 - index)) & 1) === 1)
  ));

  let bitIndex = 0;
  let upward = true;
  for (let right = QR_SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1;

    for (let vertical = 0; vertical < QR_SIZE; vertical += 1) {
      const y = upward ? QR_SIZE - 1 - vertical : vertical;

      for (let offset = 0; offset < 2; offset += 1) {
        const x = right - offset;
        if (reserved[y][x]) continue;

        const bit = bitIndex < dataBits.length ? dataBits[bitIndex] : false;
        const shouldMask = (x + y) % 2 === 0;
        modules[y][x] = bit !== shouldMask;
        bitIndex += 1;
      }
    }

    upward = !upward;
  }

  return modules;
}
