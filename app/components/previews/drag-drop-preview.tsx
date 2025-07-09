"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"
import { SequencePreview } from "./sequence-preview"

interface DragDropPreviewProps {
  content: {
    questionText: string
    dragDropType: "categorize" | "sequence" | "match-boxes",
    displayDuplicateItems: boolean,
    items: Array<{
      id: string
      text: string
      category?: string
      correctPosition?: number
      imageUrl?: string // Optional image URL for items
    }>
    categories?: Array<{
      id: string
      name: string
      color: string
      image?: string
    }>
    boxes?: Array<{
      id: string
      label: string,
      image?:string,
      correctAnswers?: [{
        id: string,
        count?: number // Optional count for how many times this answer can be used
      }]
    }>
  }
}

export function DragDropPreview({ content }: DragDropPreviewProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [droppedItems, setDroppedItems] = useState<Record<string, Array<{ targetId: string; count: number }>>>({});
  const [itemLists, setItemList] = useState<Array<{
    id: string
      text: string
      category?: string
      correctPosition?: number
      imageUrl?: string // Optional image URL for items
  }>>([]);
  const [showResults, setShowResults] = useState(false)
  const [allowDuplicateItems, setAllowDuplicateItems] = useState(false)

  useEffect(() => {
    if(content.dragDropType === "match-boxes") {
      // For match-boxes type, allow duplicate items to be dropped in the same box
      setAllowDuplicateItems(true)
    }

   if(content.displayDuplicateItems){
    const itemList = createItemLists();
    setItemList(itemList);
   }
  },[content.dragDropType, content.displayDuplicateItems, content.boxes,content.items])
  
  const createItemLists = () => {
    const newList =  content.items.flatMap(item => {
      const count = content.boxes?.reduce((accumulator, currentBox) => {
        const newcount = (currentBox?.correctAnswers?.find(ans => ans.id === item.id))?.count || 0
              return newcount + accumulator 
      },0) || 0

      return Array.from({length: count}, (_, index) => ({
        ...item
      }))
    })
    return newList;
  }
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    // Prevent dragging if results are shown
    if (showResults) {
      e.preventDefault()
      return
    }
    setDraggedItem(itemId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    // Prevent drop if results are shown
    if (showResults) {
      e.dataTransfer.dropEffect = "none"
      return
    }
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (showResults || !draggedItem) return;
  
    setDroppedItems((prev) => {
      const prevCount = prev[draggedItem]?.find((item) => item.targetId === targetId)?.count || 0;
      const newCount = allowDuplicateItems ? prevCount + 1 : 1;
      const updatedItems = structuredClone(prev[draggedItem]) || [];
      if(prev[draggedItem]){
        // if the targetId doesn't exist, add it
        if (!updatedItems.some((item) => item.targetId === targetId)) {
          updatedItems.push({ targetId, count: newCount });
        } else {
          // if it exists, update the count
          updatedItems.forEach((item) => {
            if (item.targetId === targetId) {
              item.count = allowDuplicateItems ? item.count + 1 : 1; // Increment count if duplicates are allowed
            }
          });
        }
      }else {
        updatedItems.push({ targetId, count: newCount }); // Add new item with count 1
      }
      return {
        ...prev,
        [draggedItem]: updatedItems,
      };
    });

    // remove that item from itemlists
    if(content.displayDuplicateItems){

      setItemList((prev) => {
        const newList = structuredClone(prev);
        const index = newList.findIndex((item) => draggedItem === item.id)
        newList.splice(index,1)
         return newList
      })
    }
  
    setDraggedItem(null);
  };

 
// Add this debug version to your component
const handleDoubleClick = (e: React.MouseEvent, itemId: string, boxId?:string) => {
  console.log("Double clicked item:", itemId);
  e.preventDefault();
  e.stopPropagation();
  
  // Prevent double click if results are shown
  if (showResults) return;
  if (allowDuplicateItems) {
    // If allowDuplicateItems is true, just remove one instance of the item
    console.log("Removing one instance of item:", itemId);
    
    setDroppedItems((prev) => {
      
      // Check if item exists and has count > 0
      if (!prev[itemId] || prev[itemId].length === 0) {
        console.log("Item doesn't exist or count is 0, returning unchanged state");
        return prev; // Return unchanged state
      }
      
      // Create a shallow copy of the previous state
      const newDroppedItems = structuredClone(prev);
      console.log(newDroppedItems)
      
        newDroppedItems[itemId] = newDroppedItems[itemId].map((item) =>
          item.targetId === boxId ? { ...item, count: item.count - 1 } : item
        );
      
      
      return newDroppedItems;
    });
    if(content.displayDuplicateItems) {
      setItemList((prev) => {
        const newList = structuredClone(prev);
        const elementToPuash = content.items.find(item => item.id === itemId)
        elementToPuash && newList.push(elementToPuash)
  
        return newList
      })
    }
  } else {
    setDroppedItems((prev) => {
      // Check if item exists before trying to delete
      if (!prev[itemId]) {
        console.log("Item doesn't exist, returning unchanged state");
        return prev; // Return unchanged state
      }
      
      const newDroppedItems = { ...prev };
      delete newDroppedItems[itemId];
      return newDroppedItems;
    });
  }
};

// Also add this useEffect to monitor state changes
useEffect(() => {
  console.log("droppedItems state changed:", JSON.stringify(droppedItems, null, 2));
}, [droppedItems]);
  const checkAnswers = () => {
    setShowResults(true)
  }

  const resetAnswers = () => {
    setDroppedItems({})
    setShowResults(false)
    if(content.displayDuplicateItems){
      const itemList = createItemLists();
      setItemList(itemList);
    }
  }

  const isCorrect = (itemId: string) => {
    const item = content.items.find((i) => i.id === itemId)
    const droppedTarget = droppedItems[itemId]
    

    if (content.dragDropType === "categorize") {
      return droppedTarget?.some((d) => d.targetId === item?.category)
    } else if (content.dragDropType === "match-boxes") {
      const box = content.boxes?.find((b) => b.id === droppedTarget.targetId)
      const item = content.items.find((i) => i.id === itemId)
      // Support both single correctAnswer (backward compatibility) and multiple correctAnswers
      if (box?.correctAnswers && Array.isArray(box.correctAnswers)) {
        return box.correctAnswers.includes(item?.id || "")
      } else {
        // Fallback to single answer for backward compatibility
        return box?.correctAnswers === item?.id
      }
    }
    return false
  }

  const renderCategorizeType = () => (
    <div className="space-y-6">
      <p className="text-lg font-medium">{content.questionText}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {content.categories?.map((category) => (
          <Card
            key={category.id}
            className={`min-h-32 ${category.color} border-2 border-dashed ${
              showResults ? "border-gray-400" : "border-gray-300"
            } ${showResults ? "cursor-not-allowed" : ""}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, category.id)}
            style={{
              backgroundImage: category.image ? `url(${category.image})` : "none",
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{category.name}</h3>
              <div className="space-y-2">
                {content.items
                  .filter((item) => droppedItems[item.id]?.some((d) => d.targetId === category.id))
                  .map((item) => (
                    <Badge
                      key={item.id}
                      variant="secondary"
                      className={`p-2 transition-all ${
                        showResults
                          ? isCorrect(item.id)
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          : ""
                      }`}
                      onDoubleClick={(e) => handleDoubleClick(e, item.id, category.id)}
                    >
                      {item.text}
                      {item.imageUrl && <img className="w-8 h-8 object-cover rounded" src={item.imageUrl} alt="" />}
                      {showResults &&
                        (isCorrect(item.id) ? (
                          <CheckCircle className="w-4 h-4 ml-2 inline" />
                        ) : (
                          <XCircle className="w-4 h-4 ml-2 inline" />
                        ))}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Items to Categorize:</h3>
        <div className="flex flex-wrap gap-2">
          {content.items.map((item) => (
            <Badge
              key={item.id}
              variant="outline"
              className={`p-2 transition-all ${
                showResults
                  ? "cursor-not-allowed opacity-70"
                  : droppedItems[item.id]
                    ? "opacity-60 bg-gray-100 border-dashed cursor-move"
                    : "hover:bg-blue-50 cursor-move"
              }`}
              draggable={!showResults}
              onDragStart={(e) => handleDragStart(e, item.id)}
            >
              {item.text}
              {item.imageUrl && <img className="w-9 h-9 object-cover rounded" src={item.imageUrl} alt="" />}
              {/* {droppedItems[item.id] && (
                <span className="ml-2 text-xs text-gray-500">
                  (in {content.categories?.find((c) => c.id === droppedItems[item.id].targetId)?.name})
                </span>
              )} */}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )

  const matchBoxResult = (id: string) => {
    const box = content.boxes?.find((b) => b.id === id);
    if (!box) return false;

    // Check if all items in the box match the correct answers
    const correctAnswers = Array.isArray(box.correctAnswers) ? box.correctAnswers : [box.correctAnswers];

    // dropped items in box
    const droppedItemInBox = Object.keys(droppedItems).filter(keys => 
      droppedItems[keys]?.some(item => item.targetId === box.id)
    ).map(keys => {
      return {
        itemId: keys,
        count: (droppedItems[keys].find(item => item.targetId === box.id))?.count
      }
    })

    
    //matching correct answers with droppedItemInBox
    if(correctAnswers?.length !== droppedItemInBox?.length){
      return false;
    } else {
      return droppedItemInBox.every(item => {
        //if item not found in correct answer return false
        const correctAnswerCount = (correctAnswers.find(ans => ans?.id === item.itemId))?.count || 0
        
        return item.count === correctAnswerCount
      })
    }

  };

  const renderMatchBoxesType = () => (
  <div className="space-y-6">
      <p className="text-lg font-medium">{content.questionText}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.boxes?.map((box) => (
          <Card
            key={box.id}
            className={`min-h-24 border-2 border-dashed ${
              showResults ? matchBoxResult(box.id) ? 
                "border-green-600" : "border-red-600 cursor-not-allowed" :
                "border-gray-300"}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, box.id)}
            style={{
              backgroundImage: box.image ? `url(${box.image})` : "none",
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
           <CardContent className="p-4">
            <h3 className="font-semibold mb-2">{box.label}</h3>
            <div className="space-y-2">
              {content.items
                .filter((item) => droppedItems[item.id]?.some((d) => d.targetId === box.id))
                .map((item) => {
                  const count = (droppedItems[item.id]?.find((e) => e.targetId === box.id))?.count || 0;
                  // Create an array of unique keys for each instance
                  return Array.from({ length: count }, (_, index) => (
                    <Badge
                      key={`${item.id}-${index}`} // Unique key for each instance
                      variant="secondary"
                      className={`p-2 transition-all`}
                      onDoubleClick={(e) => handleDoubleClick(e, item.id, box.id)}
                    >
                      {item.text}
                      {item.imageUrl && <img className="w-8 h-8 object-cover rounded" src={item.imageUrl} alt="" />}
                    </Badge>
                  ));
                })
                .flat()} {/* Flatten the array of arrays */}
            </div>
          </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Drag these items:</h3>
        <div className="flex flex-wrap gap-2">
        {content.displayDuplicateItems ? (
          itemLists.map((item,index) =>
            ( <Badge
              key={`${item}.${index}`}
              variant="outline"
              className={`p-2 transition-all hover:bg-blue-50 cursor-move`}
              draggable={!showResults}
              onDragStart={(e) => handleDragStart(e, item.id)}
              >
                {item.text}
                {item.imageUrl && <img className="w-8 h-8 object-cover rounded" src={item.imageUrl} alt="" />}
              </Badge>)
           )
        ): 
        content.items.map((item) => (
            <Badge
              key={item.id}
              variant="outline"
              className={`p-2 transition-all hover:bg-blue-50 cursor-move`}
              draggable={!showResults}
              onDragStart={(e) => handleDragStart(e, item.id)}
            >
              {item.text}
              {item.imageUrl && <img className="w-8 h-8 object-cover rounded" src={item.imageUrl} alt="" />}
              {/* {droppedItems[item.id] && (
                <span className="ml-2 text-xs text-gray-500">
                  (in {content.boxes?.find((b) => b.id === droppedItems[item.id])?.label})
                </span>
              )} */}
            </Badge>
          )
        )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {content.dragDropType === "categorize" && renderCategorizeType()}
      {content.dragDropType === "match-boxes" && renderMatchBoxesType()}
      {content.dragDropType === "sequence" && <SequencePreview content={content} />}

      {/* Only show these buttons for categorize and match-boxes types */}
      {content.dragDropType !== "sequence" && (
        <>
          <div className="flex gap-2 pt-4">
            <Button onClick={checkAnswers} disabled={Object.keys(droppedItems).length === 0 || showResults}>
              Check Answers
            </Button>
            <Button variant="outline" onClick={resetAnswers}>
              Reset
            </Button>
          </div>

          {showResults && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Results locked!</strong> Click "Reset" to try again or make changes.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
