export const dateFormat = (date) => {
  const options = {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }

  const formatedDate = new Date(date).toLocaleString('en-US', options)

  return formatedDate;
}