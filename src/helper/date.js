import dayjs from 'dayjs'

export function phpToDayjsFormat(phpFormat) {
  return phpFormat
    .replace(/Y/g, 'YYYY')
    .replace(/m/g, 'MM')
    .replace(/d/g, 'DD')
    .replace(/H/g, 'HH')
    .replace(/i/g, 'mm')
    .replace(/s/g, 'ss')
}

export function formatDate(date, phpFormat = 'Y-m-d H:i:s') {
  if (!date) return ''
  const jsFormat = phpToDayjsFormat(phpFormat)
  return dayjs(date).format(jsFormat)
}