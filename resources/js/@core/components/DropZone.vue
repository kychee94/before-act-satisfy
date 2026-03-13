<script setup>
import {
  useDropZone,
  useFileDialog,
  useObjectUrl,
} from '@vueuse/core'
import axios from 'axios'

const dropZoneRef = ref()
const fileData = ref([])
const { open, onChange } = useFileDialog({ accept: 'image/*' })
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
  type: {
    type: String,
  }
})

const getFileName = url => {
  if (typeof url === 'string') {
    return url.split('/').pop()
  }
  return ''
}

onMounted(() => {
  if (props.images?.length) {
    props.images.forEach(url => {
      const name = getFileName(url.image)

      fileData.value.push({ 
        name: name,
        file: { name },
        thumburl: url.image,
        url: url.image, 
        isUploaded: true })
    })
  }
})

async function uploadImage(file) {
  const formData = new FormData()
  formData.append('image', file)

  try {
    const response = await axios.post('/upload/dropzone/image/'+props.type, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // return thumbnail url
    const thumburl = response.data.thumb_url
    const url = response.data.url

    fileData.value.push({
      file,
      thumburl,
      url,
      isUploaded: true,
    })
  } catch (error) {
    console.error('Upload failed', error)
    alert(t('Image upload failed.'))
  }
}

async function removeFile(index) {
  const file = fileData.value[index]

  // Optional: check if it's already uploaded
  if (file.isUploaded === true) {
    try {
      await axios.delete(`/delete/dropzone/image/`+props.type,{
        data: {
          path: file.url
        }
      }) // Adjust path as needed
      // Remove from frontend
      fileData.value.splice(index, 1)

    } catch (error) {
      console.error('File delete failed:', error)
      return
    }
  }
}

async function onDrop(DroppedFiles) {
  for (const file of DroppedFiles) {
    if (!file.type.startsWith('image/')) {
      alert(t('Only image files are allowed'))
      continue
    }

    await uploadImage(file)
  }
}

onChange(async selectedFiles => {
  if (!selectedFiles) return

  for (const file of selectedFiles) {
    if (!file.type.startsWith('image/')) {
      alert(t('Only image files are allowed'))
      continue
    }

    await uploadImage(file)
  }
})

useDropZone(dropZoneRef, onDrop)

const emit = defineEmits(['update:files'])

watch(fileData, newVal => {
  emit('update:files', newVal)
}, { deep: true })
</script>

<template>
  <div class="flex">
    <div class="w-full h-auto relative">
      <div
        ref="dropZoneRef"
        class="cursor-pointer"
        @click="() => open()"
      >
        <div
          v-if="fileData.length === 0"
          class="d-flex flex-column justify-center align-center gap-y-2 pa-12 drop-zone rounded"
        >
          <VIcon icon="tabler-upload" />
          <h4 class="text-h4">
            {{t('Drag and drop your image here.')}}
          </h4>
          <span class="text-disabled">or</span>

          <VBtn
            variant="tonal"
            size="small"
          >
            {{t('Browse Images')}}
          </VBtn>
        </div>

        <div
          v-else
          class="d-flex justify-center align-center gap-3 pa-8 drop-zone flex-wrap"
        >
          <VRow class="match-height w-100">
            <template
              v-for="(item, index) in fileData"
              :key="index"
            >
              <VCol
                cols="12"
                sm="4"
              >
                <VCard :ripple="false">
                  <VCardText
                    class="d-flex flex-column"
                    @click.stop
                  >
                    <VImg
                      :src="item.thumburl"
                      width="200px"
                      height="150px"
                      class="w-100 mx-auto"
                    />
                    <div class="mt-2">
                      <span class="clamp-text text-wrap">
                        {{ item.file.name }}
                      </span>
                    </div>
                  </VCardText>
                  <VCardActions>
                    <VBtn
                      variant="text"
                      block
                      @click.stop="removeFile(index)"
                    >
                      {{t('Remove File')}}
                    </VBtn>
                  </VCardActions>
                </VCard>
              </VCol>
            </template>
          </VRow>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.drop-zone {
  border: 1px dashed rgba(var(--v-theme-on-surface), var(--v-border-opacity));
}
</style>
