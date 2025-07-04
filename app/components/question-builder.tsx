"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultipleChoiceBuilder } from "./builders/multiple-choice-builder"
import { FillBlanksBuilder } from "./builders/fill-blanks-builder"
import { MatchFollowingBuilder } from "./builders/match-following-builder"
import { DragDropBuilder } from "./builders/drag-drop-builder"
import type { Question } from "../page"
import { DragDropPreview } from "./previews/drag-drop-preview"
import { MultipleChoicePreview } from "./previews/multiple-choice-preview"
import { FillBlanksPreview } from "./previews/fill-blanks-preview"
import { MatchFollowingPreview } from "./previews/match-following-preview"
import { Badge } from "@/components/ui/badge"
import { MathOperationsBuilder } from "./builders/math-operations-builder"
import { MathOperationsPreview } from "./previews/math-operations-preview"

interface QuestionBuilderProps {
  question: Question | null
  onSave: (question: Question) => void
  onCancel: () => void
}

// Default content for each question type
const getDefaultContent = (type: Question["type"]) => {
  switch (type) {
    case "multiple-choice":
      return {
        questionText: "",
        options: [
          { id: "1", type: "text", text: "" },
          { id: "2", type: "text", text: "" },
        ],
        correctAnswer: "",
        layout: "vertical",
      }
    case "fill-blanks":
      return {
        questionText: "",
        blanks: [{ id: "1", correctAnswer: "", placeholder: "" }],
      }
    case "match-following":
      return {
        questionText: "",
        pairs: [
          { id: "1", left: "", right: "" },
          { id: "2", left: "", right: "" },
        ],
      }
    case "drag-drop":
      return {
        questionText: "",
        dragDropType: "categorize",
        items: [],
        categories: [],
        boxes: [],
      }
    case "math-operations":
      return {
        questionText: "",
        operation: "addition",
        problems: [],
        availableDigits: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
        layout: "vertical",
      }
    default:
      return {}
  }
}

export function QuestionBuilder({ question, onSave, onCancel }: QuestionBuilderProps) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<Question["type"]>("multiple-choice")
  const [content, setContent] = useState<any>({})
  const [showJson, setShowJson] = useState(false)

  useEffect(() => {
    if (question) {
      setTitle(question.title)
      setType(question.type)
      setContent(question.content)
    } else {
      setTitle("")
      setType("multiple-choice")
      setContent(getDefaultContent("multiple-choice"))
    }
  }, [question])

  // Handle question type change and reset content
  const handleTypeChange = (newType: Question["type"]) => {
    setType(newType)
    setContent(getDefaultContent(newType))
  }

  const handleSave = () => {
    const newQuestion: Question = {
      id: question?.id || Date.now().toString(),
      title,
      type,
      content,
      createdAt: question?.createdAt || new Date(),
    }
    onSave(newQuestion)
  }

  const renderBuilder = () => {
    switch (type) {
      case "multiple-choice":
        return <MultipleChoiceBuilder content={content} onChange={setContent} />
      case "fill-blanks":
        return <FillBlanksBuilder content={content} onChange={setContent} />
      case "match-following":
        return <MatchFollowingBuilder content={content} onChange={setContent} />
      case "drag-drop":
        return <DragDropBuilder content={content} onChange={setContent} />
      case "math-operations":
        return <MathOperationsBuilder content={content} onChange={setContent} />
      default:
        return null
    }
  }

  const renderPreview = () => {
    // Don't render preview if content is empty or invalid
    if (!content || Object.keys(content).length === 0) {
      return <div className="text-gray-500 text-sm">Start building your question to see the preview</div>
    }

    try {
      switch (type) {
        case "drag-drop":
          // Ensure we have the minimum required data for drag-drop preview
          if (!content.questionText && (!content.items || content.items.length === 0)) {
            return <div className="text-gray-500 text-sm">Add question text and items to see the preview</div>
          }
          return <DragDropPreview content={content} />
        case "multiple-choice":
          if (!content.questionText && (!content.options || content.options.length === 0)) {
            return <div className="text-gray-500 text-sm">Add question text and options to see the preview</div>
          }
          return <MultipleChoicePreview content={content} />
        case "fill-blanks":
          if (!content.questionText && (!content.blanks || content.blanks.length === 0)) {
            return <div className="text-gray-500 text-sm">Add question text and blanks to see the preview</div>
          }
          return <FillBlanksPreview content={content} />
        case "match-following":
          if (!content.questionText && (!content.pairs || content.pairs.length === 0)) {
            return <div className="text-gray-500 text-sm">Add question text and pairs to see the preview</div>
          }
          return <MatchFollowingPreview content={content} />
        case "math-operations":
          if (!content.problems || content.problems.length === 0) {
            return <div className="text-gray-500 text-sm">Add math problems to see the preview</div>
          }
          return <MathOperationsPreview content={content} />
        default:
          return <div className="text-gray-500 text-sm">Preview not available</div>
      }
    } catch (error) {
      console.error("Preview error:", error)
      return <div className="text-gray-500 text-sm">Building preview...</div>
    }
  }

  const hasValidContent = () => {
    if (!title.trim()) return false

    switch (type) {
      case "multiple-choice":
        return content.questionText?.trim() && content.options?.some((opt: any) => opt.text?.trim())
      case "fill-blanks":
        return content.questionText?.trim() && content.blanks?.some((blank: any) => blank.correctAnswer?.trim())
      case "match-following":
        return (
          content.questionText?.trim() && content.pairs?.some((pair: any) => pair.left?.trim() && pair.right?.trim())
        )
      case "drag-drop":
        return content.questionText?.trim() && content.items?.some((item: any) => item.text?.trim() || item.imageUrl)
      case "math-operations":
        return content.problems?.some((problem: any) => problem.operand1 && problem.operand2)
      default:
        return false
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>{question ? "Edit Question" : "Create New Question"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Existing form content */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Question Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter question title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Question Type</Label>
                <Select value={type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="fill-blanks">Fill in the Blanks</SelectItem>
                    <SelectItem value="match-following">Match the Following</SelectItem>
                    <SelectItem value="drag-drop">Drag & Drop</SelectItem>
                    <SelectItem value="math-operations">Math Operations</SelectItem>
                  </SelectContent>
                </Select>
                {!question && (
                  <p className="text-xs text-amber-600">⚠️ Changing question type will reset all form data</p>
                )}
              </div>
            </div>

            {renderBuilder()}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!hasValidContent()}>
                Save Question
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Preview */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <span>Live Preview</span>
                <Badge variant="secondary" className="text-xs">
                  {type.replace("-", " ").toUpperCase()}
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowJson(!showJson)}
                className="flex items-center gap-2"
              >
                {showJson ? "👁️ Preview" : "📄 JSON"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {title && hasValidContent() ? (
              <div className="space-y-4">
                <h3 className="font-medium text-lg">{title}</h3>
                {showJson ? (
                  <div className="space-y-4">
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-auto max-h-96">
                      <pre>{JSON.stringify({ title, type, content }, null, 2)}</pre>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>
                        <strong>API Usage:</strong>
                      </p>
                      <code className="block bg-gray-100 p-2 rounded text-xs">
                        POST /api/questions
                        <br />
                        Content-Type: application/json
                        <br />
                        <br />
                        {JSON.stringify({ title, type, content }, null, 2)}
                      </code>
                    </div>
                  </div>
                ) : (
                  renderPreview()
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">Start building your question to see the preview</p>
                {title && !hasValidContent() && (
                  <p className="text-xs text-gray-400 mt-2">Add content to enable preview</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
