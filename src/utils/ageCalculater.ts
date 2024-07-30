export function calculateAge(birthDateStr: string) {
  // Parse the birth date string to create a Date object
  const birthDate = new Date(birthDateStr);

  // Check if the birth date is valid
  if (isNaN(birthDate.getTime())) {
    return "Error: Invalid date format";
  }

  // Get the current date
  const currentDate = new Date();

  // Calculate the age
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = currentDate.getMonth() - birthDate.getMonth();

  // Adjust age if the current month is before the birth month
  // or it's the birth month but the current date is before the birth date
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  // Format the output string
  return age;
}

export function calculateSpanAge(birthDateStr: string, endDateStr: string) {
  // Parse the birth date string to create a Date object
  const birthDate = new Date(birthDateStr);
  const endDate = new Date(endDateStr);

  // Check if the birth date is valid
  if (isNaN(birthDate.getTime())) {
    return "Error: Invalid date format";
  }

  // Calculate the age
  let age = endDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = endDate.getMonth() - birthDate.getMonth();

  // Adjust age if the current month is before the birth month
  // or it's the birth month but the current date is before the birth date
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && endDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  // Format the output string
  return age;
}
// Example usage
