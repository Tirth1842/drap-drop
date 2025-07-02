"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, Volume2 } from "lucide-react"

interface MultipleChoiceOption {
  id: string
  type: "text" | "image" | "audio" | "video" | "mixed"
  text?: string
  imageUrl?: string
  audioUrl?: string
  videoUrl?: string
  altText?: string
}

interface MultipleChoicePreviewProps {
  content: {
    questionText: string
    questionImage?: string
    options: MultipleChoiceOption[]
    correctAnswer: string
    layout: "vertical" | "grid" | "horizontal"
  }
}

export function MultipleChoicePreview({ content }: MultipleChoicePreviewProps) {
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [showResult, setShowResult] = useState(false)

  const handleSubmit = () => {
    setShowResult(true)
  }

  const handleReset = () => {
    setSelectedAnswer("")
    setShowResult(false)
  }

  const renderOption = (option: MultipleChoiceOption) => {
    const isSelected = selectedAnswer === option.id
    const isCorrect = option.id === content.correctAnswer
    const showCorrectness = showResult && (isSelected || isCorrect)

    return (
      <Card
        key={option.id}
        className={`cursor-pointer transition-all ${isSelected ? "ring-2 ring-blue-500" : ""} ${
          showResult
            ? isCorrect
              ? "border-green-500 bg-green-50"
              : isSelected
                ? "border-red-500 bg-red-50"
                : ""
            : "hover:bg-gray-50"
        }`}
        onClick={() => !showResult && setSelectedAnswer(option.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <RadioGroupItem value={option.id} id={option.id} className="mt-1" checked={isSelected} readOnly />

            <div className="flex-1 space-y-2">
              {option.text && (
                <Label htmlFor={option.id} className="cursor-pointer text-base">
                  {option.text}
                </Label>
              )}

              {option.imageUrl && (
                <div className="max-w-48">
                  <img
                    src={option.imageUrl || "/placeholder.svg"}
                    alt={option.altText || "Option image"}
                    className="w-full rounded border"
                  />
                </div>
              )}

              {option.audioUrl && (
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  <audio controls className="max-w-48">
                    <source src={option.audioUrl} />
                    Your browser does not support audio.
                  </audio>
                </div>
              )}

              {option.videoUrl && (
                <div className="max-w-64">
                  <video controls className="w-full rounded border">
                    <source src={option.videoUrl} />
                    Your browser does not support video.
                  </video>
                </div>
              )}
            </div>

            {showCorrectness && (
              <div className="ml-2">
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : isSelected ? (
                  <XCircle className="w-5 h-5 text-red-600" />
                ) : null}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getLayoutClass = () => {
    switch (content.layout) {
      case "grid":
        return "grid grid-cols-1 md:grid-cols-2 gap-4"
      case "horizontal":
        return "flex flex-wrap gap-4"
      default:
        return "space-y-4"
    }
  }

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

      <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
        <div className={getLayoutClass()}>{content.options.map((option) => renderOption(option))}</div>
      </RadioGroup>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={!selectedAnswer || showResult}>
          Submit Answer
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>

      {showResult && (
        <div
          className={`p-4 rounded-lg ${
            selectedAnswer === content.correctAnswer ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {selectedAnswer === content.correctAnswer ? "✅ Correct! Well done." : "❌ Incorrect. Try again!"}
        </div>
      )}
    </div>
  )
}
