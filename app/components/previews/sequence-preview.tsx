"use client"

import type React from "react"

import type { ReactElement } from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, GripVertical, ArrowUp, ArrowDown } from "lucide-react"

interface SequenceItem {
  id: string
  type?: "text" | "image" | "mixed"
  text?: string
  imageUrl?: string
  altText?: string
  correctPosition?: number
}

interface SequencePreviewProps {
  content: {
    questionText?: string
    sequenceLayout?: "horizontal" | "vertical"
    items?: SequenceItem[]
    dragDropType?: string
  }
}

export function SequencePreview({ content }: SequencePreviewProps): ReactElement {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [orderedItems, setOrderedItems] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)

  // Initialize with shuffled items when content changes
  useEffect(() => {
    if (content.items && content.items.length > 0) {
      const shuffled = [...content.items].sort(() => Math.random() - 0.5).map((item) => item.id)
      setOrderedItems(shuffled)
      setShowResults(false)
    } else {
      setOrderedItems([])
    }
  }, [content.items])

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    if (showResults) {
      e.preventDefault()
      return
    }
    setDraggedItem(itemId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (showResults) {
      e.dataTransfer.dropEffect = "none"
      return
    }
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (showResults || !draggedItem) return

    const draggedIndex = orderedItems.indexOf(draggedItem)
    if (draggedIndex === -1) return

    const newOrder = [...orderedItems]
    newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, draggedItem)

    setOrderedItems(newOrder)
    setDraggedItem(null)
  }

  const moveItem = (itemId: string, direction: "up" | "down") => {
    if (showResults) return

    const currentIndex = orderedItems.indexOf(itemId)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= orderedItems.length) return

    const newOrder = [...orderedItems]
    newOrder.splice(currentIndex, 1)
    newOrder.splice(newIndex, 0, itemId)
    setOrderedItems(newOrder)
  }

  const checkAnswers = () => {
    setShowResults(true)
  }

  const resetAnswers = () => {
    if (content.items && content.items.length > 0) {
      const shuffled = [...content.items].sort(() => Math.random() - 0.5).map((item) => item.id)
      setOrderedItems(shuffled)
    }
    setShowResults(false)
  }

  const isCorrect = (itemId: string, currentPosition: number) => {
    const item = content.items?.find((i) => i.id === itemId)
    return item?.correctPosition === currentPosition + 1
  }

  const getCorrectCount = () => {
    return orderedItems.filter((itemId, index) => isCorrect(itemId, index)).length
  }

  // Don't render if no items
  if (!content.items || content.items.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-sm">Add items to see the sequence preview</p>
      </div>
    )
  }

  const renderSequenceItem = (itemId: string, index: number) => {
    const item = content.items?.find((i) => i.id === itemId)
    if (!item) return null

    const isItemCorrect = isCorrect(itemId, index)

    return (
      <Card
        key={itemId}
        className={`transition-all ${
          showResults
            ? isItemCorrect
              ? "border-green-500 bg-green-50"
              : "border-red-500 bg-red-50"
            : "hover:shadow-md cursor-move"
        } ${showResults ? "cursor-not-allowed" : ""}`}
        draggable={!showResults}
        onDragStart={(e) => handleDragStart(e, itemId)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                {index + 1}
              </Badge>
              {!showResults && <GripVertical className="w-4 h-4 text-gray-400" />}
            </div>

            <div className="flex-1 flex items-center gap-2">
              {item.imageUrl && (
                <img
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.altText || "Sequence item"}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              {item.text && <span className="font-medium">{item.text}</span>}
            </div>

            <div className="flex items-center gap-2">
              {!showResults && content.sequenceLayout === "vertical" && (
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveItem(itemId, "up")}
                    disabled={index === 0}
                    className="h-6 w-6 p-0"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveItem(itemId, "down")}
                    disabled={index === orderedItems.length - 1}
                    className="h-6 w-6 p-0"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {showResults && (
                <div className="flex items-center gap-1">
                  {isItemCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <div className="flex items-center gap-1">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <Badge variant="destructive" className="text-xs">
                        Should be #{item.correctPosition}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const layoutClass = content.sequenceLayout === "horizontal" ? "flex flex-wrap gap-4 justify-center" : "space-y-3"

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{content.questionText || "Arrange the items in the correct order"}</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {content.sequenceLayout === "horizontal" ? "Horizontal" : "Vertical"} Sequence
          </Badge>
          <span className="text-sm text-gray-600">Drag items to arrange them in the correct order</span>
        </div>
      </div>

      <div className={`${layoutClass} min-h-32 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50`}>
        {orderedItems.map((itemId, index) => renderSequenceItem(itemId, index))}
      </div>

      <div className="flex gap-2">
        <Button onClick={checkAnswers} disabled={orderedItems.length === 0 || showResults}>
          Check Order
        </Button>
        <Button variant="outline" onClick={resetAnswers}>
          Shuffle Again
        </Button>
      </div>

      {showResults && (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg ${
              getCorrectCount() === content.items.length
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-orange-50 text-orange-800 border border-orange-200"
            }`}
          >
            {getCorrectCount() === content.items.length ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Perfect! All items are in the correct order.</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  <span className="font-semibold">
                    {getCorrectCount()} out of {content.items.length} items are correctly positioned.
                  </span>
                </div>
                <p className="text-sm">Look for the red X marks to see which items need to be repositioned.</p>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Results locked!</strong> Click "Shuffle Again" to try a new arrangement.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
