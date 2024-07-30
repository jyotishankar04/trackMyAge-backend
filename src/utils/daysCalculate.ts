export function calculateDays(targetDate: string) {
  // Parse the birth date string to create a Date object
  const target = new Date(targetDate);

  // Check if the birth date is valid
  if (isNaN(target.getTime())) {
    return "Error: Invalid date format";
  }

  // Get the current date
  const currentDate = new Date();

  // Calculate the difference in time
  const timeDiff = target.getTime() - currentDate.getTime();

  // Calculate the difference in days
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  return daysDiff;
}

export function calculateCompletedDays(startDateStr: string) {
  // Parse the birth date string to create a Date object
  const startDate = new Date(startDateStr);

  // Check if the birth date is valid
  if (isNaN(startDate.getTime())) {
    return "Error: Invalid date format";
  }

  // Get the current date
  const currentDate = new Date();

  // Calculate the difference in time
  const timeDiff = currentDate.getTime() - startDate.getTime();

  // Calculate the difference in days
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  return daysDiff;
}
