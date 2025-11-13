# Astronaut Galaxy Star Laser

![Astronaut Star Projector Night Light](https://manuals.plus/wp-content/uploads/2023/07/Mooyran-Astronaut-Star-Projector-Night-Light-User-Manual-1-Copy.png)

## Homey + IR
- https://apps.developer.homey.app/wireless/rf-433mhz-868mhz
- https://apps-sdk-v3.developer.homey.app/Signal.html#tx
- https://apps.developer.homey.app/wireless/infrared
- https://apps-sdk-v2.developer.athom.com/tutorial-Signals-Prontohex.html
- https://apps-sdk-v3.developer.homey.app/SignalInfrared.html
- https://tools.developer.homey.app/tools/ir

## NEC IR Protocol
- https://www.sbprojects.net/knowledge/ir/nec.php
- https://github.com/johnosbb/hx1838decoder
- https://www.youtube.com/watch?v=VX-b89jkovc

 **Parameter**                      | **Value**   | **Code**
------------------------------------|-------------|------------
 Carrier Frequency                  | 38 kHz      | 38000 
 Start of Frame (SOF) : Lead / AGC  | 9.0 ms      | 9000
 Start of Frame (SOF) : Space       | 4.5 ms      | 4500
 End of Frame (EOF)                 | 562.5 µs    | 560
 Logical "0" : Pulse                | 562.5 µs    | 560
 Logical "0" : Space                | 562.5 µs    | 560
 Logical "1" : Pulse                | 562.5 µs    | 560
 Logical "1" : Space                | 1687.5 µs   | 1690
 Interval                           | 110 ms      | 110000
 Sensitivity                        | 0.0 - 0.5   | 0.5
 Repetitions                        | 1 - 10      | 3
 Bit Length                         | 32 words    | 32
 Prefix (Address)                   | None        | 0x00

### NEC Protocol Frame Structure
Total 32 words (bits), where the LSB (Least Significant Bit) first and second byte is the inverse of the first.

| Address | Address INV | Command | Command INV |
|---------|-------------|---------|-------------|
| 8 bits  | 8 bits      | 8 bits  | 8 bits      |


## Astronaut Star Projector Night Light
- https://device.report/manual/8559116
- https://manuals.plus/closunt/astronaut-star-projector-kids-night-light-manual

# Codes
Note the **Adress** is always **0x00** for this specific device.

### Example Power Command

| Addr    | Cmd     | Message  | Address | Address INV | Command                   | Command INV | Telegram.   |
|---------|---------|----------|---------|-------------|---------------------------|-------------|-------------|
| 0       | 69      | 0x0045   | 0x00    | 0xFF        | 0xA2 (bit-reverse 0x45)   | 0x5D        | 0x00FFA25D

## Recoder from Remote

 **Button**            | **Command** | **Code + Inverse Code**            | **Notes**          
-----------------------|-------------|------------------------------------|-------------------------------------------
 **Power**             | 0x45        | `1,0,1,0,0,0,1,0, 0,1,0,1,1,1,0,1` | Toggle On / Off
 **Timer**             | 0x47        | `1,1,1,0,0,0,1,0, 0,0,0,1,1,1,0,1` | 0 (long press, default) / 45 min (blue led) / 90 min (red led)
 **Nebula**            | 0x44        | `0,0,1,0,0,0,1,0, 1,1,0,1,1,1,0,1` | Off (long press) / On (default) + Next color (cycle)
 **NebulaBrightness+** | 0x09        | `1,0,0,1,0,0,0,0, 0,1,1,0,1,1,1,1` | 0 / 1 / 2 (default) / 3  / 4 
 **NebulaBrightness-** | 0x15        | `1,0,1,0,1,0,0,0, 0,1,0,1,0,1,1,1` | 0 / 1 / 2 (default) / 3  / 4 
 **NebulaSpeed+**      | 0x43        | `1,1,0,0,0,0,1,0, 0,0,1,1,1,1,0,1` | 0 (static) / 1 / 2 (default) / 3 / 4
 **NebulaSpeed-**      | 0x40        | `0,0,0,0,0,0,1,0, 1,1,1,1,1,1,0,1` | 0 (static) / 1 / 2 (default) / 3 / 4
 **Star**              | 0xFF        | `1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0` | Off (long press) / On (default)
 **StarBreathing+**    | 0x19        | `1,0,0,1,1,0,0,0, 0,1,1,0,0,1,1,1` | 0 (always on) / 1 / 2 (default) / 3
 **StarBreathing-**    | 0x46        | `0,1,1,0,0,0,1,0, 1,0,0,1,1,1,0,1` | 0 (always on) / 1 / 2 (default) / 3
 **StarBrightness+**   | 0x0D        | `1,0,1,1,0,0,0,0, 0,1,0,0,1,1,1,1` | 0 (default) / 1 / 2 (brightness is only effected visibly when breathing = 0)
 **StarBrightness-**   | 0x07        | `1,1,1,0,0,0,0,0, 0,0,0,1,1,1,1,1` | 0 (default) / 1 / 2 (brightness is only effected visibly when breathing = 0)

- Normal NEC frame:
    - Leader: 9 ms HIGH + 4.5 ms LOW
	- 32 bits: 8-bit address + 8-bit ~address + 8-bit command + 8-bit ~command

- Note then a button is presses longer there is a NEC repeat frame: 
    - Leader: 9 ms HIGH + 2.25 ms LOW
    - No data bits, only a short end pulse (≈ 562.5 µs HIGH).
- Some buttons (Nebula, Star, Timing) allow for a short and long press (see [here](https://device.report/manual/8559116)].