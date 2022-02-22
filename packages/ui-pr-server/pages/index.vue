<template>
  <main class="p-12">
    <Html>
      <Head>
        <Title>sketch对稿助手传图端</Title>
      </Head>
    </Html>

    <TabGroup>
      <TabList class="flex p-1 space-x-1 bg-blue-900/20 rounded-xl">
        <Tab v-for="tab in tabList" as="template" :key="tab.name" v-slot="{ selected }">
          <button
            :class="[
              'w-full py-2.5 text-sm leading-5 font-medium text-blue-700 rounded-lg',
              'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
              selected
                ? 'bg-white shadow'
                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white',
            ]"
          >{{ tab.name }}</button>
        </Tab>
      </TabList>
      <TabPanels class="mt-2" v-slot="{ selectedIndex }">
        <TabPanel
          v-for="(tab, idx) in tabList"
          :key="idx"
          :class="[
            'bg-white rounded-xl p-3',
            'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
          ]"
        >
          <section v-show="selectedIndex === 0">{{ tab.name }}</section>
          <section v-show="selectedIndex === 1" class="w-full px-2 py-4">
            <div class="w-full max-w-md mx-auto">
              <RadioGroup v-model="selected">
                <!-- <RadioGroupLabel class="sr-only">Server size</RadioGroupLabel> -->
                <div class="space-y-2">
                  <RadioGroupOption
                    as="template"
                    v-for="room in rooms"
                    :key="room.room"
                    :value="room.room"
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
                            <!-- <RadioGroupDescription
                              as="span"
                              :class="checked ? 'text-sky-100' : 'text-gray-500'"
                              class="inline"
                            >
                              <span>{{ plan.ram }}/{{ plan.cpus }}</span>
                              <span aria-hidden="true">&middot;</span>
                              <span>{{ plan.disk }}</span>
                            </RadioGroupDescription>-->
                          </div>
                        </div>
                        <div class="flex flex-shrink-0">
                          <div class="mr-4 text-black">当前{{room.online ? '在线' : '离线'}}</div>
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
          </section>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </main>
</template>

<script setup lang="ts">
import { TabGroup, TabList, Tab, TabPanel, TabPanels, RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue'
import { SocketClient, getUuid } from 'ui-pr-socket/client'

type roomFormatter = {
  room: string,
  online: boolean
}

let socketClient: SocketClient

let tabList = ref([
  {
    name: '传图'
  },
  {
    name: '插件列表'
  }
])
let selected = ref<number>(-1)
let rooms = ref<Array<roomFormatter>>([])

const getRooms = (roomList: Array<roomFormatter>) => {
  console.log(roomList)
  rooms.value = roomList
}

onMounted(() => {
  socketClient = new SocketClient({
    id: getUuid(),
    url: window.location.origin,
    socketFrom: 'device',
    getRoomsFn: getRooms
  })
})
</script>

<style lang="scss">
.page-index {
  padding-top: 60px;
  text-align: center;
}
</style>
