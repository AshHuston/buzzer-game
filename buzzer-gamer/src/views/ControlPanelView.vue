<template>
  <div class="wa-split page">
    <div class="gameboardContainer">
      <gameboardpanel v-if="game.round1.categories && !showRound2" :categories="game.round1.categories" />
      <gameboardpanel v-if="game.round2.categories && showRound2" :categories="game.round2.categories" />
    </div>
    <div class="wa-stack wa-gap-m sidebar">
        <div class="wa-cluster">
            <p class="main caption">Game code: {{ gameCode }}</p>
            <wa-button @click="resetBuzzers" style="width: 70%; margin: auto">RESET BUZZERS</wa-button>
            <wa-checkbox @change="setRound($event.target.checked)">Round 2</wa-checkbox>
            <wa-checkbox @change="setScoreboardMode($event.target.checked)">Team mode</wa-checkbox>
        </div>
        <div class="scoreButtonList">
            <p class="caption">Scores:</p>
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
                    class="wa-split name"
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
                    v-for="(player, index) in players.filter(p => p.name !== 'hub' && p.name !== 'panel')"
                    :key="index"
                    class="wa-split name"
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
            <p class="caption">Buzzes:</p>
            <p
                v-for="(player, index) in buzzList.filter(p => p.name !== 'hub')"
                :key="index"
                class="name"
            >
                {{ index+1 }}. {{ player.name }}
            </p>
        </div>
        <wa-divider></wa-divider>
    </div>
  </div>
</template>

<script setup>
import gameboardpanel from '@/components/GameBoardPanel.vue';
import { io } from 'socket.io-client'
import { onMounted, ref, computed, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router'
import game from '@/assets/tuckerGame.json'

const route = useRoute()

const gameCodeQuery = computed(() => route.query.code)
const players = ref([])
const buzzList = ref([])
const gameCode = ref(gameCodeQuery.value ? gameCodeQuery.value.toUpperCase() : '')
const isTeamMode = ref(false)
const teamNameInput = ref('')
const showRound2 = ref(false)

isTeamMode.value = false
showRound2.value = false

const pointButtonValues = [
    +100,
    -50,
]

const teams = ref([])

const socket = io();

socket.on('buzzOrderUpdated', (order) => {buzzList.value = order})
socket.on('buzzReset', () => {buzzList.value = []})
socket.on("playersUpdated", (playerList) => {players.value = playerList})
socket.on("teamsUpdated", (teamsList) => {teams.value = teamsList})

onMounted(() => {
  gameCode.value = gameCode.value == '' ? "NONE" : gameCode.value.toUpperCase()

  socket.emit('joinGame', {
      gameCode: gameCode.value,
      playerName: 'panel'
  })

  updateSize()
  window.addEventListener('resize', updateSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateSize)
})

const qrZoomSize = ref(300)

function updateSize() {
  qrZoomSize.value = Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.6)
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

function setRound(isRound2) {
    showRound2.value = isRound2
    socket.emit('showRound2', {gameCode: gameCode.value, isRound2})
}

</script>

<style scoped>
.page{
  padding: 30px;
  background-color: rgb(91, 91, 91);
  color: #c3c3c3;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: nowrap;
}

.board-container {
    min-width: 0;
    flex: 1;
}

.sidebar {
    width: 600px; /* adjust as needed */
}

.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.lightbox-image {
  max-width: 60vw;
  max-height: 60vh;
  width: auto;
  height: auto;
  object-fit: contain;
}

wa-checkbox::part(control) {
    width: 1.75rem;
    height: 1.75rem;
    border: 3px solid #c3c3c3;
    background-color: #929292;
}
wa-checkbox::part(label) {
    color: #c3c3c3;
    font-size: 1.5rem;
}

.caption {
    font-size: 2.5rem;
    font-weight: bold;
}

.main {
    font-size: 3rem;
}

.name {
    font-size: 1.75rem;
}
</style>
