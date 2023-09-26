import { decode_issue } from "./lib/decode";
import { issue_rune } from "./lib/issue_rune";
import * as dotenv from 'dotenv';
dotenv.config();
const { WIF } = process.env;


const symbol = 'RUNE00000000222'
const decimals = 18
const supply = 21000000

const fee_value = 200

// address
const recv = "" 
const is_send = false
const is_decode = true

// debug
issue_rune({symbol, decimals, supply, WIF: WIF ?? '', is_send, is_decode, fee_value})

// main
// issue_rune({symbol, decimals, supply, WIF: WIF ?? '', fee_value})