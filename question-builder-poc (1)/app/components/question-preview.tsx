"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DragDropPreview } from "./previews/drag-drop-preview"
import { MultipleChoicePreview } from "./previews/multiple-choice-preview"
import { FillBlanksPreview } from "./previews/fill-blanks-preview"
import { MatchFollowingPreview } from "./previews/match-following-preview"
import type { Question } from "../page"

interface QuestionPreviewProps {
  question: Question
}

export function QuestionPreview({ question }: QuestionPreviewProps) {
  const renderPreview = () => {
    switch (question.type) {
      case "drag-drop":
        return <DragDropPreview content={question.content} />
      case "multiple-choice":
        return <MultipleChoicePreview content={question.content} />
      case "fill-blanks":
        return <FillBlanksPreview content={question.content} />
      case "match-following":
        return <MatchFollowingPreview content={question.content} />
      default:
        return <div>Preview not available for this question type</div>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{question.title}</CardTitle>
      </CardHeader>
      <CardContent>{renderPreview()}</CardContent>
    </Card>
  )
}
