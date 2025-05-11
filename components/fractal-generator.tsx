"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

// Fractal types
const FRACTAL_TYPES = {
  MANDELBROT: "mandelbrot",
  JULIA: "julia",
  BURNING_SHIP: "burning-ship",
  SIERPINSKI: "sierpinski",
  IFS_FERN: "ifs-fern",
  NEWTON: "newton"
}

export default function FractalGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fractalType, setFractalType] = useState(FRACTAL_TYPES.MANDELBROT)
  const [iterations, setIterations] = useState(100)
  const [zoom, setZoom] = useState(1)
  const [centerX, setCenterX] = useState(0)
  const [centerY, setCenterY] = useState(0)
  const [juliaConstant, setJuliaConstant] = useState({ x: -0.7, y: 0.27 })
  const [primaryColor, setPrimaryColor] = useState("#ff0000")
  const [secondaryColor, setSecondaryColor] = useState("#0000ff")
  const [isGenerating, setIsGenerating] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [viewStart, setViewStart] = useState({ x: 0, y: 0 })
  const [computationProgress, setComputationProgress] = useState(0)

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

  // Mouse drag handlers for panning or segmentify
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setViewStart({ x: centerX, y: centerY })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return
    const canvas = canvasRef.current
    if (!canvas) return
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    // Convert pixel movement to fractal coordinates
    const scaleX = 5 / (zoom * canvas.width)
    const scaleY = 3 / (zoom * canvas.height)
    setCenterX(viewStart.x - dx * scaleX)
    setCenterY(viewStart.y - dy * scaleY)
    generateFractal()
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(false)
  }

  // Mouse event handlers for canvas interaction
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
    setComputationProgress(0)
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
      case FRACTAL_TYPES.IFS_FERN:
        calculateIFSFern(data, canvas.width, canvas.height)
        break
      case FRACTAL_TYPES.NEWTON:
        calculateNewton(data, canvas.width, canvas.height)
        break
    }

    // Put image data back to canvas
    ctx.putImageData(imageData, 0, 0)
    setIsGenerating(false)
    setComputationProgress(100)
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
    // Clear data with white background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
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
          data[i] = 0
          data[i + 1] = 0
          data[i + 2] = 0
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

    return Math.abs(area - (a1 + a2 + a3)) < 0.1
  }

  // IFS Fern calculation
  const calculateIFSFern = (data: Uint8ClampedArray, width: number, height: number) => {
    const maxPoints = iterations * 1000
    let x = 0
    let y = 0

    // Scale and center the fern
    const scale = Math.min(width, height) * 0.2
    const offsetX = width / 2
    const offsetY = height * 0.9

    for (let i = 0; i < maxPoints; i++) {
      const r = Math.random()
      let newX, newY

      if (r < 0.01) {
        newX = 0
        newY = 0.16 * y
      } else if (r < 0.86) {
        newX = 0.85 * x + 0.04 * y
        newY = -0.04 * x + 0.85 * y + 1.6
      } else if (r < 0.93) {
        newX = 0.2 * x - 0.26 * y
        newY = 0.23 * x + 0.22 * y + 1.6
      } else {
        newX = -0.15 * x + 0.28 * y
        newY = 0.26 * x + 0.24 * y + 0.44
      }

      x = newX
      y = newY

      const pixelX = Math.floor(x * scale + offsetX)
      const pixelY = Math.floor(-y * scale + offsetY)

      if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
        const i = (pixelY * width + pixelX) * 4
        data[i] = 0
        data[i + 1] = 255
        data[i + 2] = 0
        data[i + 3] = 255
      }
    }
  }

  // Newton fractal calculation
  const calculateNewton = (data: Uint8ClampedArray, width: number, height: number) => {
    const maxIter = iterations
    const xMin = centerX - 2 / zoom
    const xMax = centerX + 2 / zoom
    const yMin = centerY - 1.5 / zoom
    const yMax = centerY + 1.5 / zoom

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let zx = xMin + ((xMax - xMin) * x) / width
        let zy = yMin + ((yMax - yMin) * y) / height
        let iter = 0

        while (iter < maxIter) {
          const zx2 = zx * zx
          const zy2 = zy * zy
          const zxzy = zx * zy
          const denom = 3 * (zx2 + zy2) * (zx2 + zy2)

          if (denom === 0) break

          const newZx = (2 * zx * (zx2 - 3 * zy2) + 1) / denom
          const newZy = (2 * zy * (3 * zx2 - zy2)) / denom

          if (Math.abs(newZx - zx) < 1e-6 && Math.abs(newZy - zy) < 1e-6) break

          zx = newZx
          zy = newZy
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

  // Color calculation based on iteration count
  const getColor = (iter: number, maxIter: number) => {
    if (iter === maxIter) {
      return { r: 0, g: 0, b: 0 } // Black for points in the set
    }
    const val = Math.floor((iter / maxIter) * 255)
    return { r: val, g: val, b: val }
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
        <div
          id="canvas-container"
          className="w-full relative overflow-auto rounded-lg border border-gray-700"
          style={{ maxHeight: 700, maxWidth: 1200 }}
        >
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className={`mx-auto block ${isGenerating ? "opacity-50" : ""} cursor-pointer`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ position: 'relative', zIndex: 1 }}
          />
          {/* Prominent loading animation */}
          {isGenerating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-lg z-10">
              <div className="w-16 h-16 border-4 border-t-4 border-t-green-400 border-gray-200 rounded-full animate-spin mb-4"></div>
              <div className="text-white text-lg font-bold tracking-wide animate-pulse">Processing...</div>
              <div className="w-48 h-2 bg-gray-700 rounded-full mt-2">
                <div 
                  className="h-full bg-green-400 rounded-full transition-all duration-300"
                  style={{ width: `${computationProgress}%` }}
                ></div>
              </div>
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
                <Label htmlFor="fractal-type">Fractal Type</Label>
                <Select
                  value={fractalType}
                  onValueChange={(value: string) => {
                    setFractalType(value)
                    setIterations(100)
                    resetView()
                  }}
                >
                  <SelectTrigger id="fractal-type">
                    <SelectValue placeholder="Select fractal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FRACTAL_TYPES.MANDELBROT}>Mandelbrot Set</SelectItem>
                    <SelectItem value={FRACTAL_TYPES.JULIA}>Julia Set</SelectItem>
                    <SelectItem value={FRACTAL_TYPES.BURNING_SHIP}>Burning Ship</SelectItem>
                    <SelectItem value={FRACTAL_TYPES.SIERPINSKI}>Sierpinski Triangle</SelectItem>
                    <SelectItem value={FRACTAL_TYPES.IFS_FERN}>IFS Fern</SelectItem>
                    <SelectItem value={FRACTAL_TYPES.NEWTON}>Newton Fractal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Iterations: {iterations}</Label>
                <Slider
                  value={[iterations]}
                  min={10}
                  max={1000}
                  step={10}
                  onValueChange={(value: number[]) => {
                    setIterations(value[0])
                    setComputationProgress(0)
                  }}
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
            <li>Try different fractal types for varied patterns</li>
          </ul>
        </div>
      </div>
    </div>
  )
}