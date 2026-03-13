<script setup>
import { usePage, Link, useForm, router } from '@inertiajs/vue3'
import { useLoadingStore } from '@layouts/stores/loading'

// v-model contract (parent pass modelValue, child emits update:modelValue)
const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])

const loadingStore = useLoadingStore()
const isPasswordVisible = ref(false)

// get the modelValue parent tell child update
const loginDialog = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const errors = ref({
  username: undefined,
  password: undefined,
})

const form = useForm({
  username: '',
  password: '',
})


// send data to laravel route POST /login 
const onSubmit = () => {
  form.post(route('login.post'), {
      forceFormData: true,
      onStart: () => {
        loadingStore.start()
      },
      onFinish: () => {
        loadingStore.stop()
        form.username = ''
        form.password = ''
      },
      onSuccess: () => {
        loginDialog.value = false
      }
  });
}
</script>

<template>
  <VDialog 
    v-model="loginDialog" 
    max-width="500"
    :scrim="false"
    >
    <VForm
        ref="formRef"
        method="post"
        @submit.prevent="onSubmit()"
      >
      <VCard class="border border-frontend-primary">
        <VToolbar color="custom">
          <VToolbarTitle>{{$t('Login')}}</VToolbarTitle>
          <VBtn
            icon
            variant="plain"
            @click="loginDialog = false"
          >
            <VIcon
              color="white"
              icon="tabler-x"
            />
          </VBtn>
        </VToolbar>
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                color="custom"
                v-model="form.username"
                :label="$t('Username')"
                :placeholder="$t('Username')"
                autofocus
                :rules="[requiredValidator]"
                :error-messages="errors.username"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                color="custom"
                v-model="form.password"
                :label="$t('Password')"
                placeholder="············"
                :rules="[requiredValidator]"
                :type="isPasswordVisible ? 'text' : 'password'"
                autocomplete="password"
                :error-messages="errors.password"
                :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />
            </VCol>
            <VCol cols="12">
              <VBtn
                block
                color="custom"
                type="submit"
              >
                {{$t('Login')}}
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VForm>
  </VDialog>
</template>