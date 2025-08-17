export const formatDate = (dateString) => {
  if (!dateString) {
    return 'Date not available'
  }

  const date = new Date(dateString)

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }

  const options = { year: "numeric", month: "long", day: "numeric" }
  const formattedDate = date.toLocaleDateString("en-US", options)

  const hour = date.getHours()
  const minutes = date.getMinutes()
  const period = hour >= 12 ? "PM" : "AM"
  const formattedTime = `${hour % 12}:${minutes
    .toString()
    .padStart(2, "0")} ${period}`

  return `${formattedDate} | ${formattedTime}`
}