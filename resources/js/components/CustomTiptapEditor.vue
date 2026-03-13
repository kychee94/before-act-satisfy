<script setup>
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import { Superscript } from '@tiptap/extension-superscript'
import { Subscript } from '@tiptap/extension-subscript'
import { Highlight } from '@tiptap/extension-highlight'
import { StarterKit } from '@tiptap/starter-kit'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { Heading } from '@tiptap/extension-heading'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-font-family'
import { Color } from '@tiptap/extension-color'
import { Extension } from '@tiptap/core'
import { Link } from '@tiptap/extension-link'
import { BubbleMenu as BubbleMenuExtension } from '@tiptap/extension-bubble-menu'
import { CustomImage as Image } from '@/composables/CustomTiptapImage.js'
import { NodeSelection } from 'prosemirror-state'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { CustomTableCell as TableCell } from '@/composables/CustomTableCell.js'
import { Iframe } from '@/composables/CustomIFrame.js'
import { TableHeader } from '@tiptap/extension-table-header'
import axios from 'axios'
import { useI18n } from 'vue-i18n'

// import { CustomImageResize as ImageResize } from '@/composables/CustomImageResize.js'

const { t } = useI18n()

const FontSize = Extension.create({
  name: 'fontSize',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },
})

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    required: false,
  },
})

const headingItems = [
  { text: 'p', value: '' },
  { text: 'h1', value: 1 },
  { text: 'h2', value: 2 },
  { text: 'h3', value: 3 },
  { text: 'h4', value: 4 },
  { text: 'h5', value: 5 },
  { text: 'h6', value: 6 },
]

const emit = defineEmits(['update:modelValue'])

const editorRef = ref()
const headingLevel = ref('')
const selectedFontFamily = ref('Arial')
const selectedFontSize = ref('15px')

const fontFamilies = [
  'Arial',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
  'Times New Roman',
  'Georgia',
  'Garamond',
  'Courier New',
  'Lucida Console',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Comic Sans MS'
]

const fontSizes = [
  '10px', '11px', '12px', '13px', '14px', '15px', '16px', '18px', '20px', '24px', '32px'
]

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    Underline,
    Superscript,
    Subscript,
    TextStyle,
    FontFamily,
    FontSize,
    Color,
    TableRow,
    TableCell,
    TableHeader,
    BubbleMenuExtension,
    Image,
    Iframe,
    // ImageResize,
    Table.configure({
      resizable: true, // allows column resizing
    }),
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({
      types: [
        'heading',
        'paragraph'
      ],
    }),
    StarterKit.configure({
      heading: false,
    }),
    Heading.configure({
      levels: [1, 2, 3, 4, 5, 6],
    }),
    Placeholder.configure({ placeholder: props.placeholder ?? t('Write something here...') }),
    Link.configure({
      openOnClick: false,
    }),
  ],
  editorProps: {
    attributes: {
      class: 'editor-prose',
      autocomplete: 'off',
      autocorrect: 'off',
      autocapitalize: 'off',
      'aria-label': 'Editor content area',
    },
  },
  onUpdate() {
    if (!editor.value)
      return
    emit('update:modelValue', editor.value.getHTML())
  },
})

watch(() => props.modelValue, () => {
  const isSame = editor.value?.getHTML() === props.modelValue
  if (isSame)
    return
  editor.value?.commands.setContent(props.modelValue)
})

const toolbarRef = ref(null)

function setHeading() {
  if (!editor.value) return

  if (headingLevel.value) {
    const level = Number(headingLevel.value)
    if (editor.value.isActive('heading', { level })) {
      editor.value.chain().focus().setParagraph().run()
    } else {
      editor.value.chain().focus().setHeading({ level }).run()
    }
  } else {
    editor.value.chain().focus().setParagraph().run()
  }
}

function setFontFamily() {
  if (editor.value) {
    editor.value.chain().focus().setMark('textStyle', { fontFamily: selectedFontFamily.value }).run()
  }
}

function setFontSize() {
  if (editor.value) {
    editor.value.chain().focus().setMark('textStyle', { fontSize: selectedFontSize.value }).run()
  }
}

// Keep dropdown in sync when cursor moves
watch(
  () => editor.value,
  (newEditor) => {
    if (!newEditor) return

    newEditor.on('selectionUpdate', () => {
      const heading = newEditor.getAttributes('heading')
      headingLevel.value = heading.level || ''
    })
  },
  { immediate: true }
)

// Highlight
const menu = ref(false)
const selectedColor = ref('#F59E0B')
watch(selectedColor, (newColor) => {
  if (editor.value) {
    editor.value.chain().focus().toggleHighlight({ color: newColor }).run()
  }
  menu.value = false
})

// Font Color
const colorMenu = ref(false)
const selectedFontColor = ref('#000000')
watch(selectedFontColor, (newColor) => {
  if (editor.value) {
    editor.value.chain().focus().setColor(newColor).run()
  }

  colorMenu.value = false;
})

// Link
const linkUrl = ref()
const linkTarget = ref()
const linkDialog = ref(false)
const imageEditUrl = ref('')
const imageEditAlt = ref('')
function openLinkDialog() {
  if (!editor.value) return

  linkUrl.value = editor.value.getAttributes('link').href || ''
  linkTarget.value = editor.value.getAttributes('link').target

  linkDialog.value = true
  editor.value.chain().focus().extendMarkRange('link').run()
}

function applyLink() {
  if (!linkUrl.value) {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
  } else {
    editor.value?.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.value, target: linkTarget.value }).run()
  }
  linkDialog.value = false
}

function removeLink() {
  editor.value?.chain().focus().unsetLink().run()
  linkDialog.value = false
}

// Dialog
const imageDialog = ref(false)
watch(editor, (ed) => {
  if (!ed) return

  ed.on('selectionUpdate', () => {
    const { state } = ed
    const { selection } = state

    if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
      const nodeAt = selection.node

      imageEditUrl.value = nodeAt.attrs.src
      imageEditAlt.value = nodeAt.attrs.alt || ''
      imagePreview.value = nodeAt.attrs.src
      imageWidth.value = nodeAt.attrs.width
      imageHeight.value = nodeAt.attrs.height
      imageLink.value = nodeAt.attrs.link
      imageTarget.value = nodeAt.attrs.target

      imageDialog.value = true
    } else {
      // Not an image selection, don’t open dialog
      imageDialog.value = false
    }
  })
})

// Image
const imageUrl = ref('')
const imagePreview = ref('')
const imageWidth = ref('')
const imageHeight = ref('')
const imageAlt = ref('')
const imageLink = ref('')
const imageTarget = ref('')
const targets = [
  { text: '<not set>', value: '' },
  { text: 'Same Window (_self)', value: '_self' },
  { text: 'New Window (_blank)', value: '_blank' },
  { text: 'Topmost Window (_top)', value: '_top' },
  { text: 'Parent Window (_parent)', value: '_parent' },
]

function openImageDialog() {
  imageUrl.value = ''
  imageAlt.value = ''
  imageDialog.value = true
  imagePreview.value = ''
  imageWidth.value = ''
  imageHeight.value = ''
  imageLink.value = ''
  imageTarget.value = ''
}

// File input reference
const imageUpload = ref(null)

// Trigger hidden input
function triggerFileUpload() {
  imageUpload.value?.click()
}

// Handle file upload
function handleImageUpload(e) {
  const files = e.target?.files
  if (!files || !files.length) return

  const file = files[0]
  const reader = new FileReader()

  // upload to server
  const formData = new FormData()
  formData.append('image', file)

  axios.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  .then(response => {
    if (response.status === 200) {
      // reader.onload = (event) => {
        // imageUrl.value = event.target.result
        // imagePreview.value = event.target.result
        imageUrl.value = response.data.thumb_url
        imagePreview.value = response.data.thumb_url
      // }

      reader.readAsDataURL(file)
    }
  })
  .catch(error => {
    alert(error)
    console.error(error)
  })
}

function updatePreviewFromUrl() {
  // When typing a URL manually, also update preview
  imagePreview.value = imageUrl.value
}

// Insert image logic
function insertImage() {
  editor.value?.chain()
                .focus()
                .setImage({ 
                            src: imageUrl.value,
                            alt: imageAlt.value, 
                            width: imageWidth.value, 
                            height: imageHeight.value,
                            link: imageLink.value,
                            target: imageTarget.value
                          })
                .run()

  imageDialog.value = false
}

// Table
const tableDialog = ref(false)
const editTableDialog = ref(false)
const tableRows = ref()
const tableColumns = ref()
const tableHeaders = ref('')
const editCell = ref('')
const editRow = ref('')
const editColumn = ref('')
const bgMenu = ref()
const selectedBgColor = ref('#000000')
let selectedCellPos = null

const cells = [
  { title: 'None', value: '' },
  { title: 'Merge Right', value: 'merge_right' },
  { title: 'Merge Down', value: 'merge_down' },
  { title: 'Split', value: 'split' },
  { title: 'Background Color', value: 'bg_color' },
  { title: 'Border Color', value: 'border_color' }
]

const rows = [
  { title: 'None', value: '' },
  { title: 'Insert Before', value: 'insert_before' },
  { title: 'Insert After', value: 'insert_after' },
  { title: 'Delete', value: 'delete' },
]

const columns = [
  { title: 'None', value: '' },
  { title: 'Insert Before', value: 'insert_before' },
  { title: 'Insert After', value: 'insert_after' },
  { title: 'Delete', value: 'delete' },
]

function openTableDialog() {
  tableDialog.value = true
}

// Insert table
function insertTable() {
  editor.value?.chain()
              .focus()
              .insertTable({ 
                              rows: tableRows.value, 
                              cols: tableColumns.value, 
                              withHeaderRow: (tableHeaders.value == 'row' ? true : false )
                            })
              .run()

  tableDialog.value = false
}

function editTable() {
  if(editRow.value == 'insert_before')
    editor.value?.chain().focus().addRowBefore().run();
  else if(editRow.value == 'insert_after')
    editor.value?.chain().focus().addRowAfter().run();
  else if(editRow.value == 'delete')
    editor.value?.chain().focus().deleteRow().run();

  if(editColumn.value == 'insert_before')
    editor.value?.chain().focus().addColumnBefore().run();
  else if(editColumn.value == 'insert_after')
    editor.value?.chain().focus().addColumnAfter().run();
  else if(editColumn.value == 'delete')
    editor.value?.chain().focus().deleteColumn().run();

  editTableDialog.value = false
}

function onContextMenu(event) {
  const td = event.target.closest('td,th')
  if (!td) return

  event.preventDefault()

  // Get the ProseMirror position for the clicked cell
  selectedCellPos = editor.value?.view.posAtDOM(td, 1)

  // set selection to this cell
  editor.value?.commands.setTextSelection(selectedCellPos)

  // Open the dialog
  editTableDialog.value = true
}

watch(selectedBgColor, (newColor) => {
  if (editor.value) {
    editor.value.chain().focus().setCellAttribute('background', newColor).run()
  }

  bgMenu.value = false;
})

// IFrame
const iframeDialog = ref(false)
const iframeUrl = ref('')
const iframeWidth = ref('')
const iframeHeight = ref('')
function openIframeDialog() {
  iframeDialog.value = true
  iframeUrl.value = ''
  iframeWidth.value = ''
  iframeHeight.value = ''
}

// Insert iframe
function insertIframe() {
  if (!iframeUrl.value) {
    alert(t('Please enter a valid iframe URL.'))
    return
  }

  editor.value?.chain().focus().setIframe({
    src: iframeUrl.value,
    width: iframeWidth.value,
    height: iframeHeight.value,
  }).run()

  // Reset
  iframeDialog.value = false
  iframeUrl.value = ''
  iframeWidth.value = ''
  iframeHeight.value = ''
}

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<template>
  <div>
    <div
      v-if="editor"
      class="d-flex gap-2 py-2 px-3 flex-wrap align-center editor"
      style="border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); 
            border-radius: 6px;"
      >

      <VToolbar
        height="56"
        density="compact"
        color="transparent"
        class="flex-wrap scrollable-toolbar"
        >

        <div class="tiptap-toolbar-group">
          <!-- Action -->
          <VTooltip :text="$t('Undo')" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  :variant="editor.isActive('undo') ? 'tonal' : 'text'"
                  :color="editor.isActive('undo') ? 'primary' : 'default'"
                  @click="editor.chain().focus().undo().run()"
                >
                <VIcon icon="mdi-undo" />
              </VChip>
            </template>
          </VTooltip>
          <VTooltip :text="$t('Redo')" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  :variant="editor.isActive('redo') ? 'tonal' : 'text'"
                  :color="editor.isActive('redo') ? 'primary' : 'default'"
                  @click="editor.chain().focus().redo().run()"
                >
                <VIcon icon="mdi-redo" />
              </VChip>
            </template>
          </VTooltip>
          <!-- Text format -->
          <VTooltip :text="$t('Bold')" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  :variant="editor.isActive('bold') ? 'tonal' : 'text'"
                  :color="editor.isActive('bold') ? 'primary' : 'default'"
                  @click="editor.chain().focus().toggleBold().run()"
                >
                <VIcon icon="tabler-bold" />
              </VChip>
            </template>
          </VTooltip>
          <VTooltip :text="$t('Italic')" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  :variant="editor.isActive('italic') ? 'tonal' : 'text'"
                  :color="editor.isActive('italic') ? 'primary' : 'default'"
                  @click="editor.chain().focus().toggleItalic().run()"
                >
                <VIcon icon="tabler-italic" />
              </VChip>
            </template>
          </VTooltip>
          <VTooltip :text="$t('Underline')" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  :variant="editor.isActive('underline') ? 'tonal' : 'text'"
                  :color="editor.isActive('underline') ? 'primary' : 'default'"
                  @click="editor.chain().focus().toggleUnderline().run()"
                >
                <VIcon icon="tabler-underline" />
              </VChip>
            </template>
          </VTooltip>
          <VTooltip :text="$t('Strikethrough')" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  :variant="editor.isActive('strike') ? 'tonal' : 'text'"
                  :color="editor.isActive('strike') ? 'primary' : 'default'"
                  @click="editor.chain().focus().toggleStrike().run()"
                >
                <VIcon icon="tabler-strikethrough" />
              </VChip>
            </template>
          </VTooltip>

          <VTooltip :text="$t('Highlight')" location="bottom">
            <template #activator="{ props: tooltipProps }">
              <VMenu
                  v-model="menu"
                  :close-on-content-click="false"
                  offset-y
                >
                <template #activator="{ props: menuProps }">
                  <VChip
                    v-bind="{ ...tooltipProps, ...menuProps }"
                    size="small"
                    rounded
                    :variant="editor.isActive('highlight') ? 'tonal' : 'text'"
                    :color="editor.isActive('highlight') ? 'primary' : 'default'"
                  >
                    <VIcon icon="mdi-marker" />
                  </VChip>
                </template>

                <VCard>
                  <VColorPicker
                    v-model="selectedColor"
                    hide-canvas
                    mode="hexa"
                    show-swatches
                    swatches-max-height="150"
                  />
                </VCard>
              </VMenu>
            </template>
          </VTooltip>

          <VTooltip :text="$t('Font Color')" location="bottom">
            <template #activator="{ props: tooltipProps }">
              <VMenu
                v-model="colorMenu"
                :close-on-content-click="false"
                offset-y
              >
                <template #activator="{ props: menuProps }">
                  <VChip
                    v-bind="{ ...tooltipProps, ...menuProps }"
                    size="small"
                    rounded
                    :variant="editor.isActive('textStyle') ? 'tonal' : 'text'"
                    :color="editor.isActive('textStyle') ? 'primary' : 'default'"
                  >
                    <VIcon icon="mdi-format-color-text" />
                  </VChip>
                </template>

                <VCard>
                  <VColorPicker
                    v-model="selectedFontColor"
                    hide-canvas
                    mode="hexa"
                    show-swatches
                  />
                </VCard>
              </VMenu>
            </template>
          </VTooltip>
        </div>

        <VDivider vertical class="mx-2"/>
        
        <div class="tiptap-toolbar-group">
          <VTooltip :text="$t('Superscript')" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  :variant="editor.isActive('superscript') ? 'tonal' : 'text'"
                  :color="editor.isActive('superscript') ? 'primary' : 'default'"
                  @click="editor.chain().focus().toggleSuperscript().run()"
                >
                <VIcon icon="mdi-format-superscript" />
              </VChip>
            </template>
          </VTooltip>
          <VTooltip :text="$t('Subscript')" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  :variant="editor.isActive('subscript') ? 'tonal' : 'text'"
                  :color="editor.isActive('subscript') ? 'primary' : 'default'"
                  @click="editor.chain().focus().toggleSubscript().run()"
                >
                <VIcon icon="mdi-format-subscript" />
              </VChip>
            </template>
          </VTooltip>
        </div>

        <VDivider vertical class="mx-2"/>

        <div class="tiptap-toolbar-group">
          <!-- Link button -->
          <VTooltip :text="$t('Link')" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  :variant="editor.isActive('link') ? 'tonal' : 'text'"
                  :color="editor.isActive('link') ? 'primary' : 'default'"
                  @click="openLinkDialog"
                >
                <VIcon icon="mdi-link-variant" />
              </VChip>
            </template>
          </VTooltip>

          <!-- Link -->
          <VDialog v-model="linkDialog" max-width="500">
            <VCard>
              <VCardTitle>{{$t('Link')}}</VCardTitle>

              <VCardText>
                <!-- Link URL -->
                <VRow>
                  <VCol cols="12">
                    <VTextField
                      v-model="linkUrl"
                      label="Link URL"
                    >
                    </VTextField>
                  </VCol>
                </VRow>

                <!-- Target -->
                <VRow>
                  <VCol cols="12">
                    <VSelect
                      v-model="linkTarget"
                      :items="targets"
                      item-title="text"
                      item-value="value"
                      label="Link Target"
                      class="mb-3"
                    />
                  </VCol>
                </VRow>
              </VCardText>

              <VCardActions>
                <VSpacer />
                <VBtn color="primary" @click="applyLink">{{$t('Apply')}}</VBtn>
                <VBtn @click="linkDialog = false">{{$t('Cancel')}}</VBtn>
              </VCardActions>
            </VCard>
          </VDialog>

          <!-- Unlink button -->
          <VTooltip :text="$t('Unlink')" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  :variant="editor.isActive('unlink') ? 'tonal' : 'text'"
                  :color="editor.isActive('unlink') ? 'primary' : 'default'"
                  @click="removeLink"
                >
                <VIcon icon="tabler-unlink" />
              </VChip>
            </template>
          </VTooltip>

          <!-- Image button -->
          <VTooltip :text="$t('Image')" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  variant="text"
                  @click="openImageDialog"
                >
                <VIcon icon="mdi-image-plus" />
              </VChip>
            </template>
          </VTooltip>

          <!-- Image -->
          <VDialog v-model="imageDialog" max-width="500">
            <VCard>
              <VCardTitle>{{$t('Image')}}</VCardTitle>

              <VCardText>
                <VRow>
                  <!-- Image URL -->
                  <VCol md="10" cols="9" class="pe-0">
                    <VTextField
                      v-model="imageUrl"
                      :label="$t('Image URL')"
                      @input="updatePreviewFromUrl"
                    >
                    </VTextField>
                  </VCol>
                  <VCol md="2" cols="3" class="ps-0">
                    <VBtn
                      color="primary"
                      size="small"
                      height="38px"
                      @click="triggerFileUpload"
                    >
                      <VIcon icon="tabler-cloud-upload" class="d-sm-none" />
                      <span class="d-none d-sm-block">{{$t('Upload')}}</span>
                    </VBtn>
                    <input
                      ref="imageUpload"
                      type="file"
                      accept=".jpeg,.png,.jpg,.gif"
                      hidden
                      @change="handleImageUpload"
                    >
                  </VCol>
                </VRow>

                <!-- Alt Text -->
                <VRow>
                  <VCol cols="12">
                    <VTextField
                      v-model="imageAlt"
                      :label="$t('Alt Text')"
                    />
                  </VCol>
                </VRow>

                <!-- Link + Target -->
                <VRow>
                  <VCol cols="12">
                    <VTextField
                      v-model="imageLink"
                      :label="$t('Link URL')"
                    />
                  </VCol>
                </VRow>

                <VRow>
                  <!-- Width & Height -->
                  <VCol cols="6">
                    <VTextField
                      v-model="imageWidth"
                      :label="$t('Width (px)')"
                      class="mb-3"
                    />
                    <VTextField
                      v-model="imageHeight"
                      :label="$t('Height (px)')"
                      class="mb-3"
                    />
                    <VSelect
                      v-model="imageTarget"
                      :items="targets"
                      item-title="text"
                      item-value="value"
                      :label="$t('Link Target')"
                      class="mb-3"
                    />
                  </VCol>
                  <VCol cols="6">
                    <!-- Preview -->
                    <div v-if="imagePreview">
                      <img
                        :src="imagePreview"
                        alt="Image Preview"
                        style="max-width: 100%; max-height: 200px; display: block; border: 1px solid #ddd; border-radius: 4px;"
                      />
                    </div>
                    <div v-else class="center">
                      <img
                        src="/images/no_image.jpg"
                        alt="Image Preview"
                        style="max-width: 100%; max-height: 200px; display: block; border: 1px solid #ddd; border-radius: 4px;"
                      />
                    </div>
                  </VCol>
                </VRow>
              </VCardText>

              <VCardActions>
                <VSpacer />
                <VBtn color="primary" @click="insertImage">{{$t('Insert')}}</VBtn>
                <VBtn @click="imageDialog = false">{{$t('Cancel')}}</VBtn>
              </VCardActions>
            </VCard>
          </VDialog>

          <!-- Table button -->
          <VTooltip :text="$t('Table')" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  :variant="editor.isActive('table') ? 'tonal' : 'text'"
                  :color="editor.isActive('table') ? 'primary' : 'default'"
                  @click="openTableDialog"
                >
                <VIcon icon="tabler-table" />
              </VChip>
            </template>
          </VTooltip>

          <VTooltip :text="$t('Merge or Split')" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  variant="text"
                  color="default"
                  @click="editor.chain().focus().mergeOrSplit().run()"
                >
                <VIcon icon="tabler-layout-board-split" />
              </VChip>
            </template>
          </VTooltip>

          <VTooltip :text="$t('Cell Background Color')" location="bottom">
            <template #activator="{ props: tooltipProps }">
              <VMenu
                  v-model="bgMenu"
                  :close-on-content-click="false"
                  offset-y
                >
                <template #activator="{ props: menuProps }">
                  <VChip
                    v-bind="{ ...tooltipProps, ...menuProps }"
                    size="small"
                    rounded
                    variant="text"
                    color="default"
                  >
                    <VIcon icon="mdi-format-color-fill" />
                  </VChip>
                </template>

                <VCard>
                  <VColorPicker
                    v-model="selectedBgColor"
                    hide-canvas
                    mode="hexa"
                    show-swatches
                  />
                </VCard>
              </VMenu>
            </template>
          </VTooltip>

          <!-- IFrame -->
          <VTooltip text="IFrame" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  variant="text"
                  color="default"
                  @click="openIframeDialog"
                >
                <VIcon icon="tabler-world" />
              </VChip>
            </template>
          </VTooltip>
        </div>

        <VDialog v-model="iframeDialog" max-width="500">
          <VCard>
            <VCardTitle>IFrame</VCardTitle>

            <VCardText>
              <VRow>
                <!-- IFrame URL -->
                <VCol cols="12">
                  <VTextField
                    v-model="iframeUrl"
                    :label="$t('IFrame URL')"
                  >
                  </VTextField>
                </VCol>
              </VRow>

              <VRow>
                <!-- Width & Height -->
                <VCol cols="6">
                  <VTextField
                    v-model="iframeWidth"
                    :label="$t('Width (px)')"
                    class="mb-3"
                  />
                </VCol>
                <VCol cols="6">
                  <VTextField
                    v-model="iframeHeight"
                    :label="$t('Height (px)')"
                    class="mb-3"
                  />
                </VCol>
              </VRow>
            </VCardText>

            <VCardActions>
              <VSpacer />
              <VBtn color="primary" @click="insertIframe">{{$t('Insert')}}</VBtn>
              <VBtn @click="iframeDialog = false">{{$t('Cancel')}}</VBtn>
            </VCardActions>
          </VCard>
        </VDialog>

        <!-- Table -->
        <VDialog v-model="tableDialog" max-width="500">
          <VCard>
            <VCardTitle>{{$t('Table Properties')}}</VCardTitle>

            <VCardText>
              <VRow>
                <VCol md="6" cols="12">
                  <VTextField
                    v-model="tableRows"
                    :label="$t('Row')"
                    type="number"
                    :min="0"
                    step="1"
                  />
                </VCol>
                <VCol md="6" cols="12">
                  <VTextField
                    v-model="tableColumns"
                    :label="$t('Column')"
                    type="number"
                    :min="0"
                    step="1"
                  />
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="12">
                  <VSelect
                    v-model="tableHeaders"
                    :items="[{'value': '', 'title': $t('none')}, {'value': 'row', 'title': $t('First Row')}]"
                    item-title="title"
                    item-value="value"
                    :label="$t('Header')"
                  />
                </VCol>
              </VRow>
            </VCardText>

            <VCardActions>
              <VSpacer />
              <VBtn color="primary" @click="insertTable">{{$t('Apply')}}</VBtn>
              <VBtn @click="tableDialog = false">{{$t('Cancel')}}</VBtn>
            </VCardActions>
          </VCard>
        </VDialog>

        <VDialog v-model="editTableDialog" max-width="500">
          <VCard>
            <VCardTitle>{{$t('Table Properties')}}</VCardTitle>

            <VCardText>
              <VRow>
                <VCol md="6" cols="12">
                  <VSelect
                    v-model="editRow"
                    :items="rows"
                    item-title="title"
                    item-value="value"
                    label="Row"
                  />
                </VCol>
                <VCol md="6" cols="12">
                  <VSelect
                    v-model="editColumn"
                    :items="columns"
                    item-title="title"
                    item-value="value"
                    label="Column"
                  />
                </VCol>
              </VRow>
            </VCardText>

            <VCardActions>
              <VSpacer />
              <VBtn color="primary" @click="editTable">{{$t('Apply')}}</VBtn>
              <VBtn @click="editTableDialog = false">{{$t('Cancel')}}</VBtn>
            </VCardActions>
          </VCard>
        </VDialog>
      </VToolbar>

      <VToolbar
          height="56"
          density="compact"
          color="transparent"
          class="flex-wrap scrollable-toolbar"
        >
        <div>
          <VSelect
            v-model="headingLevel"
            :items="headingItems"
            item-title="text"
            item-value="value"
            @update:modelValue="setHeading"
            density="compact"
            style="width: 80px;"
          />
        </div>

        <!-- Font Family -->
        <div>
          <VSelect
              v-model="selectedFontFamily"
              :items="fontFamilies"
              density="compact"
              style="width: 160px;"
              @update:modelValue="setFontFamily"
            >
            <template #item="{ props, item }">
              <VListItem
                v-bind="props"
                :style="{ fontFamily: item.raw }"
              >
              </VListItem>
            </template>
          </VSelect>
        </div>

        <!-- Font Size -->
        <div>
          <VSelect
            v-model="selectedFontSize"
            :items="fontSizes"
            density="compact"
            style="width: 120px;"
            @update:modelValue="setFontSize"
          />
        </div>

        <VDivider vertical class="mx-2"/>

        <div class="tiptap-toolbar-group">
          <VTooltip :text="$t('Numbered')" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  :variant="editor.isActive('orderedList') ? 'tonal' : 'text'"
                  :color="editor.isActive('orderedList') ? 'primary' : 'default'"
                  @click="editor.chain().focus().toggleOrderedList().run()"
                >
                <VIcon icon="mdi-format-list-numbered" />
              </VChip>
            </template>
          </VTooltip>

          <VTooltip :text="$t('Bullet')" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  :variant="editor.isActive('bulletList') ? 'tonal' : 'text'"
                  :color="editor.isActive('bulletList') ? 'primary' : 'default'"
                  @click="editor.chain().focus().toggleBulletList().run()"
                >
                <VIcon icon="mdi-format-list-bulleted" />
              </VChip>
            </template>
          </VTooltip>
          
          <!-- Text align -->
          <VTooltip :text="$t('Left')" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  :variant="editor.isActive({ textAlign: 'left' }) ? 'tonal' : 'text'"
                  :color="editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'"
                  @click="editor.chain().focus().setTextAlign('left').run()"
                >
                <VIcon icon="tabler-align-left" />
              </VChip>
            </template>
          </VTooltip>

          <VTooltip :text="$t('Center')" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  :color="editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'"
                  :variant="editor.isActive({ textAlign: 'center' }) ? 'tonal' : 'text'"
                  @click="editor.chain().focus().setTextAlign('center').run()"
                >
                <VIcon icon="tabler-align-center" />
              </VChip>
            </template>
          </VTooltip>

          <VTooltip :text="$t('Right')" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  :variant="editor.isActive({ textAlign: 'right' }) ? 'tonal' : 'text'"
                  :color="editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'"
                  @click="editor.chain().focus().setTextAlign('right').run()"
                >
                <VIcon icon="tabler-align-right" />
              </VChip>
            </template>
          </VTooltip>

          <VTooltip :text="$t('Justify')" location="bottom">
            <template #activator="{ props }">
              <VChip
                  v-bind="props"
                  size="small"
                  rounded
                  :variant="editor.isActive({ textAlign: 'justify' }) ? 'tonal' : 'text'"
                  :color="editor.isActive({ textAlign: 'justify' }) ? 'primary' : 'default'"
                  @click="editor.chain().focus().setTextAlign('justify').run()"
                >
                <VIcon icon="tabler-align-justified" />
              </VChip>
            </template>
          </VTooltip>

          <VDivider vertical class="mx-2"/>      
        </div>
      </VToolbar>

      <VDivider />

      <EditorContent
        ref="editorRef"
        :editor="editor"
        class="editor-content"
        @contextmenu="onContextMenu" 
      />
    </div>
  </div>
</template>

<style lang="scss">
.editor-content{
  width: 100%
}

.ProseMirror {
  padding: 0.5rem;
  min-block-size: 15vh;
  outline: none;
  font-family: inherit;
  font-size: inherit;

  p {
    margin-block-end: 0;
  }

  p.is-editor-empty:first-child::before {
    block-size: 0;
    color: #adb5bd;
    content: attr(data-placeholder);
    float: inline-start;
    pointer-events: none;
  }
}

.ProseMirror p div:has(.float-left) {
  float: left;
  margin-right: 5px;
}

.ProseMirror p div:has(.float-right) {
  float: right;
  margin-left: 5px;
}

.ProseMirror p div:has(.float-none) {
  float: none;
  margin: 0;
}
.ProseMirror table {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
}

.ProseMirror table, 
.ProseMirror th, 
.ProseMirror td {
  border: 1px solid #ccc;
  word-wrap: break-word;  /* Allows long words to break */
  white-space: normal;    /* Allows text to wrap to next line */
  overflow-wrap: break-word; /* Better support for wrapping */
}

.ProseMirror th, 
.ProseMirror td {
  padding: 8px;
}

.selectedCell {
  position: relative;
}

.selectedCell::after {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(200, 200, 255, 0.4);
  pointer-events: none;
}

.scrollable-toolbar {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch; /* Smooth scroll on iOS */
}

.v-toolbar__content{
  overflow-x: auto !important;
  white-space: nowrap;
  scrollbar-width: thin;
  scrollbar-color: var(--v-theme-primary) transparent; /* Firefox */
}

.v-toolbar__content::-webkit-scrollbar {
  height: 6px;
  opacity: 0;
  transition: opacity 0.3s;
}

.v-toolbar__content:hover::-webkit-scrollbar {
  opacity: 1;
}

.v-toolbar__content::-webkit-scrollbar-track {
  background: transparent;
}

.v-toolbar__content::-webkit-scrollbar-thumb {
  background-color: var(--v-theme-primary);
  border-radius: 3px;
}

/* Firefox */
.v-toolbar__content {
  scrollbar-width: none; /* default hidden */
}
.v-toolbar__content:hover {
  scrollbar-width: thin;
  scrollbar-color: var(--v-theme-primary) transparent;
}

.bubble-menu {
  z-index: 9999;
}
</style>
