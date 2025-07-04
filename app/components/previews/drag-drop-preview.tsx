"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"
import { SequencePreview } from "./sequence-preview"

interface DragDropPreviewProps {
  content: {
    questionText: string
    dragDropType: "categorize" | "sequence" | "match-boxes"
    items: Array<{
      id: string
      text: string
      category?: string
      correctPosition?: number
    }>
    categories?: Array<{
      id: string
      name: string
      color: string
    }>
    boxes?: Array<{
      id: string
      label: string
      correctAnswer: string | string[]
    }>
  }
}

export function DragDropPreview({ content }: DragDropPreviewProps) {
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

  const checkAnswers = () => {
    setShowResults(true)
  }

  const resetAnswers = () => {
    setDroppedItems({})
    setShowResults(false)
  }

  const isCorrect = (itemId: string) => {
    const item = content.items.find((i) => i.id === itemId)
    const droppedTarget = droppedItems[itemId]

    if (content.dragDropType === "categorize") {
      return item?.category === droppedTarget
    } else if (content.dragDropType === "match-boxes") {
      const box = content.boxes?.find((b) => b.id === droppedTarget)
      const item = content.items.find((i) => i.id === itemId)
      // Support both single correctAnswer (backward compatibility) and multiple correctAnswers
      if (box?.correctAnswers && Array.isArray(box.correctAnswers)) {
        return box.correctAnswers.includes(item?.text || "")
      } else {
        // Fallback to single answer for backward compatibility
        return box?.correctAnswer === item?.text
      }
    }
    return false
  }

  const renderCategorizeType = () => (
    <div className="space-y-6">
      <p className="text-lg font-medium">{content.questionText}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {content.categories?.map((category) => (
          <Card
            key={category.id}
            className={`min-h-32 ${category.color} border-2 border-dashed ${
              showResults ? "border-gray-400" : "border-gray-300"
            } ${showResults ? "cursor-not-allowed" : ""}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, category.id)}
          >
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{category.name}</h3>
              <div className="space-y-2">
                {content.items
                  .filter((item) => droppedItems[item.id] === category.id)
                  .map((item) => (
                    <Badge
                      key={item.id}
                      variant="secondary"
                      className={`block w-full p-2 ${
                        showResults
                          ? isCorrect(item.id)
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          : ""
                      }`}
                    >
                      {item.text}
                      {showResults &&
                        (isCorrect(item.id) ? (
                          <CheckCircle className="w-4 h-4 ml-2 inline" />
                        ) : (
                          <XCircle className="w-4 h-4 ml-2 inline" />
                        ))}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Items to Categorize:</h3>
        <div className="flex flex-wrap gap-2">
          {content.items.map((item) => (
            <Badge
              key={item.id}
              variant="outline"
              className={`p-2 transition-all ${
                showResults
                  ? "cursor-not-allowed opacity-70"
                  : droppedItems[item.id]
                    ? "opacity-60 bg-gray-100 border-dashed cursor-move"
                    : "hover:bg-blue-50 cursor-move"
              }`}
              draggable={!showResults}
              onDragStart={(e) => handleDragStart(e, item.id)}
            >
              {item.text}
              {droppedItems[item.id] && (
                <span className="ml-2 text-xs text-gray-500">
                  (in {content.categories?.find((c) => c.id === droppedItems[item.id])?.name})
                </span>
              )}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )

  const renderMatchBoxesType = () => (
    <div className="space-y-6">
      <p className="text-lg font-medium">{content.questionText}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.boxes?.map((box) => (
          <Card
            key={box.id}
            className={`min-h-24 border-2 border-dashed ${
              showResults ? "border-gray-400 cursor-not-allowed" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, box.id)}
          >
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{box.label}</h3>
              <div className="space-y-2">
                {content.items
                  .filter((item) => droppedItems[item.id] === box.id)
                  .map((item) => (
                    <Badge
                      key={item.id}
                      variant="secondary"
                      className={`block w-full p-2 ${
                        showResults
                          ? isCorrect(item.id)
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          : ""
                      }`}
                    >
                      {item.text}
                      {showResults &&
                        (isCorrect(item.id) ? (
                          <CheckCircle className="w-4 h-4 ml-2 inline" />
                        ) : (
                          <XCircle className="w-4 h-4 ml-2 inline" />
                        ))}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Drag these items:</h3>
        <div className="flex flex-wrap gap-2">
          {content.items.map((item) => (
            <Badge
              key={item.id}
              variant="outline"
              className={`p-2 transition-all ${
                showResults
                  ? "cursor-not-allowed opacity-70"
                  : droppedItems[item.id]
                    ? "opacity-60 bg-gray-100 border-dashed cursor-move"
                    : "hover:bg-blue-50 cursor-move"
              }`}
              draggable={!showResults}
              onDragStart={(e) => handleDragStart(e, item.id)}
            >
              {item.text}
              {droppedItems[item.id] && (
                <span className="ml-2 text-xs text-gray-500">
                  (in {content.boxes?.find((b) => b.id === droppedItems[item.id])?.label})
                </span>
              )}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {content.dragDropType === "categorize" && renderCategorizeType()}
      {content.dragDropType === "match-boxes" && renderMatchBoxesType()}
      {content.dragDropType === "sequence" && <SequencePreview content={content} />}

      {/* Only show these buttons for categorize and match-boxes types */}
      {content.dragDropType !== "sequence" && (
        <>
          <div className="flex gap-2 pt-4">
            <Button onClick={checkAnswers} disabled={Object.keys(droppedItems).length === 0 || showResults}>
              Check Answers
            </Button>
            <Button variant="outline" onClick={resetAnswers}>
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
        </>
      )}
    </div>
  )
}
