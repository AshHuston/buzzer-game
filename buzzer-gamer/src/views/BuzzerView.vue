<script setup>
import { bunBuiltin } from 'globals'
import { onMounted, ref } from 'vue'

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

function handleSubmit(){
  gameCode.value = inputCode.value.value
  playerName.value = inputName.value.value
}

function onClick() {
  buttonIsDisabled.value = true
  buttonText.value = "YOU'VE BUZZED IN.\nWAIT FOR HOST TO RESET BUZZERS."
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
    <form>
      <wa-input ref="inputName" label="Name" :placeholder="placeholderName"></wa-input>
      <br/>
      <wa-input ref="inputCode" label="Game Code" placeholder="XXXX"></wa-input>
      <wa-button slot="footer" data-dialog="close" @click="handleSubmit">Join Game</wa-button>  
    </form>
      
  </wa-dialog>

  <div>
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