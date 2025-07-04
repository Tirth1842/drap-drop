"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"

interface EnhancedDragItem {
  id: string
  type: "text" | "image" | "mixed"
  text?: string
  imageUrl?: string
  altText?: string
  category?: string
  correctPosition?: number
}

interface EnhancedDragDropPreviewProps {
  content: {
    questionText: string
    questionImage?: string
    dragDropType: "categorize" | "sequence" | "match-boxes"
    items: EnhancedDragItem[]
    categories?: Array<{
      id: string
      name: string
      color: string
      imageUrl?: string
    }>
    boxes?: Array<{
      id: string
      label: string
      correctAnswer: string
      imageUrl?: string
    }>
  }
}

export function EnhancedDragDropPreview({ content }: EnhancedDragDropPreviewProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [droppedItems, setDroppedItems] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    // Prevent dragging if results are shown
    if (showResults) {
      e.preventDefault()
      return
    }
    setDraggedItem(itemId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    // Prevent drop if results are shown
    if (showResults) {
      e.dataTransfer.dropEffect = "none"
      return
    }
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    // Prevent drop if results are shown
    if (showResults || !draggedItem) return

    setDroppedItems((prev) => ({
      ...prev,
      [draggedItem]: targetId,
    }))
    setDraggedItem(null)
  }

  const renderDragItem = (item: EnhancedDragItem) => (
    <Card
      key={item.id}
      className={`transition-all ${
        showResults
          ? "cursor-not-allowed opacity-70"
          : droppedItems[item.id]
            ? "opacity-60 bg-gray-100 border-dashed cursor-move hover:shadow-md"
            : "cursor-move hover:shadow-lg"
      }`}
      draggable={!showResults}
      onDragStart={(e) => handleDragStart(e, item.id)}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          {item.imageUrl && (
            <img
              src={item.imageUrl || "/placeholder.svg"}
              alt={item.altText || "Drag item"}
              className="w-12 h-12 object-cover rounded"
            />
          )}
          {item.text && <span className="text-sm font-medium">{item.text}</span>}
          {droppedItems[item.id] && <span className="ml-auto text-xs text-gray-500">✓ Placed</span>}
        </div>
      </CardContent>
    </Card>
  )

  const renderCategory = (category: any) => (
    <Card
      key={category.id}
      className={`min-h-32 ${category.color} border-2 border-dashed ${
        showResults ? "border-gray-400 cursor-not-allowed" : "border-gray-300"
      }`}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, category.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          {category.imageUrl && (
            <img
              src={category.imageUrl || "/placeholder.svg"}
              alt={category.name}
              className="w-8 h-8 object-cover rounded"
            />
          )}
          <h3 className="font-semibold">{category.name}</h3>
        </div>
        <div className="space-y-2">
          {content.items
            .filter((item) => droppedItems[item.id] === category.id)
            .map((item) => (
              <div key={item.id} className="p-2 bg-white rounded shadow-sm">
                <div className="flex items-center gap-2">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.altText || ""}
                      className="w-6 h-6 object-cover rounded"
                    />
                  )}
                  <span className="text-sm">{item.text}</span>
                  {showResults && (
                    <div className="ml-auto">
                      {item.category === category.id ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{content.questionText}</h3>

        {content.questionImage && (
          <div className="max-w-md">
            <img
              src={content.questionImage || "/placeholder.svg"}
              alt="Question illustration"
              className="w-full rounded border"
            />
          </div>
        )}
      </div>

      {content.dragDropType === "categorize" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.categories?.map((category) => renderCategory(category))}
        </div>
      )}

      <div className="space-y-2">
        <h4 className="font-semibold">Items to Drag:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{content.items.map((item) => renderDragItem(item))}</div>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => setShowResults(true)} disabled={Object.keys(droppedItems).length === 0 || showResults}>
          Check Answers
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setDroppedItems({})
            setShowResults(false)
          }}
        >
          Reset
        </Button>
      </div>

      {showResults && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Results locked!</strong> Click "Reset" to try again or make changes.
          </p>
        </div>
      )}
    </div>
  )
}
