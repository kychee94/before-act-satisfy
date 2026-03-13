<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { usePage, router, useForm } from '@inertiajs/vue3'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// const router = useRouter()
const ability = useAbility()

// TODO: Get type from backend
const { userInfo } = usePage().props;

const logout = async () => {
  // const rememberMe = ref(false)
  const form = useForm({});
  form.post(route('admin.logout'));

  // Remove "accessToken" from cookie
  useCookie('accessToken').value = null

  // Remove "userAbilities" from cookie
  useCookie('userAbilityRules').value = null

  // Reset ability to initial ability
  ability.update([])
}

const userProfileList = [
  { type: 'divider' },
  {
    type: 'navItem',
    icon: 'tabler-user',
    title: 'Profile',
    to: {
      name: route('admin.user.profile'),
      // params: { id: 21 },
    },
  },
  // {
  //   type: 'navItem',
  //   icon: 'tabler-file-dollar',
  //   title: 'Billing Plan',
  //   to: {
  //     // name: 'pages-account-settings-tab',
  //     params: { tab: 'billing-plans' },
  //   },
  //   badgeProps: {
  //     color: 'error',
  //     content: '4',
  //   },
  // },
]
</script>

<template>
  <VBadge
    dot
    bordered
    location="bottom right"
    offset-x="1"
    offset-y="2"
    color="success"
  >
    <VAvatar
      size="38"
      class="cursor-pointer"
      :color="!(userInfo && userInfo.avatar) ? 'primary' : undefined"
      :variant="!(userInfo && userInfo.avatar) ? 'tonal' : undefined"
    >
      <!-- <v-img
        v-if="userInfo && userInfo.avatar"
        :src="userInfo.avatar"
      /> -->
      <VIcon>tabler-user</VIcon>

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="240"
        location="bottom end"
        offset="12px"
      >
        <VList>
          <VListItem>
            <div class="d-flex gap-2 align-center">
              <VListItemAction>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                  bordered
                >
                  <VAvatar
                    :color="!(userInfo && userInfo.avatar) ? 'primary' : undefined"
                    :variant="!(userInfo && userInfo.avatar) ? 'tonal' : undefined"
                  >
                    <VIcon>tabler-user</VIcon>
                    <!-- <v-img
                      v-if="userInfo && userInfo.avatar"
                      :src="userInfo.avatar"
                    />
                    <v-icon
                      v-else
                      icon="tabler-user"
                    /> -->
                  </VAvatar>
                </VBadge>
              </VListItemAction>

              <div>
                <h6 class="text-h6 font-weight-medium">
                  {{ userInfo.name }}
                </h6>
                <VListItemSubtitle class="text-capitalize text-disabled">
                  {{ t(userInfo.role_name) }}
                </VListItemSubtitle>
              </div>
            </div>
          </VListItem>

          <PerfectScrollbar :options="{ wheelPropagation: false }">
            <template
              v-for="item in userProfileList"
              :key="item.title"
            >
              <VListItem
                v-if="item.type === 'navItem'"
                :href="item.to.name"
              >
                <template #prepend>
                  <VIcon
                    :icon="item.icon"
                    size="22"
                  />
                </template>

                <VListItemTitle>{{ t(item.title) }}</VListItemTitle>

                <template
                  v-if="item.badgeProps"
                  #append
                >
                  <v-badge
                    rounded="sm"
                    class="me-3"
                    v-bind="item.badgeProps"
                  />
                </template>
              </VListItem>

              <VDivider
                v-else
                class="my-2"
              />
            </template>

            <div class="px-4 py-2">
              <VBtn
                block
                size="small"
                color="error"
                append-icon="tabler-logout"
                @click="logout"
              >
                {{ $t('Logout') }}
              </VBtn>
            </div>
          </PerfectScrollbar>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
