import { useDeckState } from './useDeckState'

// Web Audio 合成音效（离线版构建时整体禁用）
const state = useDeckState()
let audioCtx = null

function initAudio() {
  if (audioCtx) {
    if (audioCtx.state === 'suspended') audioCtx.resume()
    return
  }
  const AC = window.AudioContext || window.webkitAudioContext
  if (AC) audioCtx = new AC()
}

export function useSound() {
  function play(type) {
    if (__OFFLINE__) return          // 离线版：无音效
    if (!state.soundOn) return
    try {
      initAudio()
      if (!audioCtx) return
      const now = audioCtx.currentTime

      if (type === 'pop') {
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(350, now)
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.08)
        gain.gain.setValueAtTime(0.25, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)
        osc.connect(gain); gain.connect(audioCtx.destination)
        osc.start(now); osc.stop(now + 0.08)
      } else if (type === 'success') {
        const notes = [523.25, 659.25, 783.99, 1046.5]
        notes.forEach((freq, idx) => {
          const o = audioCtx.createOscillator()
          const g = audioCtx.createGain()
          o.type = 'triangle'
          o.frequency.setValueAtTime(freq, now + idx * 0.08)
          g.gain.setValueAtTime(0.2, now + idx * 0.08)
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25)
          o.connect(g); g.connect(audioCtx.destination)
          o.start(now + idx * 0.08); o.stop(now + idx * 0.08 + 0.25)
        })
      } else if (type === 'breeze') {
        const size = audioCtx.sampleRate * 0.4
        const buffer = audioCtx.createBuffer(1, size, audioCtx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1
        const noise = audioCtx.createBufferSource()
        noise.buffer = buffer
        const filter = audioCtx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(300, now)
        filter.frequency.linearRampToValueAtTime(700, now + 0.2)
        filter.frequency.linearRampToValueAtTime(200, now + 0.4)
        const gain = audioCtx.createGain()
        gain.gain.setValueAtTime(0.12, now)
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4)
        noise.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination)
        noise.start(now)
      }
    } catch (e) {
      console.warn('audio unavailable', e)
    }
  }
  return { play }
}
