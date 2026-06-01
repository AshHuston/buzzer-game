<script setup>
import { io } from 'socket.io-client'
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router'

const route = useRoute()

const gameCodeQuery = computed(() => route.query.code)
const players = ref([])
const buzzList = ref([])
const gameCode = ref(gameCodeQuery.value ? gameCodeQuery.value.toUpperCase() : '')
const isTeamMode = ref(false)
const teamNameInput = ref('')

const pointButtonValues = [
    +100,
    +99,
    -50,
]

const teams = ref([])

const socket = io();

const host = import.meta.env.VITE_APP_HOST
const buzzerUrl = 'https://' + host + '/' + (gameCode.value == '' ? '' : '?code=' + gameCode.value)

socket.on('buzzOrderUpdated', (order) => {buzzList.value = order})
socket.on('buzzReset', () => {buzzList.value = []})
socket.on("playersUpdated", (playerList) => {players.value = playerList})
socket.on("teamsUpdated", (teamsList) => {teams.value = teamsList})

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

function addNewTeam() {
    if (teamNameInput.value == '') return

    teams.value.push({
        name: teamNameInput.value,
        score: 0
    })

    socket.emit('updateTeamScore', {gameCode: gameCode.value, teamName: teamNameInput.value, delta: 0})
    teamNameInput.value = ''
}

function setScoreboardMode(e){
    isTeamMode.value = e
    socket.emit('setScoreboardMode', {gameCode: gameCode.value, isTeamsMode: e})
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
        <div class="wa-cluster">
            <wa-button @click="resetBuzzers" style="width: 60%; margin: auto">RESET BUZZERS</wa-button>
            <wa-checkbox :checked="isTeamMode" @change="setScoreboardMode($event.target.checked)">Team mode</wa-checkbox>
        </div>
        <div class="scoreButtonList">
            <h2>Scores:</h2>
            <div v-if="isTeamMode">
                <div class="wa-cluster">
                    <wa-input
                        placeholder="Team Name"
                        :value="teamNameInput"
                        @input="teamNameInput = $event.target.value"
                    />
                    <wa-button @click="addNewTeam"><wa-icon name="plus" /></wa-button>
                </div>
                <wa-divider style="--width:1px; margin-top: 10px;"></wa-divider>
                <div
                    v-for="(team, index) in teams"
                    :key="index"
                    class="wa-split"
                >
                    <span>{{ team.name }}: {{ team.score }}</span>
                    <div>
                        <wa-button
                            v-for="points, index in pointButtonValues"
                            :key="index"
                            @click="socket.emit('updateTeamScore', { gameCode, teamName: team.name, delta: points })"
                        >
                            {{ points>0 ? '+':'' }}{{ points }}
                        </wa-button>
                    </div>
                </div>
            </div>
            <div v-else>
                <div
                    v-for="(player, index) in players.filter(p => p.name !== 'hub')"
                    :key="index"
                    class="wa-split"
                >
                    <span>{{ player.name }}: {{ player.score }}</span>
                    <div>
                        <wa-button
                            v-for="points, index in pointButtonValues"
                            :key="index"
                            @click="socket.emit('updateScore', { gameCode, playerId: player.id, delta: points })"
                        >
                            {{ points>0 ? '+':'' }}{{ points }}
                        </wa-button>
                    </div>
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
