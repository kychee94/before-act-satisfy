import { isEmpty, isEmptyArray, isNullOrUndefined } from './helpers'
import { createI18n } from 'vue-i18n'

// Import translation files
import en from '/resources/lang/en.json'
import zh from '/resources/lang/zh.json'
import ms from '/resources/lang/ms.json'

const i18n = createI18n({
  legacy: false, // This is required for Vue 3
  locale: 'en', // Set the default language
  messages: {
    en,
    zh,
    ms
  }
})

// 👉 Required Validator
export const requiredValidator = value => {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false)
    return i18n.global.t('validation.required')
  
  return !!String(value).trim().length || i18n.global.t('validation.required')
}

// 👉 Email Validator
export const emailValidator = value => {
  if (isEmpty(value))
    return true
  const re = /^(?:[^<>()[\]\\.,;:\s@"]+(?:\.[^<>()[\]\\.,;:\s@"]+)*|".+")@(?:\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]|(?:[a-z\-\d]+\.)+[a-z]{2,})$/i
  if (Array.isArray(value))
    return value.every(val => re.test(String(val))) || i18n.global.t('validation.email')
  
  return re.test(String(value)) || i18n.global.t('validation.email')
}

// 👉 Password Validator
export const passwordValidator = password => {
  const regExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{8,}/
  const validPassword = regExp.test(password)
  
  return validPassword || i18n.global.t('validation.password')
}

// 👉 Confirm Password Validator
export const confirmedValidator = (value, target) => value === target || i18n.global.t('validation.confirm_password')

// 👉 Between Validator
export const betweenValidator = (value, min, max) => {
  const valueAsNumber = Number(value)
  
  return (Number(min) <= valueAsNumber && Number(max) >= valueAsNumber) || i18n.global.t('validation.between.numeric', { min, max })
}

// 👉 Integer Validator
export const integerValidator = value => {
  if (isEmpty(value))
    return true
  if (Array.isArray(value))
    return value.every(val => /^-?\d+$/.test(String(val))) || i18n.global.t('validation.integer')
  
  return /^-?\d+$/.test(String(value)) || i18n.global.t('validation.integer')
}

// 👉 Regex Validator
export const regexValidator = (value, regex) => {
  if (isEmpty(value))
    return true
  let regeX = regex
  if (typeof regeX === 'string')
    regeX = new RegExp(regeX)
  if (Array.isArray(value))
    return value.every(val => regexValidator(val, regeX))
  
  return regeX.test(String(value)) || i18n.global.t('validation.regex')
}

// 👉 Alpha Validator
export const alphaValidator = value => {
  if (isEmpty(value))
    return true
  
  return /^[A-Z]*$/i.test(String(value)) || i18n.global.t('validation.alpha')
}

// 👉 URL Validator
export const urlValidator = value => {
  if (isEmpty(value))
    return true
  const re = /^https?:\/\/[^\s$.?#].\S*$/
  
  return re.test(String(value)) || i18n.global.t('validation.url')
}

// 👉 Length Validator
export const lengthValidator = (value, length) => {
  if (isEmpty(value))
    return true
  
  return String(value).length === length || i18n.global.t('validation.length', {length})
}

// 👉 Alpha-dash Validator
export const alphaDashValidator = value => {
  if (isEmpty(value))
    return true
  const valueAsString = String(value)
  
  return /^[\w-]*$/.test(valueAsString) || i18n.global.t('validation.alpha-dash')
}
