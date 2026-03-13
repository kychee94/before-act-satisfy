import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { mergeCells, splitCell, CellSelection, TableMap } from 'prosemirror-tables'

export const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      background: {
        default: null,
        parseHTML: element => element.getAttribute('data-background'),
        renderHTML: attributes => {
          if (!attributes.background) return {}
          return {
            'data-background': attributes.background,
            style: `background-color: ${attributes.background}`,
          }
        },
      },
    }
  }
})
