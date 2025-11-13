import argparse
import os
from PIL import Image

# Input file
input_file = "native.png"

# Target files and resolutions for different image types
app_sizes = {
    "small":  (250, 175),
    "large":  (500, 350),
    "xlarge": (1000, 700)
}

driver_sizes = {
    "small":  (75, 75),
    "large":  (500, 500),
    "xlarge": (1000, 1000)
}

def main():
    # Set up command line argument parsing
    parser = argparse.ArgumentParser(description="Resize images for Homey app or driver")
    parser.add_argument("type", choices=["app", "driver"], 
                       help="Type of images to generate (app or driver)")
    parser.add_argument("--path", 
                       help="Custom path for output images. If not specified, uses default paths.")
    parser.add_argument("--driver-name", 
                       help="Driver name (required when type is 'driver' and no custom path is provided)")
    
    args = parser.parse_args()
    
    # Determine output path
    if args.path:
        output_path = args.path
    elif args.type == "app":
        output_path = "assets/images"
    elif args.type == "driver":
        if not args.driver_name:
            parser.error("--driver-name is required when type is 'driver' and no --path is specified")
        output_path = f"drivers/{args.driver_name}/assets/images"
    
    # Determine input file path (look for native.png in the same location as output)
    input_path = os.path.join(output_path, input_file)
    
    # Create output directory if it doesn't exist
    os.makedirs(output_path, exist_ok=True)
    
    # Select appropriate size configuration
    if args.type == "app":
        sizes = app_sizes
        print(f"Generating app images in {output_path}...")
    else:
        sizes = driver_sizes
        print(f"Generating driver images in {output_path}...")
    
    # Check if input file exists
    if not os.path.exists(input_path):
        print(f"Error: Input file '{input_path}' not found.")
        print(f"Please make sure '{input_file}' exists in the {output_path} directory.")
        return
    
    # Open original image
    with Image.open(input_path) as img:
        for name, size in sizes.items():
            # Resize with anti-alias filter
            resized = img.resize(size, Image.LANCZOS)
            # Save with new filename
            output_file = os.path.join(output_path, f"{name}.png")
            resized.save(output_file, format="PNG")
            print(f"{output_file} saved ({size[0]}x{size[1]})")

if __name__ == "__main__":
    main()