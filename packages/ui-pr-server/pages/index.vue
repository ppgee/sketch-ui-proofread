<template>
  <main class="p-12">
    <Html>
      <Head>
        <Title>sketch对稿助手传图端</Title>
      </Head>
    </Html>

    <TabGroup>
      <TabList class="flex p-1 space-x-1 bg-blue-900/20 rounded-xl">
        <Tab
          v-for="tab in tabList"
          as="template"
          :key="tab.name"
          v-slot="{ selected }"
        >
          <button
            :class="[
              'w-full py-2.5 text-sm leading-5 font-medium text-blue-700 rounded-lg',
              'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
              selected
                ? 'bg-white shadow'
                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white',
            ]"
          >
            {{ tab.name }}
          </button>
        </Tab>
      </TabList>
      <TabPanels
        class="mt-2"
        v-slot="{ selectedIndex }"
      >
        <TabPanel
          v-for="(tab, idx) in tabList"
          :key="idx"
          :class="[
            'bg-white rounded-xl p-3',
            'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
          ]"
        >
          <section v-show="selectedIndex === 0">{{tab.name}}</section>
          <section v-show="selectedIndex === 1">{{tab.name}}</section>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </main>
</template>

<script setup lang="ts">
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from '@headlessui/vue'
import { SocketClient, getUuid } from 'ui-pr-socket/client'

let socketClient: SocketClient

let tabList = ref([
  {
    name: '传图'
  },
  {
    name: '设置'
  }
])

const getRooms = (rooms: string[]) => {
  console.log(rooms)
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
