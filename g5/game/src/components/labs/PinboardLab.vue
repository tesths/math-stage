<script setup lang="ts">
/**
 * 钉子板上的多边形 Lab（探索规律）
 * 皮克定理：S = n ÷ 2 + b - 1（n 边上钉子，b 内部钉子）
 * 顶点在格点上，边界/内部钉子数由程序精确计算
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { PINBOARD_SHAPES, pickCheck, pointStatus as pinStatus } from '@/lib/labs/pinboard'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

/** 预设多边形来自共用模块（图形数据只此一份） */
const SHAPES = PINBOARD_SHAPES

const shapeIdx = computed(() => Math.round(props.values.shape ?? 0) % SHAPES.length)
const shape = computed(() => SHAPES[shapeIdx.value]!)

/**
 * 内部钉子逐个**数**出来（边上判定 + 射线法），再用皮克定理去对鞋带公式的面积。
 * 早期实现是 `b = 面积 − n/2 + 1` 再代回公式，等于把结论当前提，图上钉子与公式还可能对不上。
 */
const check = computed(() => pickCheck(shape.value.pts))
const area = computed(() => check.value.area)
const n = computed(() => check.value.n)
const b = computed(() => check.value.b)
const pickArea = computed(() => check.value.pickArea)
const pickAgree = computed(() => check.value.ok)
const pickFormula = computed(() => check.value.formula)

/** 渲染用：缩放后的顶点（格点 1 = 40px，翻 y） */
const CELL = 40
const OX = 45
const OY = 55
const viewPts = computed(() =>
  shape.value.pts.map(([x, y]) => ({ x: OX + x * CELL, y: OY + y * CELL })),
)
const polyPoints = computed(() => viewPts.value.map((p) => `${p.x},${p.y}`).join(' '))

const boardPins = computed(() => {
  const out: { x: number; y: number; st: 'boundary' | 'inside' | 'outside' }[] = []
  for (let gy = 0; gy <= 6; gy++) {
    for (let gx = 0; gx <= 8; gx++) {
      out.push({ x: OX + gx * CELL, y: OY + gy * CELL, st: pinStatus(shape.value.pts, gx, gy) })
    }
  }
  return out
})
</script>

<template>
  <div class="pinboard-wrap">
    <svg viewBox="0 0 400 340" class="w-full">
      <!-- 钉子板 -->
      <rect x="20" y="20" width="350" height="290" rx="8" class="board" />
      <g v-for="(pin, i) in boardPins" :key="i">
        <circle :cx="pin.x" :cy="pin.y" r="4" class="pin-plain" :class="pin.st" />
      </g>
      <!-- 多边形 -->
      <polygon :points="polyPoints" class="poly-fill" />
      <polyline :points="polyPoints" fill="none" class="poly-line" />
      <!-- 顶点 -->
      <circle
        v-for="(p, i) in viewPts"
        :key="i"
        :cx="p.x"
        :cy="p.y"
        r="6"
        class="vertex"
      />
      <text x="390" y="330" text-anchor="end" class="shape-name">{{ shape.name }}</text>
    </svg>

    <div class="pin-legend" aria-label="钉子分类图例">
      <span><i class="legend-dot boundary" />边上钉子 n：在多边形边上</span>
      <span><i class="legend-dot inside" />内部钉子 b：在多边形内部</span>
      <span><i class="legend-dot outside" />不计入：在图形外部</span>
    </div>

    <div class="pick-box">
      <div class="pick-stat">
        <span class="pick-label">边上钉子 n</span>
        <strong>{{ n }}</strong>
      </div>
      <span class="pick-op">÷ 2</span>
      <span class="pick-plus">+</span>
      <div class="pick-stat">
        <span class="pick-label">内部钉子 b</span>
        <strong>{{ b }}</strong>
      </div>
      <span class="pick-op">− 1</span>
      <span class="pick-eq">=</span>
      <div class="pick-stat">
        <span class="pick-label">面积 S</span>
        <strong class="pick-result">{{ pickArea }}</strong>
      </div>
      <p class="pick-formula">{{ pickFormula }}</p>
      <p class="pick-check">
        ✓ 边上 {{ n }} 个、内部 {{ b }} 个钉子都是逐个数出来的（内部用射线法判定），
        代进公式得 {{ pickArea }}；再用鞋带公式/数方格算同一个多边形，面积也是 {{ area }}——
        <b v-if="pickAgree">两者一致，皮克定理成立</b><b v-else>两者不一致，请检查</b>
      </p>
    </div>
  </div>
</template>

<style scoped>
.pinboard-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
}
svg {
  max-width: 644px;
}
.board {
  fill: var(--ui-bg-muted);
  stroke: var(--ui-border-accented);
}
.pin-plain {
  fill: var(--ui-text-muted);
  opacity: 0.35;
}
.pin-plain.boundary {
  fill: var(--ui-primary);
  opacity: 1;
}
.pin-plain.inside {
  fill: color-mix(in srgb, var(--ui-primary) 70%, white);
  opacity: 0.9;
}
.poly-fill {
  fill: color-mix(in srgb, var(--ui-primary) 20%, transparent);
}
.poly-line {
  stroke: var(--ui-primary);
  stroke-width: 3;
  stroke-linejoin: round;
}
.vertex {
  fill: var(--ui-text-highlighted);
  stroke: white;
  stroke-width: 1.5;
}
.shape-name {
  font-size: 14px;
  fill: var(--ui-text-muted);
  font-weight: 700;
}
.pin-legend {
  display: flex;
  justify-content: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  max-width: 38rem;
}
.pin-legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  color: var(--ui-text-toned);
  font-weight: 700;
}
.legend-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 9999px;
  display: inline-block;
}
.legend-dot.boundary {
  background: var(--ui-primary);
}
.legend-dot.inside {
  background: color-mix(in srgb, var(--ui-primary) 70%, white);
  border: 1px solid var(--ui-primary);
}
.legend-dot.outside {
  background: var(--ui-text-muted);
  opacity: 0.35;
}
.pick-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  background: var(--ui-bg-muted);
  border-radius: var(--ui-radius-xl);
  padding: 0.7rem 1rem;
}
.pick-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.pick-label {
  font-size: 0.7rem;
  color: var(--ui-text-muted);
}
.pick-stat strong {
  font-size: 1.3rem;
  color: var(--ui-text-highlighted);
}
.pick-stat strong.pick-result {
  color: var(--ui-primary);
  font-size: 1.6rem;
}
.pick-op,
.pick-plus,
.pick-eq {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ui-text-muted);
}
.pick-check {
  width: 100%;
  text-align: center;
  font-size: 0.8rem;
  color: var(--ui-success, #16a34a);
  font-weight: 600;
}
.pick-formula {
  width: 100%;
  text-align: center;
  font-size: 0.9rem;
  color: var(--ui-primary);
  font-weight: 800;
  margin: 0;
}
@media (max-width: 520px) {
  .pin-legend {
    gap: 0.3rem;
  }
  .pin-legend span {
    width: min(100%, 18rem);
    justify-content: center;
  }
}
</style>
