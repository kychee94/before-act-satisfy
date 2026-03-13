<script setup>
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

// Props
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [
      dayjs().subtract(29, 'day').format('YYYY-MM-DD'),
      dayjs().format('YYYY-MM-DD')
    ]
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  appendIcon: {
    type: String,
    default: 'mdi-calendar'
  },
  textFieldClass: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'outlined'
  },
  displayFormat: {
    type: String,
    default: 'MMM DD, YYYY'
  },
  autoApply: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'change'])

// Reactive state
const menu = ref(false)
const internalDateRange = ref([])
const dateOptions = ref(null)
const lastEmittedValue = ref(null)
const datePickerRef = ref(null)

// Initialize internal date range from props
watch(() => props.modelValue, (newValue) => {
  if (!newValue || newValue.length === 0) {
    return
  }
  
  if (newValue && newValue.length === 2) {
    try {
      const formattedDates = [
        dayjs(newValue[0]).format('YYYY-MM-DD'),
        dayjs(newValue[1]).format('YYYY-MM-DD')
      ]
      
      // Only update if different from last emitted value to prevent loops
      const valueStr = JSON.stringify(formattedDates)
      if (lastEmittedValue.value !== valueStr) {
        internalDateRange.value = [
          dayjs(newValue[0]).toDate(),
          dayjs(newValue[1]).toDate()
        ]
      }
    } catch (error) {
      console.error('Error parsing modelValue:', error)
    }
  }
}, { immediate: true })

const shortcuts = computed(() => [
  { 
    text: t('Today'), 
    dates: [dayjs().toDate(), dayjs().toDate()]
  },
  { 
    text: t('Yesterday'), 
    dates: [dayjs().subtract(1, 'day').toDate(), dayjs().subtract(1, 'day').toDate()]
  },
  { 
    text: t('Last 7 Days'), 
    dates: [dayjs().subtract(6, 'day').toDate(), dayjs().toDate()]
  },
  { 
    text: t('Last 30 Days'), 
    dates: [dayjs().subtract(29, 'day').toDate(), dayjs().toDate()]
  },
  { 
    text: t('This Month'), 
    dates: [dayjs().startOf('month').toDate(), dayjs().endOf('month').toDate()]
  },
  { 
    text: t('Last Month'), 
    dates: [dayjs().subtract(1, 'month').startOf('month').toDate(), dayjs().subtract(1, 'month').endOf('month').toDate()]
  },
  { 
    text: t('Custom Date'), 
    dates: [dayjs().toDate(), dayjs().toDate()],
    isCustom: true
  }
])

// Parse string or return array
const parseDateRange = (value) => {
  try {
    // Handle string format "YYYY-MM-DD to YYYY-MM-DD"
    if (typeof value === "string") {
      if (value.includes(" to ")) {
        const [startStr, endStr] = value.split(" to ")
        return [
          dayjs(startStr.trim()).toDate(),
          dayjs(endStr.trim()).toDate()
        ]
      }
      // Single date string
      const date = dayjs(value).toDate()
      return [date, date]
    }
    
    // Already an array
    if (Array.isArray(value) && value.length === 2) {
      return value
    }
    
    return null
  } catch (error) {
    console.error('Error parsing date range:', error)
    return null
  }
}

// Check if the selected dates match any shortcut
const matchShortcut = (dates) => {
  if (!dates || dates.length !== 2) return null
  
  const selectedStart = dayjs(dates[0]).format('YYYY-MM-DD')
  const selectedEnd = dayjs(dates[1]).format('YYYY-MM-DD')
  
  for (const shortcut of shortcuts.value) {
    if (shortcut.isCustom) continue
    
    const shortcutStart = dayjs(shortcut.dates[0]).format('YYYY-MM-DD')
    const shortcutEnd = dayjs(shortcut.dates[1]).format('YYYY-MM-DD')
    
    if (selectedStart === shortcutStart && selectedEnd === shortcutEnd) {
      return shortcut
    }
  }
  
  return null
}

watch(
  internalDateRange,
  (newValue) => {
    try {
      // Handle clear action (null, undefined, or empty array)
      if (!newValue || (Array.isArray(newValue) && newValue.length === 0)) {
        const emitValue = JSON.stringify([])
        if (lastEmittedValue.value !== emitValue) {
          lastEmittedValue.value = emitValue
          emit('update:modelValue', [])
          emit('change', {
            startDate: null,
            endDate: null,
            dates: []
          })
        }
        return
      }
      
      const parsedValue = parseDateRange(newValue)

      if (parsedValue && parsedValue.length === 2 && parsedValue.every((v) => v instanceof Date && !isNaN(v))) {
        const formattedDates = [
          dayjs(parsedValue[0]).format('YYYY-MM-DD'),
          dayjs(parsedValue[1]).format('YYYY-MM-DD')
        ]
        
        // Check if dates match a shortcut or set to custom
        const matchedShortcut = matchShortcut(parsedValue)
        if (matchedShortcut) {
          dateOptions.value = matchedShortcut
        } else {
          // Set to Custom Date option
          dateOptions.value = shortcuts.value.find(s => s.isCustom)
        }

        // Only emit if the value actually changed
        const emitValue = JSON.stringify(formattedDates)
        if (lastEmittedValue.value !== emitValue) {
          lastEmittedValue.value = emitValue
          emit('update:modelValue', formattedDates)
          emit('change', {
            startDate: formattedDates[0],
            endDate: formattedDates[1],
            dates: formattedDates
          })
        }
      }
    } catch (error) {
      console.error('Error in date range watcher:', error)
    }
  },
  { flush: 'post' }
)

// Methods
const applyShortcut = (shortcut) => {
  try {
    // Check if it's the custom date option
    if (shortcut?.isCustom) {
      // Use nextTick to ensure the ref is available
      nextTick(() => {
        if (datePickerRef.value) {
          const el = datePickerRef.value.$el || datePickerRef.value
          const input = el?.querySelector('input') || el?.querySelector('[role="textbox"]')
          
          if (input) {
            input.click()
            input.focus()
          }
        }
      })
      return
    }

    // Create new date instances to avoid reference issues
    internalDateRange.value = [
      new Date(shortcut.dates[0]),
      new Date(shortcut.dates[1])
    ]
    if (props.autoApply) {
      menu.value = false
    }
  } catch (error) {
    console.error('Error applying shortcut:', error)
  }
}

const handleCustomDateSelected = (dates) => {
  internalDateRange.value = dates
  showDatePicker.value = false
}

const handleClear = () => {
  internalDateRange.value = null
  lastEmittedValue.value = JSON.stringify([])
  dateOptions.value = null

  emit('update:modelValue', [])
  emit('change', {
    startDate: null,
    endDate: null,
    dates: []
  })
}

const datePickerConfig = {
  mode: 'range',
  dateFormat: 'Y-m-d',
}
</script>

<template>
  <AppDateTimePicker
    v-model="internalDateRange"
    ref="datePickerRef"
    :config="datePickerConfig"
    :placeholder="t('Select date range')"
    :clearable="true"
    :variant="variant"
    :class="textFieldClass"
    @click:clear="handleClear"
  />

  <AppSelect 
    v-model="dateOptions"
    :items="shortcuts" 
    item-title="text"
    :placeholder="t('Select Dates')"
    @update:modelValue="applyShortcut" 
    return-object
  >
  </AppSelect>


  <!-- Shortcut buttons -->
  <!-- <div class="mt-2">
    <VBtn
      v-for="shortcut in shortcuts"
      :key="shortcut.text"
      size="small"
      variant="text"
      class="ma-1"
      @click="applyShortcut(shortcut)"
    >
      {{ shortcut.text }}
    </VBtn>
  </div> -->
</template>