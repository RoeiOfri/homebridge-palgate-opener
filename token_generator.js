/*
AES 128-bit encryption and decryption and PalGate token generation
License: GNU General Public License v3 or later

This is intended for personal use only.

This is a translation of https://github.com/DonutByte/pylgate/tree/main/pylgate into Javascript.
*/

// --- Constants ---
const S_BOX = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5,
    0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0,
    0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc,
    0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a,
    0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0,
    0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b,
    0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85,
    0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5,
    0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17,
    0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88,
    0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c,
    0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9,
    0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6,
    0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e,
    0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94,
    0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68,
    0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
];

const INVERSE_S_BOX = [
    0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38,
    0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
    0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87,
    0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
    0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d,
    0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
    0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2,
    0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
    0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16,
    0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
    0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda,
    0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
    0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a,
    0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
    0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02,
    0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
    0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea,
    0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
    0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85,
    0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
    0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89,
    0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
    0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20,
    0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
    0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31,
    0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
    0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d,
    0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
    0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0,
    0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
    0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26,
    0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d
];

const RCON = [
    0x01, 0x02, 0x04, 0x08, 0x10,
    0x20, 0x40, 0x80, 0x1b, 0x36
];

const BLOCK_SIZE = 16;
const KEY_SIZE = 16;

// PalGate-specific constants
const T_C_KEY = new Uint8Array([
    0xfa, 0xd3, 0x25, 0x72, 0x81, 0x29,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x3a, 0xb4, 0x5a, 0x65
]);

const TOKEN_SIZE = 23; // In bytes
const TIMESTAMP_OFFSET = 2;

// Token types "enum"
const TokenType = {
    SMS: 0,       // Handle SMS
    PRIMARY: 1,   // Linked Device - first
    SECONDARY: 2  // Linked Device - second
};

// --- Utility Functions ---

// Multiply a byte by 2 in GF(2^8)
function galoisMul2(value) {
    return (value & 0x80) ? (((value << 1) ^ 0x1b) & 0xff) : ((value << 1) & 0xff);
}

// Convert a Uint8Array to a hexadecimal string
function bytesToHex(bytes) {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Pack a number into an 8-byte big-endian Uint8Array
function packUint64BE(num) {
    const result = new Uint8Array(8);
    let big = BigInt(num);
    for (let i = 7; i >= 0; i--) {
        result[i] = Number(big & 0xffn);
        big >>= 8n;
    }
    return result;
}

// --- AES Encryption/Decryption Functions ---

// Encrypts or decrypts a 16-byte state using a 16-byte key.
// stateBytes and keyBytes are expected to be Uint8Array(16).
function aesEncryptDecrypt(stateBytes, keyBytes, isEncrypt) {
    if (stateBytes.length !== BLOCK_SIZE || keyBytes.length !== KEY_SIZE) {
        throw new Error("State and/or key are not 16 bytes");
    }
    // Work on copies so as not to modify the originals
    const state = new Uint8Array(stateBytes);
    const key = new Uint8Array(keyBytes);
    _aesEncDec(state, key, isEncrypt);
    return state;
}

// The internal AES encryption/decryption routine.
// It directly mutates the state and key arrays.
function _aesEncDec(state, key, encrypt) {
    // If encrypting, perform initial key schedule and add round key.
    if (encrypt) {
        for (let rnd = 0; rnd < 10; rnd++) {
            key[0] = (S_BOX[key[13]] ^ key[0] ^ RCON[rnd]) & 0xff;
            key[1] = (S_BOX[key[14]] ^ key[1]) & 0xff;
            key[2] = (S_BOX[key[15]] ^ key[2]) & 0xff;
            key[3] = (S_BOX[key[12]] ^ key[3]) & 0xff;
            for (let i = 4; i < KEY_SIZE; i++) {
                key[i] = (key[i] ^ key[i - 4]) & 0xff;
            }
        }
        for (let i = 0; i < BLOCK_SIZE; i++) {
            state[i] = (state[i] ^ key[i]) & 0xff;
        }
    }

    // Main round loop.
    for (let rnd = 0; rnd < 10; rnd++) {
        if (encrypt) {
            // For encryption: update the key schedule (reverse order for half rounds).
            for (let i = KEY_SIZE - 1; i > 3; i--) {
                key[i] = (key[i] ^ key[i - 4]) & 0xff;
            }
            key[0] = (S_BOX[key[13]] ^ key[0] ^ RCON[9 - rnd]) & 0xff;
            key[1] = (S_BOX[key[14]] ^ key[1]) & 0xff;
            key[2] = (S_BOX[key[15]] ^ key[2]) & 0xff;
            key[3] = (S_BOX[key[12]] ^ key[3]) & 0xff;
        } else {
            // For decryption: first substitute using S_BOX with XOR of key.
            for (let i = 0; i < BLOCK_SIZE; i++) {
                state[i] = S_BOX[state[i] ^ key[i]];
            }
            // Perform row shifting as per the Python logic.
            // Shift row 1 (indices 1,5,9,13)
            let buf1 = state[1];
            state[1] = state[5];
            state[5] = state[9];
            state[9] = state[13];
            state[13] = buf1;

            // Swap row 2 (indices 2,6,10,14)
            let tmp1 = state[2];
            let tmp2 = state[6];
            state[2] = state[10];
            state[6] = state[14];
            state[10] = tmp1;
            state[14] = tmp2;

            // Corrected row swap for row 3 (indices 3,7,11,15)
            let tmp = state[15];
            state[15] = state[11];
            state[11] = state[7];
            state[7] = state[3];
            state[3] = tmp;
        }

        // Mid-round mixing, applied conditionally.
        if ((rnd > 0 && encrypt) || (!encrypt && rnd < 9)) {
            for (let i = 0; i < 4; i++) {
                let base = i * 4;
                if (encrypt) {
                    const buf1 = galoisMul2(galoisMul2(state[base] ^ state[base + 2]));
                    const buf2 = galoisMul2(galoisMul2(state[base + 1] ^ state[base + 3]));
                    state[base] = (state[base] ^ buf1) & 0xff;
                    state[base + 1] = (state[base + 1] ^ buf2) & 0xff;
                    state[base + 2] = (state[base + 2] ^ buf1) & 0xff;
                    state[base + 3] = (state[base + 3] ^ buf2) & 0xff;
                }
                const mix = state[base] ^ state[base + 1] ^ state[base + 2] ^ state[base + 3];
                const first = state[base];
                let buf3 = galoisMul2(state[base] ^ state[base + 1]);
                state[base] = (state[base] ^ buf3 ^ mix) & 0xff;
                buf3 = galoisMul2(state[base + 1] ^ state[base + 2]);
                state[base + 1] = (state[base + 1] ^ buf3 ^ mix) & 0xff;
                buf3 = galoisMul2(state[base + 2] ^ state[base + 3]);
                state[base + 2] = (state[base + 2] ^ buf3 ^ mix) & 0xff;
                buf3 = galoisMul2(state[base + 3] ^ first);
                state[base + 3] = (state[base + 3] ^ buf3 ^ mix) & 0xff;
            }
        }

        // Final round adjustments.
        if (encrypt) {
            // Row swapping for encryption.
            let buf1 = state[13];
            state[13] = state[9];
            state[9] = state[5];
            state[5] = state[1];
            state[1] = buf1;

            let tmp1 = state[10];
            let tmp2 = state[14];
            state[10] = state[2];
            state[14] = state[6];
            state[2] = tmp1;
            state[6] = tmp2;

            let tmp = state[3];
            state[3] = state[7];
            state[7] = state[11];
            state[11] = state[15];
            state[15] = tmp;

            // Final substitution using INVERSE_S_BOX and XOR with key.
            for (let i = 0; i < BLOCK_SIZE; i++) {
                state[i] = (INVERSE_S_BOX[state[i]] ^ key[i]) & 0xff;
            }
        } else {
            // Update key schedule for decryption.
            key[0] = (S_BOX[key[13]] ^ key[0] ^ RCON[rnd]) & 0xff;
            key[1] = (S_BOX[key[14]] ^ key[1]) & 0xff;
            key[2] = (S_BOX[key[15]] ^ key[2]) & 0xff;
            key[3] = (S_BOX[key[12]] ^ key[3]) & 0xff;
            for (let i = 4; i < KEY_SIZE; i++) {
                key[i] = (key[i] ^ key[i - 4]) & 0xff;
            }
        }
    }

    // Final key addition for decryption.
    if (!encrypt) {
        for (let i = 0; i < BLOCK_SIZE; i++) {
            state[i] = (state[i] ^ key[i]) & 0xff;
        }
    }
}

// --- Token Generation Functions ---

/**
 * Generates a derived token for the PalGate API.
 *
 * @param {Uint8Array} sessionToken - A 16-byte base token (from SMS or device linking).
 * @param {number} phoneNumber - The associated phone number.
 * @param {number} tokenType - Either TokenType.PRIMARY or TokenType.SECONDARY.
 * @param {number|null} [timestampMs=null] - Seconds since the Epoch (default: current time).
 * @param {number} [timestampOffset=TIMESTAMP_OFFSET] - Offset added to the timestamp.
 * @returns {string} The derived token as an uppercase hex string.
 */
function generateToken(sessionToken, phoneNumber, tokenType, timestampMs = null, timestampOffset = TIMESTAMP_OFFSET) {
    if (sessionToken.length !== BLOCK_SIZE) {
        throw new Error('Invalid session token');
    }
    if (timestampMs === null) {
        timestampMs = Math.floor(Date.now() / 1000);
    }

    const step2Key = _step1(sessionToken, phoneNumber);
    const step2Result = _step2(step2Key, timestampMs, timestampOffset);

    const result = new Uint8Array(TOKEN_SIZE);
    if (tokenType === TokenType.SMS) {
        result[0] = 0x01;
    } else if (tokenType === TokenType.PRIMARY) {
        result[0] = 0x11;
    } else if (tokenType === TokenType.SECONDARY) {
        result[0] = 0x21;
    } else {
        throw new Error(`unknown token type: ${tokenType}`);
    }

    // Use the 8-byte big-endian representation of the phone number
    // and take bytes 2 to 7.
    const phonePacked = packUint64BE(phoneNumber);
    // phonePacked is an 8-byte Uint8Array; slice(2, 8) gives 6 bytes.
    result.set(phonePacked.slice(2, 8), 1);

    result.set(step2Result, 7);

    return bytesToHex(result).toUpperCase();
}

// Internal step 1: derive a key based on sessionToken and phoneNumber.
function _step1(sessionToken, phoneNumber) {
    const key = new Uint8Array(T_C_KEY); // copy T_C_KEY
    const phonePacked = packUint64BE(phoneNumber);
    // Replace key[6..11] with phonePacked[2..7]
    for (let i = 0; i < 6; i++) {
        key[6 + i] = phonePacked[2 + i];
    }
    return aesEncryptDecrypt(sessionToken, key, true);
}

// Internal step 2: derive a token part using a timestamp.
function _step2(resultFromStep1, timestampMs, timestampOffset) {
    const nextState = new Uint8Array(BLOCK_SIZE);
    // Set nextState[1..2] to the little-endian representation of 0xa0a.
    const val16 = 0xa0a;
    nextState[1] = val16 & 0xff;
    nextState[2] = (val16 >> 8) & 0xff;
    // Set nextState[10..13] to the big-endian representation of (timestampMs + timestampOffset).
    const val32 = timestampMs + timestampOffset;
    nextState[10] = (val32 >> 24) & 0xff;
    nextState[11] = (val32 >> 16) & 0xff;
    nextState[12] = (val32 >> 8) & 0xff;
    nextState[13] = val32 & 0xff;
    return aesEncryptDecrypt(nextState, resultFromStep1, false);
}

// --- Example usage ---
function hexStringToUint8Array(hexStr) {
    if (hexStr.length % 2 !== 0) {
        throw new Error("Invalid hex string");
    }
    const arr = new Uint8Array(hexStr.length / 2);
    for (let i = 0; i < hexStr.length; i += 2) {
        arr[i / 2] = parseInt(hexStr.substr(i, 2), 16);
    }
    return arr;
}

module.exports = { generateToken };
