"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"

interface MatchFollowingPreviewProps {
  content: {
    questionText: string
    pairs: Array<{
      id: string
      left: string
      right: string
    }>
  }
}

export function MatchFollowingPreview({ content }: MatchFollowingPreviewProps) {
  const [matches, setMatches] = useState<Record<string, string>>({})
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)

  const shuffledRightItems = [...content.pairs.map((p) => ({ id: p.id, text: p.right }))].sort(
    () => Math.random() - 0.5,
  )

  const handleLeftClick = (leftId: string) => {
    if (showResults) return
    setSelectedLeft(leftId)
  }

  const handleRightClick = (rightId: string) => {
    if (showResults || !selectedLeft) return

    setMatches((prev) => ({
      ...prev,
      [selectedLeft]: rightId,
    }))
    setSelectedLeft(null)
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

  const handleReset = () => {
    setMatches({})
    setSelectedLeft(null)
    setShowResults(false)
  }

  const isCorrect = (leftId: string) => {
    return matches[leftId] === leftId // Since we're matching by pair ID
  }

  const getMatchedText = (leftId: string) => {
    const matchedRightId = matches[leftId]
    const pair = content.pairs.find((p) => p.id === matchedRightId)
    return pair?.right || ""
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">{content.questionText}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h4 className="font-semibold">Left Column</h4>
          {content.pairs.map((pair) => (
            <Card
              key={pair.id}
              className={`cursor-pointer transition-colors ${
                selectedLeft === pair.id
                  ? "border-blue-500 bg-blue-50"
                  : matches[pair.id]
                    ? showResults
                      ? isCorrect(pair.id)
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                    : "hover:bg-gray-50"
              }`}
              onClick={() => handleLeftClick(pair.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <span>{pair.left}</span>
                  {matches[pair.id] && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">→ {getMatchedText(pair.id)}</span>
                      {showResults &&
                        (isCorrect(pair.id) ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Right Column</h4>
          {shuffledRightItems.map((item) => (
            <Card
              key={item.id}
              className={`cursor-pointer transition-colors ${
                Object.values(matches).includes(item.id)
                  ? "border-gray-300 bg-gray-100 opacity-50"
                  : selectedLeft
                    ? "hover:bg-blue-50 border-blue-200"
                    : "hover:bg-gray-50"
              }`}
              onClick={() => handleRightClick(item.id)}
            >
              <CardContent className="p-3">
                <span>{item.text}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={Object.keys(matches).length !== content.pairs.length || showResults}>
          Check Answers
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>

      {showResults && (
        <div
          className={`p-4 rounded-lg ${
            content.pairs.every((pair) => isCorrect(pair.id)) ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {content.pairs.every((pair) => isCorrect(pair.id))
            ? "✅ Perfect! All matches are correct."
            : `❌ ${content.pairs.filter((pair) => isCorrect(pair.id)).length}/${content.pairs.length} correct matches.`}
        </div>
      )}
    </div>
  )
}
