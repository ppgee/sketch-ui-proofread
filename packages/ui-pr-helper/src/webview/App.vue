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
      <TabPanels class="mt-2" v-slot="{ selectedIndex }">
        <TabPanel
          :class="[
            'bg-white rounded-xl p-3',
            'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
          ]"
        >
          <section>{{ tabList[0].name }}</section>
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
                  v-model="storeSocketInfo.server"
                  placeholder="可向开发人员索取服务器地址"
                />
              </label>
              <label class="block">
                <span class="text-2xl text-gray-700">🙋‍♂️ 昵称：</span>
                <input
                  type="url"
                  class="mt-2 block w-full"
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
                >保存</button>
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
