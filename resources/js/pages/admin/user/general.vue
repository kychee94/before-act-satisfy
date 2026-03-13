<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { Head, Link, useForm } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { languages } = usePage().props

const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const modalContent = ref('')

const errors = ref({
  email: undefined,
  username: undefined,
  password: undefined,
  password_confirmation: undefined,
})

const props = defineProps({
    form: Object,
    pageTitle: String,
    user: [Array, Object],
    roles: [Array, Object],
    statuses: [Array, Object],
})

</script>

<template>
    <Head :title="$t('General')"/>
    <VCard
      :title="$t('General')"
    >
    <VCardText>
      <VRow>
        <VCol>
          <AppTextField
            v-model="props.form.first_name"
            :label="$t('First Name')"
          />
        </VCol>
        <VCol>
          <AppTextField
            v-model="props.form.last_name"
            :label="$t('Last Name')"
          />
        </VCol>
      </VRow>
      <VRow>
        <VCol>
          <AppTextField
            v-model="props.form.email"
            type="email"
            :label="$t('Email')"
            :rules="[emailValidator]"
            :error-messages="errors.email"
          />
        </VCol>
        <VCol>
          <AppTextField
            v-model="props.form.phone"
            :label="$t('Phone')"
          />
        </VCol>
      </VRow>
      <VRow>
        <VCol>
          <AppSelect
            v-model="props.form.gender"
            :items="[
                      { value: 'M', title: t('Male') },
                      { value: 'F', title: t('Female') }
                    ]"
            :placeholder="$t('Gender')"
            :label="$t('Gender')"
          />
        </VCol>
        <VCol>
          <AppDateTimePicker
            v-model="props.form.dob"
            :placeholder="$t('Select date')"
            :label="$t('Date of Birth')"
          />
        </VCol>
      </VRow>
      <VRow>
        <VCol>
          <AppSelect
              v-model="props.form.role"
              :items="props.roles"
              item-title="name"
              item-value="id"
              :placeholder="$t('Role')"
              :label="$t('Role')"
              :rules="[requiredValidator]"
            />
        </VCol>
        <VCol>
          <AppSelect
              v-model.number="props.form.status"
              :items="props.statuses"
              item-title="value"
              item-value="key"
              :placeholder="$t('Status')"
              :label="$t('Status')"
              :rules="[requiredValidator]"
            />
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
  <VCard
      :title="$t('Account')"
      class="mt-3"
    >
    <VCardText>
      <VRow>
        <VCol cols="12">
          <AppTextField
            v-model="props.form.username"
            :label="$t('Username')"
            :rules="[requiredValidator]"
            :error-messages="form.errors.username"
            readonly
          />
        </VCol>
        <VCol cols="12">
          <AppTextField
              v-model="props.form.password"
              :label="$t('Password')"
              placeholder="············"
              :type="isPasswordVisible ? 'text' : 'password'"
              autocomplete="password"
              :error-messages="props.form.errors.password"
              :append-inner-icon="isPasswordVisible ? 'tabler:eye_off' : 'tabler:eye'"
              @click:append-inner="isPasswordVisible = !isPasswordVisible"
              hide-details="auto"
            />
        </VCol>
        <VCol cols="12">
          <AppTextField
              v-model="props.form.password_confirmation"
              :label="$t('Confirm Password')"
              placeholder="············"
              :rules="[confirmedValidator(props.form.password_confirmation, props.form.password)]"
              :type="isConfirmPasswordVisible ? 'text' : 'password'"
              autocomplete="password"
              :error-messages="props.form.errors.password_confirmation"
              :append-inner-icon="isConfirmPasswordVisible ? 'tabler:eye_off' : 'tabler:eye'"
              @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
              hide-details="auto"
            />
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<style lang="scss">
@use "@core-scss/template/pages/misc.scss";
</style>
