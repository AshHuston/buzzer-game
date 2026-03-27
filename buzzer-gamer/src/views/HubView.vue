<script setup>
import { io } from 'socket.io-client'
import { onMounted, ref } from 'vue';

const players = ref([])
const buzzList = ref([])
const gameCode = ref('')

const socket = io()

const buzzerUrl = 'https://buzzer-game-dd6w.onrender.com'

socket.on('buzzOrderUpdated', (order) => {
  buzzList.value = order
})
socket.on('buzzReset', () => {
  buzzList.value = []
})
socket.on("playersUpdated", (playerList) => {
  players.value = playerList
})
onMounted(() => {
    gameCode.value = randomCode()

    socket.emit('joinGame', {
        gameCode: gameCode.value,
        playerName: 'hub'
    })
    
})

function randomCode(length = 4) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  
  return result
}

function resetBuzzers() {
    socket.emit('resetBuzz', { gameCode: gameCode.value })
}

</script>

<template>
    <div class="wa-stack wa-gap-m">

        <div class="wa-cluster">
            <h1>Game code: {{ gameCode }}</h1>
            <wa-qr-code
                :value="buzzerUrl"
                size="86"
            ></wa-qr-code>
        </div>
        <div class="playerList">
            <h2>Players:</h2>
            <p 
                v-for="(player, index) in players.filter(p => p.name !== 'hub')" 
                :key="index"
            >
            - {{ player.name }}
            </p>
        </div>
        <wa-button @click="resetBuzzers">RESET BUZZERS</wa-button>
        <div class="buzzerList">
            <h2>Buzzes:</h2>
            <p 
                v-for="(player, index) in buzzList.filter(p => p.name !== 'hub')" 
                :key="index"
            >
            {{ index+1 }}. {{ player.name }}
            </p>
        </div>
    </div>
</template>
