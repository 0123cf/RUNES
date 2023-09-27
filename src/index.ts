import { decode_issue } from "./lib/decode";
import { decoderawtransaction, issue_rune } from "./lib/issue_rune";
import * as dotenv from "dotenv";
dotenv.config();
const { WIF_TEST } = process.env;

const symbol = "RUNE";
const decimals = 18;
const supply = 21000000;

const fee_value = 200;

// address
const recv = "";
const is_send = false;
const is_decode = true;
const is_mint = true;
const p = "P";

// debug
issue_rune({
  symbol,
  decimals,
  supply,
  WIF: WIF_TEST ?? "",
  is_send,
  is_decode,
  fee_value,
  is_mint,
  p,
});

// main
// issue_rune({symbol, decimals, supply, WIF: WIF ?? '', fee_value})