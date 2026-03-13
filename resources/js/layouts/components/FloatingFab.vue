<script setup>
import { usePage, Link, useForm, router } from '@inertiajs/vue3'
import { useLoadingStore } from '@layouts/stores/loading'
import { useDisplay } from 'vuetify'

const { mdAndDown } = useDisplay();

const props = defineProps({
    image: String,
    name: String,
    position: {
      type: String,
      default: "bottom-right", // bottom-left, top-right, top-left
    },
    enable: Boolean,
    offsetX: { type: [String, Number], default: 20 },
    offsetY: { type: [String, Number], default: 20 },
    link: String
  })

const emit = defineEmits(["click"]);

const offsetX = computed(() => props.offsetX ?? 20)
const offsetY = computed(() => props.offsetY ?? 20)

const positionStyle = computed(() => {
  const style = { position: "fixed", zIndex: 9999 };
  const additionalOffset = mdAndDown.value ? 15 : 0;

  switch (props.position) {
    case "bottom-left":
      style.left = offsetX.value + "px";
      style.bottom = `${Number(offsetY.value) + additionalOffset}px`;
      break;

    case "top-right":
      style.right = offsetX.value + "px";
      style.top = offsetY.value + "px";
      break;

    case "top-left":
      style.left = offsetX.value + "px";
      style.top = offsetY.value + "px";
      break;

    default: // bottom-right
        style.right = offsetX.value + "px";
        style.bottom = `${Number(offsetY.value) + additionalOffset}px`
      break;
  }

  return style;
});

const emitClick = () => emit("click");
</script>

<template>
  <div v-if="props.enable">
    <Link 
      v-if="props.image"
      :href="props.link || '#'"
      :style="positionStyle"
      @click="emitClick"
    >
      <VImg
        :src="props.image"
        :alt="props.name"
        class="w-[60px] md:w-[80px]"
      />
    </Link>
    <VBtn
      v-else
      :style="positionStyle"
      @click="emitClick"
    />
  </div>
</template>