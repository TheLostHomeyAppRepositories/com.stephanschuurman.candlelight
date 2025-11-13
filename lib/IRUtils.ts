/**
 * IR Utilities Helper Class
 * Contains helper functions for IR signal processing and conversion
 */
export class IRUtils {

    /**
     * Convert hex command to Homey bits array
     * @param hex Hex number to convert
     * @returns Array of bits (0s and 1s)
     */
    static hexToHomeyBits(hex: number): number[] {
        const bits: number[] = [];

        // Extract high byte (0xA2) and low byte (0x5D) from 0xA25D
        const highByte = (hex >> 8) & 0xFF;  // 0xA2
        const lowByte = hex & 0xFF;          // 0x5D

        // Process high byte first, then low byte
        const bytes = [highByte, lowByte];

        for (const byte of bytes) {
            // MSB-first bit ordering (7 down to 0)
            for (let j = 7; j >= 0; j--) {
                bits.push((byte >> j) & 1);
            }
        }
        return bits;
    }

    /**
     * Convert hex string to number
     * @param hexString Hex string (e.g., "0x45" or "45")
     * @returns Hex number
     */
    static hexStringToNumber(hexString: string): number {
        // Remove 0x prefix if present
        const cleanHex = hexString.replace(/^0x/i, '');
        return parseInt(cleanHex, 16);
    }

    static numberToHexString(num: number): string {
        return '0x' + num.toString(16).toUpperCase().padStart(4, '0');
    }

    /**
     * Convert hex command string to Homey bits
     * @param hexString Hex string command
     * @returns Array of bits
     */
    static hexCommandToHomeyBits(hexString: string): number[] {
        const hexNumber = this.hexStringToNumber(hexString);
        return this.hexToHomeyBits(hexNumber);
    }

    static necCommandToHex(cmd: number): number {
        // 1. bitreverse het commando (8 bits)
        const rev = this.reverseByte(cmd);

        // 2. inverse voor checksum
        const inv = (~rev) & 0xFF;

        // 3. combineer tot 16-bit
        return (rev << 8) | inv;
    }

    static reverseByte(b: number): number {
        let r = 0;
        for (let i = 0; i < 8; i++) {
            r = (r << 1) | (b & 1);
            b >>= 1;
        }
        return r;
    }

    static necCommandToHomeyBits(cmd: number): number[] {
        const hex = this.necCommandToHex(cmd);
        return this.hexToHomeyBits(hex);
    }
}