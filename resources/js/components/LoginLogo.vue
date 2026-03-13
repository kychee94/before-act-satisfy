<script setup>
import { Link } from '@inertiajs/vue3';
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'

defineProps({
    nodes: {
        type: Object,
        default: null
    },
    title: {
        type: String,
        default: null
    }
});

</script>

<template>
    <Link href="/">
        <div class="auth-logo d-flex align-center gap-x-3">
            <VNodeRenderer :nodes="nodes" />
            <h1 class="auth-title">
                {{ title }}
            </h1>
        </div>
    </Link>
</template>