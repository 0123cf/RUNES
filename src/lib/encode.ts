import { payments } from "bitcoinjs-lib";
import { number } from "bitcoinjs-lib/src/script";

export function encode_issue(supply: number, symbol: string, decimals: number){
    const issuanceData = Buffer.from(symbol + decimals)
    const opReturnOutput = payments.embed({ data: [
        Buffer.from('R', 'utf-8'), 
        Buffer.from(supply.toString()),
        issuanceData
    ] }).output
    return opReturnOutput
}