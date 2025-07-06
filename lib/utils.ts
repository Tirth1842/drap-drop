import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const upload = async (file: File): Promise<string> => {
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve(`/images/uploads/${file.name}`)
  //   }, 500)
  // })
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
