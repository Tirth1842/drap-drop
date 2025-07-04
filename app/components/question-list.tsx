"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, Calendar } from "lucide-react"
import type { Question } from "../page"

interface QuestionListProps {
  questions: Question[]
  onEdit: (question: Question) => void
  onDelete: (id: string) => void
  onPreview: (question: Question) => void
}

export function QuestionList({ questions, onEdit, onDelete, onPreview }: QuestionListProps) {
  const getTypeColor = (type: Question["type"]) => {
    switch (type) {
      case "multiple-choice":
        return "bg-blue-100 text-blue-800"
      case "fill-blanks":
        return "bg-green-100 text-green-800"
      case "match-following":
        return "bg-purple-100 text-purple-800"
      case "drag-drop":
        return "bg-orange-100 text-orange-800"
      case "math-operations":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeName = (type: Question["type"]) => {
    switch (type) {
      case "multiple-choice":
        return "Multiple Choice"
      case "fill-blanks":
        return "Fill in Blanks"
      case "match-following":
        return "Match Following"
      case "drag-drop":
        return "Drag & Drop"
      case "math-operations":
        return "Math Operations"
      default:
        return type
    }
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 mb-4">No questions created yet</p>
          <p className="text-sm text-gray-400">Click "Create Question" to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {questions.map((question) => (
        <Card key={question.id}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <CardTitle className="text-lg">{question.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(question.type)}>{getTypeName(question.type)}</Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {question.createdAt.toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => onPreview(question)}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(question)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(question.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 line-clamp-2">
              {question.type === "drag-drop" && question.content.questionText}
              {question.type === "multiple-choice" && question.content.questionText}
              {question.type === "fill-blanks" && question.content.questionText}
              {question.type === "match-following" && question.content.questionText}
              {question.type === "math-operations" && question.content.questionText}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
