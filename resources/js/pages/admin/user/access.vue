<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { Head, Link, useForm } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { languages } = usePage().props

const modalContent = ref('')

const errors = ref({
})

const props = defineProps({
    form: Object,
    pageTitle: String,
    user: [Array, Object],
    accesses: [Array, Object],
    funcs: [Array, Object],
})

</script>

<template>
    <Head :title="$t('Access')"/>
    <VCard
      :title="$t('Access')"
    >
    <VCardText>
      <VTable class="text-no-wrap mb-6 border rounded">
        <thead>
          <tr>
            <th scope="col">
              {{$t('Functions')}}
            </th>
            <th scope="col">
              {{$t('Access Level')}}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="func in props.funcs"
            :key="func.function"
          >
            <td
              width="400px"
              class="text-high-emphasis"
            >
              {{ func.function }}
            </td>
            <td>
              <AppSelect
                v-model="props.form.access[func.key]"
                :items="props.accesses"
                item-title="value"
                item-value="key"
                :placeholder="$t('Access Level')"
              />
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCardText>
  </VCard>
</template>

<style lang="scss">
@use "@core-scss/template/pages/misc.scss";
</style>
