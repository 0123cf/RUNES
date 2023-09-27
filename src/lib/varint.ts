export class VarInt {
    static getBytes(length: number): number[] {
      if (length <= 252) {
        return [length];
      } else if (length <= 0xff) {
        const push1 = [0xfd];
        const lengthBytes = new Uint8Array(new Uint16Array([length]).buffer);
        push1.push(...Array.from(lengthBytes));
        return push1;
      } else if (length <= 0xffff) {
        const push2 = [0xfe];
        const lengthBytes = new Uint8Array(new Uint32Array([length]).buffer);
        push2.push(...Array.from(lengthBytes));
        return push2;
      } else {
        const push4 = [0xff];
        const lengthBytes = new Uint8Array(new BigUint64Array([BigInt(length)]).buffer);
        push4.push(...Array.from(lengthBytes));
        return push4;
      }
    }
  
    static readBytes(bytes: number[]): [number, number] {
      switch (bytes[0]) {
        case 0xff: {
          const length = Number(new BigUint64Array(bytes.slice(1, 9).map((b) => BigInt(b)))[0]);
          return [length, 9];
        }
        case 0xfe: {
          const length = Number(new Uint32Array(bytes.slice(1, 5))[0]);
          return [length, 5];
        }
        case 0xfd: {
          const length = Number(new Uint16Array(bytes.slice(1, 3))[0]);
          return [length, 3];
        }
        default: {
          const length = Number(bytes[0]);
          return [length, 1];
        }
      }
    }
}