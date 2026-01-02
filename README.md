# Candlelight

Control your IR-based LED candles, tealights, and galaxy projectors with Homey Pro. Simple, reliable integration for ambient lighting automation.

> **Project Name**: Named after the Dutch radio show *Candlelight* by Jan van Veen.

## Features

- **Multiple Device Types**: Supports LED tealights and galaxy star projectors
- **Full IR Control**: On/off, timers, brightness, nebula and star effects
- **Satellite Support**: Use Homey Pro's built-in IR or external satellites (select via Advanced Settings)
- **Configurable Repetitions**: Adjust IR command reliability via device settings
- **Flow Integration**: Complete flow card support for all functions
- **NEC Protocol**: Works with common NEC-based IR remotes

## Installation

### From Homey App Store

*Coming soon*

### Development Install

```bash
git clone https://github.com/stephanschuurman/com.stephanschuurman.candlelight.git
cd com.stephanschuurman.candlelight
npm install
homey app run
```

## Supported Devices

See [docs/ir-codes.md](docs/ir-codes.md) for complete IR command documentation. 

### LED Tealights

| Brand | Models (tested) | Protocol | Features | Remarks |
|-------|---------------|----------|----------|---------|
| Action | 3210507, [3221633](https://shop.action.com/nl-nl/p/8721184890585/luxe-set-ledkaarsen-7-delig-taupe), [3221634](https://shop.action.com/nl-nl/p/8721184890561/luxe-set-ledkaarsen-7-delig-rood) | NEC | On/Off, Dim, 2/4/6/8h timers | Mascot Online B.V., model AO-LL-CDLS01-T
| HEMA | 13550076, 13550089, 13550123, 13550124, 13550125, 13550128, 13550129, 13550134, 13550140, 13550143 | NEC | On/Off, 2/4/6/8h timers | Seems rebranded Taizhou Sparkle
| Deluxe Homeart | `None Tested` | NEC | On/Off, 2/4/6/8h timers | 


## Usage

### Add a Device

1. Open the Homey app
2. Add device → **Candlelight** (Kaarslicht)
3. Select your device type
4. Position Homey's IR transmitter toward the device
5. Complete pairing

### Device Settings

- **IR Command Repetitions** (1-10, default: 3): Adjust for reliability vs. speed
- **Satellite Mode**: Select IR antenna (Homey or satellite device)

### Flow Cards

#### Tealights
- Turn on
- Turn off
- Set timer (2h, 4h, 6h, 8h)
- Set mode (candle, light)
- Dim up/down

## Development

### Requirements
- Node.js 22+
- Docker (for `homey app run`)
- Homey CLI: `npm install -g homey`

### Local Development

```bash
npm install
homey app run
```

All logs will be streamed to your terminal.

### Project Structure

```
drivers/
  action-10-button/  # Action 10-button remote driver
  hema-tealight/      # LED tealight driver
  deluxe-homeart/

lib/
  ir.ts              # IR communication library
  ProjectorDeviceApi.ts  # Projector-specific API
  IRUtils.ts         # NEC protocol utilities
```

## Roadmap

- [ ] Additional IR remote profiles
- [ ] Per-brand driver variants
- [ ] IR learning mode
- [ ] Advanced scene presets
- [ ] Multi-device synchronization

## Contributing

Contributions welcome! Please submit:
- New IR codes via PR with Pronto hex or NEC command codes
- Bug reports via GitHub Issues
- Feature requests via GitHub Discussions

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgements

- Homey Pro developer community
