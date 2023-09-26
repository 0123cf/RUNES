import { networks } from "bitcoinjs-lib";
import { decode_issue } from "./lib/decode";
import { issue_rune } from "./lib/issue_rune";
import * as dotenv from "dotenv";
dotenv.config();
const { WIF } = process.env;

const symbol = "SATS";
const decimals = 18;
const supply = 21000000 * 1e9;

const fee_value = 4000;

const recv = "";
const is_send = true;
const is_decode = true;

issue_rune({
  symbol,
  decimals,
  supply,
  WIF: WIF ?? "",
  fee_value,
  is_send,
  is_decode,
  network: networks.bitcoin
});
