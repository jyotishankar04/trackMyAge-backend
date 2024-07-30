export function getTargetStatistics(startDateStr: string, endDateStr: string) {
  // Parse the input date strings to create Date objects
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Check if the dates are valid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return "Error: Invalid date format";
  }

  const currentDate = new Date();
  const remainingDays =
    Math.floor(
      (endDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000)
    ) + 1;

  // Format the output object
  return {
    remainingDays: remainingDays,
  };
}
