"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle } from "lucide-react"

interface FillBlanksPreviewProps {
  content: {
    questionText: string
    enableDragDrop?: boolean
    dragOptions?: Array<{
      id: string
      text: string
      isCorrectFor?: string
    }>
    blanks: Array<{
      id: string
      correctAnswer: string
      placeholder?: string
    }>
  }
}

export function FillBlanksPreview({ content }: FillBlanksPreviewProps) {
  // Make sure blanks is always an array to avoid “undefined” errors
  const blanks = content.blanks ?? []
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [draggedOption, setDraggedOption] = useState<string | null>(null)
  const [droppedInBlanks, setDroppedInBlanks] = useState<Record<string, string>>({}) // blankId -> optionId

  if (blanks.length === 0) {
    return <div className="text-center text-gray-500 py-4">Add blanks in the builder to see the preview.</div>
  }

  const handleAnswerChange = (blankId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [blankId]: value,
    }))
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

  const handleReset = () => {
    setAnswers({})
    setShowResults(false)
    setDroppedInBlanks({})
    setDraggedOption(null)
  }

  const handleDragStart = (e: React.DragEvent, optionId: string) => {
    if (showResults) {
      e.preventDefault()
      return
    }
    setDraggedOption(optionId)
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

  const handleDrop = (e: React.DragEvent, blankId: string) => {
    e.preventDefault()
    if (showResults || !draggedOption) return

    // Remove the option from any other blank it might be in
    const newDroppedInBlanks = { ...droppedInBlanks }
    Object.keys(newDroppedInBlanks).forEach((key) => {
      if (newDroppedInBlanks[key] === draggedOption) {
        delete newDroppedInBlanks[key]
      }
    })

    // Add to the new blank
    newDroppedInBlanks[blankId] = draggedOption
    setDroppedInBlanks(newDroppedInBlanks)
    setDraggedOption(null)
  }

  const isCorrect = (blankId: string) => {
    const blank = blanks.find((b) => b.id === blankId)

    if (content.enableDragDrop) {
      const droppedOptionId = droppedInBlanks[blankId]
      const droppedOption = content.dragOptions?.find((opt) => opt.id === droppedOptionId)
      return droppedOption?.isCorrectFor === blankId
    } else {
      return blank?.correctAnswer.toLowerCase() === answers[blankId]?.toLowerCase()
    }
  }

  const renderQuestionWithBlanks = () => {
    const questionText = content.questionText
    let blankIndex = 0

    // Replace underscores with input fields or drop zones
    const parts = questionText.split(/_{3,}/)

    return (
      <div className="space-y-4">
        <div className="text-lg leading-relaxed">
          {parts.map((part, index) => (
            <span key={index}>
              {part}
              {index < parts.length - 1 && blankIndex < blanks.length && (
                <span className="inline-block mx-2">
                  {content.enableDragDrop ? (
                    // Drag & Drop Mode - Drop Zone
                    <div
                      className={`inline-flex items-center justify-center min-w-32 h-10 px-3 border-2 border-dashed rounded ${
                        showResults
                          ? isCorrect(blanks[blankIndex]?.id ?? "")
                            ? "border-green-500 bg-green-50"
                            : "border-red-500 bg-red-50"
                          : "border-gray-300 bg-gray-50 hover:border-blue-400"
                      } ${showResults ? "" : "cursor-pointer"}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, blanks[blankIndex]?.id ?? "")}
                    >
                      {droppedInBlanks[blanks[blankIndex]?.id ?? ""] ? (
                        <span className="text-sm font-medium">
                          {
                            content.dragOptions?.find((opt) => opt.id === droppedInBlanks[blanks[blankIndex]?.id ?? ""])
                              ?.text
                          }
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Drop here</span>
                      )}
                      {showResults && (
                        <span className="ml-2">
                          {isCorrect(blanks[blankIndex]?.id ?? "") ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </span>
                      )}
                    </div>
                  ) : (
                    // Traditional Typing Mode
                    <>
                      <Input
                        value={answers[blanks[blankIndex]?.id ?? String(blankIndex)] ?? ""}
                        onChange={(e) =>
                          handleAnswerChange(blanks[blankIndex]?.id ?? String(blankIndex), e.target.value)
                        }
                        placeholder={blanks[blankIndex]?.placeholder ?? "Fill in the blank"}
                        className={`inline-block w-32 ${
                          showResults
                            ? isCorrect(blanks[blankIndex]?.id ?? "")
                              ? "border-green-500 bg-green-50"
                              : "border-red-500 bg-red-50"
                            : ""
                        }`}
                        disabled={showResults}
                      />
                      {showResults && (
                        <span className="ml-2">
                          {isCorrect(blanks[blankIndex]?.id ?? "") ? (
                            <CheckCircle className="w-5 h-5 text-green-600 inline" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 inline" />
                          )}
                        </span>
                      )}
                    </>
                  )}
                  <span style={{ display: "none" }}>{blankIndex++}</span>
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {renderQuestionWithBlanks()}

      {/* Draggable Options */}
      {content.enableDragDrop && content.dragOptions && content.dragOptions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Drag these options into the blanks:</h4>
          <div className="flex flex-wrap gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            {content.dragOptions.map((option) => {
              const isUsed = Object.values(droppedInBlanks).includes(option.id)
              return (
                <div
                  key={option.id}
                  className={`px-3 py-2 rounded border transition-all ${
                    showResults
                      ? "cursor-not-allowed opacity-70"
                      : isUsed
                        ? "bg-gray-200 border-gray-300 opacity-60 cursor-move"
                        : "bg-white border-gray-300 hover:border-blue-400 hover:shadow-sm cursor-move"
                  }`}
                  draggable={!showResults}
                  onDragStart={(e) => handleDragStart(e, option.id)}
                >
                  <span className="text-sm font-medium">{option.text}</span>
                  {isUsed && <span className="ml-2 text-xs text-gray-500">(used)</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={Object.keys(answers).length === 0 || showResults}>
          Check Answers
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>

      {showResults && (
        <div className="space-y-2">
          <h4 className="font-semibold">Results:</h4>
          {blanks.map((blank, index) => (
            <div key={blank.id} className="flex items-center gap-2 text-sm">
              <span>Blank {index + 1}:</span>
              {content.enableDragDrop ? (
                <>
                  <span className={isCorrect(blank.id) ? "text-green-600" : "text-red-600"}>
                    Your answer: "
                    {content.dragOptions?.find((opt) => opt.id === droppedInBlanks[blank.id])?.text || "No answer"}"
                  </span>
                  {!isCorrect(blank.id) && (
                    <span className="text-gray-600">
                      (Correct: "
                      {content.dragOptions?.find((opt) => opt.isCorrectFor === blank.id)?.text || blank.correctAnswer}")
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className={isCorrect(blank.id) ? "text-green-600" : "text-red-600"}>
                    Your answer: "{answers[blank.id] || "No answer"}"
                  </span>
                  {!isCorrect(blank.id) && <span className="text-gray-600">(Correct: "{blank.correctAnswer}")</span>}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
