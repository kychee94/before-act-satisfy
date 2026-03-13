import { useI18n } from 'vue-i18n'

export const paginationMeta = (options, total) => {
  const { t } = useI18n()
  
  const start = (options.page - 1) * options.itemsPerPage + 1
  const end = Math.min(options.page * options.itemsPerPage, total)
  
  return t('pagination.showing', {
    start: total === 0 ? 0 : start,
    end: end,
    total: total
  })
}