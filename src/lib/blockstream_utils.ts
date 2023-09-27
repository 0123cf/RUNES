import axios, { AxiosResponse } from "axios";


export const OPENAPI_URL_MAINNET = 'https://blockstream.info/api';
export const OPENAPI_URL_TESTNET = 'https://blockstream.info/testnet/api';
// export const OPENAPI_URL_MAINNET = 'https://mempool.space/api';
// export const OPENAPI_URL_TESTNET = 'https://mempool.space/testnet/api';
// export const baseURL = OPENAPI_URL_TESTNET

// const blockstream = new axios.Axios({
//     baseURL,
// });

export async function waitUntilUTXO(address: string, isMiannet = false) {
    return new Promise<IUTXO[]>((resolve, reject) => {
        let intervalId: any;
        const checkForUtxo = async () => {
            try {
                const response: AxiosResponse<IUTXO[]> = await axios.get((isMiannet ? OPENAPI_URL_MAINNET : OPENAPI_URL_TESTNET) + `/address/${address}/utxo`);
                console.log('---response.data', response.data)
                // const data: IUTXO[] = response.data ? (isMiannet ? response.data : JSON.parse(response.data)) : undefined;
                const data: IUTXO[] = response.data ?? []
                // console.log(data);
                if (data.length > 0) {
                    resolve(data);
                    clearInterval(intervalId);
                }
            } catch (error) {
                reject(error);
                clearInterval(intervalId);
            }
        };
        intervalId = setInterval(checkForUtxo, 10000);
    });
}

export async function broadcast(txHex: string, isMiannet = false) {
    const response: AxiosResponse<string> = await axios.post((isMiannet ? OPENAPI_URL_MAINNET : OPENAPI_URL_TESTNET) +  '/tx', txHex);
    return response.data;
}

interface IUTXO {
    txid: string;
    vout: number;
    status: {
        confirmed: boolean;
        block_height: number;
        block_hash: string;
        block_time: number;
    };
    value: number;
}