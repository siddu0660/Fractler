"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

// Fractal types
const FRACTAL_TYPES = {
  MANDELBROT: "mandelbrot",
  JULIA: "julia",
  BURNING_SHIP: "burning-ship",
  SIERPINSKI: "sierpinski",
}

export default function FractalGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fractalType, setFractalType] = useState(FRACTAL_TYPES.MANDELBROT)
  const [iterations, setIterations] = useState(100)
  const [zoom, setZoom] = useState(1)
  const [centerX, setCenterX] = useState(0)
  const [centerY, setCenterY] = useState(0)
  const [juliaConstant, setJuliaConstant] = useState({ x: -0.7, y: 0.27 })
  const [colorScheme, setColorScheme] = useState("rainbow")
  const [primaryColor, setPrimaryColor] = useState("#ff0000")
  const [secondaryColor, setSecondaryColor] = useState("#0000ff")
  const [isGenerating, setIsGenerating] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById("canvas-container")
      if (container) {
        const width = Math.min(container.clientWidth, 1200)
        const height = Math.floor(width * 0.75) // 4:3 aspect ratio
        setCanvasSize({ width, height })
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Generate fractal when parameters change
  useEffect(() => {
    generateFractal()
  }, [canvasSize, fractalType])

  // Mouse event handlers for canvas interaction
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Convert click position to fractal coordinates
    const xMin = centerX - 2.5 / zoom
    const xMax = centerX + 2.5 / zoom
    const yMin = centerY - 1.5 / zoom
    const yMax = centerY + 1.5 / zoom

    const newCenterX = xMin + ((xMax - xMin) * x) / canvas.width
    const newCenterY = yMin + ((yMax - yMin) * y) / canvas.height

    setCenterX(newCenterX)
    setCenterY(newCenterY)
    generateFractal()
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Convert mouse position to fractal coordinates
    const xMin = centerX - 2.5 / zoom
    const xMax = centerX + 2.5 / zoom
    const yMin = centerY - 1.5 / zoom
    const yMax = centerY + 1.5 / zoom

    const mouseFractalX = xMin + ((xMax - xMin) * mouseX) / canvas.width
    const mouseFractalY = yMin + ((yMax - yMin) * mouseY) / canvas.height

    // Zoom factor
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = zoom * zoomFactor

    // Calculate new center to zoom towards mouse position
    const newCenterX = mouseFractalX - (mouseFractalX - centerX) * (newZoom / zoom)
    const newCenterY = mouseFractalY - (mouseFractalY - centerY) * (newZoom / zoom)

    setZoom(newZoom)
    setCenterX(newCenterX)
    setCenterY(newCenterY)
    generateFractal()
  }

  // Generate the fractal
  const generateFractal = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsGenerating(true)
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Create image data
    const imageData = ctx.createImageData(canvas.width, canvas.height)
    const data = imageData.data

    // Calculate fractal based on type
    switch (fractalType) {
      case FRACTAL_TYPES.MANDELBROT:
        calculateMandelbrot(data, canvas.width, canvas.height)
        break
      case FRACTAL_TYPES.JULIA:
        calculateJulia(data, canvas.width, canvas.height)
        break
      case FRACTAL_TYPES.BURNING_SHIP:
        calculateBurningShip(data, canvas.width, canvas.height)
        break
      case FRACTAL_TYPES.SIERPINSKI:
        calculateSierpinski(data, canvas.width, canvas.height)
        break
    }

    // Put image data back to canvas
    ctx.putImageData(imageData, 0, 0)
    setIsGenerating(false)
  }

  // Mandelbrot set calculation
  const calculateMandelbrot = (data: Uint8ClampedArray, width: number, height: number) => {
    const maxIter = iterations
    const xMin = centerX - 2.5 / zoom
    const xMax = centerX + 2.5 / zoom
    const yMin = centerY - 1.5 / zoom
    const yMax = centerY + 1.5 / zoom

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const cRe = xMin + ((xMax - xMin) * x) / width
        const cIm = yMin + ((yMax - yMin) * y) / height

        let zRe = 0,
          zIm = 0
        let iter = 0

        while (iter < maxIter && zRe * zRe + zIm * zIm < 4) {
          const tmp = zRe * zRe - zIm * zIm + cRe
          zIm = 2 * zRe * zIm + cIm
          zRe = tmp
          iter++
        }

        const i = (y * width + x) * 4
        const color = getColor(iter, maxIter)

        data[i] = color.r
        data[i + 1] = color.g
        data[i + 2] = color.b
        data[i + 3] = 255
      }
    }
  }

  // Julia set calculation
  const calculateJulia = (data: Uint8ClampedArray, width: number, height: number) => {
    const maxIter = iterations
    const xMin = centerX - 2 / zoom
    const xMax = centerX + 2 / zoom
    const yMin = centerY - 1.5 / zoom
    const yMax = centerY + 1.5 / zoom
    const cRe = juliaConstant.x
    const cIm = juliaConstant.y

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let zRe = xMin + ((xMax - xMin) * x) / width
        let zIm = yMin + ((yMax - yMin) * y) / height
        let iter = 0

        while (iter < maxIter && zRe * zRe + zIm * zIm < 4) {
          const tmp = zRe * zRe - zIm * zIm + cRe
          zIm = 2 * zRe * zIm + cIm
          zRe = tmp
          iter++
        }

        const i = (y * width + x) * 4
        const color = getColor(iter, maxIter)

        data[i] = color.r
        data[i + 1] = color.g
        data[i + 2] = color.b
        data[i + 3] = 255
      }
    }
  }

  // Burning Ship fractal calculation
  const calculateBurningShip = (data: Uint8ClampedArray, width: number, height: number) => {
    const maxIter = iterations
    const xMin = centerX - 2.5 / zoom
    const xMax = centerX + 2.5 / zoom
    const yMin = centerY - 1.5 / zoom
    const yMax = centerY + 1.5 / zoom

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const cRe = xMin + ((xMax - xMin) * x) / width
        const cIm = yMin + ((yMax - yMin) * y) / height

        let zRe = 0,
          zIm = 0
        let iter = 0

        while (iter < maxIter && zRe * zRe + zIm * zIm < 4) {
          const tmp = zRe * zRe - zIm * zIm + cRe
          zIm = Math.abs(2 * zRe * zIm) + cIm
          zRe = tmp
          iter++
        }

        const i = (y * width + x) * 4
        const color = getColor(iter, maxIter)

        data[i] = color.r
        data[i + 1] = color.g
        data[i + 2] = color.b
        data[i + 3] = 255
      }
    }
  }

  // Sierpinski Triangle calculation
  const calculateSierpinski = (data: Uint8ClampedArray, width: number, height: number) => {
    // Clear data
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0
      data[i + 1] = 0
      data[i + 2] = 0
      data[i + 3] = 255
    }

    const depth = Math.min(10, Math.floor(iterations / 10))
    const size = Math.min(width, height) * 0.8
    const offsetX = (width - size) / 2
    const offsetY = (height - size) / 2

    // Draw Sierpinski triangle
    drawSierpinskiTriangle(data, width, height, offsetX, offsetY, size, depth)
  }

  // Recursive function to draw Sierpinski triangle
  const drawSierpinskiTriangle = (
    data: Uint8ClampedArray,
    width: number,
    height: number,
    x: number,
    y: number,
    size: number,
    depth: number,
  ) => {
    if (depth === 0) {
      // Draw a filled triangle
      drawTriangle(data, width, height, x, y + size, x + size / 2, y, x + size, y + size)
      return
    }

    const newSize = size / 2

    // Draw three smaller triangles
    drawSierpinskiTriangle(data, width, height, x, y + newSize, newSize, depth - 1)
    drawSierpinskiTriangle(data, width, height, x + newSize / 2, y, newSize, depth - 1)
    drawSierpinskiTriangle(data, width, height, x + newSize, y + newSize, newSize, depth - 1)
  }

  // Draw a filled triangle
  const drawTriangle = (
    data: Uint8ClampedArray,
    width: number,
    height: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
  ) => {
    // Find bounding box
    const minX = Math.max(0, Math.floor(Math.min(x1, x2, x3)))
    const maxX = Math.min(width - 1, Math.ceil(Math.max(x1, x2, x3)))
    const minY = Math.max(0, Math.floor(Math.min(y1, y2, y3)))
    const maxY = Math.min(height - 1, Math.ceil(Math.max(y1, y2, y3)))

    // Check each pixel
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        if (isPointInTriangle(x, y, x1, y1, x2, y2, x3, y3)) {
          const i = (y * width + x) * 4
          const color = getColor(iterations, iterations)
          data[i] = color.r
          data[i + 1] = color.g
          data[i + 2] = color.b
          data[i + 3] = 255
        }
      }
    }
  }

  // Check if point is inside triangle
  const isPointInTriangle = (
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
  ) => {
    const area = 0.5 * Math.abs(x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2))

    const a1 = 0.5 * Math.abs(px * (y1 - y2) + x1 * (y2 - py) + x2 * (py - y1))
    const a2 = 0.5 * Math.abs(px * (y2 - y3) + x2 * (y3 - py) + x3 * (py - y2))
    const a3 = 0.5 * Math.abs(px * (y3 - y1) + x3 * (y1 - py) + x1 * (py - y3))

    return Math.abs(area - (a1 + a2 + a3)) < 0.01
  }

  // Color calculation based on iteration count
  const getColor = (iter: number, maxIter: number) => {
    if (iter === maxIter) {
      return { r: 0, g: 0, b: 0 } // Black for points in the set
    }

    const normalized = iter / maxIter

    switch (colorScheme) {
      case "rainbow":
        return hsvToRgb(normalized * 360, 1, 1)
      case "grayscale":
        const val = Math.floor(normalized * 255)
        return { r: val, g: val, b: val }
      case "custom":
        const primary = hexToRgb(primaryColor)
        const secondary = hexToRgb(secondaryColor)
        return {
          r: Math.floor(primary.r * (1 - normalized) + secondary.r * normalized),
          g: Math.floor(primary.g * (1 - normalized) + secondary.g * normalized),
          b: Math.floor(primary.b * (1 - normalized) + secondary.b * normalized),
        }
      default:
        return hsvToRgb(normalized * 360, 1, 1)
    }
  }

  // HSV to RGB conversion
  const hsvToRgb = (h: number, s: number, v: number) => {
    let r = 0,
      g = 0,
      b = 0

    const i = Math.floor(h / 60) % 6
    const f = h / 60 - i
    const p = v * (1 - s)
    const q = v * (1 - f * s)
    const t = v * (1 - (1 - f) * s)

    switch (i) {
      case 0:
        r = v
        g = t
        b = p
        break
      case 1:
        r = q
        g = v
        b = p
        break
      case 2:
        r = p
        g = v
        b = t
        break
      case 3:
        r = p
        g = q
        b = v
        break
      case 4:
        r = t
        g = p
        b = v
        break
      case 5:
        r = v
        g = p
        b = q
        break
    }

    return {
      r: Math.floor(r * 255),
      g: Math.floor(g * 255),
      b: Math.floor(b * 255),
    }
  }

  // Hex to RGB conversion
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }

  // Save the fractal as an image
  const saveImage = (format: "png" | "jpeg") => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `fractal-${fractalType}-${Date.now()}.${format}`
    link.href = canvas.toDataURL(`image/${format}`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Reset view to default
  const resetView = () => {
    setCenterX(0)
    setCenterY(0)
    setZoom(1)
    generateFractal()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Fractal Canvas */}
      <div className="lg:col-span-2 bg-gray-800 rounded-lg p-4 flex flex-col items-center">
        <div id="canvas-container" className="w-full relative overflow-hidden">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className={`border border-gray-700 rounded-lg mx-auto ${isGenerating ? "opacity-50" : ""} cursor-pointer`}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
          />
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Iterations: {iterations}</Label>
                <Slider
                  value={[iterations]}
                  min={10}
                  max={1000}
                  step={10}
                  onValueChange={(value: number[]) => setIterations(value[0])}
                  onValueCommit={() => generateFractal()}
                />
              </div>

              <Button className="w-full" onClick={generateFractal} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate Fractal"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-sm text-gray-400">
          <h3 className="font-medium mb-2">Tips:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Click to center the view at that point</li>
            <li>Use mouse wheel to zoom in/out at cursor position</li>
            <li>Higher iterations give more detail but are slower</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
