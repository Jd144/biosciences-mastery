import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`
}

export const PRICES = {
  FULL: 99900, // ₹999 in paise
  SINGLE_SUBJECT: 44900, // ₹449 in paise
} as const
