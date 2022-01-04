import dayjs from 'dayjs'

export const log = (title: string, ...info: any[]) => {
  const date = dayjs().format('YYYY/MM/DD HH:mm:ss')
  if (info.length > 0) console.log(`[${date}] ${title}`, '->', ...info)
  else console.log(`[${date}] ${title}`)
}
