<template>
  <TransitionRoot appear :show="props.isDialogOpen" as="template">
    <Dialog as="div" @close="closeDialog">
      <DialogOverlay class="fixed inset-0 bg-black opacity-40"></DialogOverlay>
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="min-h-screen px-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <DialogOverlay class="fixed inset-0" />
          </TransitionChild>

          <span class="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <div
              class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
            >
              <DialogTitle as="h3" class="text-xl font-medium leading-6 text-gray-900">👀 请先注册信息吧</DialogTitle>
              <div class="mt-2">
                <p class="text-lg text-gray-500">💁‍♂️ 为了能够找到指定sketch，需要“设置”项中给sketch注册信息哦！</p>
              </div>

              <div class="mt-4">
                <button
                  type="button"
                  class="inline-flex justify-center px-4 py-2 text-lsm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  @click="closeDialog"
                >✍️ 知道了</button>
              </div>
            </div>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
const props = defineProps({
  isDialogOpen: Boolean
})
const emit = defineEmits(['closeDialog'])
const closeDialog = () => {
  emit('closeDialog')
}
</script>