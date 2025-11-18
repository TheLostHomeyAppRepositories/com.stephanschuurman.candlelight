# Candlelight -- Homey Pro IR Candle Controller

A lightweight Homey Pro app to control IR-based LED candle and tealight lights. Supports simple on/off commands and is designed for reliable, effortless integration with your smart home.

## Project Name

The name is a small nod to the Dutch radio show *Candlelight* by Jan van
Veen.

## ✨ Features

-   Control IR-based LED candles and tealights
-   Supports on/off commands
-   Uses the Homey Pro IR capabilities
-   Works with common NEC-based IR candle remotes
-   Minimal, clean implementation

## 📦 Installation

### From Homey CLI (development)

``` bash
git clone https://github.com/stephanschuurman/com.stephanschuurman.candlelight.git
cd com.stephanschuurman.candlelight
npm install
homey app run
```

### From Homey App Store (when published)

Coming soon.

## 🕹 Usage

1.  Open the Homey app
2.  Add a new device → choose **Candlelight**
3.  Aim Homey's IR blaster toward the candle(s)
4.  Use on/off to control your lights
5.  Use flows to integrate ambient scenes or automations

## 🔦 Supported Devices

Currently tested with:

| Brand | Model       | Protocol | Notes |
|-------|--------------|----------|-------|
| HEMA  | 13550076 - Oplaadbare LED Theelichtjes | NEC | Rebranded item, see Taizhou Sparkle Lights, BAT-LEDS01 |
| Taizhou Sparkle Lights | BAT-LEDS01 | NEC | Sold under HEMA house brand |


More IR sets to be added --- feel free to open an Issue or PR with
Pronto/Hex codes.

## ⚙️ Configuration

-   No configuration required
-   Homey uses its internal IR transmitter
-   For custom IR remotes: codes can be added under
    `/drivers/<driver>/remote.json`

## 🛠 Development

``` bash
npm install
homey app run
```

## 🗺 Roadmap

-   [ ] Add more IR remote profiles
-   [ ] Per-brand candle drivers
-   [ ] Flow cards for brightness or flicker presets
-   [ ] Optional learn-mode

## 🤝 Contributing

Contributions, IR codes, and feature suggestions are welcome! Please
open an Issue or create a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgements

-   Open-source IR projects for reference
-   Homey Pro developer community
