"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Eye, EyeOff, ImageIcon } from "lucide-react"
import { upload } from "@/lib/utils"

interface FillBlanksContent {
  questionText: string,
  questionImage?: string, // Optional image for the question
  blanks: Array<{
    id: string
    correctAnswer: string
    placeholder?: string
  }>
  enableDragDrop?: boolean
  dragOptions?: Array<{
    id: string
    text: string
    isCorrectFor?: string // which blank this is correct for
  }>
}

interface FillBlanksBuilderProps {
  content: FillBlanksContent
  onChange: (content: FillBlanksContent) => void
}

export function FillBlanksBuilder({ content, onChange }: FillBlanksBuilderProps) {
  const [localContent, setLocalContent] = useState<FillBlanksContent>({
    questionText: "",
    blanks: [{ id: "1", correctAnswer: "", placeholder: "" }],
    enableDragDrop: false,
    dragOptions: [],
    ...content,
  })
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [dragOptions, setDragOptions] = useState<
    Array<{
      id: string
      text: string
      isCorrectFor?: string // which blank this is correct for
    }>
  >([])
  const [enableDragDrop, setEnableDragDrop] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    onChange(localContent)
  }, [localContent, onChange])

  const addBlank = () => {
    const newBlank = {
      id: Date.now().toString(),
      correctAnswer: "",
      placeholder: "",
    }
    setLocalContent((prev) => ({
      ...prev,
      blanks: [...prev.blanks, newBlank],
    }))
  }

  const updateBlank = (id: string, updates: Partial<(typeof localContent.blanks)[0]>) => {
    setLocalContent((prev) => ({
      ...prev,
      blanks: prev.blanks.map((blank) => (blank.id === id ? { ...blank, ...updates } : blank)),
    }))
  }

  const removeBlank = (id: string) => {
    setLocalContent((prev) => ({
      ...prev,
      blanks: prev.blanks.filter((blank) => blank.id !== id),
    }))
  }

  const addDragOption = () => {
    const newOption = {
      id: Date.now().toString(),
      text: "",
      isCorrectFor: localContent.blanks[0]?.id || "",
    }
    setLocalContent((prev) => ({
      ...prev,
      dragOptions: [...(prev.dragOptions || []), newOption],
    }))
  }

  const updateDragOption = (id: string, updates: Partial<(typeof localContent.dragOptions)[0]>) => {
    setLocalContent((prev) => ({
      ...prev,
      dragOptions: (prev.dragOptions || []).map((option) => (option.id === id ? { ...option, ...updates } : option)),
    }))
  }

  const removeDragOption = (id: string) => {
    setLocalContent((prev) => ({
      ...prev,
      dragOptions: (prev.dragOptions || []).filter((option) => option.id !== id),
    }))
  }

  // Count underscores in question text to show how many blanks are expected
  const countBlanksInText = () => {
    const underscoreMatches = localContent.questionText.match(/_{3,}/g)
    return underscoreMatches ? underscoreMatches.length : 0
  }

  // Render question text with numbered blank indicators
  const renderQuestionWithNumbers = () => {
    const questionText = localContent.questionText
    let blankIndex = 0

    // Split by underscores and rebuild with numbered indicators
    const parts = questionText.split(/_{3,}/)

    return (
      <div className="text-base leading-relaxed p-3 bg-blue-50 border border-blue-200 rounded-lg">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="inline-flex items-center mx-1">
                <Badge variant="default" className="text-xs font-mono px-2 py-1 bg-blue-600 text-white">
                  #{blankIndex + 1}
                </Badge>
                <span style={{ display: "none" }}>{blankIndex++}</span>
              </span>
            )}
          </span>
        ))}
      </div>
    )
  }

  // Insert blank placeholder at cursor position
  const insertBlank = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = localContent.questionText
    const before = text.substring(0, start)
    const after = text.substring(end)

    const newText = before + "____" + after
    setLocalContent((prev) => ({ ...prev, questionText: newText }))

    // Set cursor position after the inserted blank
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + 4, start + 4)
    }, 0)
  }

  // Preview the question with numbered blanks
  const renderQuestionPreview = () => {
    const questionText = localContent.questionText
    let blankIndex = 0

    // Replace underscores with numbered placeholders
    const parts = questionText.split(/_{3,}/)

    return (
      <div className="p-4 bg-gray-50 border rounded-lg">
        <div className="text-lg leading-relaxed">
          {parts.map((part, index) => (
            <span key={index}>
              {part}
              {index < parts.length - 1 && blankIndex < localContent.blanks.length && (
                <span className="inline-block mx-2 px-3 py-1 bg-white border-2 border-dashed border-gray-300 rounded text-sm text-gray-500">
                  [Blank #{blankIndex + 1}]<span style={{ display: "none" }}>{blankIndex++}</span>
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    )
  }

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const base64Image = await upload(file) // Assuming upload function returns base64 string
      setLocalContent((prev) => ({ ...prev, questionImage: base64Image }))
    } catch (error) {
      console.error("Image upload failed:", error)
      // Optionally show an error toast or message
    } finally {
      setUploading(false)
    }
  } 

  const expectedBlanks = countBlanksInText()
  const actualBlanks = localContent.blanks.length

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="questionText">Question Text</Label>
            <Button variant="outline" size="sm" onClick={insertBlank} className="text-xs bg-transparent">
              <Plus className="w-3 h-3 mr-1" />
              Insert Blank
            </Button>
          </div>

          <Textarea
            ref={textareaRef}
            id="questionText"
            value={localContent.questionText}
            onChange={(e) => setLocalContent((prev) => ({ ...prev, questionText: e.target.value }))}
            placeholder="Enter your question. Use _____ to indicate blanks, or click 'Insert Blank' button."
            rows={4}
            className="font-mono text-sm"
          />
        
        <div className="flex flex-col space-y-2">
          {localContent.questionImage ? (
            <div className="relative w-32 h-32">
              <img
                src={localContent.questionImage}
                alt="Question Image"
                className="object-cover w-full h-full rounded-md"
              />
              <Button
               className="absolute top-0 right-0"
               variant="destructive"
               size={"icon"}
                onClick={() => setLocalContent((prev) => ({ ...prev, questionImage: undefined }))}
               >
                <Trash2 className="w-4 h-4"></Trash2>
              </Button>
            </div>
          ) : 
            <Label className="cursor-pointer w-32">
                   <Input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      handleImageUpload(file)
                    }
                  }}
                />
                {
                  uploading ? (
                    "Uploading..."
                  ) : (
                    <div className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-md">
                      <ImageIcon className="w-6 h-6 text-gray-500"></ImageIcon>
                      <p className="text-sm-text-gray-500">Upload Image</p>
                    </div>
                  )
                }
            </Label>
          }
         
        </div>

          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-500">
              Tip: Use 4 or more underscores (____) for each blank, or use the "Insert Blank" button.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
          </div>
        </div>

        {/* Live numbered question display */}
        {localContent.questionText && (
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <span>Question with Blank Numbers:</span>
              <Badge variant="secondary" className="text-xs">
                Live View
              </Badge>
            </Label>
            {renderQuestionWithNumbers()}
          </div>
        )}

        {/* Question Preview */}
        {showPreview && localContent.questionText && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Student View Preview:</Label>
            {renderQuestionPreview()}
          </div>
        )}

        {/* Blank count validation */}
        {localContent.questionText && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {expectedBlanks} blanks detected
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {actualBlanks} answer fields
                </Badge>
              </div>
              {expectedBlanks !== actualBlanks && (
                <div className="text-amber-600 font-medium">
                  ⚠️ Mismatch: {expectedBlanks > actualBlanks ? "Add more" : "Remove extra"} answer fields
                </div>
              )}
              {expectedBlanks === actualBlanks && expectedBlanks > 0 && (
                <div className="text-green-600 font-medium">✅ Perfect match!</div>
              )}
            </div>
          </div>
        )}

        {/* Drag & Drop Mode Toggle */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Input Mode</Label>
              <p className="text-sm text-gray-600">Choose how students will fill in the blanks</p>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="drag-mode" className="text-sm">
                Enable Drag & Drop
              </Label>
              <input
                id="drag-mode"
                type="checkbox"
                checked={localContent.enableDragDrop || false}
                onChange={(e) =>
                  setLocalContent((prev) => ({
                    ...prev,
                    enableDragDrop: e.target.checked,
                    dragOptions: e.target.checked ? prev.dragOptions || [] : [],
                  }))
                }
                className="rounded"
              />
            </div>
          </div>

          {localContent.enableDragDrop && (
            <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded border border-blue-200">
              <p>
                <strong>Drag & Drop Mode:</strong> Students will drag answer options into the blanks instead of typing.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-lg font-semibold">Blank Answers</Label>
          <Button onClick={addBlank} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Answer Field
          </Button>
        </div>

        {localContent.blanks.map((blank, index) => (
          <div key={blank.id} className="flex items-start space-x-4 p-4 border rounded-lg bg-white">
            <div className="flex-shrink-0">
              <Badge
                variant="default"
                className={`text-sm font-mono px-3 py-2 ${index < expectedBlanks ? "bg-blue-600" : "bg-gray-400"}`}
              >
                #{index + 1}
              </Badge>
            </div>

            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Correct Answer</Label>
                  <Input
                    value={blank.correctAnswer}
                    onChange={(e) => updateBlank(blank.id, { correctAnswer: e.target.value })}
                    placeholder="Enter the correct answer"
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Placeholder Text (Optional)</Label>
                  <Input
                    value={blank.placeholder || ""}
                    onChange={(e) => updateBlank(blank.id, { placeholder: e.target.value })}
                    placeholder="Hint text for students"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Show which blank this corresponds to in the question */}
              <div
                className={`text-xs p-2 rounded ${
                  index < expectedBlanks
                    ? "text-blue-700 bg-blue-50 border border-blue-200"
                    : "text-gray-600 bg-gray-50 border border-gray-200"
                }`}
              >
                {index < expectedBlanks ? (
                  <>
                    <strong>✅ This corresponds to blank #{index + 1}</strong> in your question text
                    {blank.correctAnswer && (
                      <span className="ml-2">
                        → Students will see:{" "}
                        <code className="bg-white px-1 rounded border">
                          "{blank.placeholder || "Fill in the blank"}"
                        </code>
                      </span>
                    )}
                  </>
                ) : (
                  <strong>⚠️ Extra field - no corresponding blank in question text</strong>
                )}
              </div>
            </div>

            {localContent.blanks.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => removeBlank(blank.id)} className="flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}

        {/* Drag Options Section */}
        {localContent.enableDragDrop && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-semibold">Draggable Answer Options</Label>
              <Button onClick={addDragOption} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>

            {(localContent.dragOptions || []).map((option, index) => (
              <div key={option.id} className="flex items-start space-x-4 p-4 border rounded-lg bg-white">
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="text-sm font-mono px-3 py-2">
                    Option {index + 1}
                  </Badge>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Option Text</Label>
                      <Input
                        value={option.text}
                        onChange={(e) => updateDragOption(option.id, { text: e.target.value })}
                        placeholder="Enter the answer option"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Correct for Blank</Label>
                      <select
                        value={option.isCorrectFor || ""}
                        onChange={(e) => updateDragOption(option.id, { isCorrectFor: e.target.value })}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select blank...</option>
                        {localContent.blanks.map((blank, blankIndex) => (
                          <option key={blank.id} value={blank.id}>
                            Blank #{blankIndex + 1} ({blank.correctAnswer || "No answer set"})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <Button variant="ghost" size="sm" onClick={() => removeDragOption(option.id)} className="flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {(localContent.dragOptions || []).length === 0 && (
              <div className="text-center text-gray-500 py-8 border-2 border-dashed rounded-lg">
                <p className="text-sm">No drag options created yet</p>
                <p className="text-xs text-gray-400">Click "Add Option" to create draggable answer choices</p>
              </div>
            )}
          </div>
        )}

        {/* Helper text */}
        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border">
          <p className="font-medium mb-2">💡 How to use:</p>
          <ul className="space-y-1 text-xs">
            <li>
              • <strong>Type your question</strong> and use ____ (4+ underscores) for each blank
            </li>
            <li>
              • <strong>Use "Insert Blank" button</strong> to add blanks at your cursor position
            </li>
            <li>
              • <strong>See live numbering</strong> in the blue box above - blank #1, #2, etc.
            </li>
            <li>
              • <strong>Match answer fields</strong> to the numbered blanks in your question
            </li>
            <li>
              • <strong>Preview mode</strong> shows exactly what students will see
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
