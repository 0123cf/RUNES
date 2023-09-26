import {
  initEccLib,
  networks,
  script,
  Signer,
  payments,
  crypto,
  Psbt,
  Transaction,
} from "bitcoinjs-lib";
import { broadcast, waitUntilUTXO } from "./blockstream_utils";
import { ECPairFactory, ECPairAPI, TinySecp256k1Interface } from "ecpair";
import { Taptree } from "bitcoinjs-lib/src/types";
import { encode_issue } from "./encode";

const tinysecp: TinySecp256k1Interface = require("tiny-secp256k1");
initEccLib(tinysecp as any);
const ECPair: ECPairAPI = ECPairFactory(tinysecp);

export const issue_rune = async ({
  symbol,
  decimals,
  supply,
  WIF,
  recv,
  is_send = true,
  is_decode = false,
  fee_value,
  network = networks.testnet
}: {
  symbol: string;
  decimals: number;
  supply: number;
  WIF: string;
  is_send?: boolean;
  is_decode?: boolean;
  recv?: string;
  fee_value: number;
  network?: networks.Network
}) => {

  if(supply <= 0){
    return console.error('supply cannot be less than 0')
  }
  if(decimals >= 100){
    return console.error('The maximum value of decimals is 99')
  }

  const keypair = ECPair.fromWIF(WIF, network);
  const tweakedSigner = tweakSigner(keypair, { network });
  const p2pktr = payments.p2tr({
    pubkey: toXOnly(tweakedSigner.publicKey),
    network,
  });

  const payerAddress = p2pktr.address;
  if (!payerAddress) {
    return console.log("payerAddress error");
  }

  const utxos = await waitUntilUTXO(payerAddress, network === networks.bitcoin);
  console.log(`Using UTXO ${utxos[0].txid}:${utxos[0].vout}`);

  const psbt = new Psbt({ network });
  psbt.addInput({
    hash: utxos[0].txid,
    index: utxos[0].vout,
    witnessUtxo: { value: utxos[0].value, script: p2pktr.output! },
    tapInternalKey: toXOnly(keypair.publicKey),
  });

  const opReturnOutput = encode_issue(supply, symbol, decimals);
  psbt.addOutput({
    script: opReturnOutput!,
    value: 0,
  });
  psbt.addOutput({
    address: recv || p2pktr.address!,
    value: utxos[0].value - fee_value,
  });

  psbt.signInput(0, tweakedSigner);
  psbt.finalizeAllInputs();

  const tx = psbt.extractTransaction();
  console.log(`Broadcasting Transaction Hex: ${tx.toHex()}`);
  if (is_send) {
    const txid = await broadcast(tx.toHex(), network === networks.bitcoin);
    console.log(`Success! Txid is ${txid}`);
  }
  if (is_decode) {
    decoderawtransaction(tx.toHex());
  }
};

export const decoderawtransaction = (raw_tx_hex: string) => {
  const network = networks.bitcoin;

  const buffer = Buffer.from(raw_tx_hex, "hex");
  if (network) {
    const tx = Transaction.fromBuffer(buffer, network as any);
    const decodedTx: any = {
      txid: tx.getId(),
      inputs: [],
      outputs: [],
    };

    for (const input of tx.ins) {
      const inputDetails = {
        prevTxId: input.hash.reverse().toString("hex"),
        outputIndex: input.index,
        scriptSig: input.script.toString("hex"),
        txinwitness: [] as any,
      };

      if (input.witness.length > 0) {
        for (const witnessItem of input.witness) {
          inputDetails.txinwitness.push(witnessItem.toString("hex"));
        }
      }

      decodedTx.inputs.push(inputDetails);
    }
    for (const output of tx.outs) {
      const outputDetails = {
        value: output.value,
        scriptPubKey: output.script.toString("hex"),
        ASM: script.toASM(output.script),
      };
      decodedTx.outputs.push(outputDetails);
    }
    console.log(decodedTx.inputs);
    console.log(decodedTx.outputs);
  }
};

function tweakSigner(signer: Signer, opts: any = {}): Signer {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let privateKey: Uint8Array | undefined = signer.privateKey!;
  if (!privateKey) {
    throw new Error("Private key is required for tweaking signer!");
  }
  if (signer.publicKey[0] === 3) {
    privateKey = tinysecp.privateNegate(privateKey);
  }

  const tweakedPrivateKey = tinysecp.privateAdd(
    privateKey,
    tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash)
  );
  if (!tweakedPrivateKey) {
    throw new Error("Invalid tweaked private key!");
  }

  return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
    network: opts.network,
  });
}

function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer {
  return crypto.taggedHash(
    "TapTweak",
    Buffer.concat(h ? [pubKey, h] : [pubKey])
  );
}

function toXOnly(pubkey: Buffer): Buffer {
  return pubkey.subarray(1, 33);
}
