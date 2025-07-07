"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Calculator } from "lucide-react"

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

interface MathOperationsPreviewProps {
  content: {
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
}

export function MathOperationsPreview({ content }: MathOperationsPreviewProps) {
  const [draggedDigit, setDraggedDigit] = useState<string | null>(null)
  const [filledBlanks, setFilledBlanks] = useState<Record<string, string>>({}) // blankKey -> digit
  const [showResults, setShowResults] = useState(false)
  const [usedDigits, setUsedDigits] = useState<Record<string, number>>({}) // digit -> count used
  const [carryOverAnswers, setCarryOverAnswers] = useState<Record<string, string>>({}) // carryKey -> value

  const handleDragStart = (e: React.DragEvent, digit: string) => {
    if (showResults) {
      e.preventDefault()
      return
    }
    setDraggedDigit(digit)
    e.dataTransfer.effectAllowed = "copy"
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (showResults) {
      e.dataTransfer.dropEffect = "none"
      return
    }
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const getBlankKey = (problemId: string, position: string, digitIndex: number) => {
    return `${problemId}-${position}-${digitIndex}`
  }

  const handleDrop = (e: React.DragEvent, problemId: string, position: string, digitIndex: number) => {
    e.preventDefault()
    if (showResults || !draggedDigit) return

    const blankKey = getBlankKey(problemId, position, digitIndex)

    // Remove previous digit if blank was already filled
    const previousDigit = filledBlanks[blankKey]
    if (previousDigit) {
      setUsedDigits((prev) => ({
        ...prev,
        [previousDigit]: Math.max(0, (prev[previousDigit] || 0) - 1),
      }))
    }

    // Add new digit (allow multiple usage by not tracking usage limits)
    setFilledBlanks((prev) => ({
      ...prev,
      [blankKey]: draggedDigit,
    }))

    setDraggedDigit(null)
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

  const handleReset = () => {
    setFilledBlanks({})
    setUsedDigits({})
    setShowResults(false)
    setDraggedDigit(null)
    setCarryOverAnswers({})
  }

  const isBlankCorrect = (problemId: string, position: string, digitIndex: number) => {
    const problem = content.problems.find((p) => p.id === problemId)
    if (!problem) return false

    const blank = problem.blanks.find((b) => b.position === position && b.digitIndex === digitIndex)
    if (!blank) return false

    const blankKey = getBlankKey(problemId, position, digitIndex)
    const filledDigit = filledBlanks[blankKey]

    return filledDigit === blank.correctDigit
  }

  const getCarryKey = (problemId: string, place: string) => {
    return `${problemId}-${place}`
  }

  const handleCarryDrop = (
    e: React.DragEvent,
    problemId: string,
    place: string
  ) => {
    e.preventDefault();
    if (showResults || !draggedDigit) return;

    const carryKey = getCarryKey(problemId, place);
    const currentValue = carryOverAnswers[carryKey] || "";

    // Find if this is a borrow operation
    const carryBlank = (content.carryOverBlanks || []).find(
      (b) => b.problemId === problemId && b.place === place
    );
    const isBorrow = carryBlank?.operation === "borrow";

    // For borrow operations, allow two digits; for carry operations, allow one digit
    const maxDigits = isBorrow ? 2 : 1;

    if (currentValue.length >= maxDigits) {
      // If at max capacity, replace the value
      setCarryOverAnswers((prev) => ({
        ...prev,
        [carryKey]: draggedDigit,
      }));
    } else {
      // Append the digit
      setCarryOverAnswers((prev) => ({
        ...prev,
        [carryKey]: currentValue + draggedDigit,
      }));
    }

    setDraggedDigit(null);
  };

  const isCarryCorrect = (problemId: string, place: string) => {
    const carryBlank = content.carryOverBlanks?.find(
      (b) => b.problemId === problemId && b.place === place
    );
    if (!carryBlank) return false;

    const carryKey = getCarryKey(problemId, place);
    const isBorrow = carryBlank.operation === "borrow";

    if (isBorrow) {
      // For borrow operations, check if the combined value matches
      const filledValue = carryOverAnswers[carryKey] || "";
      return filledValue === carryBlank.correctValue;
    } else {
      // For carry operations, check single digit
      const filledValue = carryOverAnswers[carryKey];
      return filledValue === carryBlank.correctValue;
    }
  };

  const isCarryBoxEnabled = (problemId: string, place: string) => {
    const placeOrder = ["ones", "tens", "hundreds", "thousands"];
    const currentIndex = placeOrder.indexOf(place);
    
    // Ones place is always enabled (rightmost)
    if (currentIndex === 0) return true;
    
    // Check if all previous places (to the right) are filled or disabled
    for (let i = 0; i < currentIndex; i++) {
      const prevPlace = placeOrder[i];
      const prevCarryBlank = content.carryOverBlanks?.find(
        (b) => b.problemId === problemId && b.place === prevPlace
      );
      
      if (prevCarryBlank) {
        // If the previous place is empty disabled (like ones place in addition), skip it
        if (prevCarryBlank.correctValue === "") {
          continue;
        }
        
        const prevCarryKey = getCarryKey(problemId, prevPlace);
        const filledValue = carryOverAnswers[prevCarryKey] || "";
        
        // Check if previous place is filled (both for carry and borrow)
        if (!filledValue) return false;
      }
    }
    
    return true;
  };

  // Helper function to get the maximum number of digits across all numbers in a problem
  const getMaxDigits = (problem: MathProblem) => {
    const op1Length = String(problem.operand1).length;
    const op2Length = String(problem.operand2).length;
    const answerLength = String(problem.answer).length;
    return Math.max(op1Length, op2Length, answerLength);
  };

  const renderProblem = (problem: MathProblem, index: number) => {
    const maxDigits = getMaxDigits(problem);

    const renderCarryOverRow = (problem: MathProblem) => {
      if (!content.showCarryOver) return null;

      const carryBlanks = (content.carryOverBlanks || []).filter(
        (b) => b.problemId === problem.id
      );
      if (carryBlanks.length === 0) return null;

      // Create array for proper alignment
      const carryRow = Array(maxDigits).fill(null);

      // Fill in the carry blanks at correct positions
      carryBlanks.forEach((carryBlank) => {
        let position = 0;
        if (carryBlank.place === "ones") position = maxDigits - 1;
        else if (carryBlank.place === "tens") position = maxDigits - 2;
        else if (carryBlank.place === "hundreds") position = maxDigits - 3;
        else if (carryBlank.place === "thousands") position = maxDigits - 4;

        if (position >= 0) {
          carryRow[position] = carryBlank;
        }
      });

      return (
        <div className="flex justify-center mb-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 w-16 text-right">
              {problem.operator === "+" ? "Carry:" : "Borrow:"}
            </span>
            {carryRow.map((carryBlank, index) => {
              if (!carryBlank) {
                return (
                  <div
                    key={index}
                    className="w-10 h-10 flex items-center justify-center"
                  >
                    {/* Empty space for alignment */}
                  </div>
                );
              }

              const carryKey = getCarryKey(problem.id, carryBlank.place);
              const filledValue = carryOverAnswers[carryKey];
              const isCorrect = isCarryCorrect(problem.id, carryBlank.place);
              const isEmptyDisabled = carryBlank.correctValue === "";
              const isSequentiallyDisabled = !isCarryBoxEnabled(problem.id, carryBlank.place);
              const isDisabled = isEmptyDisabled || isSequentiallyDisabled;
              const isBorrow = carryBlank.operation === "borrow";

              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`${
                      isBorrow ? "w-12" : "w-10"
                    } h-10 border-2 border-dashed rounded flex items-center justify-center text-lg font-mono transition-colors ${
                      isEmptyDisabled
                        ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                        : isSequentiallyDisabled
                        ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed opacity-60"
                        : showResults
                        ? isCorrect
                          ? "border-green-500 bg-green-50 text-green-800"
                          : "border-red-500 bg-red-50 text-red-800"
                        : filledValue
                        ? "border-blue-500 bg-blue-50 text-blue-800"
                        : "border-gray-400 bg-gray-50 hover:border-blue-400 cursor-pointer"
                    }`}
                    onDragOver={isDisabled ? undefined : handleDragOver}
                    onDrop={
                      isDisabled
                        ? undefined
                        : (e) =>
                            handleCarryDrop(e, problem.id, carryBlank.place)
                    }
                    onDoubleClick={
                      isDisabled || showResults
                        ? undefined
                        : () => {
                            const carryKey = getCarryKey(
                              problem.id,
                              carryBlank.place
                            );
                            setCarryOverAnswers((prev) => ({
                              ...prev,
                              [carryKey]: "",
                            }));
                          }
                    }
                  >
                    {isEmptyDisabled
                      ? "-"
                      : isSequentiallyDisabled
                      ? ""
                      : filledValue ||
                        (isBorrow
                          ? carryBlank.correctValue.length === 2
                            ? "_ _"
                            : "_"
                          : "_")}
                    {showResults && filledValue && !isDisabled && (
                      <span className="ml-1">
                        {isCorrect ? (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-600" />
                        )}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 capitalize">
                    {carryBlank.place.charAt(0)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    const renderNumberWithBlanks = (
      value: string | number,
      position: "operand1" | "operand2" | "answer"
    ) => {
      const strValue = String(value);
      const blanksForPosition = problem.blanks.filter(
        (b) => b.position === position
      );

      // Pad the number to match maxDigits for proper alignment
      const paddedValue = strValue.padStart(maxDigits, " ");

      return (
        <div className="flex items-center justify-center gap-1">
          {paddedValue.split("").map((digit, digitIndex) => {
            // Skip rendering for leading spaces
            if (digit === " ") {
              return (
                <div
                  key={digitIndex}
                  className="w-10 h-10 flex items-center justify-center"
                >
                  {/* Empty space for alignment */}
                </div>
              );
            }

            // Calculate the actual digit index in the original number (without padding)
            const actualDigitIndex = digitIndex - (maxDigits - strValue.length);
            const hasBlank = blanksForPosition.some(
              (b) => b.digitIndex === actualDigitIndex
            );
            const blankKey = getBlankKey(
              problem.id,
              position,
              actualDigitIndex
            );
            const filledDigit = filledBlanks[blankKey];
            const isCorrect = isBlankCorrect(
              problem.id,
              position,
              actualDigitIndex
            );

            if (hasBlank) {
              return (
                <div
                  key={digitIndex}
                  className={`w-10 h-10 border-2 border-dashed rounded flex items-center justify-center text-lg font-mono transition-colors ${
                    showResults
                      ? isCorrect
                        ? "border-green-500 bg-green-50 text-green-800"
                        : "border-red-500 bg-red-50 text-red-800"
                      : filledDigit
                      ? "border-blue-500 bg-blue-50 text-blue-800"
                      : "border-gray-400 bg-gray-50 hover:border-blue-400"
                  } ${showResults ? "" : "cursor-pointer"}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) =>
                    handleDrop(e, problem.id, position, actualDigitIndex)
                  }
                >
                  {filledDigit || "_"}
                  {showResults && filledDigit && (
                    <span className="ml-1">
                      {isCorrect ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-600" />
                      )}
                    </span>
                  )}
                </div>
              );
            } else {
              return (
                <div
                  key={digitIndex}
                  className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center text-lg font-mono bg-gray-100"
                >
                  {digit}
                </div>
              );
            }
          })}
        </div>
      );
    };

    return (
      <Card key={problem.id} className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calculator className="w-3 h-3" />
              Problem {index + 1}
            </Badge>
          </div>

          {renderCarryOverRow(problem)}

          <div className="flex flex-col items-center space-y-3 font-mono text-xl">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-16 text-right">
                First:
              </span>
              {renderNumberWithBlanks(problem.operand1, "operand1")}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-16 text-right">
                {problem.operator}:
              </span>
              {renderNumberWithBlanks(problem.operand2, "operand2")}
            </div>

            <div className="border-t-2 border-gray-400 w-full max-w-xs"></div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-16 text-right">
                Answer:
              </span>
              {renderNumberWithBlanks(problem.answer, "answer")}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const getAvailableCount = (digit: string) => {
    // Always return a positive count to allow multiple usage
    return 1
  }

  const getTotalBlanks = () => {
    const regularBlanks = content.problems.reduce((total, problem) => total + problem.blanks.length, 0)
    const carryBlanks = (content.carryOverBlanks || []).length
    return regularBlanks + carryBlanks
  }

  const getFilledBlanks = () => {
    return Object.keys(filledBlanks).length + Object.keys(carryOverAnswers).length
  }

  const canSubmit = () => {
    const hasRegularBlanks = getTotalBlanks() - (content.carryOverBlanks || []).length > 0
    const hasCarryBlanks = (content.carryOverBlanks || []).length > 0
    const hasFilledRegular = Object.keys(filledBlanks).length > 0
    const hasFilledCarry = Object.keys(carryOverAnswers).length > 0

    if (hasRegularBlanks && hasCarryBlanks) {
      // Both types exist, need at least one filled
      return hasFilledRegular || hasFilledCarry
    } else if (hasRegularBlanks) {
      // Only regular blanks
      return hasFilledRegular
    } else if (hasCarryBlanks) {
      // Only carry blanks
      return hasFilledCarry
    }

    return false
  }

  if (!content.problems || content.problems.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Calculator className="w-12 h-12 mx-auto mb-4" />
        <p className="text-sm">Add math problems in the builder to see the preview</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">{content.questionText}</h3>
        <p className="text-sm text-gray-600">
          Drag digits from below to fill in the blanks • {getFilledBlanks()}/{getTotalBlanks()} blanks filled
        </p>
      </div>

      <div className={`grid gap-6 ${content.layout === "horizontal" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
        {content.problems.map((problem, index) => renderProblem(problem, index))}
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-center">Available Digits</h4>
        <div className="flex flex-wrap justify-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          {content.availableDigits.map((digit, index) => {
            return (
              <div
                key={`${digit}-${index}`}
                className={`relative w-12 h-12 border-2 rounded-lg flex items-center justify-center text-xl font-mono transition-all ${
                  showResults
                    ? "cursor-not-allowed opacity-50 border-gray-300 bg-gray-100"
                    : "cursor-move hover:shadow-lg border-blue-400 bg-white hover:border-blue-600"
                }`}
                draggable={!showResults}
                onDragStart={(e) => handleDragStart(e, digit)}
              >
                {digit}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <Button onClick={handleSubmit} disabled={!canSubmit() || showResults} className="flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Check Answers
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>

      {showResults && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-sm text-blue-800">
              💡 <strong>Results shown!</strong> Green checkmarks indicate correct answers, red X marks show incorrect
              ones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.problems.map((problem, problemIndex) => (
              <Card key={problem.id} className="p-4">
                <h5 className="font-medium mb-2">Problem {problemIndex + 1} Results:</h5>
                <div className="space-y-1 text-sm">
                  {problem.blanks.map((blank, blankIndex) => {
                    const blankKey = getBlankKey(problem.id, blank.position, blank.digitIndex)
                    const filledDigit = filledBlanks[blankKey]
                    const isCorrect = isBlankCorrect(problem.id, blank.position, blank.digitIndex)

                    return (
                      <div key={blankIndex} className="flex items-center gap-2">
                        <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                          {blank.position} digit {blank.digitIndex + 1}: "{filledDigit || "empty"}"
                        </span>
                        {!isCorrect && <span className="text-gray-600 text-xs">(correct: "{blank.correctDigit}")</span>}
                      </div>
                    )
                  })}
                </div>
                {content.showCarryOver &&
                  (content.carryOverBlanks || []).filter((b) => b.problemId === problem.id).length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <h6 className="font-medium text-xs mb-1">Carryover/Borrowing:</h6>
                      <div className="space-y-1 text-xs">
                        {(content.carryOverBlanks || [])
                          .filter((b) => b.problemId === problem.id)
                          .map((carryBlank, carryIndex) => {
                            const carryKey = getCarryKey(problem.id, carryBlank.place)
                            const filledValue = carryOverAnswers[carryKey]
                            const isCorrect = isCarryCorrect(problem.id, carryBlank.place)

                            return (
                              <div key={carryIndex} className="flex items-center gap-2">
                                <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                                  {carryBlank.place} {carryBlank.operation}: "{filledValue || "empty"}"
                                </span>
                                {!isCorrect && (
                                  <span className="text-gray-600 text-xs">(correct: "{carryBlank.correctValue}")</span>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
