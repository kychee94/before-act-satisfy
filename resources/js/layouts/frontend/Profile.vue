<script setup>
import { router, Link, usePage, useForm } from '@inertiajs/vue3'
import { useLocaleStore } from '@layouts/stores/locale'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
  location: {
    type: null,
    required: false,
    default: 'bottom end',
  },
})

const ability = useAbility()

const userInfo = computed(() => usePage().props.userInfo)

const logout = async () => {
  // const rememberMe = ref(false)
  const form = useForm({});
  form.post(route('logout'));

  // Remove "accessToken" from cookie
  useCookie('accessToken').value = null

  // Remove "userAbilities" from cookie
  useCookie('userAbilityRules').value = null

  // Reset ability to initial ability
  ability.update([])
}

</script>

<template>
  <div>
    <VBtn
      class="ms-2"
      rounded
      color="white"
      variant="outlined"
    >
      <VIcon 
        color="white"
        size="20"
        >
        tabler-user-circle
      </VIcon>
      <span class="text-white mx-1">{{$formatNumber(userInfo.balance)}} {{t('Points')}}</span>
      <VIcon color="white">tabler-chevron-down</VIcon>
    </VBtn>
    
    <VMenu
      activator="parent"
      :location="props.location"
      offset="12px"
      :width="175"
    >
      <VList
        color="custom"
        class="menu-item"
        >
        <VListItem @click="router.visit(route('profile'))">
          <VListItemTitle>
            {{ t('Order History') }}
          </VListItemTitle>
        </VListItem>
        <VListItem @click="logout()">
          <VListItemTitle>
            {{ t('Logout') }}
          </VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
  </div>
</template>

<style scoped>
  .menu-item .v-list-item:hover{
    background-color: rgb(var(--v-theme-custom));
    color: rgb(var(--v-theme-on-primary));
  }
</style>
