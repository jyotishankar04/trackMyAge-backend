export function dateToDatetimeConverter(dateStr: string) {
  // Parse the date string to create a Date object
  const date = new Date(dateStr);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.log("Error: Invalid date format");
    return null;
  }

  return date;
}
