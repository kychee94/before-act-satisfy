export function imageUploads(form) {
  const original = ref(structuredClone(JSON.parse(JSON.stringify(form.data())))) // deep copy
  const local = ref(structuredClone(JSON.parse(JSON.stringify(form.data()))))

  const changeImage = (event, key) => {
    const fileReader = new FileReader()
    const { files } = event.target

    if (files && files.length > 0) {

      form[key] = files[0]

      fileReader.readAsDataURL(files[0])
      fileReader.onload = () => {
        if (typeof fileReader.result === 'string') {
          local.value[key] = fileReader.result
        }
      }

      // 🔁 Reset input value so same file can be selected again later
      event.target.value = ''
    }
  }

  // Reset a single field
  const removeImage = key => {
    form[key] = null
    local.value[key] = null

    // clear hidden file input
    const inputRef = local.value[`${key}Input`]
    if (inputRef) {
      form[`${key}Input`] = null
      local.value[`${key}Input`] = null
    }
  }

  // key {'pc': {'en', 'zh', 'ms'}}
  const changeImageWithLayoutWithLanguage = (event, key, layout, lang) => {
    const fileReader = new FileReader()
    const { files } = event.target

    if (files && files.length > 0) {

      form[key][layout][lang] = files[0]

      fileReader.readAsDataURL(files[0])
      fileReader.onload = () => {
        if (typeof fileReader.result === 'string') {
          local.value[key][layout][lang] = fileReader.result
        }
      }

      // 🔁 Reset input value so same file can be selected again later
      event.target.value = ''
    }
  }

  const removeImageWithLayoutWithLanguage = (key, layout, lang) => {
    form[key][layout][lang] = null
    local.value[key][layout][lang] = null

    // clear hidden file input
    const inputRef = local.value[`${key}Input`][layout][lang]
    if (inputRef) {
      form[`${key}Input`][layout][lang] = null
      local.value[`${key}Input`][layout][lang] = null
    }
  }

  return {
    local,
    changeImage,
    removeImage,
    changeImageWithLayoutWithLanguage,
    removeImageWithLayoutWithLanguage,
  }
}
