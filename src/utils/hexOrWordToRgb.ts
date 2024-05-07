interface RGB {
    r: number;
    g: number;
    b: number;
}

export default function hexOrWordToRgb(input: string): RGB | null {
    // If input is a hex color code
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(input)) {
        let hex: string = input.substring(1); // Remove the hash character
        // Convert short-form hex to full-form hex
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        // Parse hex to RGB
        const rgb: RGB = {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
        return rgb;
    }
    // If input is a color name
    else {
        // Define color names and their RGB values
        const colorNames: { [key: string]: RGB } = {
            aliceblue: { r: 240, g: 248, b: 255 },
            antiquewhite: { r: 250, g: 235, b: 215 },
            // Add more color names as needed
        };
        // Check if input is a recognized color name
        if (colorNames[input.toLowerCase()]) {
            return colorNames[input.toLowerCase()];
        } else {
            return null; // Return null if input is neither hex nor a recognized color name
        }
    }
}
