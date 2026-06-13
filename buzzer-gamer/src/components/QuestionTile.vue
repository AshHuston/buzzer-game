<!-- eslint-disable vue/no-deprecated-slot-attribute -->
<template>
  <div class="question-tile" :class="{questionless : question==''}" @click="modalWasOpened = true; openDialog()">
    <p v-if="!modalWasOpened" class="pointsText">{{ value }}</p>
  </div>
  <wa-dialog
    :label="'For '+value+' points...'"
    ref="dialogRef"
    light-dismiss
    class="question-dialog"
    @open="modalWasOpened = true"
    style="--width: 55vw;"
  >
    <wa-button slot="footer" @click="showAnswer=true">Show Answer</wa-button>
    <h1>
      <span v-for="(char, index) in question" :key="index">
        <span v-if="char === '♦' || char === '♥'" class="red-text">{{ char }}</span>
        <template v-else>{{ char }}</template>
      </span>
    </h1>
    <wa-divider />
    <h1 v-if="showAnswer">{{ answer }}</h1>
    <h1 v-else class="blank">_</h1>
  </wa-dialog>
</template>

<script setup>
import { ref } from 'vue'

const dialogRef = ref()

function openDialog() {
  dialogRef.value.open = true
}

const props = defineProps({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
})

const modalWasOpened = ref(props.opened)
const showAnswer = ref(false)
</script>

<style scoped>
.question-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 13vw;
  aspect-ratio: 1.8;
  background-color: #4a90e2;
  color: white;
  border: 2px solid #333;
  border-radius: 8px;
  cursor: pointer;
}

.questionless {
  background-color: tomato;
}

.question-dialog {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

wa-divider {
  margin: 1.5rem 0;
}

.blank {
  color: transparent;
}

.pointsText {
  font-size: 4rem;
}

.red-text {
  color: tomato;
}
</style>
