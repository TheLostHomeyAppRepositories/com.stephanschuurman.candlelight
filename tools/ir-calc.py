#!/usr/bin/env python3
"""
NEC Infrared Protocol Calculator
TUI application for encoding and decoding NEC IR protocol telegrams
"""

import re
from textual.app import App, ComposeResult
from textual.containers import Container, Horizontal, Vertical
from textual.widgets import Header, Footer, Input, Static, Button, Label
from textual.validation import ValidationResult, Validator


class HexValidator(Validator):
    """Validator for hexadecimal input."""
    
    def validate(self, value: str) -> ValidationResult:
        """Check if the value is a valid hex number."""
        if not value:
            return self.success()
        
        # Remove 0x prefix if present
        clean_value = value.replace('0x', '').replace('0X', '')
        
        try:
            int(clean_value, 16)
            return self.success()
        except ValueError:
            return self.failure("Must be a valid hexadecimal number")


class NECCalculator:
    """NEC Protocol calculator for IR codes."""
    
    # Regex pattern for decoding NEC telegram
    TELEGRAM_PATTERN = re.compile(
        r'^(?:0x)?(?P<ADDR>[0-9A-Fa-f]{2})(?P<ADDR_INV>[0-9A-Fa-f]{2})'
        r'(?P<CMD>[0-9A-Fa-f]{2})(?P<CMD_INV>[0-9A-Fa-f]{1,2})$'
    )
    
    @staticmethod
    def calculate_inverse(byte: int) -> int:
        """Calculate the bitwise inverse of a byte."""
        return (~byte) & 0xFF
    
    @staticmethod
    def parse_hex(value: str) -> int:
        """Parse hex string to integer."""
        if not value:
            return 0
        clean_value = value.replace('0x', '').replace('0X', '')
        return int(clean_value, 16) if clean_value else 0
    
    @staticmethod
    def decode_telegram(telegram_hex: str) -> dict:
        """
        Decode NEC protocol telegram to extract address and command.
        
        Args:
            telegram_hex: Hex string of the telegram (e.g., "0x01FE12ED")
            
        Returns:
            Dictionary with decoded values or error message
        """
        match = NECCalculator.TELEGRAM_PATTERN.match(telegram_hex)
        
        if not match:
            return {'error': 'Invalid telegram format'}
        
        addr = int(match.group('ADDR'), 16)
        addr_inv = int(match.group('ADDR_INV'), 16)
        cmd = int(match.group('CMD'), 16)
        cmd_inv = int(match.group('CMD_INV'), 16)
        
        # Verify address inverse
        if addr_inv != NECCalculator.calculate_inverse(addr):
            return {'error': 'Invalid address inverse'}
        
        # Verify command inverse
        if cmd_inv != NECCalculator.calculate_inverse(cmd):
            return {'error': 'Invalid command inverse'}
        
        return {
            'address': addr,
            'address_hex': f'0x{addr:02X}',
            'command': cmd,
            'command_hex': f'0x{cmd:02X}',
            'telegram': telegram_hex,
            'valid': True
        }
    
    @staticmethod
    def calculate_telegram(address: int, command: int) -> dict:
        """
        Calculate NEC protocol telegram from address and command.
        
        Args:
            address: 8-bit address value
            command: 8-bit command value
            
        Returns:
            Dictionary with all calculated values
        """
        address = address & 0xFF
        command = command & 0xFF
        
        address_inv = NECCalculator.calculate_inverse(address)
        command_inv = NECCalculator.calculate_inverse(command)
        
        # Construct 32-bit telegram
        telegram = (address << 24) | (address_inv << 16) | (command << 8) | command_inv
        
        # Binary representation for command
        command_binary = format(command, '08b')
        command_inv_binary = format(command_inv, '08b')
        
        return {
            'address': address,
            'address_hex': f'0x{address:02X}',
            'address_inv': address_inv,
            'address_inv_hex': f'0x{address_inv:02X}',
            'command': command,
            'command_hex': f'0x{command:02X}',
            'command_inv': command_inv,
            'command_inv_hex': f'0x{command_inv:02X}',
            'telegram': telegram,
            'telegram_hex': f'0x{telegram:08X}',
            'command_binary': command_binary,
            'command_inv_binary': command_inv_binary,
        }


class NECCalculatorApp(App):
    """A Textual app for NEC IR protocol calculations."""
    
    CSS = """
    Screen {
        background: $surface;
    }
    
    #input-container {
        height: auto;
        padding: 1;
        background: $boost;
        margin: 1;
    }
    
    #results-container {
        height: auto;
        padding: 1;
        background: $panel;
        margin: 1;
    }
    
    .input-row {
        height: auto;
        margin-bottom: 1;
    }
    
    .hidden {
        display: none;
    }
    
    .mode-label {
        text-align: center;
        text-style: bold;
        color: $warning;
        margin-bottom: 1;
    }
    
    .label {
        width: 20;
        content-align: right middle;
        padding-right: 1;
    }
    
    Input {
        width: 30;
    }
    
    Button {
        margin-left: 1;
    }
    
    .result-row {
        height: auto;
        margin-bottom: 1;
    }
    
    .result-label {
        width: 25;
        content-align: right middle;
        padding-right: 1;
        color: $text-muted;
    }
    
    .result-value {
        width: 40;
        color: $success;
    }
    
    #title {
        text-align: center;
        text-style: bold;
        color: $accent;
        margin-bottom: 1;
    }
    
    #info {
        text-align: center;
        color: $text-muted;
        margin-bottom: 1;
    }
    """
    
    BINDINGS = [
        ("q", "quit", "Quit"),
        ("e", "toggle_mode", "Toggle Mode"),
    ]
    
    def __init__(self):
        super().__init__()
        self.encode_mode = True
    
    def compose(self) -> ComposeResult:
        """Create child widgets for the app."""
        yield Header()
        yield Container(
            Static("NEC Infrared Protocol Calculator", id="title"),
            Static("Press 'e' to toggle Encode/Decode mode", id="info"),
            Vertical(
                Static("Mode: Encode", id="mode-label", classes="mode-label"),
                Horizontal(
                    Label("Address (hex):", classes="label", id="label-address"),
                    Input(
                        placeholder="0x00",
                        validators=[HexValidator()],
                        id="address-input",
                        value="0x00",
                    ),
                    classes="input-row",
                ),
                Horizontal(
                    Label("Command (hex):", classes="label", id="label-command"),
                    Input(
                        placeholder="0x45",
                        validators=[HexValidator()],
                        id="command-input",
                        value="0x45",
                    ),
                    classes="input-row",
                ),
                Horizontal(
                    Label("Telegram (hex):", classes="label", id="label-telegram"),
                    Input(
                        placeholder="0x01FE12ED",
                        validators=[HexValidator()],
                        id="telegram-input",
                        value="0x01FE12ED",
                    ),
                    classes="input-row hidden",
                ),
                Horizontal(
                    Button("Calculate", variant="primary", id="action-btn"),
                    Button("Reset", variant="default", id="reset-btn"),
                    classes="input-row",
                ),
                id="input-container",
            ),
            Vertical(
                Static("Results:", classes="result-label"),
                Horizontal(
                    Label("Address:", classes="result-label"),
                    Static("", id="result-address", classes="result-value"),
                    classes="result-row",
                ),
                Horizontal(
                    Label("Address INV:", classes="result-label"),
                    Static("", id="result-address-inv", classes="result-value"),
                    classes="result-row",
                ),
                Horizontal(
                    Label("Command:", classes="result-label"),
                    Static("", id="result-command", classes="result-value"),
                    classes="result-row",
                ),
                Horizontal(
                    Label("Command INV:", classes="result-label"),
                    Static("", id="result-command-inv", classes="result-value"),
                    classes="result-row",
                ),
                Horizontal(
                    Label("Binary:", classes="result-label"),
                    Static("", id="result-binary", classes="result-value"),
                    classes="result-row",
                ),
                Horizontal(
                    Label("Telegram:", classes="result-label"),
                    Static("", id="result-telegram", classes="result-value"),
                    classes="result-row",
                ),
                id="results-container",
            ),
        )
        yield Footer()
    
    def on_mount(self) -> None:
        """Run calculation on mount with default values."""
        self.update_mode_display()
        self.calculate()
    
    def action_toggle_mode(self) -> None:
        """Toggle between encode and decode mode."""
        self.encode_mode = not self.encode_mode
        self.update_mode_display()
    
    def update_mode_display(self) -> None:
        """Update UI based on current mode."""
        mode_label = self.query_one("#mode-label", Static)
        addr_row = self.query_one("#label-address").parent
        cmd_row = self.query_one("#label-command").parent
        tele_row = self.query_one("#label-telegram").parent
        action_btn = self.query_one("#action-btn", Button)
        
        if self.encode_mode:
            mode_label.update("Mode: Encode (Address + Command → Telegram)")
            action_btn.label = "Calculate"
            addr_row.remove_class("hidden")
            cmd_row.remove_class("hidden")
            tele_row.add_class("hidden")
        else:
            mode_label.update("Mode: Decode (Telegram → Address + Command)")
            action_btn.label = "Decode"
            addr_row.add_class("hidden")
            cmd_row.add_class("hidden")
            tele_row.remove_class("hidden")
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        """Handle button press events."""
        if event.button.id == "action-btn":
            if self.encode_mode:
                self.calculate()
            else:
                self.decode()
        elif event.button.id == "reset-btn":
            if self.encode_mode:
                self.action_reset()
            else:
                self.action_decode_reset()
    
    def on_input_submitted(self, event: Input.Submitted) -> None:
        """Calculate when Enter is pressed in an input field."""
        if self.encode_mode:
            self.calculate()
        else:
            self.decode()
    
    def action_reset(self) -> None:
        """Reset all inputs and results."""
        self.query_one("#address-input", Input).value = "0x00"
        self.query_one("#command-input", Input).value = "0x45"
        self.calculate()
    
    def action_decode_reset(self) -> None:
        """Reset decode input and results."""
        self.query_one("#telegram-input", Input).value = "0x01FE12ED"
        self.decode()
    
    def calculate(self) -> None:
        """Perform the NEC protocol calculation."""
        try:
            # Get input values
            address_str = self.query_one("#address-input", Input).value
            command_str = self.query_one("#command-input", Input).value
            
            # Parse hex values
            address = NECCalculator.parse_hex(address_str)
            command = NECCalculator.parse_hex(command_str)
            
            # Calculate
            result = NECCalculator.calculate_telegram(address, command)
            
            # Update results
            self.query_one("#result-address", Static).update(
                f"{result['address_hex']} ({result['address']})"
            )
            self.query_one("#result-address-inv", Static).update(
                f"{result['address_inv_hex']} ({result['address_inv']})"
            )
            self.query_one("#result-command", Static).update(
                f"{result['command_hex']} ({result['command']})"
            )
            self.query_one("#result-command-inv", Static).update(
                f"{result['command_inv_hex']} ({result['command_inv']})"
            )
            self.query_one("#result-binary", Static).update(
                f"{result['command_binary']}, {result['command_inv_binary']}"
            )
            self.query_one("#result-telegram", Static).update(
                result['telegram_hex']
            )
            
        except Exception as e:
            self.query_one("#result-telegram", Static).update(f"Error: {str(e)}")
    
    def decode(self) -> None:
        """Decode a telegram to extract address and command."""
        try:
            # Get telegram input
            telegram_str = self.query_one("#telegram-input", Input).value
            
            # Decode
            result = NECCalculator.decode_telegram(telegram_str)
            
            if 'error' in result:
                self.query_one("#result-telegram", Static).update(f"Error: {result['error']}")
                return
            
            # Calculate the command inverse
            cmd_inv = NECCalculator.calculate_inverse(result['command'])
            
            # Update results
            self.query_one("#result-address", Static).update(
                f"{result['address_hex']} ({result['address']})"
            )
            self.query_one("#result-address-inv", Static).update(
                f"0x{NECCalculator.calculate_inverse(result['address']):02X}"
            )
            self.query_one("#result-command", Static).update(
                f"{result['command_hex']} ({result['command']})"
            )
            self.query_one("#result-command-inv", Static).update(
                f"0x{cmd_inv:02X} ({cmd_inv})"
            )
            
            cmd_binary = format(result['command'], '08b')
            cmd_inv_binary = format(cmd_inv, '08b')
            self.query_one("#result-binary", Static).update(
                f"{cmd_binary}, {cmd_inv_binary}"
            )
            self.query_one("#result-telegram", Static).update(result['telegram'])
            
        except Exception as e:
            self.query_one("#result-telegram", Static).update(f"Error: {str(e)}")


if __name__ == "__main__":
    app = NECCalculatorApp()
    app.run()
