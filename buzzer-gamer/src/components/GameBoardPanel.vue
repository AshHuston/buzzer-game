<template>
  <div class="gameboard wa-grid wa-gap-m">
    <div class="wa-grid wa-gap-xs" :style="{ display: 'grid',
      gridTemplateColumns: `repeat(${categories.length}, 1fr)`
    }">
      <div
        v-for="category, index in categories"
        :key="index"
        class="wa-stack wa-gap-xs"
      >
        <p class="section-tile">{{ category.name }}</p>
        <wa-divider style="--width:1px; --color: grey;" />
        <p
          class="section-tile answer-tile"
          v-for="(question, qIndex) in category.questions"
          :key="qIndex"
        >
          <span>Q: {{ question.question }}</span>
          --------------------
          <span>A: {{ question.answer }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>

defineProps({
  categories: {
    type: Array,
    required: true
  }
})

</script>

<style scoped>
.section-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 11vw;
  aspect-ratio: 1.6;
  background-color: #4a90e2;
  color: white;
  border: 2px solid #333;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  font-size: 2rem;
  line-height: 95%;
}

.answer-tile {
  font-size: 1rem;
}
</style>
