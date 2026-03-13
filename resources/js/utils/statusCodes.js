// resources/js/utils/statusCodes.js
import { i18n } from '@/i18n.js'

// Agent
export const AGENT_STATUS = {
  ACTIVE: 1,
  BANNED: 2,
  INACTIVE: 0,

  label(status) {
    switch (status) {
      case AGENT_STATUS.ACTIVE:
        return i18n.global.t('Active')
      case AGENT_STATUS.INACTIVE:
        return i18n.global.t('Inactive')
      case AGENT_STATUS.BANNED:
        return i18n.global.t('Banned')
      default:
        return i18n.global.t('Unknown')
    }
  },

  color(status) {
    switch (status) {
      case AGENT_STATUS.ACTIVE:
        return 'success'
      case AGENT_STATUS.INACTIVE:
        return 'error'
      case AGENT_STATUS.BANNED:
        return 'primary'
      default:
        return 'grey'
    }
  },
}

// Member
export const MEMBER_STATUS = {
  ACTIVE: 1,
  BANNED: 2,
  INACTIVE: 0,

  label(status) {
    switch (status) {
      case MEMBER_STATUS.ACTIVE:
        return i18n.global.t('Active')
      case MEMBER_STATUS.INACTIVE:
        return i18n.global.t('Inactive')
      case MEMBER_STATUS.BANNED:
        return i18n.global.t('Banned')
      default:
        return i18n.global.t('Unknown')
    }
  },

  color(status) {
    switch (status) {
      case MEMBER_STATUS.ACTIVE:
        return 'success'
      case MEMBER_STATUS.INACTIVE:
        return 'error'
      case MEMBER_STATUS.BANNED:
        return 'primary'
      default:
        return 'grey'
    }
  },
}

// Product
export const PRODUCT_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,

  label(status) {
    switch (status) {
      case PRODUCT_STATUS.ACTIVE:
        return i18n.global.t('Active')
      case PRODUCT_STATUS.INACTIVE:
        return i18n.global.t('Inactive')
      default:
        return i18n.global.t('Unknown')
    }
  },

  color(status) {
    switch (status) {
      case PRODUCT_STATUS.ACTIVE:
        return 'success'
      case PRODUCT_STATUS.INACTIVE:
        return 'error'
      default:
        return 'grey'
    }
  },
}

// Category
export const CATEGORY_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,

  label(status) {
    switch (status) {
      case CATEGORY_STATUS.ACTIVE:
        return i18n.global.t('Active')
      case CATEGORY_STATUS.INACTIVE:
        return i18n.global.t('Inactive')
      default:
        return i18n.global.t('Unknown')
    }
  },

  color(status) {
    switch (status) {
      case CATEGORY_STATUS.ACTIVE:
        return 'success'
      case CATEGORY_STATUS.INACTIVE:
        return 'error'
      default:
        return 'grey'
    }
  },
}

// Brand
export const BRAND_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,

  label(status) {
    switch (status) {
      case BRAND_STATUS.ACTIVE:
        return i18n.global.t('Active')
      case BRAND_STATUS.INACTIVE:
        return i18n.global.t('Inactive')
      default:
        return i18n.global.t('Unknown')
    }
  },

  color(status) {
    switch (status) {
      case CATEGORY_STATUS.ACTIVE:
        return 'success'
      case CATEGORY_STATUS.INACTIVE:
        return 'error'
      default:
        return 'grey'
    }
  },
}

// Order
export const ORDER_STATUS = {
  PENDING: 0,
  ACTIVE: 1,
  FAILED: 2,
  PROCESSING: 3,
  SHIPPED: 4,
  DELIVERED: 5,

  label(status) {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return i18n.global.t('Pending')
      case ORDER_STATUS.ACTIVE:
        return i18n.global.t('Active')
      case ORDER_STATUS.PROCESSING:
        return i18n.global.t('Processing')
      case ORDER_STATUS.SHIPPED:
        return i18n.global.t('Shipped')
      case ORDER_STATUS.DELIVERED:
        return i18n.global.t('Delivered')
      case ORDER_STATUS.FAILED:
        return i18n.global.t('Failed')
      default:
        return i18n.global.t('Unknown')
    }
  },

  color(status) {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return 'warning'
      case ORDER_STATUS.ACTIVE:
        return 'info'
      case ORDER_STATUS.PROCESSING:
        return 'primary'
      case ORDER_STATUS.SHIPPED:
        return 'default'
      case ORDER_STATUS.DELIVERED:
        return 'success'
      case ORDER_STATUS.FAILED:
        return 'error'
      default:
        return 'grey'
    }
  },
}

// Page
export const PAGE_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
  DELETED: -999,

  label(status) {
    switch (status) {
      case PAGE_STATUS.ACTIVE:
        return i18n.global.t('Active')
      case PAGE_STATUS.INACTIVE:
        return i18n.global.t('Inactive')
      case PAGE_STATUS.DELETED:
        return i18n.global.t('Deleted')
      default:
        return i18n.global.t('Unknown')
    }
  },

  color(status) {
    switch (status) {
      case PAGE_STATUS.ACTIVE:
        return 'success'
      case PAGE_STATUS.INACTIVE:
        return 'error'
      case PAGE_STATUS.DELETED:
        return 'grey'
      default:
        return 'grey'
    }
  },
}

// Slideshow
export const SLIDESHOW_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
  DELETED: -999,

  label(status) {
    switch (status) {
      case SLIDESHOW_STATUS.ACTIVE:
        return i18n.global.t('Active')
      case SLIDESHOW_STATUS.INACTIVE:
        return i18n.global.t('Inactive')
      case SLIDESHOW_STATUS.DELETED:
        return i18n.global.t('Deleted')
      default:
        return i18n.global.t('Unknown')
    }
  },

  color(status) {
    switch (status) {
      case SLIDESHOW_STATUS.ACTIVE:
        return 'success'
      case SLIDESHOW_STATUS.INACTIVE:
        return 'error'
      case SLIDESHOW_STATUS.DELETED:
        return 'grey'
      default:
        return 'grey'
    }
  },
}

// User
export const USER_STATUS = {
  ACTIVE: 1,
  INACTIVE : 0,
  BANNED: 2,

  label(status) {
    switch (status) {
      case USER_STATUS.ACTIVE:
        return i18n.global.t('Active')
      case USER_STATUS.INACTIVE:
        return i18n.global.t('Inactive')
      case USER_STATUS.BANNED:
        return i18n.global.t('Banned')
      default:
        return i18n.global.t('Unknown')
    }
  },

  color(status) {
    switch (status) {
      case USER_STATUS.ACTIVE:
        return 'success'
      case USER_STATUS.INACTIVE:
        return 'warning'
      case USER_STATUS.BANNED:
        return 'error'
      default:
        return 'grey'
    }
  },
}

// Exchange
export const EXCHANGE_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  FAILED: 2,

  label(status) {
    switch (status) {
      case EXCHANGE_STATUS.PENDING:
        return i18n.global.t('Pending')
      case EXCHANGE_STATUS.APPROVED:
        return i18n.global.t('Approved')
      case EXCHANGE_STATUS.FAILED:
        return i18n.global.t('Failed')
      default:
        return i18n.global.t('Unknown')
    }
  },

  color(status) {
    switch (status) {
      case EXCHANGE_STATUS.PENDING:
        return 'warning'
      case EXCHANGE_STATUS.APPROVED:
        return 'success'
      case EXCHANGE_STATUS.FAILED:
        return 'error'
      default:
        return 'grey'
    }
  },
}

// Voucher
export const VOUCHER_STATUS = {
  INACTIVE: 0,
  ACTIVE: 1,
  EXPIRED: 2,
  USED: 3,

  label(status) {
    switch (status) {
      case VOUCHER_STATUS.ACTIVE:
        return i18n.global.t('Active')
      case VOUCHER_STATUS.INACTIVE:
        return i18n.global.t('Inactive')
      case VOUCHER_STATUS.EXPIRED:
        return i18n.global.t('Expired')
      case VOUCHER_STATUS.USED:
        return i18n.global.t('Used')
      default:
        return i18n.global.t('Unknown')
    }
  },

  color(status) {
    switch (status) {
      case VOUCHER_STATUS.ACTIVE:
        return 'success'
      case VOUCHER_STATUS.INACTIVE:
        return 'default'
      case VOUCHER_STATUS.EXPIRED:
        return 'error'
      case VOUCHER_STATUS.USED:
        return 'primary'
      default:
        return 'grey'
    }
  },
}
