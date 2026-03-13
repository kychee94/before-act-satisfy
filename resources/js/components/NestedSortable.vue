<script setup>
import { ref, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
  depth: {
    type: Number,
    default: 0,
  },
  maxDepth: {
    type: Number,
    default: 10,
  },
})

const expandedItems = ref(new Set())

/* -----------------------------
 Ensure children arrays exist
------------------------------ */
const normalizeTree = (items) => {
  if (!Array.isArray(items)) return
  items.forEach(item => {
    if (!Array.isArray(item.children)) {
      item.children = []
    }
    if (item.children.length) {
      expandedItems.value.add(item.uuid)
      normalizeTree(item.children)
    }
  })
}

onMounted(() => {
  normalizeTree(props.modelValue)
})

/* -----------------------------
 Expand / Collapse
------------------------------ */
const toggleExpand = (uuid) => {
  expandedItems.value.has(uuid)
    ? expandedItems.value.delete(uuid)
    : expandedItems.value.add(uuid)
}

const isExpanded = (uuid) => expandedItems.value.has(uuid)
</script>

<template>
  <div class="nested-sortable">
    <draggable
      :list="modelValue"
      item-key="uuid"
      class="draggable-dropzone"
      :group="{ name: 'nested-categories', pull: true, put: true }"
      handle=".drag-handle"
      animation="200"
      ghost-class="ghost-item"
    >
      <template #item="{ element }">
        <div class="sortable-item" :class="`depth-${depth}`">
          <!-- ITEM HEADER -->
          <div class="item-content">
            <VIcon class="drag-handle" size="20">
              tabler-grip-vertical
            </VIcon>

            <span class="item-name">
              {{ element.name }}
            </span>

            <VChip
              v-if="element.children.length"
              size="x-small"
              color="primary"
              variant="tonal"
            >
              {{ element.children.length }}
            </VChip>

            <VBtn
              v-if="depth < maxDepth"
              icon
              size="small"
              variant="text"
              @click.stop="toggleExpand(element.uuid)"
            >
              <VIcon size="20">
                {{ isExpanded(element.uuid)
                  ? 'tabler-chevron-up'
                  : 'tabler-chevron-down' }}
              </VIcon>
            </VBtn>
          </div>

          <!-- NESTED AREA (always mounted) -->
          <div
            class="nested-container"
            :class="{ collapsed: !isExpanded(element.uuid) }"
          >
            <NestedSortable
              v-if="depth < maxDepth"
              :model-value="element.children"
              :depth="depth + 1"
              :max-depth="maxDepth"
            />

            <!-- EMPTY DROP HINT -->
            <div
              v-if="element.children.length === 0"
              class="empty-message"
            >
              {{t('Drop items here')}}
            </div>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<style scoped>
/* REQUIRED: empty list drop zone */
.draggable-dropzone {
  min-height: 30px;
}

/* ITEM */
.sortable-item {
  margin: 6px 0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: linear-gradient(to bottom,  #ffffff 0%,#f6f6f6 47%,#ededed 100%);
}

.item-content {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 14px;
  color: #5E6278;
}

.drag-handle {
  cursor: grab;
  color: #888;
}

.item-name {
  font-weight: 500;
  flex: 1;
}

/* NESTED */
.nested-container {
  margin-left: 28px;
  padding-left: 16px;
  border-left: 2px solid #e3f2fd;
  transition: all 0.25s ease;
}

.nested-container.collapsed {
  max-height: 0;
  padding: 0;
  margin: 0;
  border: none;
  overflow: hidden;
}

/* EMPTY DROP MESSAGE */
.empty-message {
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 13px;
  pointer-events: none;
}

/* GHOST */
.ghost-item {
  opacity: 0.5;
  border: 2px dashed #1976d2;
}
</style>
