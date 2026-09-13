<script setup lang="ts">
/**
 * 面积单位换算 Lab：平方厘米 ↔ 平方分米 ↔ 平方米
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { deriveAreaUnitConversion } from '@/lib/labs/areaUnit'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const conversion = computed(() => deriveAreaUnitConversion(props.values))
</script>

<template>
  <div class="unit-wrap">
    <!-- 进率示意图：1 平方分米 = 100 平方厘米 -->
    <div class="lesson-board">
      <div class="side-measure">
        <span class="side-label">{{ conversion.bigSideLabel }}</span>
        <span class="side-bracket" />
      </div>

      <div class="square-stack" :aria-label="conversion.relationText">
        <div class="top-strip" aria-hidden="true">
          <span v-for="i in 10" :key="`top-${i}`" class="edge-cell" />
        </div>
        <div class="square-row">
          <div class="left-strip" aria-hidden="true">
            <span v-for="i in 10" :key="`left-${i}`" class="edge-cell" />
          </div>
          <div class="big-area">
            <span v-for="i in 100" :key="`grid-${i}`" class="mini-cell" />
            <div class="area-badge">
              <strong>1 {{ conversion.bigUnit }}</strong>
              <small>10 × 10 = 100 个 1 {{ conversion.smallUnit }}</small>
            </div>
          </div>
        </div>
      </div>

      <div class="tile-callout">
        <span class="tile-side">{{ conversion.smallSideLabel }}</span>
        <span class="callout-bracket" />
        <span class="sample-tile" />
        <span class="sample-note">1 {{ conversion.smallUnit }}</span>
      </div>
    </div>

    <div class="rule-line">
      <span>{{ conversion.relationText }}</span>
      <b>{{ conversion.operationText }}</b>
    </div>

    <div class="formula-row">
      <span class="chip">{{ conversion.fromValue }} {{ conversion.fromUnit }}</span>
      <span class="chip op">= {{ conversion.result }} {{ conversion.toUnit }}</span>
    </div>

    <div class="steps-inline">
      <div class="step-pair">
        <span class="big-box">{{ conversion.fromValue }} {{ conversion.fromUnit }}</span>
        <span class="op-sym">{{ conversion.operationSymbol }} 100</span>
        <span class="small-box">{{ conversion.result }} {{ conversion.toUnit }}</span>
      </div>
      <p class="note">
        {{ conversion.actionText }}。相邻面积单位之间的进率是 <b>100</b>，因为面积是二维铺满，不是只看一条边。
      </p>
    </div>
  </div>
</template>

<style scoped>
.unit-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}
.lesson-board {
  --tile: 24px;
  display: grid;
  box-sizing: border-box;
  grid-template-columns: minmax(56px, auto) auto minmax(96px, auto);
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  width: min(100%, 520px);
  padding: 0.45rem 0.25rem;
}
.side-measure {
  display: grid;
  grid-template-columns: auto 18px;
  gap: 0.3rem;
  align-items: center;
  height: calc(var(--tile) * 10);
  margin-top: var(--tile);
}
.side-label {
  color: var(--ui-text-highlighted);
  font-size: 1.15rem;
  font-weight: 800;
  white-space: nowrap;
}
.side-bracket,
.callout-bracket {
  position: relative;
  display: block;
  width: 14px;
  border-left: 2px solid var(--ui-primary);
  border-radius: 12px 0 0 12px;
  opacity: 0.85;
}
.side-bracket {
  height: 100%;
}
.side-bracket::before,
.side-bracket::after,
.callout-bracket::before,
.callout-bracket::after {
  position: absolute;
  left: -2px;
  width: 14px;
  height: 14px;
  border-left: 2px solid var(--ui-primary);
  content: '';
}
.side-bracket::before,
.callout-bracket::before {
  top: 0;
  border-top: 2px solid var(--ui-primary);
  border-radius: 12px 0 0 0;
}
.side-bracket::after,
.callout-bracket::after {
  bottom: 0;
  border-bottom: 2px solid var(--ui-primary);
  border-radius: 0 0 0 12px;
}
.square-stack {
  width: calc(var(--tile) * 11);
}
.top-strip {
  display: grid;
  grid-template-columns: repeat(10, var(--tile));
  margin-left: var(--tile);
}
.square-row {
  display: flex;
}
.left-strip {
  display: grid;
  grid-template-rows: repeat(10, var(--tile));
  width: var(--tile);
}
.edge-cell,
.sample-tile {
  width: var(--tile);
  height: var(--tile);
  border: 1px solid color-mix(in srgb, var(--ui-primary) 55%, white);
  border-radius: 1px;
  background: color-mix(in srgb, var(--ui-primary) 18%, white);
}
.big-area {
  position: relative;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  width: calc(var(--tile) * 10);
  aspect-ratio: 1;
  overflow: hidden;
  border: 2px solid color-mix(in srgb, var(--ui-primary) 78%, white);
  border-radius: 4px;
  background: color-mix(in srgb, var(--ui-primary) 34%, white);
  box-shadow: 0 6px 14px color-mix(in srgb, var(--ui-primary) 10%, transparent);
}
.mini-cell {
  min-width: 0;
  min-height: 0;
  border-right: 1px solid color-mix(in srgb, var(--ui-primary) 20%, white);
  border-bottom: 1px solid color-mix(in srgb, var(--ui-primary) 20%, white);
  background: color-mix(in srgb, var(--ui-primary) 28%, white);
}
.area-badge {
  position: absolute;
  inset: 50% auto auto 50%;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 8.2rem;
  transform: translate(-50%, -50%);
  border: 1px solid color-mix(in srgb, var(--ui-primary) 24%, white);
  border-radius: var(--ui-radius-md);
  background: color-mix(in srgb, var(--ui-bg) 88%, transparent);
  padding: 0.45rem 0.65rem;
  color: var(--ui-primary);
  text-align: center;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.07);
}
.area-badge strong {
  font-size: 0.98rem;
  line-height: 1.2;
}
.area-badge small {
  font-size: 0.68rem;
  color: var(--ui-text-toned);
}
.tile-callout {
  display: grid;
  grid-template-columns: auto 14px var(--tile);
  grid-template-rows: auto auto;
  gap: 0.28rem 0.45rem;
  align-items: center;
}
.tile-side {
  color: var(--ui-text-highlighted);
  font-size: 0.95rem;
  font-weight: 800;
  white-space: nowrap;
}
.callout-bracket {
  height: var(--tile);
}
.sample-note {
  grid-column: 1 / 4;
  color: var(--ui-primary);
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.25;
  text-align: right;
  white-space: nowrap;
}
.rule-line {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  color: var(--ui-text-highlighted);
  font-size: 0.9rem;
}
.rule-line span,
.rule-line b {
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
}
.rule-line span {
  border: 1px solid rgba(82, 136, 197, 0.28);
  background: rgba(82, 136, 197, 0.08);
}
.rule-line b {
  background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
  color: var(--ui-primary);
}
.formula-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.chip {
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  padding: 0.3rem 0.8rem;
  font-size: 0.95rem;
  color: var(--ui-text-toned);
}
.chip.op {
  background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
.steps-inline {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: center;
}
.step-pair {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 800;
}
.big-box,
.small-box {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-md);
  background: var(--ui-bg-muted);
  padding: 0.3rem 0.7rem;
  color: var(--ui-text-highlighted);
}
.op-sym {
  color: var(--ui-primary);
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  text-align: center;
}
.note b {
  color: var(--ui-primary);
}

@media (max-width: 640px) {
  .unit-wrap {
    min-height: 320px;
  }
  .lesson-board {
    --tile: clamp(15px, 4.45vw, 18px);
    grid-template-columns: auto auto;
    grid-template-areas:
      'measure square'
      'callout callout';
    gap: 0.35rem;
    padding: 0.35rem 0.1rem;
  }
  .side-measure {
    grid-area: measure;
  }
  .square-stack {
    grid-area: square;
  }
  .tile-callout {
    grid-area: callout;
    justify-content: center;
  }
  .side-label {
    font-size: 0.95rem;
  }
  .tile-side {
    font-size: 0.9rem;
  }
  .area-badge {
    min-width: 7rem;
    padding: 0.35rem 0.45rem;
  }
  .area-badge strong {
    font-size: 0.86rem;
  }
  .area-badge small {
    font-size: 0.6rem;
  }
  .sample-note {
    text-align: center;
  }
}
</style>
