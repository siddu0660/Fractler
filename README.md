# Fractler - Interactive Fractal Generator

A modern web application for generating and exploring mathematical fractals using React and TypeScript.

## Features

- Multiple fractal types:
  - Mandelbrot Set
  - Julia Set
  - IFS Fern
  - L-System
- Interactive navigation:
  - Pan with mouse drag
  - Zoom with mouse wheel
  - Touch support for mobile devices
- Customizable parameters:
  - Resolution (512px - 2048px)
  - Iteration count
  - Color gradient
- Export functionality:
  - PNG export
  - High-resolution rendering

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fractler.git
cd fractler
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Controls

- **Fractal Type**: Select from different fractal types
- **Iterations**: Adjust the number of iterations for more detail
- **Resolution**: Set the rendering resolution
- **Color Gradient**: Customize the fractal's color scheme
- **Export**: Save the current view as a PNG file

### Navigation

- **Pan**: Click and drag to move around the fractal
- **Zoom**: Use the mouse wheel to zoom in/out
- **Mobile**: Use touch gestures for pan and pinch-to-zoom

## Technical Details

- Built with React and TypeScript
- Uses Material-UI for the interface
- Canvas-based rendering for performance
- Responsive design for all screen sizes

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 