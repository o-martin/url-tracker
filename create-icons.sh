#!/bin/bash

# Script to convert icon.svg to PNG files
# Requires: rsvg-convert (librsvg) or inkscape

if command -v rsvg-convert &> /dev/null; then
    echo "Creating icons with rsvg-convert..."
    rsvg-convert -w 128 -h 128 icon.svg -o icon128.png
    rsvg-convert -w 48 -h 48 icon.svg -o icon48.png
    rsvg-convert -w 16 -h 16 icon.svg -o icon16.png
    echo "Icons created successfully!"
elif command -v inkscape &> /dev/null; then
    echo "Creating icons with inkscape..."
    inkscape icon.svg -w 128 -h 128 -o icon128.png
    inkscape icon.svg -w 48 -h 48 -o icon48.png
    inkscape icon.svg -w 16 -h 16 -o icon16.png
    echo "Icons created successfully!"
else
    echo "Error: Neither rsvg-convert nor inkscape found."
    echo "Please install one of them or create icons manually:"
    echo "  - macOS: brew install librsvg"
    echo "  - Ubuntu: sudo apt-get install librsvg2-bin"
    echo ""
    echo "Alternatively, use an online converter:"
    echo "  - https://cloudconvert.com/svg-to-png"
    echo "  - https://icon.kitchen/"
    exit 1
fi
