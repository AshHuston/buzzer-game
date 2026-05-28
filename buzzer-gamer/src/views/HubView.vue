<script setup>
import { io } from 'socket.io-client'
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router'

const route = useRoute()

const gameCodeQuery = computed(() => route.query.code)
const players = ref([])
const buzzList = ref([])
const gameCode = ref(gameCodeQuery.value ? gameCodeQuery.value.toUpperCase() : '')

const socket = io();

const buzzerUrl = 'https://buzzer.ashhuston.com/' + (gameCode.value == '' ? '' : '?code=' + gameCode.value)

socket.on('buzzOrderUpdated', (order) => {buzzList.value = order})
socket.on('buzzReset', () => {buzzList.value = []})
socket.on("playersUpdated", (playerList) => {players.value = playerList})

onMounted(() => {
    gameCode.value = gameCode.value == '' ? randomCode() : gameCode.value.toUpperCase()

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
        <wa-button @click="resetBuzzers" style="width: 60%; margin: auto">RESET BUZZERS</wa-button>
        <!-- <div class="playerList">
            <h2>Players:</h2>
            <p
                v-for="(player, index) in players.filter(p => p.name !== 'hub')"
                :key="index"
            >
            - {{ player.name }}
            </p>
        </div> -->
        <div class="scoreButtonList">
            <h2>Scores:</h2>
            <div
                v-for="(player, index) in players.filter(p => p.name !== 'hub')"
                :key="index"
                class="wa-split"
            >
                <span>{{ player.name }}: {{ player.score }}</span>
                <div>
                  <wa-button @click="socket.emit('updateScore', { gameCode, playerId: player.id, delta: 100 })">+100</wa-button>
                  <wa-button @click="socket.emit('updateScore', { gameCode, playerId: player.id, delta: 99 })">+99</wa-button>
                  <wa-button @click="socket.emit('updateScore', { gameCode, playerId: player.id, delta: -50 })">-50</wa-button>
              </div>
            </div>
        </div>
        <wa-divider></wa-divider>
        <div class="buzzerList">
            <h2>Buzzes:</h2>
            <p
                v-for="(player, index) in buzzList.filter(p => p.name !== 'hub')"
                :key="index"
            >
            {{ index+1 }}. {{ player.name }}
            </p>
        </div>
        <wa-divider></wa-divider>
    </div>
</template>
