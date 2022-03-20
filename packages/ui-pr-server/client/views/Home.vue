<template>
  <main class="p-12">
    <TabGroup :selected-index="selectedTab">
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
      <TabPanels as="template">
        <TabPanel
          :class="[
            'mt-2 bg-white rounded-xl p-3',
            'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
          ]"
        >
          <section class="w-full px-2 py-4">
            <div class="relative">
              <input
                ref="inputElem"
                type="file"
                accept="image/*"
                @change="uploadFile"
                class="absolute z-0 h-full w-full opacity-0"
              />
              <button
                type="button"
                :class="[
                  'inline-block w-full py-4 text-sm leading-5 font-medium text-white rounded-lg',
                  'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
                  'bg-blue-600'
                  // selected
                  //   ? 'bg-white shadow'
                  //   : 'text-blue-100 hover:bg-white/[0.12] hover:text-white',
                ]"
              >立即传图</button>
            </div>
            <div
              v-show="fileList.length"
              class="relative grid gap-8 bg-white px-1.5 py-7 lg:grid-cols-2"
            >
              <div
                v-for="file in fileList"
                :key="file.file.name"
                class="flex items-center p-2 -m-3 transition duration-150 ease-in-out rounded-lg hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
              >
                <div
                  class="flex items-center justify-center flex-shrink-0 w-16 h-16 text-white sm:h-12 sm:w-12"
                >
                  <img class="inline-block w-full h-full object-contain" :src="file.img" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">{{ file.file.name }}</p>
                  <p class="text-sm text-gray-500">截图时间：{{ file.time }}</p>
                </div>
              </div>
            </div>
          </section>
        </TabPanel>
        <TabPanel
          :class="[
            'mt-2 bg-white rounded-xl p-3',
            'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
          ]"
        >
          <section class="w-full px-2 py-4">
            <PluginList :rooms="rooms" :store-socket-info="storeSocketInfo" @change="changePlugin"></PluginList>
          </section>
        </TabPanel>
      </TabPanels>
    </TabGroup>
    <RegisterTips :is-dialog-open="isDialogOpen" @close-dialog="closeDialog"></RegisterTips>
  </main>
</template>

<script setup lang="ts">
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from '@headlessui/vue'
import RegisterTips from '../components/register-tips.vue'
import PluginList from '../components/plugin-list.vue'
import useSocket from '../composables/socket';
import dayjs from 'dayjs'
import { onMounted, ref } from 'vue';

const enum TAB_MAP {
  FUNC = 0,
  INFO = 1
}

let tabList = ref([
  {
    name: '传图'
  },
  {
    name: '插件列表'
  }
])
let selectedTab = ref(TAB_MAP.FUNC)
let isDialogOpen = ref(false)
let inputElem = ref<HTMLInputElement>()
let fileList = ref<Array<{
  file: File,
  img: string,
  time: string
}>>([])
let { rooms, socketLoading, storeSocketInfo, updateSocketInfo, sendFileToPlugin } = useSocket()

console.log('rooms', rooms.value)

const closeDialog = () => {
  isDialogOpen.value = false
  selectedTab.value = TAB_MAP.INFO
}

onMounted(() => {
  selectedTab.value = storeSocketInfo.value.room ? TAB_MAP.FUNC : TAB_MAP.INFO
  isDialogOpen.value = !storeSocketInfo.value.room
})

function changePlugin(room: string) {
  updateSocketInfo('room', room)
}

function uploadFile(event: Event) {
  const files = (<HTMLInputElement>event.target).files
  if (!files) {
    return
  }

  const file = files[0]
  const reader = new FileReader()
  reader.onload = function (event) {
    fileList.value.unshift({
      file,
      img: <string>event.target?.result,
      time: dayjs(file.lastModified).format('HH:mm:ss')
    })
    file.arrayBuffer().then((result) => sendFileToPlugin(result, file.type.replace('image/', '')))
  }
  reader.readAsDataURL(file)

  // 清空值
  inputElem.value && (inputElem.value.value = '')
}
</script>

<style lang="scss">
.page-index {
  padding-top: 60px;
  text-align: center;
}
</style>
