<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { Head, Link, useForm, router } from '@inertiajs/vue3';
import DefaultLayoutWithVerticalNav from '@/layouts/components/DefaultLayoutWithVerticalNav.vue'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'
import Swal from 'sweetalert2'
import { useLoadingStore } from '@layouts/stores/loading'
import dayjs from 'dayjs'
import { ORDER_STATUS } from '@/utils/statusCodes'

const page = usePage()
const { languages } = usePage().props
const { t, locale } = useI18n()

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const loadingStore = useLoadingStore()

const errors = ref({
  username: undefined,
  name: undefined,
})

const showDialog = ref(false)
const modalContent = ref('')
const props = defineProps({
    pageTitle: String,
    order: [Array, Object],
    errors: [Array, Object],
    statuses: [Array, Object],
})

const formRef = ref()
const form = useForm({
  uuid: props.order.uuid,
  name: props.order.member_name,
  status: props.order.status,
  remark: props.order.order_remark,
  courier: props.order.courier,
  courier_tracking: props.order.courier_tracking,
})

const headers = [
  {
    title: '#',
    key: 'counter',
    sortable: false,
  },
  {
    title: t('SKU'),
    key: 'product_sku',
  },
  {
    title: t('Product'),
    key: 'product_name',
  },
  {
    title: t('Price'),
    key: 'product_price',
  },
  {
    title: t('Quantity'),
    key: 'pivot.product_quantity',
  },
  {
    title: t('Total'),
    key: 'pivot.total_price',
  },
]

const onSubmit = (formRef, formInstance) => {
  formInstance.transform(data => ({
    ...formInstance.data(),
  })).post(route('admin.order.update'), {
      forceFormData: true,
      onStart: () => {
        loadingStore.start()
      },
      onFinish: () => {
        loadingStore.stop()
      }
  });
}

const formatDate = (dateString) => {
  return dayjs(dateString).format('MMM D, YYYY, H:mm')
}

const subtotal = computed(() => {
  return props.order.products.reduce((total, item) => {
    return total + (item.product_price * item.product_quantity)
  }, 0).toFixed(2)
})

</script>

<template>
  <Head :title="props.pageTitle"/>
  <DefaultLayoutWithVerticalNav>
      <div>
        <div class="d-flex justify-space-between align-center flex-wrap gap-y-4 mb-6">
          <div>
            <div class="d-flex gap-2 align-center mb-2 flex-wrap">
              <h5 class="text-h5">
                {{t('Order')}} #{{ order.ref_no }}
              </h5>
              <div class="d-flex gap-x-2">
                <VChip
                  :color="ORDER_STATUS.color(order.status)"
                  label
                  size="x-small"
                >
                  {{ ORDER_STATUS.label(order.status) }}
                </VChip>
              </div>
            </div>
            <div class="text-body-1">
              {{ formatDate(order.order_date) }}
            </div>
          </div>
        </div>
        <VRow>
          <VCol
              cols="12"
            >
              <!-- 👉 Edit -->
              <VForm
                  ref="formRef"
                  method="post"
                  @submit.prevent="onSubmit(formRef, form)"
                >
                <VCard>
                  <VCardItem>
                    <template #title>
                      <h5 class="text-h5">
                        {{$t('Edit')}}
                      </h5>
                    </template>
                  </VCardItem>
                  <VCardText>
                    <VRow class="mb-6">
                      <VCol cols="12" md="4">
                        <AppSelect
                          v-model="form.status"
                          :items="props.statuses"
                          item-title="value"
                          item-value="key"
                          :placeholder="$t('Status')"
                          :rules="[requiredValidator]"
                        />
                      </VCol>
                      <VCol cols="12" md="4">
                        <AppTextField
                          v-model="form.courier"
                          :error-messages="form.errors.courier"
                          :placeholder="$t('Courier')"
                        />
                      </VCol>
                      <VCol cols="12" md="4">
                        <AppTextField
                          v-model="form.courier_tracking"
                          :error-messages="form.errors.courier_tracking"
                          :placeholder="$t('Tracking No')"
                        />
                      </VCol>
                    </VRow>
                    <AppTextarea
                      v-model="form.remark"
                      :placeholder="t('Remark')"
                      :label="t('Remark')"
                      rows="2"
                    />
                  </VCardText>
                  <VCardText>
                    <div class="d-flex justify-end gap-x-4">
                      <VBtn
                        type="button"
                        color="primary"
                        variant="text"
                        class="mt-4"
                        @click="$inertia.visit('/admin/order')"
                        >
                        <VIcon start>
                          mdi-arrow-left
                        </VIcon>
                        {{$t('Back')}}
                      </VBtn>
                      <VBtn
                        type="submit"
                        color="primary"
                        :class="['mt-4', { 'opacity-25': form.processing }]"
                        :disabled="form.processing"
                        >
                        {{$t('Submit')}}
                      </VBtn>
                    </div>
                  </VCardText>
                </VCard>
              </VForm>
          </VCol>
        </VRow>

        <VRow>
          <VCol
              cols="12"
              md="8"
            >
              <!-- 👉 Order Details -->
              <VCard class="mb-6">
                <VCardItem>
                  <template #title>
                    <h5 class="text-h5">
                      {{$t('Order Details')}}
                    </h5>
                  </template>
                </VCardItem>

                <VDivider />
                <VDataTable
                  :headers="headers"
                  :items="order.products"
                  item-value="product.id"
                  class="text-no-wrap"
                >
                  <template #item.counter="{ index }">
                    {{ index + 1 }}
                  </template>
                  <template #item.product_name="{ item }">
                    <div class="d-flex gap-x-3 align-center">

                      <VAvatar
                        size="34"
                        :image="item.variant_image || item.product_featured_image"
                        :rounded="0"
                      />

                      <div class="d-flex flex-column">
                        <span>{{ item.product_name }}</span>

                        <span
                          v-if="item.variant_name"
                          class="text-xs text-medium-emphasis"
                        >
                          {{ item.variant_name }}
                        </span>
                      </div>

                    </div>
                  </template>
                  <template #item.product_price="{ item }">
                    <div class="text-right">
                      {{$formatNumber(item.product_price, 2)}}
                    </div>
                  </template>
                  <template #item.pivot.product_quantity="{ item }">
                    <div class="d-flex gap-x-3 justify-center">
                      {{$formatNumber(item.product_quantity)}}
                    </div>
                  </template>
                  <template #item.pivot.total_price="{ item }">
                    <div class="d-flex gap-x-3 justify-end">
                      {{$formatNumber(item.total_price, 2)}}
                    </div>
                  </template>

                  <template #bottom />
                </VDataTable>
                <VDivider />

                <VCardText>
                  <div class="d-flex align-end flex-column">
                    <table class="text-high-emphasis">
                      <tbody>
                        <tr>
                          <td width="200px">
                            {{$t('Subtotal')}}:
                          </td>
                          <td class="font-weight-medium justify-end">
                            {{$formatNumber(subtotal,2)}}
                          </td>
                        </tr>
                        <tr v-if="order.shipping_amount > 0">
                          <td>{{$t('Shipping Total')}}: </td>
                          <td class="font-weight-medium text-right">
                            {{$formatNumber(order.shipping_amount,2)}}
                          </td>
                        </tr>
                        <tr v-if="order.total_tax > 0">
                          <td>{{$t('Tax')}}: </td>
                          <td class="font-weight-medium text-right">
                            {{$formatNumber(order.total_tax,2)}}
                          </td>
                        </tr>
                        <tr>
                          <td class="text-high-emphasis font-weight-medium">
                            {{$t('Total')}}:
                          </td>
                          <td class="font-weight-medium">
                            {{$formatNumber(order.total_amount,2)}}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </VCardText>
              </VCard>

              <!-- 👉 Shipping Activity -->
              <VCard :title="t('Shipping Activity')">
                <VCardText v-if="order.status != 2">
                  <VTimeline
                    truncate-line="both"
                    line-inset="9"
                    align="start"
                    side="end"
                    line-color="primary"
                    density="compact"
                  >
                    <VTimelineItem
                      dot-color="primary"
                      size="x-small"
                    >
                      <div class="d-flex justify-space-between align-center">
                        <div class="app-timeline-title">
                          {{$t('Pending')}}
                        </div>
                        <div class="app-timeline-meta">
                          {{formatDate(order.order_date)}}
                        </div>
                      </div>
                      <p class="app-timeline-text mb-0 mt-3">
                        {{$t('Order is pending for payment')}}
                      </p>
                    </VTimelineItem>

                    <VTimelineItem
                      :dot-color="(order.status >= 1 && order.status != 2) ? 'primary' : 'secondary'"
                      size="x-small"
                    >
                      <div class="d-flex justify-space-between align-center">
                        <div class="app-timeline-title">
                          {{$t('Approved')}} ({{$t('Order ID')+': #'+order.ref_no}})
                        </div>
                        <div class="app-timeline-meta">
                          {{formatDate(order.approved_date)}}
                        </div>
                      </div>
                      <p class="app-timeline-text mb-0 mt-3">
                        {{$t('Order has been placed successfully')}}
                      </p>
                    </VTimelineItem>

                    <VTimelineItem
                      :dot-color="(order.status >= 3 && order.status != 2) ? 'primary' : 'secondary'"
                      size="x-small"
                    >
                      <div class="d-flex justify-space-between align-center">
                        <div class="app-timeline-title">
                          {{$t('Processed')}}
                        </div>
                        <div class="app-timeline-meta" v-if="order.processed_date">
                          {{formatDate(order.processed_date)}}
                        </div>
                      </div>
                      <p class="app-timeline-text mb-0 mt-3">
                        {{$t('Order has been processed')}}
                      </p>
                    </VTimelineItem>

                    <VTimelineItem
                      :dot-color="(order.status >= 4 && order.status != 2) ? 'primary' : 'secondary'"
                      size="x-small"
                    >
                      <div class="d-flex justify-space-between align-center">
                        <div class="app-timeline-title">
                          {{$t('Shipped')}}
                        </div>
                        <div class="app-timeline-meta" v-if="order.shipped_date">
                          {{formatDate(order.shipped_date)}}
                        </div>
                      </div>
                      <p class="app-timeline-text mb-0 mt-3">
                        {{$t('Order has been shipped')}}
                      </p>
                    </VTimelineItem>

                    <VTimelineItem
                      :dot-color="(order.status == 5) ? 'primary' : 'secondary'"
                      size="x-small"
                    >
                      <div class="d-flex justify-space-between align-center">
                        <div class="app-timeline-title">
                          {{$t('Delivered')}}
                        </div>
                        <div class="app-timeline-meta" v-if="order.delivered_date">
                          {{formatDate(order.delivered_date)}}
                        </div>
                      </div>
                      <p class="app-timeline-text mb-0 mt-3">
                        {{$t('Order has been delivered')}}
                      </p>
                    </VTimelineItem>
                  </VTimeline>
                </VCardText>
                <VCardText v-else>
                  <VTimeline
                    truncate-line="both"
                    line-inset="9"
                    align="start"
                    side="end"
                    line-color="primary"
                    density="compact"
                  >
                    <VTimelineItem
                      dot-color="error"
                      size="x-small"
                    >
                      <div class="d-flex justify-space-between align-center">
                        <div class="app-timeline-title">
                          {{$t('Cancelled')}}
                        </div>
                        <div class="app-timeline-meta" v-if="order.failed_date">
                          {{formatDate(order.failed_date)}}
                        </div>
                      </div>
                      <p class="app-timeline-text mb-0 mt-3">
                        {{$t('Order has been cancelled')}}
                      </p>
                    </VTimelineItem>
                  </VTimeline>
                </VCardText>
              </VCard>
          </VCol>
          <VCol
              cols="12"
              md="4"
            >
            <!-- 👉 Customer Details  -->
            <VCard class="mb-6">
              <VCardText class="d-flex flex-column gap-y-6">
                <h5 class="text-h5">
                  {{t('Customer details')}}
                </h5>

                <div class="d-flex align-center">
                  <VAvatar
                    color="primary"
                    variant="tonal"
                    :rounded="1"
                    class="me-3"
                  >
                    <span
                      class="font-weight-medium"
                    >{{ avatarText(order?.member_name) }}</span>
                  </VAvatar>

                  <div>
                    <h6 class="text-h6">
                      {{ order?.member_name }}
                    </h6>
                  </div>
                </div>

                <div class="d-flex flex-column gap-y-1">
                  <div class="d-flex justify-space-between align-center">
                    <h6 class="text-h6">
                      {{$t('Contact Info')}}
                    </h6>
                  </div>
                  <span v-if="order.member_email">{{$t('Email')}}: {{ order?.member_email }}</span>
                  <span v-if="order.member_phone">{{$t('Phone')}}: {{ order?.member_phone }}</span>
                </div>
              </VCardText>
            </VCard>

            <!-- 👉 Payment Method -->
            <VCard class="mb-6">
              <VCardItem>
                <VCardTitle>{{$t('Payment Method')}}</VCardTitle>
              </VCardItem>

              <VCardText>
                <div class="text-body-1 text-uppercase">
                  {{order.payment_method}}
                </div>
              </VCardText>
            </VCard>

            <!-- 👉 Shipping Address -->
            <VCard class="mb-6">
              <VCardItem>
                <VCardTitle>{{$t('Shipping Address')}}</VCardTitle>
              </VCardItem>

              <VCardText>
                <div class="text-body-1">
                  <span>{{order.shipping_address}}</span><br>
                  <span>{{order.shipping_city}}</span><br>
                  <span>{{order.shipping_postcode}} {{order.shipping_state}}</span><br>
                  <span>{{order.shipping_country}}</span>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </div>
  </DefaultLayoutWithVerticalNav>
</template>

<style>
  .v-text-field__prefix {
    opacity: 1;
  }
</style>