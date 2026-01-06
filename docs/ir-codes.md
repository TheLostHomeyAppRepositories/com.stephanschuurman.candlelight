# IR Codes of LED Candles

Contributions welcome! Please submit IR codes via Pronto hex or NEC command codes.


## HEMA / Taizhou Sparkle Lights Co., Ltd - BAT-LEDS01
The item is also sold under the house brand of HEMA (a well-known Dutch department store).

**Driver:** ./hema-tealight
**Protocol:** NEC  
**Address:** 0x00

| Button | Data (MSB)   | ADDR | ADDR_INV | CMD  | CMD_INV |
|--------|--------------|------|----------|------|---------|
| ON     | 0x00FF45BA   | 0x00 | 0xFF     | 0x45 | 0xBA    |
| OFF    | 0x00FF47B8   | 0x00 | 0xFF     | 0x47 | 0xB8    |
| 2H     | 0x00FF44BB   | 0x00 | 0xFF     | 0x44 | 0xBB    |
| 4H     | 0x00FF43BC   | 0x00 | 0xFF     | 0x43 | 0xBC    |
| 6H     | 0x00FF07F8   | 0x00 | 0xFF     | 0x07 | 0xF8    |
| 8H     | 0x00FF09F6   | 0x00 | 0xFF     | 0x09 | 0xF6    |

**Source:**
- https://www.hema.nl/wonen-slapen/wonen/kaarsen/led-kaarsen/oplaadbare-theelichtjes---4-stuks-13550076.html
- https://www.hema.nl/wonen-slapen/wonen/kaarsen/led-kaarsen/afstandsbediening-voor-led-kaarsen-13550140.html
- https://www.hema.nl/wonen-slapen/wonen/kaarsen/led-kaarsen/uitbreidingsset-oplaadbare-led-theelichtjes---2-stuks-13550143.html

---

## Deluxe Homeart - Real Flame LED Candle

**Driver:** ./deluxe-homeart
**Protocol:** NEC  
**Address:** 0x00

| Button | CMD          |
|--------|--------------|
| ON     | 0x5E         |
| OFF    | 0x0C         |
| 2H     | 0x46         |
| 4H     | 0x40         |
| 6H     | 0x15         |
| 8H     | 0x19         |

**Source:**
- https://deluxehomeartshop.nl/

---

## Action - 3 Button Remote

**Driver:** ./action-3-button
**Protocol:** NEC  
**Address:** 0x00

| Button | CMD          |
|--------|--------------|
| ON     | 0x12         |
| OFF    | 0x0F         |
| 6H     | 0x15         |

**Source:**
- https://community.homey.app/t/app-pro-candlelight/146172/14

### Product Information (from Rene_de_Ronde):

- EAN: 8721037743549 (tested model)
- Probable match: [EAN 8721037234962](https://www.bol.com/nl/nl/p/ledkaarsen-set-9-delig-white-kaarsen/9300000248071917/) (likely the same white-label model under a different barcode)
- Model AX6-200105
- Remote Model: AX6-200105 (3 buttons: ON, OFF, 6H Timer)
- Protocol: NEC IR, Address 0x00

---

## Action - 8 Button Remote

**Driver:** ./action-8-button
**Protocol:** NEC  
**Address:** 0x00

| Button | CMD          |
|--------|--------------|
| ON     | 0x45         |
| OFF    | 0x47         |

**Source:**
- https://www.action.com/fr-fr/p/3206761/bougies-led/

### Product Information (from Rene_de_Ronde):

- Article no. 3206761
- Model: 67IZJ2407-00X

---

## Action - 10 Button Remote

**Driver:** ./action-10-button
**Protocol:** NEC  
**Address:** 0x00

| Button                 | Data (MSB)   | ADDR | ADDR_INV | CMD  | CMD_INV  |
|------------------------|--------------|------|----------|------|----------|
| ON                     | 0x00FF00FF   | 0x00 | 0xFF     | 0x00 | 0xFF     |
| OFF                    | 0x00FF02FD   | 0x00 | 0xFF     | 0x02 | 0xFD     |
| Timer (2h)             | 0x00FF04FB   | 0x00 | 0xFF     | 0x04 | 0xFB     |
| Timer (4h)             | 0x00FF06F9   | 0x00 | 0xFF     | 0x06 | 0xF9     |
| Timer (6h)             | 0x00FF08F7   | 0x00 | 0xFF     | 0x08 | 0xF7     |
| Timer (8h)             | 0x00FF0AF5   | 0x00 | 0xFF     | 0x0A | 0xF5     |
| Mode: Candle           | 0x00FF0CF3   | 0x00 | 0xFF     | 0x0C | 0xF3     |
| Mode: Light            | 0x00FF0EF1   | 0x00 | 0xFF     | 0x0E | 0xF1     |
| Dim (-)                | 0x00FF10EF   | 0x00 | 0xFF     | 0x10 | 0xEF     |
| Dim (+)                | 0x00FF12ED   | 0x00 | 0xFF     | 0x12 | 0xED     |

**Source:** 
- https://leap.tardate.com/electronics101/led/remotecontrolcandles/
- https://shop.action.com/en-nl/p/8721184890585/luxury-7-piece-led-candle-set-taupe

---

## Lumineo - 3 Button Remote

**Driver:** ./lumineo-3-button
**Protocol:** NEC  
**Address:** 0x00

| Button | CMD  |
|--------|------|
| ON     | 0x39 |
| OFF    | 0x09 |
| 6H     | 0x18 |

**Source:**
- https://lumineo-lights.com/en


### Product Information:

- EAN: 8720725131712, 8720725141605, 8720725141636, 8720725216617, 8720725547421, 8720725387232, 8720725189201, 8720725339491, 8720725181090
- Sold at Albert Heijn and online
- Note black candles (EAN: 8720725131712) have a short response range (poor reception).

---

## Anna's Collection - 10 Button, Black Remote

**Driver:** ./anna-10-button
**Protocol:** NEC  
**Address:** 0x00

| Button          | CMD          |
|-----------------|--------------|
| ON              | 0x00         |
| OFF             | 0x02         |
| Brightness -    | 0x10         |
| Brightness +    | 0x12         |

**Source:**
- https://homey.app/en-us/app/com.tvdb.candles/Anna's-collection-candles/
- https://homey.app/nl-nl/app/nl.coenbakker.ir.dev/Anna’s-collection/test/

---


## Anna's Collection - 2 Button, Silver Remote

**Driver:** ./anna-2-button
**Protocol:** NEC  
**Address:** 0x00

| Button          | CMD          |
|-----------------|--------------|
| ON              | 0x01         |
| OFF             | 0x09         |

**Source:**
- https://homey.app/en-us/app/com.tvdb.candles/Anna's-collection-candles/
- https://homey.app/nl-nl/app/nl.coenbakker.ir.dev/Anna’s-collection/test/

---

## Lumiz Lantern

**Driver:** ./lumiz-lantern
**Protocol:** NEC  
**Address:** 0x00

| Button          | CMD          |
|-----------------|--------------|
| ON              | 0x01         |
| OFF             | 0x00         |
| Brighter        | 0x16         |
| Dimmer.         | 0x0D         |

### Pronto HEX

ON

0000 006D 0022 0000 015C 00AD 0017 0015 0017 0015 0017 0015 0017 0015 0017 0015 0017 0013 0019 0015 0017 0015 0017 0042 0016 0042 0016 0042 0016 0042 0016 0042 0016 0042 0016 0042 0016 0042 0016 0042 0016 0015 0017 0015 0017 0016 0016 0015 0017 0015 0017 0015 0017 0015 0017 0014 0018 0041 0016 0042 0016 0042 0016 0042 0016 0042 0016 0042 0016 0042 0016 0181
  
OFF
0000 006D 0022 0000 015C 00AD 0017 0011 001B 0015 0017 0015 0017 0015 0016 0015 0017 0015 0016 0015 0017 0015 0017 0042 0016 0042 0016 0042 0016 0042 0016 0042 0016 0042 0016 0042 0016 0042 0016 0015 0017 0016 0016 0015 0017 0015 0016 0016 0015 0016 0016 0016 0016 0015 0017 0042 0016 0042 0016 0042 0016 0042 0016 0042 0016 0042 0016 0042 0016 0042 0016 0181
  
Brighter
0000 006D 0022 0000 015D 00AD 0017 0015 0017 0015 0017 0015 0017 0015 0017 0015 0016 0015 0017 0015 0017 0015 0017 0041 0017 0041 0017 0041 0018 0040 0019 003F 0018 0040 0017 0041 0017 0041 0017 0015 0017 0041 0017 0041 0017 0015 0017 0041 0018 0014 0017 0015 0017 0015 0017 0041 0017 0015 0017 0015 0017 0041 0017 0015 0017 0041 0017 0041 0017 0041 0017 0181

Dimmer
0000 006D 0022 0000 015D 00AD 0017 0015 0017 0015 0017 0015 0017 0015 0017 0015 0017 0015 0017 0015 0017 0015 0017 0041 0017 0041 0017 0041 0017 0041 0017 0041 0017 0041 0017 0041 0017 0041 0017 0041 0018 0014 0017 0041 0017 0041 0017 0015 0017 0015 0017 0015 0017 0015 0017 0015 0017 0041 0017 0015 0017 0015 0017 0041 0017 0041 0017 0041 0017 0041 0017 0181


**Source:**
- https://community.home-assistant.io/t/lumiz-lantern-remote-control-with-esphome/937775
- https://lumiz.nl

---

## Flinq LED

**Driver:** ./flinq
**Protocol:** NEC  
**Address:** 0x80

| Button          | CMD          |
|-----------------|--------------|
| ON              | 0x12         |
| OFF             |              |
| Light Mode      | 0x09         |
| Candle Mode     |              |
| Brightness -    |              |
| Brightness +    |              |

**Source:**
- https://homey.app/en-us/app/nl.flinqproducts.candle/Flinq-LED-Candles/

---

## Gerson - LED Candle

**Driver:** ./gerson
**Protocol:** NEC  
**Address:** 0x02

| Button                 | Data (MSB)   | ADDR | ADDR_INV | CMD  | CMD_INV  |
|------------------------|--------------|------|----------|------|----------|
| Power On               | 0x02FD00FF   | 0x02 | 0xFD     | 0x00 | 0xFF     |
| Power Off              | 0x02FD01FE   | 0x02 | 0xFD     | 0x01 | 0xFE     |
| Mood                   | 0x02FD02FD   | 0x02 | 0xFD     | 0x02 | 0xFD     |
| 5 Hours                | 0x02FD04FB   | 0x02 | 0xFD     | 0x04 | 0xFB     |
| 8 Hours                | 0x02FD05FA   | 0x02 | 0xFD     | 0x05 | 0xFA     |
| Color Fade             | 0x02FD06F9   | 0x02 | 0xFD     | 0x06 | 0xF9     |
| Decrease               | 0x02FD08F7   | 0x02 | 0xFD     | 0x08 | 0xF7     |
| Increase               | 0x02FD0AF5   | 0x02 | 0xFD     | 0x0A | 0xF5     |
| Cool Wick              | 0x02FD0EF1   | 0x02 | 0xFD     | 0x0E | 0xF1     |
| Green                  | 0x02FD11EE   | 0x02 | 0xFD     | 0x11 | 0xEE     |
| Blue                   | 0x02FD12ED   | 0x02 | 0xFD     | 0x12 | 0xED     |
| Cyan                   | 0x02FD14EB   | 0x02 | 0xFD     | 0x14 | 0xEB     |
| Magenta                | 0x02FD15EA   | 0x02 | 0xFD     | 0x15 | 0xEA     |

**Source:**
- https://deluxehomeartshop.nl/

---

## Generic Dancing Flame Candles

**Driver:** ./unbranded-1
**Protocol:** NEC  
**Address:** 0x00  

| Button                 | Data (MSB)   | ADDR | ADDR_INV | CMD  | CMD_INV  |
|------------------------|--------------|------|----------|------|----------|
| ON                     | 0x00FFA25D   | 0x00 | 0xFF     | 0xA2 | 0x5D     |
| OFF                    | 0x00FFE21D   | 0x00 | 0xFF     | 0xE2 | 0x1D     |
| Mode: Candle           | 0x00FFE01F   | 0x00 | 0xFF     | 0xE0 | 0x1F     |
| Mode: Light            | 0x00FF906F   | 0x00 | 0xFF     | 0x90 | 0x6F     |
| Brightness -           | 0x00FF6897   | 0x00 | 0xFF     | 0x68 | 0x97     |
| Brightness +           | 0x00FFB04F   | 0x00 | 0xFF     | 0xB0 | 0x4F     |

**Source:**
- https://community.home-assistant.io/t/dancing-flame-candles-ir-remote-light/630802
- https://www.amazon.com/Antizer-Flameless-Candles-Battery-Operated/dp/B09ZPRSYLY?th=1

---

## Luminara Smart Candle

**Driver:** ./luminara
**Protocol:** NEC  
**Address:** 0x00  

| Button                 | Data (MSB)   | ADDR | ADDR_INV | CMD  | CMD_INV  |
|------------------------|--------------|------|----------|------|----------|
| ON                     | 0x00FF46B9   | 0x00 | 0xFF     | 0x46 | 0xB9     |
| OFF                    | 0x00FF15EA   | 0x00 | 0xFF     | 0x15 | 0xEA     |

**Source:** https://forum.mysensors.org/topic/993/ir-switch-for-luminara-candle-automation-repost-with-video-photos-and-final-sketch/21

---

## Vinkor Flameless Flickering Candles (and clones probably)

**Driver:** ./vinkor
**Protocol:** NEC  
**Address:** 0x10

| Button                 | Data (MSB)   | ADDR | ADDR_INV | CMD  | CMD_INV  |
|------------------------|--------------|------|----------|------|----------|
| ON                     | 0x10ED00FF   | 0x10 | 0xED     | 0x00 | 0xFF     |
| OFF                    | 0x10ED40BF   | 0x10 | 0xED     | 0x40 | 0xBF     |
| DIM                    | 0x10ED08F7   | 0x10 | 0xED     | 0x08 | 0xF7     |
| BRIGHT                 | 0x10ED48B7   | 0x10 | 0xED     | 0x48 | 0xB7     |
| CANDLE                 | 0x10ED30CF   | 0x10 | 0xED     | 0x30 | 0xCF     |
| LIGHT                  | 0x10ED708F   | 0x10 | 0xED     | 0x70 | 0x8F     |
| 2H                     | 0x10ED20DF   | 0x10 | 0xED     | 0x20 | 0xDF     |
| 4H                     | 0x10ED609F   | 0x10 | 0xED     | 0x60 | 0x9F     |
| 6H                     | 0x10ED10EF   | 0x10 | 0xED     | 0x10 | 0xEF     |
| 8H                     | 0x10ED50AF   | 0x10 | 0xED     | 0x50 | 0xAF     |

**Source:** https://tasmota.github.io/docs/Codes-for-IR-Remotes/#vinkor-flameless-flickering-candles-and-clones-probably

---

## Duni Warm White LED Candle / Duni Warmweiß LED Kerzen

**Driver:** ./duni-white
**Protocol:** NEC  
**Address:** 0x00  

| Button                 | Data (MSB)   | ADDR | ADDR_INV | CMD  | CMD_INV  |
|------------------------|--------------|------|----------|------|----------|
| ON                     | 0x00FF00FF   | 0x00 | 0xFF     | 0x00 | 0xFF     |
| OFF                    | 0x00FF807F   | 0x00 | 0xFF     | 0x80 | 0x7F     |
| 4H                     | 0x00FF40BF   | 0x00 | 0xFF     | 0x40 | 0xBF     |
| 8H                     | 0x00FFC03F   | 0x00 | 0xFF     | 0xC0 | 0x3F     |
| Mode: Candle           | 0x00FF20DF   | 0x00 | 0xFF     | 0x20 | 0xDF     |
| Mode: Light            | 0x00FFA05F   | 0x00 | 0xFF     | 0xA0 | 0x5F     |
| Mode: Dark             | 0x00FF906F   | 0x00 | 0xFF     | 0x90 | 0x6F     |
| Mode: Bright           | 0x00FFE01F   | 0x00 | 0xFF     | 0xE0 | 0x1F     |
| Mode: Moon             | 0x00FF10EF   | 0x00 | 0xFF     | 0x10 | 0xEF     |
| Mode: Night Light      | 0x00FF609F   | 0x00 | 0xFF     | 0x60 | 0x9F     |

**Source:** https://tasmota.github.io/docs/Codes-for-IR-Remotes/#duni-warm-white-led-candle--duni-warmweiß-led-kerzen

---

## Duni Multicoloured LED Candle / Duni Mehrfarbige LED Kerzen

**Driver:** ./duni-colour
**Protocol:** NEC  
**Address:** 0x80

| Button                 | Data (MSB)   | ADDR | ADDR_INV | CMD  | CMD_INV |
|------------------------|--------------|------|----------|------|----------|
| ON                     | 0x807F48B7   | 0x80 | 0x7F     | 0x48 | 0xB7     |
| OFF                    | 0x807F807F   | 0x80 | 0x7F     | 0x80 | 0x7F     |
| Mode: Smooth           | 0x807F58A7   | 0x80 | 0x7F     | 0x58 | 0xA7     |
| Mode: Night Light      | 0x807F7887   | 0x80 | 0x7F     | 0x78 | 0x87     |
| Mode: Candle           | 0x807F40BF   | 0x80 | 0x7F     | 0x40 | 0xBF     |
| Mode: Light            | 0x807FC03F   | 0x80 | 0x7F     | 0xC0 | 0x3F     |
| Mode: Timer            | 0x807F20DF   | 0x80 | 0x7F     | 0x20 | 0xDF     |
| Mode: Dark             | 0x807FA05F   | 0x80 | 0x7F     | 0xA0 | 0x5F     |
| Mode: Bright           | 0x807F609F   | 0x80 | 0x7F     | 0x60 | 0x9F     |
| Color: Red             | 0x807FE01F   | 0x80 | 0x7F     | 0xE0 | 0x1F     |
| Color: Green           | 0x807F10EF   | 0x80 | 0x7F     | 0x10 | 0xEF     |
| Color: Blue            | 0x807F906F   | 0x80 | 0x7F     | 0x90 | 0x6F     |
| Color: Orange          | 0x807F50AF   | 0x80 | 0x7F     | 0x50 | 0xAF     |
| Color: Light Green     | 0x807FD827   | 0x80 | 0x7F     | 0xD8 | 0x27     |
| Color: Light Blue      | 0x807FF807   | 0x80 | 0x7F     | 0xF8 | 0x07     |
| Color: Violet          | 0x807F30CF   | 0x80 | 0x7F     | 0x30 | 0xCF     |
| Color: Yellow          | 0x807FB04F   | 0x80 | 0x7F     | 0xB0 | 0x4F     |
| Color: Blue White      | 0x807F708F   | 0x80 | 0x7F     | 0x70 | 0x8F     |
| Color: Pink            | 0x807F00FF   | 0x80 | 0x7F     | 0x00 | 0xFF     |
| Color: Yellow White    | 0x807FF00F   | 0x80 | 0x7F     | 0xF0 | 0x0F     |
| Color: White           | 0x807F9867   | 0x80 | 0x7F     | 0x98 | 0x67     |

**Source:** https://tasmota.github.io/docs/Codes-for-IR-Remotes/#duni-multicoloured-led-candle--duni-mehrfarbige-led-kerzen


---

## Fishtec Bougie / Generic Multicolored Led Candle / Generische mehrfarbige LED Kerzen

**Protocol:** NEC  
**Address:** 0x01

| Button                 | Data         | ADDR | ADDR_INV | CMD  | CMD_INV  |
|------------------------|--------------|------|----------|------|----------|
| ON                     | 0x01FE48B7   | 0x01 | 0xFE     | 0x48 | 0xB7     |
| OFF                    | 0x01FE58A7   | 0x01 | 0xFE     | 0x58 | 0xA7     |
| Color: Blue            | 0x01FE609F   | 0x01 | 0xFE     | 0x60 | 0x9F     |
| Color: Red             | 0x01FE20DF   | 0x01 | 0xFE     | 0x20 | 0xDF     |
| Color: Green           | 0x01FEA05F   | 0x01 | 0xFE     | 0xA0 | 0x5F     |
| Color: White           | 0x01FE30CF   | 0x01 | 0xFE     | 0x30 | 0xCF     |
| Color: Turkis          | 0x01FE10EF   | 0x01 | 0xFE     | 0x10 | 0xEF     |
| Color: Orange          | 0x01FE50AF   | 0x01 | 0xFE     | 0x50 | 0xAF     |
| Color: Pink            | 0x01FE708F   | 0x01 | 0xFE     | 0x70 | 0x8F     |
| Color: Purple          | 0x01FEF807   | 0x01 | 0xFE     | 0xF8 | 0x07     |
| Color: Light Purple    | 0x01FE906F   | 0x01 | 0xFE     | 0x90 | 0x6F     |
| Color: Light Blue      | 0x01FED827   | 0x01 | 0xFE     | 0xD8 | 0x27     |
| Color: Ocean Blue      | 0x01FEB04F   | 0x01 | 0xFE     | 0xB0 | 0x4F     |
| Mode: Multi Color      | 0x01FEC03F   | 0x01 | 0xFE     | 0xC0 | 0x3F     |
| Mode: Switch           | 0x01FE7887   | 0x01 | 0xFE     | 0x78 | 0x87     |

**Source:** https://tasmota.github.io/docs/Codes-for-IR-Remotes/#fishtec-bougie--generic-multicolored-led-candle--generische-mehrfarbige-led-kerzen


---

## Krinner Lumix IR Remote

**Source:** https://tasmota.github.io/docs/Codes-for-IR-Remotes/#christmas-candle-weihnachtsbeleuchtung

Remote control has two buttons and three channels.
- Button 1 is to switch on
- Button 0 is to switch off
- Double click on button 1 is flicker mode

No usable protocol found yet, but raw mode does it.

### Channel A
| Function | Raw IR Code |
|----------|-------------|
| OFF | `0,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000, 400,1000, 400,1000, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000, 400,1000, 400,1000, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000, 400,1000, 400,1000, 400,2000,5600` |
| ON | `0,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,2000,5600` |
| FLICKER | `0,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000, 400,1100,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000, 400,1100,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000, 400,1100,1000, 400, 400,2000,5600` |

### Channel B
| Function | Raw IR Code |
|----------|-------------|
| OFF | `0,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,1000, 400,1000, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,1000, 400,1000, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,1000, 400,1000, 400,2000,5600` |
| ON | `0,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400,1000, 400,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400,1000, 400,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400,1000, 400,1000, 400, 400,2000,5600` |
| FLICKER | `0,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,1100,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,1100,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,1100,1000, 400, 400,2000,5600` |

### Channel C
| Function | Raw IR Code |
|----------|-------------|
| OFF | `0,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400, 400,1000, 400,1000, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400, 400,1000, 400,1000, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400, 400,1000, 400,1000, 400,2000,5600` |
| ON | `0,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,2000,5600` |
| FLICKER | `0,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400, 400,1100,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400, 400,1100,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400, 400,1100,1000, 400, 400,2000,5600` |


---

## Magic Lighting Remote

**Protocol:** NEC  
**Address:** 0x00

**Source:** https://arduinoplusplus.wordpress.com/2021/11/26/ir-remote-codes/
