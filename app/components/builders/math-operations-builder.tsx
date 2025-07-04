"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Calculator } from "lucide-react"

interface MathProblem {
  id: string
  operand1: number | string
  operand2: number | string
  operator: "+" | "-" | "×" | "÷"
  answer: number | string
  blanks: Array<{
    position: "operand1" | "operand2" | "answer"
    digitIndex: number
    correctDigit: string
  }>
}

interface MathOperationsContent {
  questionText: string
  operation: "addition" | "subtraction" | "multiplication" | "division" | "mixed"
  problems: MathProblem[]
  availableDigits: string[]
  layout: "vertical" | "horizontal"
  showCarryOver?: boolean
  carryOverBlanks?: Array<{
    problemId: string
    place: "ones" | "tens" | "hundreds" | "thousands"
    correctValue: string
    operation: "carry" | "borrow"
  }>
}

interface MathOperationsBuilderProps {
  content: MathOperationsContent
  onChange: (content: MathOperationsContent) => void
}

export function MathOperationsBuilder({ content, onChange }: MathOperationsBuilderProps) {
  const [localContent, setLocalContent] = useState<MathOperationsContent>({
    questionText: "Solve the following problems by dragging the correct digits:",
    operation: "addition",
    problems: [],
    availableDigits: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    layout: "vertical",
    showCarryOver: false,
    ...content,
  })

  useEffect(() => {
    onChange(localContent)
  }, [localContent, onChange])

  const getOperatorSymbol = (operation: string) => {
    switch (operation) {
      case "addition":
        return "+"
      case "subtraction":
        return "-"
      case "multiplication":
        return "×"
      case "division":
        return "÷"
      default:
        return "+"
    }
  }

  const calculateAnswer = (operand1: number, operand2: number, operator: string) => {
    switch (operator) {
      case "+":
        return operand1 + operand2
      case "-":
        return operand1 - operand2
      case "×":
        return operand1 * operand2
      case "÷":
        return Math.floor(operand1 / operand2)
      default:
        return 0
    }
  }

  // Auto-calculate carryover/borrow values for a problem
  const calculateCarryOverBlanks = (problem: MathProblem) => {
    const op1 = Number(problem.operand1)
    const op2 = Number(problem.operand2)
    const operator = problem.operator
    const carryBlanks: Array<{
      problemId: string
      place: "ones" | "tens" | "hundreds" | "thousands"
      correctValue: string
      operation: "carry" | "borrow"
    }> = []

    if (operator === "+") {
      // Addition - calculate carries
      let carry = 0
      const places = ["ones", "tens", "hundreds", "thousands"] as const

      for (let i = 0; i < places.length; i++) {
        const place = places[i]
        let digit1 = 0
        let digit2 = 0

        // Extract digits for current place
        if (place === "ones") {
          digit1 = op1 % 10
          digit2 = op2 % 10
        } else if (place === "tens") {
          digit1 = Math.floor((op1 % 100) / 10)
          digit2 = Math.floor((op2 % 100) / 10)
        } else if (place === "hundreds") {
          digit1 = Math.floor((op1 % 1000) / 100)
          digit2 = Math.floor((op2 % 1000) / 100)
        } else if (place === "thousands") {
          digit1 = Math.floor((op1 % 10000) / 1000)
          digit2 = Math.floor((op2 % 10000) / 1000)
        }

        const sum = digit1 + digit2 + carry
        const newCarry = Math.floor(sum / 10)

        // Only add carry blank if there's a carry and we have digits in this place
        if (newCarry > 0 && (digit1 > 0 || digit2 > 0 || carry > 0)) {
          carryBlanks.push({
            problemId: problem.id,
            place,
            correctValue: String(newCarry),
            operation: "carry",
          })
        }

        carry = newCarry
      }
    } else if (operator === "-") {
      // Subtraction - calculate borrows
      const places = ["ones", "tens", "hundreds", "thousands"] as const
      let borrow = 0

      for (let i = 0; i < places.length; i++) {
        const place = places[i]
        let digit1 = 0
        let digit2 = 0

        // Extract digits for current place
        if (place === "ones") {
          digit1 = op1 % 10
          digit2 = op2 % 10
        } else if (place === "tens") {
          digit1 = Math.floor((op1 % 100) / 10)
          digit2 = Math.floor((op2 % 100) / 10)
        } else if (place === "hundreds") {
          digit1 = Math.floor((op1 % 1000) / 100)
          digit2 = Math.floor((op2 % 1000) / 100)
        } else if (place === "thousands") {
          digit1 = Math.floor((op1 % 10000) / 1000)
          digit2 = Math.floor((op2 % 10000) / 1000)
        }

        // Adjust digit1 for previous borrow
        digit1 -= borrow
        borrow = 0

        // Check if we need to borrow
        if (digit1 < digit2 && (digit1 > 0 || digit2 > 0)) {
          borrow = 1
          carryBlanks.push({
            problemId: problem.id,
            place,
            correctValue: "1",
            operation: "borrow",
          })
        }
      }
    }

    return carryBlanks
  }

  // Auto-update carryover blanks when problems change
  const updateCarryOverBlanks = () => {
    if (!localContent.showCarryOver) return

    const allCarryBlanks: Array<{
      problemId: string
      place: "ones" | "tens" | "hundreds" | "thousands"
      correctValue: string
      operation: "carry" | "borrow"
    }> = []

    localContent.problems.forEach((problem) => {
      const carryBlanks = calculateCarryOverBlanks(problem)
      allCarryBlanks.push(...carryBlanks)
    })

    setLocalContent((prev) => ({
      ...prev,
      carryOverBlanks: allCarryBlanks,
    }))
  }

  // Update carryover blanks whenever problems or showCarryOver changes
  useEffect(() => {
    updateCarryOverBlanks()
  }, [localContent.problems, localContent.showCarryOver])

  const addProblem = () => {
    const operator = getOperatorSymbol(localContent.operation)
    const operand1 = Math.floor(Math.random() * 99) + 1
    const operand2 = Math.floor(Math.random() * 99) + 1
    const answer = calculateAnswer(operand1, operand2, operator)

    const newProblem: MathProblem = {
      id: Date.now().toString(),
      operand1,
      operand2,
      operator: operator as "+" | "-" | "×" | "÷",
      answer,
      blanks: [],
    }

    setLocalContent((prev) => ({
      ...prev,
      problems: [...prev.problems, newProblem],
    }))
  }

  const updateProblem = (id: string, updates: Partial<MathProblem>) => {
    setLocalContent((prev) => ({
      ...prev,
      problems: prev.problems.map((problem) => {
        if (problem.id === id) {
          const updated = { ...problem, ...updates }
          // Recalculate answer if operands or operator changed
          if (updates.operand1 !== undefined || updates.operand2 !== undefined || updates.operator !== undefined) {
            const op1 = Number(updated.operand1) || 0
            const op2 = Number(updated.operand2) || 0
            updated.answer = calculateAnswer(op1, op2, updated.operator)
          }
          return updated
        }
        return problem
      }),
    }))
  }

  const removeProblem = (id: string) => {
    setLocalContent((prev) => ({
      ...prev,
      problems: prev.problems.filter((problem) => problem.id !== id),
    }))
  }

  const toggleBlankForDigit = (problemId: string, position: "operand1" | "operand2" | "answer", digitIndex: number) => {
    const problem = localContent.problems.find((p) => p.id === problemId)
    if (!problem) return

    const value = String(problem[position])
    const correctDigit = value[digitIndex]

    // Check if blank already exists for this position and digit
    const existingBlankIndex = problem.blanks.findIndex((b) => b.position === position && b.digitIndex === digitIndex)

    if (existingBlankIndex >= 0) {
      // Remove existing blank
      const newBlanks = problem.blanks.filter((_, index) => index !== existingBlankIndex)
      updateProblem(problemId, { blanks: newBlanks })
    } else {
      // Add new blank
      const newBlank = {
        position,
        digitIndex,
        correctDigit,
      }
      updateProblem(problemId, {
        blanks: [...problem.blanks, newBlank],
      })
    }
  }

  const renderProblemEditor = (problem: MathProblem) => {
    const renderNumberWithClickableBlanks = (value: string | number, position: "operand1" | "operand2" | "answer") => {
      const strValue = String(value)
      const blanksForPosition = problem.blanks.filter((b) => b.position === position)

      return (
        <div className="flex items-center gap-1">
          {strValue.split("").map((digit, index) => {
            const hasBlank = blanksForPosition.some((b) => b.digitIndex === index)
            return (
              <div
                key={index}
                className={`relative w-10 h-10 border-2 rounded flex items-center justify-center text-sm font-mono cursor-pointer transition-all ${
                  hasBlank
                    ? "border-blue-500 bg-blue-100 text-blue-800 hover:bg-blue-200"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
                }`}
                onClick={() => toggleBlankForDigit(problem.id, position, index)}
                title={
                  hasBlank ? `Click to remove blank (digit: ${digit})` : `Click to make this digit (${digit}) a blank`
                }
              >
                {hasBlank ? (
                  <div className="flex flex-col items-center">
                    <span className="text-xs">_</span>
                    <span className="text-xs text-blue-600 font-bold">✓</span>
                  </div>
                ) : (
                  digit
                )}
              </div>
            )
          })}
          <div className="ml-2 text-xs text-gray-500">
            <div>Click digits to</div>
            <div>add/remove blanks</div>
          </div>
        </div>
      )
    }

    // Get carryover blanks for this problem
    const problemCarryBlanks = (localContent.carryOverBlanks || []).filter((b) => b.problemId === problem.id)

    return (
      <Card key={problem.id} className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calculator className="w-3 h-3" />
              Problem {localContent.problems.indexOf(problem) + 1}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => removeProblem(problem.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>First Number</Label>
              <Input
                type="number"
                value={problem.operand1}
                onChange={(e) => updateProblem(problem.id, { operand1: Number(e.target.value) || 0 })}
                placeholder="First number"
              />
            </div>
            <div className="space-y-2">
              <Label>Operator</Label>
              <Select
                value={problem.operator}
                onValueChange={(value: "+" | "-" | "×" | "÷") => updateProblem(problem.id, { operator: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+">+ Addition</SelectItem>
                  <SelectItem value="-">- Subtraction</SelectItem>
                  <SelectItem value="×">× Multiplication</SelectItem>
                  <SelectItem value="÷">÷ Division</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Second Number</Label>
              <Input
                type="number"
                value={problem.operand2}
                onChange={(e) => updateProblem(problem.id, { operand2: Number(e.target.value) || 0 })}
                placeholder="Second number"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Interactive Problem Layout</Label>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
              <div className="flex flex-col items-center space-y-3 font-mono">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-16 text-right font-semibold">First:</span>
                  {renderNumberWithClickableBlanks(problem.operand1, "operand1")}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-16 text-right font-semibold">{problem.operator}:</span>
                  {renderNumberWithClickableBlanks(problem.operand2, "operand2")}
                </div>
                <div className="border-t-2 border-gray-400 w-full max-w-xs my-2"></div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-16 text-right font-semibold">Answer:</span>
                  {renderNumberWithClickableBlanks(problem.answer, "answer")}
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-xs text-blue-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Click any digit to toggle blank
                </div>
              </div>
            </div>
          </div>

          {localContent.showCarryOver && problemCarryBlanks.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Auto-Generated {problem.operator === "+" ? "Carry" : "Borrow"} Blanks
              </Label>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm text-green-800 mb-2">
                  <strong>✅ Automatically calculated!</strong> These {problem.operator === "+" ? "carry" : "borrow"}{" "}
                  values are generated based on your numbers.
                </div>
                <div className="space-y-2">
                  {problemCarryBlanks.map((carryBlank, index) => (
                    <div key={index} className="flex items-center gap-4 text-sm">
                      <Badge variant="secondary" className="capitalize">
                        {carryBlank.place}
                      </Badge>
                      <span className="text-gray-600">
                        {carryBlank.operation === "carry" ? "Carry" : "Borrow"} value:
                      </span>
                      <Badge variant="outline" className="font-mono">
                        {carryBlank.correctValue}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {localContent.showCarryOver && problemCarryBlanks.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                <strong>ℹ️ No {problem.operator === "+" ? "carries" : "borrows"} needed</strong> for this problem with
                the current numbers.
              </div>
            </div>
          )}

          {problem.blanks.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Active Blanks ({problem.blanks.length})</Label>
              <div className="flex flex-wrap gap-2">
                {problem.blanks.map((blank, index) => (
                  <Badge key={index} variant="default" className="flex items-center gap-1 bg-blue-600">
                    {blank.position} digit {blank.digitIndex + 1}: "{blank.correctDigit}"
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBlankForDigit(problem.id, blank.position, blank.digitIndex)}
                      className="h-4 w-4 p-0 ml-1 text-white hover:bg-blue-700"
                      title="Click to remove this blank"
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="questionText">Instructions</Label>
          <Input
            id="questionText"
            value={localContent.questionText}
            onChange={(e) => setLocalContent((prev) => ({ ...prev, questionText: e.target.value }))}
            placeholder="Enter instructions for students"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Primary Operation</Label>
            <Select
              value={localContent.operation}
              onValueChange={(value: MathOperationsContent["operation"]) =>
                setLocalContent((prev) => ({ ...prev, operation: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="addition">Addition (+)</SelectItem>
                <SelectItem value="subtraction">Subtraction (-)</SelectItem>
                <SelectItem value="multiplication">Multiplication (×)</SelectItem>
                <SelectItem value="division">Division (÷)</SelectItem>
                <SelectItem value="mixed">Mixed Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Layout</Label>
            <Select
              value={localContent.layout}
              onValueChange={(value: "vertical" | "horizontal") =>
                setLocalContent((prev) => ({ ...prev, layout: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">Vertical Layout</SelectItem>
                <SelectItem value="horizontal">Horizontal Layout</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              id="show-carryover"
              type="checkbox"
              checked={localContent.showCarryOver || false}
              onChange={(e) =>
                setLocalContent((prev) => ({
                  ...prev,
                  showCarryOver: e.target.checked,
                  carryOverBlanks: e.target.checked ? prev.carryOverBlanks || [] : [],
                }))
              }
              className="rounded"
            />
            <Label htmlFor="show-carryover" className="text-sm">
              Enable Auto Carryover/Borrowing Practice
            </Label>
          </div>
          {localContent.showCarryOver && (
            <div className="text-sm text-green-700 bg-green-50 p-3 rounded border border-green-200">
              <p>
                <strong>🚀 Smart Mode:</strong> Carryover and borrowing values are automatically calculated and filled
                based on your numbers. No manual setup needed!
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-lg font-semibold">Math Problems</Label>
          <Button onClick={addProblem} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Problem
          </Button>
        </div>

        {localContent.problems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calculator className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No math problems created yet</p>
              <p className="text-sm text-gray-400">Click "Add Problem" to create your first math problem</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">{localContent.problems.map((problem) => renderProblemEditor(problem))}</div>
        )}
      </div>

      <div className="space-y-4">
        <Label className="text-lg font-semibold">Available Digits</Label>
        <div className="flex flex-wrap gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          {localContent.availableDigits.map((digit) => (
            <Badge key={digit} variant="outline" className="text-lg font-mono px-3 py-2">
              {digit}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-gray-600">
          Students will drag these digits to fill in the blanks you created above.
        </p>
      </div>

      <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border">
        <p className="font-medium mb-2">💡 How to create blanks easily:</p>
        <ul className="space-y-1 text-xs">
          <li>
            • <strong>Click Any Digit:</strong> Simply click on any digit in the problem layout to make it a blank
          </li>
          <li>
            • <strong>Visual Feedback:</strong> Blue background and checkmark show which digits are blanks
          </li>
          <li>
            • <strong>Toggle On/Off:</strong> Click again to remove a blank and restore the digit
          </li>
          <li>
            • <strong>Easy Access:</strong> No more hunting for tiny buttons - every digit is clickable
          </li>
          <li>
            • <strong>Precise Control:</strong> Perfect for targeting specific place values like ones, tens, etc.
          </li>
        </ul>
      </div>
    </div>
  )
}
