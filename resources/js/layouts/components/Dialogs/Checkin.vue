<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { usePage } from '@inertiajs/vue3'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { Sparkles } from 'lucide-vue-next'
import axios from 'axios'
import AlertDialog from '@/layouts/components/Dialogs/AlertDialog.vue'
import { initConfigStore } from '@core/stores/config'
import { useLoadingStore } from '@layouts/stores/loading'

// Initialize stores
initConfigStore()
const loadingStore = useLoadingStore()
const page = usePage()
const { t } = useI18n()
const display = useDisplay()
const smAndDown = computed(() => display.smAndDown.value)

// Define page layout
definePage({
  layout: 'Layout',
})

// Props & Emits
const props = defineProps({
  modelValue: Boolean,
  checkinInfo: {
    type: [Array, Object],
    default: () => ({})
  },
  checkins: {
    type: [Array, Object],
    default: () => []
  },
  consecutiveDays: {
    type: Number,
    default: 0
  },
  lastCheckinDate: {
    type: String,
    default: null
  },
})

const emit = defineEmits(['update:modelValue', 'checkin-success'])

// Refs
const alertDialog = ref(false)
const alertMessage = ref('')
const totalDays = ref([])
const dateCheckInterval = ref(null)
const isSubmitting = ref(false)
const hasAutoShown = ref(false)
const claimed = ref(false)

// Computed Properties
const userInfo = computed(() => page.props.userInfo)
const layoutInfo = computed(() => page.props.layoutInfo)
const memberDays = computed(() => userInfo.value?.checkin_days || 0)

const checkinDialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Check if user has claimed today
const isClaimedToday = computed(() => {
  if (!props.lastCheckinDate) return false
  
  const claimDate = new Date(props.lastCheckinDate)
  const today = new Date()

  // update claimed value
  claimed.value = false

  return (
    claimDate.getFullYear() === today.getFullYear() &&
    claimDate.getMonth() === today.getMonth() &&
    claimDate.getDate() === today.getDate()
  )
})

// Check if user has claimed all days
const claimedAll = computed(() => {
  return props.consecutiveDays >= (props.checkinInfo?.days || 0)
})

// Check if user is eligible for check-in
const isEligible = computed(() => {
  return (
    !isClaimedToday.value && 
    props.checkinInfo?.enable && 
    userInfo.value && 
    !claimedAll.value
  )
})

// Determine grid display count based on screen size
// const displayCount = computed(() => smAndDown.value ? 6 : 8)
// const gridColumns = computed(() => smAndDown.value ? 3 : 4)
const displayCount = computed(() => 6)
const gridColumns = computed(() => 3)
const imgSrc = computed(() => display.width.value <= 600 ? 'images/checkin/modal-sm.png' : 'images/checkin/modal.png')

// Check if it's a new day
const isNewDay = () => {
  if (!props.lastCheckinDate) return true
  
  const lastLogin = new Date(props.lastCheckinDate)
  const today = new Date()
  
  return lastLogin.toDateString() !== today.toDateString()
}

// Build the days array for display
const buildDaysArray = (claimedToday = isClaimedToday.value) => {
  if (!props.checkinInfo?.days || !props.checkins) {
    totalDays.value = []
    return
  }

  // Create full days array
  const allDays = Array.from({ length: props.checkinInfo.days }, (_, i) => ({
    day: i + 1,
    reward: props.checkins[i]?.reward || '',
    isClaimed: i < props.consecutiveDays,
    isCurrent: false
  }))

  // Separate claimed and unclaimed
  const claimed = allDays.filter(d => d.isClaimed)
  const unclaimed = allDays.filter(d => !d.isClaimed)

  // Mark the first unclaimed day as current
  if (unclaimed.length && !claimedToday) {
    unclaimed[0].isCurrent = true
  }

  const maxDisplay = displayCount.value // e.g., 6

  // Decide how many unclaimed can fit
  const unclaimedCount = Math.min(unclaimed.length, maxDisplay)
  const claimedCount = (maxDisplay - unclaimedCount)

  const claimedToShow = claimedCount > 0 ? claimed.slice(-claimedCount) : []
  const unclaimedToShow = unclaimed.slice(0, unclaimedCount)

  totalDays.value = [...claimedToShow, ...unclaimedToShow]
}

// Submit check-in
async function onSubmit() {
  if (isSubmitting.value || !isEligible.value) return
  
  isSubmitting.value = true
  
  try {
    // Get CSRF token
    await axios.get('/sanctum/csrf-cookie')
    
    // Submit check-in
    const { data } = await axios.post('/checkin/store')

    if (data.code === 200) {
      // Update the current day as claimed
      const currentDayIndex = totalDays.value.findIndex(d => d.isCurrent)
      if (currentDayIndex !== -1) {
        totalDays.value[currentDayIndex].isClaimed = true
        totalDays.value[currentDayIndex].isCurrent = false
        
        // Mark next day as current if exists
        // if (currentDayIndex + 1 < totalDays.value.length) {
        //   totalDays.value[currentDayIndex + 1].isCurrent = true
        // }
      }
    }

    // Show success/error message
    alertDialog.value = true
    alertMessage.value = data.message || t('Check-in successful!')

    // update claimed value
    claimed.value = true
    
    // Close dialog after short delay to show the update
    setTimeout(() => {
      checkinDialog.value = false
    }, 800)
    
  } catch (error) {
    console.error('Check-in error:', error)
    
    alertDialog.value = true
    alertMessage.value = error.response?.data?.message || t('An error occurred. Please try again.')
    
  } finally {
    isSubmitting.value = false
  }
}

// Check for date changes and auto-show modal
const checkDateChange = () => {
  if (isNewDay() && props.lastCheckinDate && isEligible.value) {
    checkinDialog.value = true
  }
}

// Auto-show modal on eligible condition
const autoShowModal = () => {
  if (isEligible.value && !hasAutoShown.value) {
    hasAutoShown.value = true
    checkinDialog.value = true
  }
}

watch(
  () => props.lastCheckinDate,
  (val) => {
    // Only build after lastCheckinDate has resolved
    buildDaysArray(isClaimedToday.value)
  },
  { immediate: true }
)

watch(
  () => [props.checkinInfo, props.checkins, props.consecutiveDays],
  () => {
    // Only rebuild if lastCheckinDate is already settled
    if (props.lastCheckinDate !== undefined) {
      buildDaysArray(isClaimedToday.value)
    }
  },
  { deep: true }
)

// Lifecycle Hooks
onMounted(() => {
  display.update()

  // Auto-show check-in modal after delay
  setTimeout(() => {
    autoShowModal()
  }, 1000)

  // Check for date changes every minute
  dateCheckInterval.value = setInterval(() => {
    checkDateChange()
  }, 60000)
})

onBeforeUnmount(() => {
  if (dateCheckInterval.value) {
    clearInterval(dateCheckInterval.value)
  }
})
</script>

<template
  v-if="!isClaimedToday"
  >
  <VDialog
    v-model="checkinDialog" 
    :class="[
        $vuetify.display.smAndDown ? 'w-100 max-w-full' : 'width-[900px] max-w-[900px]',
        'z-20'
      ]"
    persistent
    >
    <VForm
        ref="formRef"
        method="post"
        @submit.prevent="onSubmit()"
      >
      <VCard class="checkin-bg pa-0 relative hide-scrollbar" elevation="0">
        <a
          @click="checkinDialog = false"
          class="cursor-pointer close-btn"
          >
          <VImg 
            src="images/spin/close.png" 
            :alt="t('Close')"
            width="50"
            />
        </a>
        <VCardText class="pa-0">
          <VImg 
            :src="imgSrc"
            />
          <div :class="[
              'flex flex-wrap absolute checkin-content max-w-[70%]'
            ]"
            >
            <div 
              v-for="(day, index) in totalDays" 
              :key="day.day" 
              class="m-auto text-center box-container p-1 sm:p-1 w-1/3">
              <div 
                class="box p-1"
                :class="{ 'claimed': day.isClaimed, 'current': day.isCurrent }"
                >
                <p class="text-xs sm:text-lg text-white mb-0 border-b border-white">{{ t('Day %s',{'day': day.day}) }}</p>
                <VImg 
                  src="/images/checkin/treasure.png"
                  alt="treasure"
                  width="110"
                  class="m-auto"
                  />
                <p class="min-h-[1vh] mb-0 text-xs sm:text-lg">{{ day.reward }}</p>
                <div v-if="day.isClaimed" class="claimed-badge">
                  ✓
                </div>
              </div>
            </div>
          </div>
          <VImg 
              v-if="!isClaimedToday && !claimed"
              src="/images/checkin/claim.png"
              alt="claim"
              width="250"
              class="m-auto cursor-pointer"
              @click="onSubmit"
            />
        </VCardText>
      </VCard>
    </VForm>
  </VDialog>

  <!-- Alert Dialog -->
  <AlertDialog 
    v-model="alertDialog"
    :message="alertMessage"
  />
</template>

<style scoped>
  .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    color: #000;
    z-index: 10;
  }

  .box {
    position: relative;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    transition: all 0.3s ease;
    margin: auto;
  }

  .box.claimed {
    opacity: 0.6;
    background: #F96C05;
  }

  .box.current {
    border-color: #ffd700;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    animation: pulse 2s infinite;
  }

  .claimed-badge {
    position: absolute;
    top: 5px;
    right: 5px;
    background: #4caf50;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
  }

  .hide-scrollbar {
    overflow-y: auto;        /* still scrollable */
    scrollbar-width: none;   /* Firefox */
    -ms-overflow-style: none;/* IE / Edge legacy */
  }

  .hide-scrollbar::-webkit-scrollbar {
    display: none;           /* Chrome / Safari */
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .checkin-content{
    left: 16%;
    transform: translate(0%, -120%); 

    .box-container{
      height: 200px;
    }
  }

  @media (min-width: 768px) and (max-width: 850px) {
    .checkin-content{
      .box-container{
        height: 180px;
      }
    }
  }

  @media (max-width: 768px) {
    .checkin-content{
      .box-container{
        height: 150px !important;

        .v-img{
          width: 80px !important;
        }
      }
    }
  }

  @media (min-width: 600px) and (max-width: 640px) {
    .checkin-content{
      .box-container{
        height: 150px !important;

        .v-img{
          width: 80px !important;
        }
      }
    }
  }

  @media (max-width: 600px) {
    .checkin-content{
      transform: translate(0%, -140%); 

      .box-container{
        height: 180px !important;

        .v-img{
          width: 100px !important;
        }
      }
    }
  }

  @media (max-width: 560px) {
    .checkin-content{
      .box-container{
        height: 130px !important;

        .v-img{
          width: 80px !important;
        }
      }
    }
  }

  @media (max-width: 414px) {
    .checkin-content{
      .box-container{
        height: 100px !important;

        .v-img{
          width: 40px !important;
        }
      }
    }
  }
</style>