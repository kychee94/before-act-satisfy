import Image from '@tiptap/extension-image'

export const CustomImage = Image.extend({
  inline: true,
  group: 'inline',
  draggable: true,
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) {
            return {}
          }
          return {
            width: attributes.width,
          }
        },
      },
      height: {
        default: null,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes.height) {
            return {}
          }
          return {
            height: attributes.height,
          }
        },
      },
      link: {
        default: null,
        parseHTML: element => {
          // If inside <a>, get href from parent
          return element.parentElement?.tagName === 'A'
            ? element.parentElement.getAttribute('href')
            : null
        },
      },
      target: {
        default: '_blank',
        parseHTML: element => {
          return element.parentElement?.tagName === 'A'
            ? element.parentElement.getAttribute('target')
            : '_blank'
        },
      },
    }
  },
  renderHTML({ HTMLAttributes }) {
    const { link, target, ...imgAttrs } = HTMLAttributes

    const img = ['img', imgAttrs]

    if (link) {
      return ['a',
        { tiptap_saved_href: link, target: target || '_blank' },
        img
      ]
    }

    return img
  },
})
