<template>
  <main>
    <Html>
      <Head>
        <Title>sketch对稿助手传图端</Title>
      </Head>
    </Html>

    <div class="container">
      <p>请先选择对应接收设备</p>
      <el-button>lalala</el-button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { SocketClient } from 'ui-pr-socket/dist/ui-pr-socket-client'

let socketClient: SocketClient

const getRooms = (rooms: string[]) => {
  console.log(rooms)
}

onMounted(() => {
  socketClient = new SocketClient({
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
