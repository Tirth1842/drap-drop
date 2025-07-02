"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, Upload, ImageIcon, Video, Volume2, FileText } from "lucide-react"

interface MultipleChoiceOption {
  id: string
  type: "text" | "image" | "audio" | "video" | "mixed"
  text?: string
  imageUrl?: string
  audioUrl?: string
  videoUrl?: string
  altText?: string
}

interface MultipleChoiceContent {
  questionText: string
  questionImage?: string
  options: MultipleChoiceOption[]
  correctAnswer: string
  layout: "vertical" | "grid" | "horizontal"
}

interface MultipleChoiceBuilderProps {
  content: MultipleChoiceContent
  onChange: (content: MultipleChoiceContent) => void
}

export function MultipleChoiceBuilder({ content, onChange }: MultipleChoiceBuilderProps) {
  const [localContent, setLocalContent] = useState<MultipleChoiceContent>({
    questionText: "",
    options: [
      { id: "1", type: "text", text: "" },
      { id: "2", type: "text", text: "" },
    ],
    correctAnswer: "",
    layout: "vertical",
    ...content,
  })

  useEffect(() => {
    onChange(localContent)
  }, [localContent, onChange])

  const addOption = () => {
    const newOption: MultipleChoiceOption = {
      id: Date.now().toString(),
      type: "text",
      text: "",
    }
    setLocalContent((prev) => ({
      ...prev,
      options: [...prev.options, newOption],
    }))
  }

  const updateOption = (id: string, updates: Partial<MultipleChoiceOption>) => {
    setLocalContent((prev) => ({
      ...prev,
      options: prev.options.map((option) => (option.id === id ? { ...option, ...updates } : option)),
    }))
  }

  const removeOption = (id: string) => {
    setLocalContent((prev) => ({
      ...prev,
      options: prev.options.filter((option) => option.id !== id),
      correctAnswer: prev.correctAnswer === id ? "" : prev.correctAnswer,
    }))
  }

  const handleImageUpload = (optionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In a real app, you'd upload to your server/cloud storage
      const imageUrl = URL.createObjectURL(file)
      updateOption(optionId, { imageUrl, type: "image" })
    }
  }

  const handleQuestionImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setLocalContent((prev) => ({ ...prev, questionImage: imageUrl }))
    }
  }

  const renderOptionEditor = (option: MultipleChoiceOption) => (
    <Card key={option.id} className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Option Type</Label>
          <Select
            value={option.type}
            onValueChange={(value: MultipleChoiceOption["type"]) => updateOption(option.id, { type: value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Text
                </div>
              </SelectItem>
              <SelectItem value="image">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Image
                </div>
              </SelectItem>
              <SelectItem value="audio">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Audio
                </div>
              </SelectItem>
              <SelectItem value="video">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Video
                </div>
              </SelectItem>
              <SelectItem value="mixed">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Mixed
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(option.type === "text" || option.type === "mixed") && (
          <div className="space-y-2">
            <Label>Text Content</Label>
            <Input
              value={option.text || ""}
              onChange={(e) => updateOption(option.id, { text: e.target.value })}
              placeholder="Enter option text"
            />
          </div>
        )}

        {(option.type === "image" || option.type === "mixed") && (
          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(option.id, e)}
                className="flex-1"
              />
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            {option.imageUrl && (
              <div className="mt-2">
                <img
                  src={option.imageUrl || "/placeholder.svg"}
                  alt="Option preview"
                  className="max-w-32 max-h-32 rounded border"
                />
                <Input
                  value={option.altText || ""}
                  onChange={(e) => updateOption(option.id, { altText: e.target.value })}
                  placeholder="Alt text for accessibility"
                  className="mt-2"
                />
              </div>
            )}
          </div>
        )}

        {(option.type === "audio" || option.type === "mixed") && (
          <div className="space-y-2">
            <Label>Audio File</Label>
            <Input
              value={option.audioUrl || ""}
              onChange={(e) => updateOption(option.id, { audioUrl: e.target.value })}
              placeholder="Audio file URL or upload"
            />
          </div>
        )}

        {(option.type === "video" || option.type === "mixed") && (
          <div className="space-y-2">
            <Label>Video File</Label>
            <Input
              value={option.videoUrl || ""}
              onChange={(e) => updateOption(option.id, { videoUrl: e.target.value })}
              placeholder="Video file URL or upload"
            />
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t">
          <RadioGroup
            value={localContent.correctAnswer}
            onValueChange={(value) => setLocalContent((prev) => ({ ...prev, correctAnswer: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={`correct-${option.id}`} />
              <Label htmlFor={`correct-${option.id}`} className="text-sm">
                Correct Answer
              </Label>
            </div>
          </RadioGroup>

          {localContent.options.length > 2 && (
            <Button variant="ghost" size="sm" onClick={() => removeOption(option.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="questionText">Question Text</Label>
          <Textarea
            id="questionText"
            value={localContent.questionText}
            onChange={(e) => setLocalContent((prev) => ({ ...prev, questionText: e.target.value }))}
            placeholder="Enter your question here"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Question Image (Optional)</Label>
          <div className="flex items-center gap-2">
            <Input type="file" accept="image/*" onChange={handleQuestionImageUpload} className="flex-1" />
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4" />
            </Button>
          </div>
          {localContent.questionImage && (
            <img
              src={localContent.questionImage || "/placeholder.svg"}
              alt="Question preview"
              className="max-w-64 max-h-48 rounded border mt-2"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label>Layout Style</Label>
          <Select
            value={localContent.layout}
            onValueChange={(value: MultipleChoiceContent["layout"]) =>
              setLocalContent((prev) => ({ ...prev, layout: value }))
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vertical">Vertical List</SelectItem>
              <SelectItem value="grid">Grid Layout</SelectItem>
              <SelectItem value="horizontal">Horizontal Row</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-lg font-semibold">Options</Label>
          <Button onClick={addOption} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Option
          </Button>
        </div>

        <div className="space-y-4">{localContent.options.map((option) => renderOptionEditor(option))}</div>
      </div>
    </div>
  )
}
