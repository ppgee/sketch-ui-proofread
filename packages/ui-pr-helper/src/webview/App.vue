<template>
  <div class="p-4 py-6">
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
      <TabPanels class="mt-2">
        <TabPanel
          :class="[
            'bg-white rounded-xl p-3',
            'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
          ]"
        >
          <section class="w-full px-2 py-4">
            <div class="relative">
              <button
                type="button"
                :class="[
                  'inline-block w-full py-4 text-sm leading-5 font-medium text-white rounded-lg',
                  'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
                  'bg-blue-600'
                ]"
                @click="clearImgList"
              >清空列表</button>
            </div>
            <div
              v-show="imgList.length"
              class="relative grid gap-8 bg-white px-1.5 py-7 lg:grid-cols-2"
            >
              <div
                v-for="image in imgList"
                :key="image.url"
                class="flex items-center p-2 -m-3 transition duration-150 ease-in-out rounded-lg hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
              >
                <div
                  class="flex items-center justify-center flex-shrink-0 w-16 h-16 text-white sm:h-12 sm:w-12"
                >
                  <img class="inline-block w-full h-full object-contain" :src="image.url" />
                </div>
                <div class="ml-4">
                  <p class="text-sm text-gray-500">接收时间：{{ image.time }}</p>
                </div>
              </div>
            </div>
          </section>
        </TabPanel>
        <TabPanel
          :key="tabList[1].name"
          :class="[
            'bg-white rounded-xl p-3',
            'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
          ]"
        >
          <section class="py-12 text-left">
            <div class="grid grid-cols-1 gap-6">
              <label class="block mb-4">
                <span class="text-2xl text-gray-700">🌐 服务器地址：</span>
                <input
                  type="url"
                  class="mt-2 block w-full"
                  :disabled="isJoined"
                  v-model="storeSocketInfo.server"
                  placeholder="可向开发人员索取服务器地址"
                />
              </label>
              <label class="block">
                <span class="text-2xl text-gray-700">🙋‍♂️ 昵称：</span>
                <input
                  type="url"
                  class="mt-2 block w-full"
                  :disabled="isJoined"
                  v-model="storeSocketInfo.room"
                  placeholder="设置个性化名称以快速查找并传图"
                />
              </label>
              <label class="block mt-12">
                <button
                  :disabled="buttonDisabled"
                  :class="[
                    'block py-2 w-full rounded-md text-white bg-blue-600',
                    buttonDisabled
                      ? 'opacity-50 cursor-not-allowed'
                      : '',
                  ]"
                  @click="createSocketConnection"
                >{{ isJoined ? '连接成功' : '保存' }}</button>
              </label>
            </div>
          </section>
        </TabPanel>
      </TabPanels>
    </TabGroup>
    <RegisterTips :is-dialog-open="isDialogOpen" @close-dialog="closeDialog"></RegisterTips>
  </div>
</template>

<script setup lang="ts">
import './assets/css/tailwindcss.css'
import { ref, computed } from 'vue'
import useSocket from './compositions/socket';
import RegisterTips from './components/register-tips.vue';

const enum TAB_MAP {
  FUNC = 0,
  INFO = 1
}

let tabList = ref([
  {
    name: '传图'
  },
  {
    name: '设置'
  }
])

// 创建socket信息
let {
  isJoined,
  storeSocketInfo,
  imgList,
  clearImgList,
  createSocketConnection
} = useSocket()

let selectedTab = ref(!storeSocketInfo.id ? TAB_MAP.INFO : TAB_MAP.FUNC)
let isDialogOpen = ref<boolean>(!storeSocketInfo.id)
const closeDialog = () => {
  isDialogOpen.value = false
  selectedTab.value = TAB_MAP.INFO
}

const buttonDisabled = computed(() => isJoined.value || !storeSocketInfo.server || !storeSocketInfo.room)
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body {
  @apply bg-gray-50 dark:bg-gray-800;
}
.global-text {
  @apply text-gray-900 dark:text-gray-50;
}
</style>
