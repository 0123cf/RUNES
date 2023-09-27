import { payments } from "bitcoinjs-lib";
import { number } from "bitcoinjs-lib/src/script";
import { VarInt } from "./varint";

const BASE_OFFSET = 1;
function symbolToInt(symbol: string): number {
  if (!symbol.match(/^[A-Z]+$/)) {
    throw new Error(
      `Invalid symbol: ${symbol}. Only uppercase letters A-Z are allowed`
    );
  }

  let value = 0;
  for (let i = 0; i < symbol.length; i++) {
    const c = symbol[symbol.length - 1 - i];
    value +=
      (c.charCodeAt(0) - "A".charCodeAt(0) + BASE_OFFSET) * Math.pow(26, i);
  }
  return value;
}
function name(varint_name: string) {
  const add = (a: string, b: string) => a + b;
  let base26_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  let name = base26_chars
    .map((e) => {
      return base26_chars[parseInt(e)];
    })
    .reduce(add);
  return name;
}

export enum ENCODE_TYPE {
  OW,
  HEX,
}
export function encode_issue(
  supply: number,
  symbol: string,
  decimals: number,
  is_mint: boolean,
  p: string,
  encode_type = ENCODE_TYPE.HEX
) {
  if (p === "P") {
    // TODO TRAC
    const int_to_hex_buf = (num: number) =>
      Buffer.from(num.toString(16), "utf-8");

    const opReturnOutput = payments.embed({
      data: [
      ],
    }).output;
    return opReturnOutput;
  }
  if (p === "R") {
    if (encode_type === ENCODE_TYPE.OW) {
      const opReturnOutput = payments.embed({
        data: [
          Buffer.from(VarInt.getBytes(0).concat(VarInt.getBytes(1)).concat(VarInt.getBytes(supply))),
          Buffer.from(
            VarInt.getBytes(
              // parseInt(Buffer.from("RUNE").toString('hex'), 16)
              symbolToInt(symbol)
            ).concat(VarInt.getBytes(decimals))
          ),
        ],
      }).output;
      return opReturnOutput;
    }
  }
  const issuanceData = Buffer.from(symbol + decimals);
  const opReturnOutput = payments.embed({
    data: [
      Buffer.from("R", "utf-8"),
      Buffer.from(supply.toString()),
      issuanceData,
    ],
  }).output;
  return opReturnOutput;
}
