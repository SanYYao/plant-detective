<script setup>
import { markRaw } from 'vue'
import SlideDeck from './engine/components/SlideDeck.vue'
import ParticleField from './engine/components/ParticleField.vue'
import HeroSlide from './engine/slides/HeroSlide.vue'
import LeafSlide from './engine/slides/LeafSlide.vue'
import BreakfastSlide from './engine/slides/BreakfastSlide.vue'
import SeedSlide from './engine/slides/SeedSlide.vue'
import ChatSlide from './engine/slides/ChatSlide.vue'
import CertificateSlide from './engine/slides/CertificateSlide.vue'
import deck from './decks/plant-detective/index.js'

// 幻灯片类型 → 组件 的注册表。
// 加新类型（如 'quiz' 小测验）只需在这里注册 + 在内容包里引用。
const registry = {
  hero: markRaw(HeroSlide),
  leaf: markRaw(LeafSlide),
  breakfast: markRaw(BreakfastSlide),
  seed: markRaw(SeedSlide),
  chat: markRaw(ChatSlide),
  certificate: markRaw(CertificateSlide),
}
</script>

<template>
  <ParticleField />
  <SlideDeck :slides="deck.slides" :registry="registry" :meta="deck.meta" />
</template>
