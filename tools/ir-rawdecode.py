#!/usr/bin/env python3
"""
Tasmota IR Raw Decoder for Krinner Lumix IR Remote
Decodes raw IR timing data from Tasmota irsend format
"""

# Tasmota IR raw data examples
EXAMPLES = {
    "off_channel_A": "0,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000, 400,1000, 400,1000, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000, 400,1000, 400,1000, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000, 400,1000, 400,1000, 400,2000,5600",
    "on_channel_A": "0,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,2000,5600",
    "flicker_channel_A": "0,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000, 400,1100,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000, 400,1100,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000, 400,1100,1000, 400, 400,2000,5600",
    "off_channel_B": "0,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,1000, 400,1000, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,1000, 400,1000, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,1000, 400,1000, 400,2000,5600",
    "on_channel_B": "0,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400,1000, 400,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400,1000, 400,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400,1000, 400,1000, 400, 400,2000,5600",
    "flicker_channel_B": "0,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,1100,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,1100,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,1100,1000, 400, 400,2000,5600",
    "off_channel_C": "0,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400, 400,1000, 400,1000, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400, 400,1000, 400,1000, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400, 400,1000, 400,1000, 400,2000,5600",
    "on_channel_C": "0,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,2000,5600",
    "flicker_channel_C": "0,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400, 400,1100,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400, 400,1100,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400, 400,1100,1000, 400, 400,2000,5600",
}


def parse_tasmota_raw(raw_string):
    """Parse Tasmota irsend raw format to list of integers."""
    parts = raw_string.replace(' ', '').split(',')
    return [int(p) for p in parts if p]


def decode_krinner_frame(timings, threshold=700):
    """
    Decode a single Krinner Lumix IR frame.
    
    Frame structure:
    - Header: 2000µs mark, 1000µs space
    - Data bits: 8 bits encoded as mark-space pairs
      - 0: ~400µs mark, ~400µs space
      - 1: ~400µs mark, ~1000µs space
    - End: ~400µs mark, ~2000µs space
    - Gap: ~5600µs
    
    Returns:
        Byte value (0-255) or None if invalid
    """
    if not timings or len(timings) < 20:
        return None
    
    # Remove leading 0 if present
    if timings[0] == 0:
        timings = timings[1:]
    
    # Create (mark, space) pairs
    pairs = list(zip(timings[0::2], timings[1::2]))
    
    if len(pairs) < 10:
        return None
    
    # Skip header (first pair) and end marker (last pair)
    data_pairs = pairs[1:-1]
    
    # Decode bits
    bits = []
    for mark, space in data_pairs:
        # Skip if space is too large (gap between frames)
        if space > 3000:
            break
        bit = 1 if space > threshold else 0
        bits.append(bit)
    
    if len(bits) != 8:
        return None
    
    # Convert bits to byte (LSB first)
    value = 0
    for i, bit in enumerate(bits):
        value |= (bit << i)
    
    return value


def decode_tasmota_raw(raw_string, threshold=700):
    """
    Decode complete Tasmota IR raw string (may contain 3 repeated frames).
    
    Returns:
        dict with decoded information
    """
    timings = parse_tasmota_raw(raw_string)
    
    # Split into individual frames (separated by large gaps ~5600µs)
    frames = []
    current_frame = []
    
    for i, timing in enumerate(timings):
        current_frame.append(timing)
        
        # Check if next timing is a large gap (start of next frame)
        if i + 1 < len(timings) and timing > 5000:
            frames.append(current_frame)
            current_frame = []
    
    if current_frame:
        frames.append(current_frame)
    
    # Decode each frame
    decoded_frames = []
    for frame in frames:
        value = decode_krinner_frame(frame, threshold)
        if value is not None:
            decoded_frames.append(value)
    
    if not decoded_frames:
        return {'error': 'Could not decode any frames'}
    
    # All frames should be identical (repetition)
    byte_value = decoded_frames[0]
    
    # Decode the byte to channel and command
    # Based on binary analysis of the examples (LSB first encoding):
    # Bit pattern: [cmd1][cmd0][ch1][ch0][fixed_bits]
    # 
    # Channel A: 0x0D=00001101, 0x6D=01101101, 0x4D=01001101 -> bits[4:3]=01
    # Channel B: 0x1D=00011101, 0x7D=01111101, 0x5D=01011101 -> bits[4:3]=11  
    # Channel C: 0x15=00010101, 0x75=01110101, 0x55=01010101 -> bits[4:3]=10
    # 
    # Command:
    # Off:     bits[6:5]=00
    # On:      bits[6:5]=11
    # Flicker: bits[6:5]=10
    
    # Extract channel from bits 3-4
    channel_bits = (byte_value >> 3) & 0x03
    channels = {1: 'A', 3: 'B', 2: 'C', 0: 'D'}
    channel = channels.get(channel_bits, '?')
    
    # Command detection based on bits 5-6
    cmd_bits = (byte_value >> 5) & 0x03
    if cmd_bits == 0:  # 00 = off
        command = 'off'
    elif cmd_bits == 3:  # 11 = on
        command = 'on'
    elif cmd_bits == 2:  # 10 = flicker
        command = 'flicker'
    else:
        command = 'unknown'
    
    return {
        'byte': byte_value,
        'byte_hex': f'0x{byte_value:02X}',
        'byte_binary': format(byte_value, '08b'),
        'channel': channel,
        'command': command,
        'frames_decoded': len(decoded_frames),
        'frames_match': all(f == byte_value for f in decoded_frames)
    }


def main():
    """Test decoder with all examples."""
    print("Krinner Lumix IR Remote Decoder")
    print("=" * 60)
    
    for name, raw_data in EXAMPLES.items():
        print(f"\n{name}:")
        result = decode_tasmota_raw(raw_data)
        
        if 'error' in result:
            print(f"  Error: {result['error']}")
        else:
            print(f"  Byte: {result['byte_hex']} ({result['byte']}) = {result['byte_binary']}")
            print(f"  Channel: {result['channel']}")
            print(f"  Command: {result['command']}")
            print(f"  Frames: {result['frames_decoded']} (match: {result['frames_match']})")
    
    print("\n" + "=" * 60)
    print("\nTo decode custom raw data:")
    print('result = decode_tasmota_raw("0,2000,1000,400,1000,...")')


if __name__ == "__main__":
    main()