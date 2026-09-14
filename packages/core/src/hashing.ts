
import { createHash } from "crypto"

const SCALE = 0xfffffffffffffff; 

export function computeBucket(key: string, salt: string): number {
    const hash: string = createHash("sha1")
        .update(`${key}:${salt}`)
        .digest('hex');
    const hexSlice = hash.substring(0, 15);
    const int = parseInt(hexSlice, 16);
    const bucket = (int / SCALE) * 100;

    return bucket;
}

