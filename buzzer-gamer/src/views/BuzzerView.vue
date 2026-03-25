<script setup>
import { onMounted, ref } from 'vue'
import { io } from 'socket.io-client'

const buttonIsDisabled = ref(false)
const inputName = ref('')
const inputCode = ref('')
const playerName = ref('')
const gameCode = ref('')
const placeholderName = ref('')
const buttonText = ref('TAP TO BUZZ IN')

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

const socket = io('http://localhost:3000')

socket.on('buzzReset', () => {
  buttonIsDisabled.value = false
  buttonText.value = "TAP TO BUZZ IN"
})
socket.on('buzzOrderUpdated', (order) => {
  console.log('Buzz order:', order)

 // buzzList.value = order
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
  buttonIsDisabled.value = true
  buttonText.value = "YOU'VE BUZZED IN.\nWAIT FOR HOST TO RESET BUZZERS."
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
      <wa-input ref="inputCode" label="Game Code" placeholder="XXXX"></wa-input>
      <wa-button data-dialog="close" @click="handleSubmit">Join Game</wa-button>  
    </form>
      
  </wa-dialog>

  <div class="name">
    <h1>{{ playerName }}</h1>
  </div>
  <div 
    @click="onClick"
    class="circle"
     :class="{ 'color-untapped': !buttonIsDisabled, 'color-tapped': buttonIsDisabled }"
  >
    {{ buttonText }}
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
  .color-untapped {
    background-color: #e05941; /* Tomato color */
  }
  .color-tapped {
    background-color: #7e3326; /* Tomato color */
  }
</style>