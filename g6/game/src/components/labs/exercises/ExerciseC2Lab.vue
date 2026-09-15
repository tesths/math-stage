<script setup lang="ts">
/**
 * 二 混合运算与数量关系（三）练习题 Lab：
 *   既喜欢跳舞又唱歌（集合重叠）/ 一筐鸡蛋卖多少元（筐重抵消）
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { toFixed2 } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 既喜欢跳舞又唱歌：双长条叠加 ---------- */
const BAR_X = 20
const BAR_W = 500
const total = computed(() => props.values.total ?? 48)
const dn = computed(() => Math.round(props.values.dn ?? 2))
const sn = computed(() => Math.round(props.values.sn ?? 3))
const dance = computed(() => (total.value * dn.value) / 3)
const sing = computed(() => (total.value * sn.value) / 4)
const overlap = computed(() => dance.value + sing.value - total.value)
/** 长条宽度按“总人数”等比换算，三条右端都封顶在 BAR_X + BAR_W */
const danceW = computed(() => (BAR_W * dn.value) / 3)
const singW = computed(() => (BAR_W * sn.value) / 4)
const danceRight = computed(() => BAR_X + danceW.value)
const singLeft = computed(() => BAR_X + BAR_W - singW.value)
const overlapX = computed(() => singLeft.value)
const overlapW = computed(() => danceRight.value - singLeft.value)
const overlapMid = computed(() => (singLeft.value + danceRight.value) / 2)

/* ---------- 一筐鸡蛋卖多少元：上下堆叠条 ---------- */
const EGG_X = 20
const PX_PER_KG = 40
const crate = computed(() => props.values.crate ?? 1)
const withEggs = computed(() => props.values.withEggs ?? 8)
const price = computed(() => props.values.price ?? 12.8)
const eggs = computed(() => withEggs.value - crate.value)
const half = computed(() => eggs.value / 2)
const after = computed(() => crate.value + half.value)
const revenue = computed(() => eggs.value * price.value)
const crateW = computed(() => crate.value * PX_PER_KG)
const eggsW = computed(() => eggs.value * PX_PER_KG)
const halfW = computed(() => half.value * PX_PER_KG)
const fullW = computed(() => withEggs.value * PX_PER_KG)
const afterW = computed(() => after.value * PX_PER_KG)
/** 一半鸡蛋的分界竖线：正好落在下条鸡蛋段右端 */
const dividerX = computed(() => EGG_X + afterW.value)
const diffMid = computed(() => (dividerX.value + EGG_X + fullW.value) / 2)
</script>

<template>
  <div class="ex-c2-wrap">
    <!-- 既喜欢跳舞又唱歌 -->
    <template v-if="kind === 'ex-c2-overlap-club'">
      <div class="ex-c2-svg-box">
        <svg class="ex-c2-overlap-svg" width="660" height="300" viewBox="0 0 660 300">
          <defs>
            <pattern
              id="ex-c2-hatch"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="8" stroke="#f59e0b" stroke-width="3" />
            </pattern>
            <marker id="ex-c2-ov-l" markerWidth="8" markerHeight="8" refX="1" refY="4" orient="auto">
              <polygon points="8 0, 0 4, 8 8" fill="#0369a1" />
            </marker>
            <marker id="ex-c2-ov-r" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#0369a1" />
            </marker>
          </defs>

          <!-- 灰色参照条：全班人数 -->
          <rect class="overlap-bar ref" :x="BAR_X" y="34" :width="BAR_W" height="16" rx="4" />
          <text class="ex-lbl" :x="BAR_X + BAR_W + 8" y="47">全班 {{ total }} 人</text>

          <!-- 蓝色：喜欢跳舞，从左侧起 -->
          <rect class="overlap-bar dance" :x="BAR_X" y="76" :width="danceW" height="40" rx="6" />
          <text class="ex-lbl sky" :x="danceRight + 8" y="100">跳舞 {{ toFixed2(dance) }} 人</text>

          <!-- 绿色：喜欢唱歌，右端对齐 -->
          <rect class="overlap-bar sing" :x="singLeft" y="150" :width="singW" height="40" rx="6" />
          <text class="ex-lbl green" :x="BAR_X + BAR_W + 8" y="174">唱歌 {{ toFixed2(sing) }} 人</text>

          <!-- 交叉重叠区：斜线高亮 -->
          <rect
            class="overlap-mark"
            :x="overlapX"
            y="76"
            :width="overlapW"
            height="114"
            fill="url(#ex-c2-hatch)"
            opacity="0.55"
          />

          <!-- 重叠量双箭头 -->
          <line
            class="overlap-arrow"
            :x1="overlapX"
            y1="214"
            :x2="overlapX + overlapW"
            y2="214"
            stroke="#0369a1"
            stroke-width="2"
            marker-start="url(#ex-c2-ov-l)"
            marker-end="url(#ex-c2-ov-r)"
          />
          <line :x1="overlapX" y1="196" :x2="overlapX" y2="220" stroke="#0369a1" stroke-width="1.2" stroke-dasharray="3 3" />
          <line
            :x1="overlapX + overlapW"
            y1="196"
            :x2="overlapX + overlapW"
            y2="220"
            stroke="#0369a1"
            stroke-width="1.2"
            stroke-dasharray="3 3"
          />
          <text class="ex-lbl sky" :x="overlapMid" y="240" text-anchor="middle">重叠 {{ toFixed2(overlap) }} 人</text>
        </svg>
      </div>
      <p class="ex-c2-note">两部分相加，把“两样都喜欢”的人算了两遍</p>
      <p class="ex-c2-res">
        重叠 = {{ toFixed2(dance) }} + {{ toFixed2(sing) }} − {{ total }} = <b>{{ toFixed2(overlap) }} 人</b>
      </p>
    </template>

    <!-- 一筐鸡蛋卖多少元 -->
    <template v-else>
      <div class="ex-c2-svg-box">
        <svg class="ex-c2-egg-svg" width="660" height="300" viewBox="0 0 660 300">
          <defs>
            <marker id="ex-c2-eg-l" markerWidth="8" markerHeight="8" refX="1" refY="4" orient="auto">
              <polygon points="8 0, 0 4, 8 8" fill="#b45309" />
            </marker>
            <marker id="ex-c2-eg-r" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#b45309" />
            </marker>
          </defs>

          <!-- 上条：连筐重 = 筐 + 全部鸡蛋 -->
          <rect class="crate-seg" :x="EGG_X" y="50" :width="crateW" height="44" rx="4" />
          <rect class="egg-seg" :x="EGG_X + crateW" y="50" :width="eggsW" height="44" rx="4" />
          <text class="ex-lbl" :x="EGG_X + fullW + 8" y="77">连筐重 {{ toFixed2(withEggs) }} 千克</text>

          <!-- 一半鸡蛋的分界竖线：平分上条鸡蛋段 -->
          <line
            class="half-divider"
            :x1="dividerX"
            y1="50"
            :x2="dividerX"
            y2="214"
            stroke="#0369a1"
            stroke-width="1.5"
            stroke-dasharray="5 4"
          />
          <text class="ex-lbl sky" :x="EGG_X + crateW + eggsW / 4" y="77" text-anchor="middle">
            {{ toFixed2(half) }} 千克
          </text>
          <text class="ex-lbl sky" :x="EGG_X + crateW + eggsW * 0.75" y="77" text-anchor="middle">
            {{ toFixed2(half) }} 千克
          </text>

          <!-- 下条：卖出一半后连筐重 = 筐 + 一半鸡蛋 -->
          <rect class="crate-seg" :x="EGG_X" y="170" :width="crateW" height="44" rx="4" />
          <rect class="egg-seg half" :x="EGG_X + crateW" y="170" :width="halfW" height="44" rx="4" />
          <text class="ex-lbl" :x="EGG_X + afterW + 8" y="197">卖出一半后连筐重 {{ toFixed2(after) }} 千克</text>

          <!-- 两右端相差 = 一半鸡蛋 -->
          <line
            class="diff-arrow"
            :x1="dividerX"
            y1="140"
            :x2="EGG_X + fullW"
            y2="140"
            stroke="#b45309"
            stroke-width="2"
            marker-start="url(#ex-c2-eg-l)"
            marker-end="url(#ex-c2-eg-r)"
          />
          <text class="ex-lbl amber" :x="diffMid" y="132" text-anchor="middle">
            相差 {{ toFixed2(half) }} 千克 = 一半鸡蛋
          </text>
        </svg>
      </div>
      <p class="ex-c2-note">两次称重都含筐重，筐重相减正好抵消</p>
      <p class="ex-c2-res">
        {{ toFixed2(withEggs) }} − {{ toFixed2(after) }} = {{ toFixed2(half) }} 千克（一半）· 全部
        {{ toFixed2(eggs) }} 千克 · {{ toFixed2(eggs) }} × {{ toFixed2(price) }} =
        <b>{{ toFixed2(revenue) }} 元</b>
      </p>
    </template>
  </div>
</template>

<style scoped>
.ex-c2-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
  width: 100%;
}
.ex-c2-svg-box {
  display: flex;
  justify-content: center;
  width: 100%;
}
.ex-c2-svg-box svg {
  max-width: 100%;
  height: auto;
}
.ex-lbl {
  font-size: 12px;
  font-weight: 700;
  fill: var(--ui-text-toned);
}
.ex-lbl.sky {
  fill: #0369a1;
}
.ex-lbl.green {
  fill: #15803d;
}
.ex-lbl.amber {
  fill: #b45309;
}
.overlap-bar {
  transition: width 0.3s ease;
}
.overlap-bar.ref {
  fill: var(--ui-bg-muted);
  stroke: var(--ui-border);
  stroke-width: 1;
}
.overlap-bar.dance {
  fill: #0369a1;
}
.overlap-bar.sing {
  fill: #16a34a;
}
.overlap-mark {
  pointer-events: none;
}
.crate-seg {
  fill: #b45309;
  transition: width 0.3s ease;
}
.egg-seg {
  fill: #f59e0b;
  transition: width 0.3s ease;
}
.egg-seg.half {
  fill: color-mix(in srgb, #f59e0b 55%, white);
}
.ex-c2-note {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  text-align: center;
}
.ex-c2-res {
  font-size: 0.95rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
  text-align: center;
  line-height: 1.7;
}
.ex-c2-res b {
  color: var(--ui-primary);
  font-size: 1.05rem;
}
</style>
