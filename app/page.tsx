import FractalGenerator from "@/components/fractal-generator"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Fractal Generator</h1>
        <p className="text-center mb-8 text-gray-300 max-w-2xl mx-auto">
          Create beautiful fractals.
        </p>
        <FractalGenerator />
      </div>
    </main>
  )
}
