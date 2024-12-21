import { DatePipe } from "@angular/common";

export const formatDate = (date: Date): string => {
  const formattedDate = new DatePipe('en-US').transform(date, 'MMM dd yyyy');
  return formattedDate ?? '';
}