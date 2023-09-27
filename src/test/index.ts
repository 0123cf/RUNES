import { script } from "bitcoinjs-lib";
import { ENCODE_TYPE, encode_issue } from "../lib/encode";
import { decoderawtransaction } from "../lib/issue_rune";
import { VarInt } from "../lib/varint";

decoderawtransaction('01000000000101c305297cf18619a64dc0778d709a056184aa8760a4e95885585fd0ce3eff469e0800000000ffffffff0200000000000000001a6a01520b0001ff00752b7d000000000aff9878060100000000122d271d00000000002251208b9feef297e14e85f192e8f900efaf8852bf78542898c2a7af9550d4e137026101406e124084850794e370013ee6cfb5db762a16108df9ac8f7951140a56c3f143dc367bb9df0b424eba627e4887043140a80aab9571349a869a024a4095cb95928000000000')
// decoderawtransaction('01000000000101a616ebcf5b79993bd58fdf5830663bbb792d99c292350492857ba3d293887ba70300000000ffffffff040000000000000000126a0152030001450affe083e50000000000122202000000000000225120faae2eb2f5a9baa41050f8e2799115722cd3c9b683ea6f33e0a11caf764faa21f824010000000000225120f667578b85bed256c7fcb9f2cda488d5281e52ca42e7dd4bc21e95149562f09f9083030000000000225120045f0270cab3fd9be9c1e7b78686244ccc5b001db145ae3d9678ee254a576a0a0140ca3ed829cf459dd4fec05945eb2b215caab468105cd081b46c0f7061a005f727c5b50407d8c10494bda121b95c9097534bc3b201d93cec3c75515eef24d6623300000000')


function test_encode(){
    const symbol = "RUNE";
    const decimals = 18;
    // const supply = 21000000;
    const supply = 2100000000;

    const scriptPubKey = encode_issue(supply, symbol, decimals, false, 'R', ENCODE_TYPE.OW)
    if(scriptPubKey){
        const asm = script.toASM(scriptPubKey)
        console.log(
            scriptPubKey,
            asm
        )
    }
}

function test_varint() {
  const testCases = [
    { input: "6a", expected: [106, 1] },
    { input: "fd2602", expected: [550, 3] },
    { input: "fe703a0f00", expected: [998000, 5] },
  ];
  
  for (const testCase of testCases) {
    const bytes = testCase.input.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16));
    if (bytes) {
      const result = VarInt.readBytes(bytes);
      console.log("Input:", testCase.input);
      console.log("Expected:", testCase.expected);
      console.log("Actual:", result);
      console.log("Test passed:", result[0] === testCase.expected[0] && result[1] === testCase.expected[1]);
      console.log("------------");
    }
  }
  
  console.log(
    'getBytes',
    VarInt.getBytes(
        parseInt(Buffer.from("RUNE").toString('hex'), 16)
    ),
  )
}

// test_varint()
test_encode()