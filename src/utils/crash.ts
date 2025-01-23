import CryptoJS from 'crypto-js';

// Hash an input (private seed) to SHA256  
export const buildPrivateHash = (seed: string) => {
    return CryptoJS.SHA256(seed).toString();
};

// Generate the crash point based on the private seed and public seed  
export const generateCrashPoint = (seed: string, salt: string) => {
    const hash = CryptoJS.HmacSHA256(salt, seed).toString();
    console.log(seed, salt, hash)
    const houseEdge = 0.04; // House edge percentage  
    const hs = parseInt((100 / (houseEdge * 100)).toString());

    if (isCrashHashDivisible(hash, hs)) {
        return 100; // Return a fixed value if divisible  
    }

    const h = parseInt(hash.slice(0, 52 / 4), 16);
    const e = Math.pow(2, 52);

    return Math.floor((100 * e - h) / (e - h));
};

const isCrashHashDivisible = (hash: string, mod: any) => {
    let val = 0;

    const o = hash.length % 4;
    for (let i = o > 0 ? o - 4 : 0; i < hash.length; i += 4) {
        val = ((val << 16) + parseInt(hash.substring(i, i + 4), 16)) % mod;
    }

    return val === 0;
};
