"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, GripVertical, ImageIcon } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { upload } from "@/lib/utils"

interface DragDropItem {
  id: string
  type: "text" | "image" | "mixed"
  text?: string
  imageUrl?: string
  altText?: string
  category?: string
  correctPosition?: number
}

interface DragDropContent {
  questionText: string
  dragDropType: "categorize" | "sequence" | "match-boxes"
  sequenceLayout?: "horizontal" | "vertical"
  items: DragDropItem[]
  categories?: Array<{
    id: string
    name: string
    color: string
    image?: string // Optional background image for categorizatio
  }>
  boxes?: Array<{
    id: string
    label: string
    correctAnswers?: string[]
  }>
}

interface DragDropBuilderProps {
  content: DragDropContent
  onChange: (content: DragDropContent) => void
}

export function DragDropBuilder({ content, onChange }: DragDropBuilderProps) {
  const [localContent, setLocalContent] = useState<DragDropContent>({
    questionText: "",
    dragDropType: "categorize",
    items: [],
    categories: [],
    boxes: [],
    ...content,
  })
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false) // Moved useState to top level

  useEffect(() => {
    onChange(localContent)
  }, [localContent, onChange])

  const addItem = () => {
    const newItem: DragDropItem = {
      id: Date.now().toString(),
      type: "text",
      text: "",
      category: localContent.categories?.[0]?.id || "",
      correctPosition: localContent.items.length + 1,
    }
    setLocalContent((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }))
  }

  const updateItem = (id: string, updates: Partial<DragDropItem>) => {
    setLocalContent((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }))
  }

  const removeItem = (id: string) => {
    setLocalContent((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }))
  }

  const addCategory = () => {
    const colors = ["bg-blue-100", "bg-green-100", "bg-yellow-100", "bg-purple-100", "bg-pink-100"]
    const newCategory = {
      id: Date.now().toString(),
      name: "",
      color: colors[localContent.categories?.length || 0] || "bg-gray-100",
    }
    setLocalContent((prev) => ({
      ...prev,
      categories: [...(prev.categories || []), newCategory],
    }))
  }

  const updateCategory = (id: string, updates: Partial<(typeof localContent.categories)[0]>) => {
    setLocalContent((prev) => ({
      ...prev,
      categories: prev.categories?.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat)) || [],
    }))
  }

  const handleCategoryImageUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    upload(file)
      .then((imageUrl) => {
        updateCategory(id, { image: imageUrl })
        toast({
          title: "Upload complete",
          description: "Image uploaded successfully.",
        })
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your upload.",
        })
      })
      .finally(() => {
        setUploading(false)
      })
  }

  const updateCategoryImage = (id: string, imageUrl: string) => {
    setLocalContent((prev) => ({
      ...prev,
      categories: prev.categories?.map((cat) =>
        cat.id === id ? { ...cat, image: imageUrl } : cat
      ) || [],
    }))
  }

  const removeCategory = (id: string) => {
    setLocalContent((prev) => ({
      ...prev,
      categories: prev.categories?.filter((cat) => cat.id !== id) || [],
    }))
  }

  const addBox = () => {
    const newBox = {
      id: Date.now().toString(),
      label: "",
      correctAnswers: [],
    }
    setLocalContent((prev) => ({
      ...prev,
      boxes: [...(prev.boxes || []), newBox],
    }))
  }

  const updateBox = (id: string, updates: Partial<(typeof localContent.boxes)[0]>) => {
    setLocalContent((prev) => ({
      ...prev,
      boxes: prev.boxes?.map((box) => (box.id === id ? { ...box, ...updates } : box)) || [],
    }))
  }

  const removeBox = (id: string) => {
    setLocalContent((prev) => ({
      ...prev,
      boxes: prev.boxes?.filter((box) => box.id !== id) || [],
    }))
  }

  const handleImageUpload = async (file: File, itemId: string) => {
    setUploading(true)
    try {
      const imageUrl = await upload(file)
      updateItem(itemId, { imageUrl: imageUrl, type: "image" })
      toast({
        title: "Upload complete",
        description: "Image uploaded successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your upload.",
      })
    } finally {
      setUploading(false)
    }
  }

  const renderOptionEditor = (item: DragDropItem) => {
    return (
      <div className="flex flex-col space-y-2">
        <Select
          value={item.type}
          onValueChange={(value) => updateItem(item.id, { type: value as "text" | "image" | "mixed" })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="image">Image</SelectItem>
          </SelectContent>
        </Select>

        {item.type === "text" && (
          <Input
            value={item.text || ""}
            onChange={(e) => updateItem(item.id, { text: e.target.value })}
            placeholder="Item text"
            className="flex-1"
          />
        )}

        {item.type === "image" && (
          <>
            {item.imageUrl ? (
              <div className="relative w-32 h-32">
                <img
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.altText}
                  className="object-cover w-full h-full rounded-md"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-0 right-0"
                  onClick={() => updateItem(item.id, { imageUrl: undefined, altText: undefined, type: "text" })}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Label htmlFor={`upload-image-${item.id}`} className="cursor-pointer">
                <Input
                  type="file"
                  id={`upload-image-${item.id}`}
                  className="hidden"
                  onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      handleImageUpload(file, item.id)
                    }
                  }}
                />
                {uploading ? (
                  "Uploading..."
                ) : (
                  <div className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-md">
                    <ImageIcon className="w-6 h-6 text-gray-500" />
                    <p className="text-sm text-gray-500">Upload Image</p>
                  </div>
                )}
              </Label>
            )}
            {item.imageUrl && (
              <Textarea
                placeholder="Image alt text"
                value={item.altText || ""}
                onChange={(e) => updateItem(item.id, { altText: e.target.value })}
              />
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="questionText">Question Text</Label>
        <Input
          id="questionText"
          value={localContent.questionText}
          onChange={(e) => setLocalContent((prev) => ({ ...prev, questionText: e.target.value }))}
          placeholder="Enter the question or instruction"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dragDropType">Drag & Drop Type</Label>
        <Select
          value={localContent.dragDropType}
          onValueChange={(value: DragDropContent["dragDropType"]) =>
            setLocalContent((prev) => ({ ...prev, dragDropType: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="categorize">Categorize Items</SelectItem>
            <SelectItem value="sequence">Sequence/Order</SelectItem>
            <SelectItem value="match-boxes">Match to Boxes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {localContent.dragDropType === "categorize" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Categories</h3>
            <Button onClick={addCategory} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          {/* <div className="grid grid-cols-2 md:grid-cols-2 gap-4"> */}
            <Card className="gap-4 pt-4">

           <CardContent className="space-y-4">

            {localContent.categories?.map((category, index) => (
               <div key={index} className="space-y-4 p-4 border rounded-lg">
               <div className="flex gap-2 items-center">
                 <Input
                   value={category.name}
                   onChange={(e) => updateCategory(category.id, {name: e.target.value })}
                   placeholder={`Category ${index + 1} name`}
                 />
                 {(localContent.categories?.length ?? 0) > 1 && (
                   <Button type="button" 
                   variant="outline" size="sm" onClick={() => removeCategory(category.id)}>
                     <Trash2 className="h-4 w-4" />
                   </Button>
                 )}
               </div>

               <div className="space-y-2">
                 <Label>Background Image (Optional)</Label>
                 <div className="flex gap-2">
                   <Input
                     type="file"
                     accept="image/*"
                     onChange={(e) => handleCategoryImageUpload(category.id, e)}
                     className="hidden"
                     id={`category-image-upload-${index}`}
                   />
                   <Button
                     type="button"
                     variant="outline"
                     onClick={() => document.getElementById(`category-image-upload-${index}`)?.click()}
                     className="flex items-center gap-2"
                   >
                     <ImageIcon className="h-4 w-4" />
                     {category.image ? "Change Background" : "Add Background"}
                   </Button>
                   {category.image && (
                     <Button type="button" variant="outline" onClick={() => updateCategoryImage(category.id, "")}>
                       Remove
                     </Button>
                   )}
                 </div>
                 {category.image && (
                   <div className="mt-2">
                     <img
                       src={category.image || "/placeholder.svg"}
                       alt="Category background"
                       className="max-w-32 max-h-32 object-cover rounded border"
                     />
                   </div>
                 )}
               </div>
             </div>
            
            ))}
           </CardContent>
            </Card>
          {/* </div> */}
        </div> 
      )}

      {localContent.dragDropType === "match-boxes" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Answer Boxes</h3>
            <Button onClick={addBox} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Box
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localContent.boxes?.map((box) => (
              <Card key={box.id} className="p-4">
                <div className="space-y-2">
                  <Input
                    value={box.label}
                    onChange={(e) => updateBox(box.id, { label: e.target.value })}
                    placeholder="Box label (e.g., 'Sum of 2+3')"
                  />
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Correct Answers (select multiple)</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                      {localContent.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`${box.id}-${item.id}`}
                            checked={(box.correctAnswers || []).includes(item.text || "")}
                            onChange={(e) => {
                              const currentAnswers = box.correctAnswers || []
                              const itemText = item.text || ""
                              const newAnswers = e.target.checked
                                ? [...currentAnswers, itemText]
                                : currentAnswers.filter((answer) => answer !== itemText)
                              updateBox(box.id, { correctAnswers: newAnswers })
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={`${box.id}-${item.id}`} className="text-sm cursor-pointer">
                            {item.text || `Item ${localContent.items.indexOf(item) + 1}`}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {(box.correctAnswers || []).length === 0 && (
                      <p className="text-xs text-amber-600">⚠️ No correct answers selected for this box</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeBox(box.id)} className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Box
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {localContent.dragDropType === "sequence" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Sequence Layout</Label>
            <Select
              value={localContent.sequenceLayout || "vertical"}
              onValueChange={(value: "horizontal" | "vertical") =>
                setLocalContent((prev) => ({ ...prev, sequenceLayout: value }))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">Vertical List</SelectItem>
                <SelectItem value="horizontal">Horizontal Row</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Sequence Instructions:</strong> Students will drag items to arrange them in the correct order. Set
              the correct position number for each item (1, 2, 3, etc.).
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Draggable Items</h3>
          <Button onClick={addItem} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="space-y-2">
          {localContent.items.map((item, index) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-center gap-4">
                <GripVertical className="w-4 h-4 text-gray-400" />
                {renderOptionEditor(item)}

                {localContent.dragDropType === "categorize" && (
                  <Select value={item.category} onValueChange={(value) => updateItem(item.id, { category: value })}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {localContent.categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded ${category.color}`}></div>
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {localContent.dragDropType === "sequence" && (
                  <Input
                    type="number"
                    value={item.correctPosition}
                    onChange={(e) => updateItem(item.id, { correctPosition: Number.parseInt(e.target.value) })}
                    placeholder="Position"
                    className="w-24"
                  />
                )}

                <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
