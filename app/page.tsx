"use client"

import { useState } from "react"
import { QuestionBuilder } from "./components/question-builder"
import { QuestionPreview } from "./components/question-preview"
import { QuestionList } from "./components/question-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"

export interface Question {
  id: string
  title: string
  type: "multiple-choice" | "fill-blanks" | "match-following" | "drag-drop" | "math-operations"
  content: any
  createdAt: Date
}

export default function QuestionBuilderApp() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState("list")

  const handleCreateQuestion = () => {
    setSelectedQuestion(null)
    setIsCreating(true)
    setActiveTab("builder")
  }

  const handleSaveQuestion = (question: Question) => {
    console.log(question.content)
    if (selectedQuestion) {
      setQuestions((prev) => prev.map((q) => (q.id === question.id ? question : q)))
    } else {
      setQuestions((prev) => [...prev, question])
    }
    setIsCreating(false)
    setSelectedQuestion(null)
    setActiveTab("list")
  }

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question)
    setIsCreating(true)
    setActiveTab("builder")
  }

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const handlePreviewQuestion = (question: Question) => {
    setSelectedQuestion(question)
    setActiveTab("preview")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Question Builder POC</h1>
          <p className="text-gray-600">Create interactive questions with drag & drop functionality</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="list">Questions</TabsTrigger>
              <TabsTrigger value="builder">Builder</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <Button onClick={handleCreateQuestion} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Question
            </Button>
          </div>

          <TabsContent value="list">
            <QuestionList
              questions={questions}
              onEdit={handleEditQuestion}
              onDelete={handleDeleteQuestion}
              onPreview={handlePreviewQuestion}
            />
          </TabsContent>

          <TabsContent value="builder">
            <QuestionBuilder
              question={selectedQuestion}
              onSave={handleSaveQuestion}
              onCancel={() => {
                setIsCreating(false)
                setSelectedQuestion(null)
                setActiveTab("list")
              }}
            />
          </TabsContent>

          <TabsContent value="preview">
            {selectedQuestion ? (
              <QuestionPreview question={selectedQuestion} />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">Select a question to preview</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
