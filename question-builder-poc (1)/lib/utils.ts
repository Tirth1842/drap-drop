import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const upload = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`/images/uploads/${file.name}`)
    }, 500)
  })
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
