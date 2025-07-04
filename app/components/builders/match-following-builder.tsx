"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"

interface MatchFollowingContent {
  questionText: string
  pairs: Array<{
    id: string
    left: string
    right: string
  }>
}

interface MatchFollowingBuilderProps {
  content: MatchFollowingContent
  onChange: (content: MatchFollowingContent) => void
}

export function MatchFollowingBuilder({ content, onChange }: MatchFollowingBuilderProps) {
  const [localContent, setLocalContent] = useState<MatchFollowingContent>({
    questionText: "",
    pairs: [
      { id: "1", left: "", right: "" },
      { id: "2", left: "", right: "" },
    ],
    ...content,
  })

  useEffect(() => {
    onChange(localContent)
  }, [localContent, onChange])

  const addPair = () => {
    const newPair = {
      id: Date.now().toString(),
      left: "",
      right: "",
    }
    setLocalContent((prev) => ({
      ...prev,
      pairs: [...prev.pairs, newPair],
    }))
  }

  const updatePair = (id: string, field: "left" | "right", value: string) => {
    setLocalContent((prev) => ({
      ...prev,
      pairs: prev.pairs.map((pair) => (pair.id === id ? { ...pair, [field]: value } : pair)),
    }))
  }

  const removePair = (id: string) => {
    setLocalContent((prev) => ({
      ...prev,
      pairs: prev.pairs.filter((pair) => pair.id !== id),
    }))
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="questionText">Question Text</Label>
        <Input
          id="questionText"
          value={localContent.questionText}
          onChange={(e) => setLocalContent((prev) => ({ ...prev, questionText: e.target.value }))}
          placeholder="Enter instructions for matching"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Matching Pairs</Label>
          <Button onClick={addPair} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Pair
          </Button>
        </div>

        {localContent.pairs.map((pair, index) => (
          <div key={pair.id} className="flex items-center space-x-2 p-4 border rounded-lg">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm">Left Side {index + 1}</Label>
                <Input
                  value={pair.left}
                  onChange={(e) => updatePair(pair.id, "left", e.target.value)}
                  placeholder="Left item"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Right Side {index + 1}</Label>
                <Input
                  value={pair.right}
                  onChange={(e) => updatePair(pair.id, "right", e.target.value)}
                  placeholder="Right item"
                />
              </div>
            </div>
            {localContent.pairs.length > 2 && (
              <Button variant="ghost" size="sm" onClick={() => removePair(pair.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
