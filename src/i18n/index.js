import { createI18n } from 'vue-i18n'
import tool from '@/utils/tool'

const defaultSetting = {
  language: 'zh_CN'
}

const setting = tool.local.get('setting') || defaultSetting

const loadMessages = (locale) => {
  const globMap = {
    zh_CN: import.meta.glob('./zh_CN/**/*.js', { eager: true }),
    en: import.meta.glob('./en/**/*.js', { eager: true }),
    zh_TW: import.meta.glob('./zh_TW/**/*.js', { eager: true }),
  }

  const generateLanguage = (fileNames, fileContent, generateLanguages = {}) => {
    const fileName = fileNames.shift()
    if (fileNames.length > 0) {
      if (typeof generateLanguages[fileName] == 'undefined') {
        generateLanguages[fileName] = {}
      }
      generateLanguages[fileName] = generateLanguage(fileNames, fileContent, generateLanguages[fileName])
    } else {
      generateLanguages[fileName] = fileContent
    }
    return generateLanguages
  }

  const files = globMap[locale]
  const messages = {}
  for (let path in files) {
    // Strip Vite HMR query strings (e.g. "./zh_CN/sys.js?t=123456") before matching
    const cleanPath = path.split('?')[0]
    const names = cleanPath.match(/([A-Za-z0-9_]+)/g)
    names.shift()
    names.pop()
    if (files[path].default) {
      generateLanguage(names, files[path].default, messages)
    }
  }
  return messages
}

const allMessages = {}
for (const locale of ['zh_CN', 'en', 'zh_TW']) {
  allMessages[locale] = loadMessages(locale)
}

const i18n = createI18n({
  locale: setting.language,
  legacy: false,
  globalInjection: true,
  fallbackLocale: 'zh_CN',
  messages: allMessages,
  silentTranslationWarn: true,
  missingWarn: false,
  silentFallbackWarn: true,
  fallbackWarn: false,
})

export function setI18nLanguage(locale) {
  i18n.global.locale.value = locale
  document.querySelector('html').setAttribute('lang', locale)
  return locale
}

export default i18n
