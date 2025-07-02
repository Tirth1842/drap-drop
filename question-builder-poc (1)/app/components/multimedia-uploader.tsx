"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, ImageIcon, Video, Volume2, FileText, X } from "lucide-react"

interface MediaItem {
  type: "image" | "video" | "audio"
  url: string
  file?: File
  name: string
}

interface MultimediaUploaderProps {
  onMediaSelect: (media: MediaItem) => void
  acceptedTypes?: string[]
  maxSize?: number // in MB
}

export function MultimediaUploader({
  onMediaSelect,
  acceptedTypes = ["image/*", "video/*", "audio/*"],
  maxSize = 10,
}: MultimediaUploaderProps) {
  const [dragOver, setDragOver] = useState(false)
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`)
        return
      }

      const url = URL.createObjectURL(file)
      const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "audio"

      const mediaItem: MediaItem = {
        type,
        url,
        file,
        name: file.name,
      }

      setUploadedMedia((prev) => [...prev, mediaItem])
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeMedia = (index: number) => {
    setUploadedMedia((prev) => prev.filter((_, i) => i !== index))
  }

  const renderMediaPreview = (media: MediaItem, index: number) => (
    <Card key={index} className="relative">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {media.type === "image" && (
              <ImageIcon
                src={media.url || "/placeholder.svg"}
                alt={media.name}
                className="w-16 h-16 object-cover rounded"
              />
            )}
            {media.type === "video" && (
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                <Video className="w-6 h-6 text-gray-600" />
              </div>
            )}
            {media.type === "audio" && (
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-gray-600" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{media.name}</p>
            <p className="text-xs text-gray-500 capitalize">{media.type}</p>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={() => onMediaSelect(media)} className="text-xs">
              Use
            </Button>
            <Button variant="ghost" size="sm" onClick={() => removeMedia(index)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="url">From URL</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
            <p className="text-sm text-gray-500 mb-4">Supports images, videos, and audio files up to {maxSize}MB</p>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(",")}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Media URL</Label>
              <Input placeholder="https://example.com/image.jpg" />
            </div>
            <div className="space-y-2">
              <Label>Media Type</Label>
              <select className="w-full p-2 border rounded">
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
              </select>
            </div>
            <Button className="w-full">Add from URL</Button>
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <div className="text-center text-gray-500 py-8">
            <FileText className="w-12 h-12 mx-auto mb-4" />
            <p>Media library coming soon...</p>
            <p className="text-sm">Store and reuse your uploaded media files</p>
          </div>
        </TabsContent>
      </Tabs>

      {uploadedMedia.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Uploaded Media</Label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploadedMedia.map((media, index) => renderMediaPreview(media, index))}
          </div>
        </div>
      )}
    </div>
  )
}
