<script setup>
import { computed, onMounted, ref } from 'vue'
import { io } from 'socket.io-client'
import { useRoute } from 'vue-router'

const route = useRoute()

const gameCodeQuery = computed(() => route.query.code)
const buttonIsDisabled = ref(false)
const inputName = ref('')
const inputCode = ref('')
const playerName = ref('')
const gameCode = ref('')
const placeholderName = ref('')
const buttonText = ref('TAP TO BUZZ IN')
const players = ref([])
const scoreboardIsTeamsMode = ref(false)
const teams = ref([])
const myBuzzPlacement = ref(null)

const placeholderNamePool = [
  'muhnameisjeff',
  'Ryan\'s mom',
  'Snordlebort',
  'chungusamungus',
  'Ska8terade',
  'Blanched Almonds',
  'jesse\'s girl',
  'Mohammed',
  'Captain Jack Sparrow',
  'Mario Mario',
  'Professor Oak',
  'Doctor Eggman',
  'there is no profanity filter on this',
  '[[REDACTED]]',
  'Kermit the Frenchman',
]

const buttonColor = ref('#e05941')

function darkenColor(hex, percent) {
  const amount = 1 - percent / 100

  const r = Math.round(parseInt(hex.slice(1, 3), 16) * amount)
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * amount)
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * amount)

  return `rgb(${r}, ${g}, ${b})`
}

const pressedColor = computed(() =>
  darkenColor(buttonColor.value, 15)
)

const socket = io();

socket.on('buzzReset', () => {
  buttonIsDisabled.value = false
  buttonText.value = "TAP TO BUZZ IN"
  myBuzzPlacement.value = null
})
socket.on('buzzOrderUpdated', (order) => {
  console.log('Buzz order:', order)
  myBuzzPlacement.value = order.findIndex(p => p.name === playerName.value) + 1
  if (myBuzzPlacement.value > 0) {
    buttonIsDisabled.value = true
    buttonText.value = `YOU'VE BUZZED IN ${myBuzzPlacement.value}${getOrdinalSuffix(myBuzzPlacement.value)}.\nWAIT FOR HOST TO RESET BUZZERS.`
  }
})

function getOrdinalSuffix(n) {
  if (n % 100 >= 11 && n % 100 <= 13) {
    return 'TH';
  }
  switch (n % 10) {
    case 1: return 'ST';
    case 2: return 'ND';
    case 3: return 'RD';
    default: return 'TH';
  }
}

socket.on('playersUpdated', (playerList) => {
  players.value = playerList
})

socket.on('teamsUpdated', (teamsList) => {
  teams.value = teamsList
})

socket.on('applyScoreboardMode', (isTeamsMode) => {
  console.log("do th ething")
  scoreboardIsTeamsMode.value = isTeamsMode
})

function handleSubmit(){
  gameCode.value = inputCode.value.value.toUpperCase()
  playerName.value = inputName.value.value

  socket.emit('joinGame', {
    gameCode: gameCode.value,
    playerName: playerName.value
  })
}

function onClick() {
  socket.emit('buzz', { gameCode: gameCode.value })
};

onMounted(() => {
  placeholderName.value = placeholderNamePool[Math.floor(Math.random() * placeholderNamePool.length)]
})
</script>

<template>
  <wa-dialog
      id="info-dialog"
      open
      without-header
    >
      <form class="wa-stack">
        <wa-input ref="inputName" label="Name" :placeholder="placeholderName"></wa-input>
        <wa-input
          ref="inputCode"
          label="Game Code"
          :value="gameCodeQuery"
        ></wa-input>
        <wa-button data-dialog="close" @click="handleSubmit">Join Game</wa-button>
      </form>
    </wa-dialog>
    <wa-dialog
      id="scoreboard-dialog"
      :label="'Scoreboard for '+ gameCode +':'"
      light-dismiss
    >
      <div v-if="scoreboardIsTeamsMode"><p v-for="team, index in teams.sort((a, b) => b.score - a.score)" :key="index" class="scoreboard-line">{{ team.name }}: {{ team.score }}</p></div>
      <div v-else><p v-for="player, index in [...players.filter(p => p.name !== 'hub' && p.name !== 'panel')].sort((a, b) => b.score - a.score)" :key="index" class="scoreboard-line">{{ player.name }}: {{ player.score }}</p></div>

    </wa-dialog>

  <div class="wa-stack wa-gap-m">
    <div class="wa-stack wa-gap-m control-container">
      <wa-icon class="scorebaord-icon" name="table" data-dialog="open scoreboard-dialog" />
      <wa-color-picker
        :value="buttonColor"
        @change="buttonColor = $event.target.value"
      />
    </div>

    <div class="name">
      <h1>{{ playerName }}</h1>
    </div>
    <div
      @click="onClick"
      class="circle"
      :class="{ 'color-untapped': !buttonIsDisabled, 'color-tapped': buttonIsDisabled }"
      :style="{ backgroundColor: !buttonIsDisabled ? buttonColor : pressedColor}"
    >
      {{ buttonText }}
    </div>
  </div>
</template>

<style>
  body {
      /* Centers the circle on the page */
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #807f7f;
      color: black;
  }

  .name {
    text-align: center;
    margin-bottom: 5rem;
  }

  .circle {
      /* Defines the size of the circle */
      width: 80vw;
      height: 80vw;

      /* Creates the circle shape */
      border-radius: 50%;

      border: 5px solid #333;

      /* Centers the text inside the circle using Flexbox */
      display: flex;
      justify-content: center;
      align-items: center;

      /* Styles the text */
      color: white;
      font-size: 24px;
      text-align: center;
      padding: 10px; /* Optional: adds a little space around the text */
      box-sizing: border-box; /* Ensures padding is included in the width/height */
  }
  .control-container {
    position: absolute;
    top: 1.5rem;
    left: 1.5rem;
    align-items: center;
  }
  .scorebaord-icon {
    cursor: pointer;
    font-size: 4rem;
  }
  .scoreboard-line {
    font-size: 1.25rem;
    margin: 0.5rem 0;
  }
</style>
