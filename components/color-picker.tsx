"use client"
import { Label } from "@/components/ui/label"

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  onChangeComplete?: () => void
}

export default function ColorPicker({ label, value, onChange, onChangeComplete }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-md border border-gray-600" style={{ backgroundColor: value }} />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onChangeComplete}
          className="w-full h-8"
        />
      </div>
    </div>
  )
}
