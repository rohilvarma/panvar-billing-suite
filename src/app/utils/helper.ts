import { DatePipe } from "@angular/common";
import { CurrencyPipe } from '@angular/common';

export const formatDate = (date: Date): string => {
  const formattedDate = new DatePipe('en-US').transform(date, 'MMM dd yyyy');
  return formattedDate ?? '';
}

export const counterArray = (len: number): number[] => {
  return Array(len).fill(1);
}

export const formatAmount = (amount: number): string => {
  return new CurrencyPipe('en-IN').transform(amount, 'INR', 'symbol', '1.2-2') ?? '';
}