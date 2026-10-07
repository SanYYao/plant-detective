<script setup>
import { markRaw, watchEffect } from 'vue'
import SlideDeck from './engine/components/SlideDeck.vue'
import ParticleField from './engine/components/ParticleField.vue'
import BadgeBar from './engine/components/BadgeBar.vue'
import HeroSlide from './engine/slides/HeroSlide.vue'
import LeafSlide from './engine/slides/LeafSlide.vue'
import BreakfastSlide from './engine/slides/BreakfastSlide.vue'
import SeedSlide from './engine/slides/SeedSlide.vue'
import FlowerSlide from './engine/slides/FlowerSlide.vue'
import ChatSlide from './engine/slides/ChatSlide.vue'
import CertificateSlide from './engine/slides/CertificateSlide.vue'
import deck from './decks/plant-detective/index.js'
import badges from './decks/plant-detective/badges.js'
import { useProgress } from './engine/composables/useProgress'

// 幻灯片类型 → 组件 的注册表。
// 加新类型（如 'quiz' 小测验）只需在这里注册 + 在内容包里引用。
const registry = {
  hero: markRaw(HeroSlide),
  leaf: markRaw(LeafSlide),
  breakfast: markRaw(BreakfastSlide),
  seed: markRaw(SeedSlide),
  flower: markRaw(FlowerSlide),
  chat: markRaw(ChatSlide),
  certificate: markRaw(CertificateSlide),
}

// 「植物大侦探」：集齐其余全部徽章时自动点亮
const { unlock, isUnlocked } = useProgress()
watchEffect(() => {
  const others = badges.filter(b => b.id !== 'master')
  if (others.every(b => isUnlocked(b.id)) && !isUnlocked('master')) unlock('master')
})
</script>

<template>
  <ParticleField />
  <SlideDeck :slides="deck.slides" :registry="registry" :meta="deck.meta" />
  <BadgeBar :badges="badges" />
</template>
