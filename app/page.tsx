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

const createdQuestion: Question[] = [
  {
    "title": "Drag and Drop fill in the blanks",
    "type": "fill-blanks",
    "content": {
      "questionText": "Honesty is the best ____. \nThe sun ____ in the east.\nTime and tide ____ for none.\nThe Earth ____ around the sun.\nBe the ____ you want to see.",
      "blanks": [
        {
          "id": "1",
          "correctAnswer": "policy",
          "placeholder": ""
        },
        {
          "id": "1751796671494",
          "correctAnswer": "rises",
          "placeholder": ""
        },
        {
          "id": "1751796672573",
          "correctAnswer": "wait",
          "placeholder": ""
        },
        {
          "id": "1751796672981",
          "correctAnswer": "revolves",
          "placeholder": ""
        },
        {
          "id": "1751796675128",
          "correctAnswer": "change",
          "placeholder": ""
        }
      ],
      "enableDragDrop": true,
      "dragOptions": [
        {
          "id": "1751796745211",
          "text": "policy",
          "isCorrectFor": "1"
        },
        {
          "id": "1751796780154",
          "text": "rises",
          "isCorrectFor": "1751796671494"
        },
        {
          "id": "1751796800486",
          "text": "wait",
          "isCorrectFor": "1751796672573"
        },
        {
          "id": "1751796808257",
          "text": "revolves",
          "isCorrectFor": "1751796672981"
        },
        {
          "id": "1751796814195",
          "text": "change",
          "isCorrectFor": "1751796675128"
        }
      ]
    },
    id: "1",
    createdAt: new Date("2023-11-01T10:00:00Z")
  },
  {
    "title": "Fill in the blanks",
    "type": "fill-blanks",
    "content": {
      "questionText": "Honesty is the best ____. \nThe sun ____ in the east.\nTime and tide ____ for none.\nThe Earth ____ around the sun.\nBe the ____ you want to see.",
      "blanks": [
        {
          "id": "1",
          "correctAnswer": "policy",
          "placeholder": ""
        },
        {
          "id": "1751796671494",
          "correctAnswer": "rises",
          "placeholder": ""
        },
        {
          "id": "1751796672573",
          "correctAnswer": "wait",
          "placeholder": ""
        },
        {
          "id": "1751796672981",
          "correctAnswer": "revolves",
          "placeholder": ""
        },
        {
          "id": "1751796675128",
          "correctAnswer": "change",
          "placeholder": ""
        }
      ],
      "enableDragDrop": false,
      "dragOptions": []
    },
    id: "2",
    createdAt: new Date("2023-11-01T10:00:00Z")
  },
  {
    "title": "Classification Type 1",
    "type": "drag-drop",
    "content": {
      "questionText": "Please classify the following animals as herbivores, carnivores, or omnivores based on their diet.",
      "dragDropType": "categorize",
      "items": [
        {
          "id": "1751802539577",
          "type": "text",
          "text": "Cow",
          "category": "1751802496655",
          "correctPosition": 1
        },
        {
          "id": "1751802559866",
          "type": "text",
          "text": "Lion",
          "category": "1751802524360",
          "correctPosition": 2
        },
        {
          "id": "1751802569211",
          "type": "text",
          "text": "Bear",
          "category": "1751802531735",
          "correctPosition": 3
        },
        {
          "id": "1751802587505",
          "type": "text",
          "text": "Goat",
          "category": "1751802496655",
          "correctPosition": 4
        },
        {
          "id": "1751802593672",
          "type": "text",
          "text": "Elephant",
          "category": "1751802496655",
          "correctPosition": 5
        },
        {
          "id": "1751802607210",
          "type": "text",
          "text": "Rabbit",
          "category": "1751802496655",
          "correctPosition": 6
        },
        {
          "id": "1751802614361",
          "type": "text",
          "text": "Deer",
          "category": "1751802496655",
          "correctPosition": 7
        },
        {
          "id": "1751802619505",
          "type": "text",
          "text": "Horse",
          "category": "1751802496655",
          "correctPosition": 8
        },
        {
          "id": "1751802626858",
          "type": "text",
          "text": "Tiger",
          "category": "1751802524360",
          "correctPosition": 9
        },
        {
          "id": "1751802657485",
          "type": "text",
          "text": "Wolf",
          "category": "1751802524360",
          "correctPosition": 10
        },
        {
          "id": "1751802667925",
          "type": "text",
          "text": "Dog",
          "category": "1751802531735",
          "correctPosition": 11
        },
        {
          "id": "1751802683372",
          "type": "text",
          "text": "Pig",
          "category": "1751802531735",
          "correctPosition": 12
        },
        {
          "id": "1751802689913",
          "type": "text",
          "text": "Human",
          "category": "1751802531735",
          "correctPosition": 13
        },
        {
          "id": "1751802702325",
          "type": "text",
          "text": "Fox",
          "category": "1751802531735",
          "correctPosition": 14
        },
        {
          "id": "1751802718934",
          "type": "text",
          "text": "Monkey",
          "category": "1751802531735",
          "correctPosition": 15
        }
      ],
      "categories": [
        {
          "id": "1751802496655",
          "name": "Herbivores",
          "color": "bg-blue-100"
        },
        {
          "id": "1751802524360",
          "name": "Carnivores",
          "color": "bg-green-100"
        },
        {
          "id": "1751802531735",
          "name": "Omnivores",
          "color": "bg-yellow-100"
        }
      ],
      "boxes": []
    },
    id: "3",
    createdAt: new Date("2023-11-01T10:00:00Z")
  },
  {
    "title": "Order Horizontally type 1",
    "type": "drag-drop",
    "content": {
      "questionText": "Arrange in ascending order",
      "dragDropType": "sequence",
      "items": [
        {
          "id": "1751803932689",
          "type": "text",
          "text": "17",
          "category": "",
          "correctPosition": 1
        },
        {
          "id": "1751805155459",
          "type": "text",
          "text": "23",
          "category": "",
          "correctPosition": 2
        },
        {
          "id": "1751805578459",
          "type": "text",
          "text": "42",
          "category": "1751805174265",
          "correctPosition": 3
        },
        {
          "id": "1751805583093",
          "type": "text",
          "text": "56",
          "category": "1751805174265",
          "correctPosition": 4
        },
        {
          "id": "1751805589210",
          "type": "text",
          "text": "89",
          "category": "1751805174265",
          "correctPosition": 5
        }
      ],
      "categories": [
        {
          "id": "1751805174265",
          "name": "",
          "color": "bg-blue-100"
        }
      ],
      "boxes": [],
      "sequenceLayout": "horizontal"
    },
    id: "4",
    createdAt: new Date("2023-11-01T10:00:00Z")
  },
  {
    "title": "Jumbled Question",
    "type": "drag-drop",
    "content": {
      "questionText": "Rearrange the following words to form a meaningful sentence.",
      "dragDropType": "sequence",
      "items": [
        {
          "id": "1751805909726",
          "type": "text",
          "text": "The",
          "category": "",
          "correctPosition": 1
        },
        {
          "id": "1751805928019",
          "type": "text",
          "text": "dog",
          "category": "",
          "correctPosition": 2
        },
        {
          "id": "1751805932254",
          "type": "text",
          "text": "runs",
          "category": "",
          "correctPosition": 3
        },
        {
          "id": "1751805937058",
          "type": "text",
          "text": "very",
          "category": "",
          "correctPosition": 4
        },
        {
          "id": "1751805940060",
          "type": "text",
          "text": "fast",
          "category": "",
          "correctPosition": 5
        }
      ],
      "categories": [],
      "boxes": [],
      "sequenceLayout": "horizontal"
    },
    id: "5",
    createdAt: new Date("2023-11-01T10:00:00Z")
  },
  {
    "title": "Jumbled Sentences",
    "type": "drag-drop",
    "content": {
      "questionText": "Reorder to form a paragraph",
      "dragDropType": "sequence",
      "items": [
        {
          "id": "1751806037138",
          "type": "text",
          "text": "I wake up in the morning.",
          "category": "",
          "correctPosition": 1
        },
        {
          "id": "1751806057558",
          "type": "text",
          "text": "I brush my teeth",
          "category": "",
          "correctPosition": 2
        },
        {
          "id": "1751806066163",
          "type": "text",
          "text": "I wear my shoes",
          "category": "",
          "correctPosition": 3
        },
        {
          "id": "1751806074726",
          "type": "text",
          "text": "I go to school",
          "category": "",
          "correctPosition": 4
        }
      ],
      "categories": [],
      "boxes": []
    },
    id: "6",
    createdAt: new Date("2023-11-01T10:00:00Z")
  }
]
export default function QuestionBuilderApp() {
  const [questions, setQuestions] = useState<Question[]>(createdQuestion)
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
