<template>
  <div class="w-full max-w-md mx-auto">
    <RadioGroup v-model="room">
      <!-- <RadioGroupLabel class="sr-only">Server size</RadioGroupLabel> -->
      <div class="space-y-2">
        <RadioGroupOption
          as="template"
          v-for="room in rooms"
          :key="room.room"
          :value="room.room"
          :disabled="!room.online"
          v-slot="{ active, checked }"
        >
          <div
            :class="[
              active
                ? 'ring-2 ring-offset-2 ring-offset-sky-300 ring-white ring-opacity-60'
                : '',
              checked ? 'bg-sky-900 bg-opacity-75 text-white ' : 'bg-white ',
            ]"
            class="relative flex px-5 py-4 rounded-lg shadow-md cursor-pointer focus:outline-none"
          >
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center">
                <div class="text-sm">
                  <RadioGroupLabel
                    as="p"
                    :class="checked ? 'text-white' : 'text-gray-900'"
                    class="font-medium"
                  >{{ room.room }}</RadioGroupLabel>
                </div>
              </div>
              <div class="flex flex-shrink-0">
                <div
                  :class="[
                    'mr-4 text-black',
                    room.online ? '' : 'text-gray-400'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block rounded-full w-2.5 h-2.5',
                      room.online ? 'bg-green-500' : 'bg-gray-400'
                    ]"
                  ></span>
                  当前{{ room.online ? '在线' : '离线' }}
                </div>
                <div v-show="checked" class="text-white">
                  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="12" fill="#fff" fill-opacity="0.2" />
                    <path
                      d="M7 13l3 3 7-7"
                      stroke="#fff"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </RadioGroupOption>
      </div>
    </RadioGroup>
  </div>
</template>

<script setup lang="ts">
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue'
const props = defineProps<{
  rooms: {
    room: string;
    online: boolean;
  }[],
  storeSocketInfo: {
    id: string;
    room: string;
  }
}>()
const emit = defineEmits<{
  (e: 'change', room: string): void
}>()

let room = ref(props.storeSocketInfo.room)
onUpdated(() => {
  emit('change', room.value)
})
</script>