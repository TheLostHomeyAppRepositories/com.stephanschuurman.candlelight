/**
 * IR Command codes for various LED candle brands
 * All brands use NEC protocol with address 0x00 unless specified otherwise
 */

export interface CommandSet {
  ON: number;
  OFF: number;
  TIMER_2H?: number;
  TIMER_4H?: number;
  TIMER_6H?: number;
  TIMER_8H?: number;
}

/**
 * Centralized IR command codes for all supported candle brands
 */
export const IR_COMMANDS = {
  /**
   * HEMA rechargeable LED tealights
   * Manufacturer: Taizhou Sparkle Lights Co., Ltd - BAT-LEDS01
   * Protocol: NEC, Address: 0x00
   */
  HEMA: {
    ON: 0x45,
    OFF: 0x47,
    TIMER_2H: 0x44,
    TIMER_4H: 0x43,
    TIMER_6H: 0x07,
    TIMER_8H: 0x09,
  } as const,

  /**
   * Deluxe Homeart - Real Flame LED Candle
   * Protocol: NEC, Address: 0x00
   * Note: Timer commands may need to be preceded by ON command (0x5E)
   */
  DELUXE: {
    ON: 0x0C,
    OFF: 0x5E,
    TIMER_2H: 0x46,
    TIMER_4H: 0x40,
    TIMER_6H: 0x15,
    TIMER_8H: 0x19,
  } as const,
} as const;

/**
 * Type helper to get all available timer durations for a command set
 */
export type TimerDuration = '2h' | '4h' | '6h' | '8h';

/**
 * Type helper for command set keys
 */
export type CommandSetKey = keyof typeof IR_COMMANDS;
