<script setup lang="ts">
/**
 * 练习题 Lab（四 比和比例）：
 * - ex-c4-cube-ratio      棱长比·面积比·体积比（等轴测正方体 + 底面积方格 + 三枚比徽章）
 * - ex-c4-football-ratio  足球皮·按比分黑白（按 a:b 分段的份数横条 + 步骤卡）
 *
 * 过程态：
 * - cube：初值停在第 2 步（三个比全显示，与既有渲染一致），点按钮逐步回到「只看棱长比」，
 *   再一步一步揭开「底面积比 = 棱长比²」与「体积比 = 棱长比³」，图形随之出现 / 高亮。
 * - football：初值停在第 2 步（块数、步骤卡、合计齐全），点按钮回到「先求 1 份」，
 *   再揭开黑白块数，最后露出「合计 = 总数」的校验。
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { simplifyRatio, toFixed2 } from '@/lib/engine/math'
import { playClick } from '@/lib/sound'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ================= 棱长比·面积比·体积比 ================= */
const cAIn = computed(() => Math.round(props.values.a ?? 4))
const cBIn = computed(() => Math.round(props.values.b ?? 6))
/** 两个棱长独立可调：小 = min、大 = max，避免出现“小正方体比大正方体还大” */
const cA = computed(() => Math.min(cAIn.value, cBIn.value))
const cB = computed(() => Math.max(cAIn.value, cBIn.value))
const cubeRatios = computed(() => {
  const [ra, rb] = simplifyRatio(cA.value, cB.value)
  const [aa, ab] = simplifyRatio(cA.value ** 2, cB.value ** 2)
  const [va, vb] = simplifyRatio(cA.value ** 3, cB.value ** 3)
  return { edge: `${ra}:${rb}`, area: `${aa}:${ab}`, vol: `${va}:${vb}` }
})

/* ---------- 过程态：分步揭示 棱长比 → 底面积比（平方）→ 体积比（立方） ---------- */
/**
 * 初值 2 = 最完整的一步，与既有渲染完全一致；点一次往前走一步，走完回到第 0 步。
 * 第 0 步只看棱长（立体图），第 1 步才揭开底面积方格，第 2 步才揭开体积比。
 */
const CUBE_STEPS = ['棱长比', '底面积比（棱长比²）', '体积比（棱长比³）']
const cubeStep = ref(2)
const showArea = computed(() => cubeStep.value >= 1)
const showVol = computed(() => cubeStep.value >= 2)
function nextCubeStep() {
  cubeStep.value = (cubeStep.value + 1) % CUBE_STEPS.length
  playClick()
}
const nextCubeLabel = computed(() => CUBE_STEPS[(cubeStep.value + 1) % CUBE_STEPS.length] ?? CUBE_STEPS[0]!)
const cubeStepNote = computed(() => {
  const A = cA.value
  const B = cB.value
  if (cubeStep.value === 0) {
    return `第 1 步：先看棱长比——小 ${A} 厘米 : 大 ${B} 厘米 = ${cubeRatios.value.edge}`
  }
  if (cubeStep.value === 1) {
    return `第 2 步：底面积比 = 棱长比²——${A}²:${B}² = ${A * A}:${B * B} = ${cubeRatios.value.area}，正好是 ${cubeRatios.value.edge} 的平方`
  }
  return `第 3 步：体积比 = 棱长比³——${A}³:${B}³ = ${A * A * A}:${B * B * B} = ${cubeRatios.value.vol}，正好是 ${cubeRatios.value.edge} 的立方`
})

/** 等轴测正方体：正面正方形 + 顶面/右侧面平行四边形；棱长线性缩放并封顶 */
const CUBE_K = 13
const CUBE_CAP = 120
const CUBE_GROUND = 160
function cubeGeom(cm: number, x0: number) {
  const e = Math.min(CUBE_K * cm, CUBE_CAP)
  const d = Math.min(e * 0.32, 38)
  const right = x0 + e
  const top = CUBE_GROUND - e
  return {
    x0,
    e,
    width: e + d,
    front: `${x0},${CUBE_GROUND} ${right},${CUBE_GROUND} ${right},${top} ${x0},${top}`,
    topFace: `${x0},${top} ${right},${top} ${right + d},${top - d} ${x0 + d},${top - d}`,
    sideFace: `${right},${CUBE_GROUND} ${right + d},${CUBE_GROUND - d} ${right + d},${top - d} ${right},${top}`,
  }
}
const smallCube = computed(() => cubeGeom(cA.value, 14))
const largeCube = computed(() => cubeGeom(cB.value, 14 + smallCube.value.width + 16))

/** 底面积方格：边长线性缩放并封顶，内部按 1 厘米打浅色方格 */
const BASE_K = 16
const BASE_CAP = 150
const BASE_GROUND = 160
const baseSquares = computed(() => {
  const side = (cm: number) => Math.min(BASE_K * cm, BASE_CAP)
  const sa = side(cA.value)
  const sb = side(cB.value)
  return {
    a: { side: sa, x: 24, y: BASE_GROUND - sa, cols: cA.value },
    b: { side: sb, x: 24 + sa + 30, y: BASE_GROUND - sb, cols: cB.value },
  }
})

/* ================= 足球皮·按比分黑白 ================= */
const fA = computed(() => Math.round(props.values.a ?? 3))
const fB = computed(() => Math.round(props.values.b ?? 5))
const fParts = computed(() => fA.value + fB.value)
const fPer = computed(() => Math.round(props.values.per ?? 4))
const fTotal = computed(() => fPer.value * fParts.value)
const fBlack = computed(() => fPer.value * fA.value)
const fWhite = computed(() => fPer.value * fB.value)

/* ---------- 过程态：先求 1 份 → 再分别乘份数 → 合计 = 总数 ---------- */
/**
 * 初值 2 = 最完整的一步，与既有渲染完全一致；点一次往前走一步，走完回到第 0 步。
 * 第 0 步只留“总份数 / 每份”和量条上的一格格；第 1 步揭开黑白块数；第 2 步揭开合计校验。
 */
const FOOT_STEPS = ['先求 1 份', '再分别乘份数', '合计等于总数']
const footStep = ref(2)
const showBlocks = computed(() => footStep.value >= 1)
const showSum = computed(() => footStep.value >= 2)
function nextFootStep() {
  footStep.value = (footStep.value + 1) % FOOT_STEPS.length
  playClick()
}
const nextFootLabel = computed(() => FOOT_STEPS[(footStep.value + 1) % FOOT_STEPS.length] ?? FOOT_STEPS[0]!)
const footStepNote = computed(() => {
  if (footStep.value === 0) {
    return `第 1 步：先求 1 份——${fA.value} + ${fB.value} = ${fParts.value} 份，每份 ${toFixed2(fPer.value)} 块（量条上被分成 ${fParts.value} 小格）`
  }
  if (footStep.value === 1) {
    return `第 2 步：再分别乘份数——黑色 ${toFixed2(fPer.value)} × ${fA.value} = ${toFixed2(fBlack.value)} 块，白色 ${toFixed2(fPer.value)} × ${fB.value} = ${toFixed2(fWhite.value)} 块`
  }
  return `第 3 步：合计 = 总数——${toFixed2(fBlack.value)} + ${toFixed2(fWhite.value)} = ${fTotal.value} 块，和每份 × 总份数算出的总数一样`
})
</script>

<template>
  <div class="ex-c4-wrap">
    <!-- 棱长比·面积比·体积比 -->
    <template v-if="kind === 'ex-c4-cube-ratio'">
      <div class="ex-c4-cube" :class="'c4-cube-step-' + cubeStep">
        <div class="ex-c4-cube-stage" :class="{ 'c4-on': showVol }">
          <svg class="ex-c4-cube-svg" width="300" height="190" viewBox="0 0 300 190">
            <polygon :points="smallCube.topFace" class="c4-face top" />
            <polygon :points="smallCube.sideFace" class="c4-face side" />
            <polygon :points="smallCube.front" class="c4-face front" />
            <polygon :points="largeCube.topFace" class="c4-face top" />
            <polygon :points="largeCube.sideFace" class="c4-face side" />
            <polygon :points="largeCube.front" class="c4-face front" />
            <text
              :x="Math.min(Math.max(smallCube.x0 + smallCube.width / 2, 58), 242)"
              y="182"
              text-anchor="middle"
              class="c4-lbl"
            >
              小正方体棱长 {{ cA }} 厘米
            </text>
            <text
              :x="Math.min(Math.max(largeCube.x0 + largeCube.width / 2, 58), 242)"
              y="182"
              text-anchor="middle"
              class="c4-lbl"
            >
              大正方体棱长 {{ cB }} 厘米
            </text>
          </svg>
        </div>

        <div v-if="showArea" class="ex-c4-base-stage c4-on">
          <svg class="ex-c4-base-svg" width="300" height="200" viewBox="0 0 300 200">
            <rect
              class="c4-base"
              :x="baseSquares.a.x"
              :y="baseSquares.a.y"
              :width="baseSquares.a.side"
              :height="baseSquares.a.side"
            />
            <line
              v-for="i in baseSquares.a.cols - 1"
              :key="'va' + i"
              class="c4-grid"
              :x1="baseSquares.a.x + (i * baseSquares.a.side) / baseSquares.a.cols"
              :y1="baseSquares.a.y"
              :x2="baseSquares.a.x + (i * baseSquares.a.side) / baseSquares.a.cols"
              :y2="baseSquares.a.y + baseSquares.a.side"
            />
            <line
              v-for="i in baseSquares.a.cols - 1"
              :key="'ha' + i"
              class="c4-grid"
              :x1="baseSquares.a.x"
              :y1="baseSquares.a.y + (i * baseSquares.a.side) / baseSquares.a.cols"
              :x2="baseSquares.a.x + baseSquares.a.side"
              :y2="baseSquares.a.y + (i * baseSquares.a.side) / baseSquares.a.cols"
            />
            <rect
              class="c4-base"
              :x="baseSquares.b.x"
              :y="baseSquares.b.y"
              :width="baseSquares.b.side"
              :height="baseSquares.b.side"
            />
            <line
              v-for="i in baseSquares.b.cols - 1"
              :key="'vb' + i"
              class="c4-grid"
              :x1="baseSquares.b.x + (i * baseSquares.b.side) / baseSquares.b.cols"
              :y1="baseSquares.b.y"
              :x2="baseSquares.b.x + (i * baseSquares.b.side) / baseSquares.b.cols"
              :y2="baseSquares.b.y + baseSquares.b.side"
            />
            <line
              v-for="i in baseSquares.b.cols - 1"
              :key="'hb' + i"
              class="c4-grid"
              :x1="baseSquares.b.x"
              :y1="baseSquares.b.y + (i * baseSquares.b.side) / baseSquares.b.cols"
              :x2="baseSquares.b.x + baseSquares.b.side"
              :y2="baseSquares.b.y + (i * baseSquares.b.side) / baseSquares.b.cols"
            />
            <text :x="Math.min(Math.max(baseSquares.a.x + baseSquares.a.side / 2, 66), 234)" y="184" text-anchor="middle" class="c4-lbl">
              底面积 {{ cA }}² = {{ cA * cA }} 平方厘米
            </text>
            <text :x="Math.min(Math.max(baseSquares.b.x + baseSquares.b.side / 2, 66), 234)" y="184" text-anchor="middle" class="c4-lbl">
              底面积 {{ cB }}² = {{ cB * cB }} 平方厘米
            </text>
          </svg>
        </div>

        <div class="ex-c4-badges">
          <div class="ex-c4-badge edge" :class="{ on: cubeStep === 0 }">
            <small>棱长比</small>
            <b>{{ cubeRatios.edge }}</b>
          </div>
          <div v-if="showArea" class="ex-c4-badge area power" :class="{ on: cubeStep === 1 }">
            <small>底面积比</small>
            <b>{{ cubeRatios.area }}</b>
            <span class="ex-c4-power-tag">= 棱长比的平方</span>
          </div>
          <div v-if="showVol" class="ex-c4-badge vol power">
            <small>体积比</small>
            <b>{{ cubeRatios.vol }}</b>
            <span class="ex-c4-power-tag">= 棱长比的立方</span>
          </div>
        </div>
      </div>
      <div class="ex-c4-cube-steps">
        <UButton size="sm" variant="outline" color="neutral" @click="nextCubeStep">
          下一步：{{ nextCubeLabel }}
        </UButton>
        <span class="ex-c4-cube-note">{{ cubeStepNote }}</span>
      </div>
      <p class="ex-c4-cube-sum">
        棱长比 {{ cA }}:{{ cB }} = <b>{{ cubeRatios.edge }}</b><template v-if="showArea">；底面积比
        {{ cA * cA }}:{{ cB * cB }} = <b>{{ cubeRatios.area }}</b>（平方）</template><template v-if="showVol">；体积比
        {{ cA * cA * cA }}:{{ cB * cB * cB }} = <b>{{ cubeRatios.vol }}</b>（立方）</template>
      </p>
    </template>

    <!-- 足球皮·按比分黑白 -->
    <template v-else-if="kind === 'ex-c4-football-ratio'">
      <div class="ex-c4-foot" :class="'c4-foot-step-' + footStep">
        <div class="ex-c4-bar">
          <div class="ex-c4-seg dark" :class="{ on: showBlocks }" :style="{ flexGrow: fA }">
            <div class="ex-c4-cells">
              <span v-for="i in fA" :key="'d' + i" class="ex-c4-per">{{ toFixed2(fPer) }}</span>
            </div>
            <div v-if="showBlocks" class="ex-c4-block dark">黑色皮 {{ toFixed2(fBlack) }} 块</div>
          </div>
          <div class="ex-c4-seg light" :class="{ on: showBlocks }" :style="{ flexGrow: fB }">
            <div class="ex-c4-cells">
              <span v-for="i in fB" :key="'l' + i" class="ex-c4-per">{{ toFixed2(fPer) }}</span>
            </div>
            <div v-if="showBlocks" class="ex-c4-block light">白色皮 {{ toFixed2(fWhite) }} 块</div>
          </div>
        </div>

        <div class="ex-c4-steps">
          <div class="ex-c4-step" :class="{ on: footStep === 0 }">
            <small>总份数</small>
            <b>{{ fA }} + {{ fB }} = {{ fParts }} 份</b>
          </div>
          <div class="ex-c4-step" :class="{ on: footStep === 0 }">
            <small>每份</small>
            <b>{{ fPer }} 块</b>
          </div>
          <div v-if="showBlocks" class="ex-c4-step">
            <small>总块数</small>
            <b>{{ fPer }} × {{ fParts }} = {{ fTotal }} 块</b>
          </div>
          <div v-if="showBlocks" class="ex-c4-step wide">
            <small>各多少块</small>
            <b>黑色 {{ toFixed2(fPer) }} × {{ fA }} = {{ toFixed2(fBlack) }} 块</b>
            <b>白色 {{ toFixed2(fPer) }} × {{ fB }} = {{ toFixed2(fWhite) }} 块</b>
          </div>
        </div>

        <div class="ex-c4-foot-steps">
          <UButton size="sm" variant="outline" color="neutral" data-act @click="nextFootStep">
            下一步：{{ nextFootLabel }}
          </UButton>
          <span class="ex-c4-foot-note">{{ footStepNote }}</span>
        </div>
      </div>
      <p v-if="showSum" class="ex-c4-foot-sum">
        黑色皮和白色皮块数的比是 {{ fA }}:{{ fB }}，共 {{ fParts }} 份、每份
        {{ fPer }} 块，一共 {{ fTotal }} 块：黑色皮 <b>{{ toFixed2(fBlack) }} 块</b>、白色皮
        <b>{{ toFixed2(fWhite) }} 块</b>，{{ toFixed2(fBlack) }} + {{ toFixed2(fWhite) }} = {{ fTotal }} 块。
      </p>
    </template>
  </div>
</template>

<style scoped>
.ex-c4-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 320px;
}

/* ---------- 棱长比·面积比·体积比 ---------- */
.ex-c4-cube {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.ex-c4-cube-stage,
.ex-c4-base-stage {
  display: flex;
  justify-content: center;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  padding: 0.45rem 0.6rem;
}
.ex-c4-cube-svg,
.ex-c4-base-svg {
  max-width: 100%;
  height: auto;
}
/* 过程态高亮：当前这一步对应的图形/卡片描边点亮 */
.c4-on {
  border-color: var(--ui-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ui-primary) 22%, transparent);
}
.c4-face {
  stroke: var(--ui-primary);
  stroke-width: 1.6;
  stroke-linejoin: round;
}
.c4-face.front {
  fill: color-mix(in srgb, var(--ui-primary) 42%, white);
}
.c4-face.top {
  fill: color-mix(in srgb, var(--ui-primary) 28%, white);
}
.c4-face.side {
  fill: color-mix(in srgb, var(--ui-primary) 60%, white);
}
.c4-base {
  fill: color-mix(in srgb, var(--ui-primary) 14%, transparent);
  stroke: var(--ui-primary);
  stroke-width: 2;
}
.c4-grid {
  stroke: color-mix(in srgb, var(--ui-primary) 45%, white);
  stroke-width: 1;
}
.c4-lbl {
  font-size: 12px;
  font-weight: 700;
  fill: var(--ui-text-toned);
}
.ex-c4-badges {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ex-c4-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  min-width: 7.5rem;
  padding: 0.4rem 0.7rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
}
.ex-c4-badge small {
  font-size: 0.72rem;
  color: var(--ui-text-muted);
}
.ex-c4-badge b {
  font-size: 1.15rem;
  font-family: ui-monospace, monospace;
  color: var(--ui-text-highlighted);
}
.ex-c4-badge.power {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
}
.ex-c4-badge.power b {
  color: var(--ui-primary);
}
.ex-c4-power-tag {
  font-size: 0.68rem;
  font-weight: 700;
  color: #b45309;
}
.ex-c4-badge.on {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 16%, transparent);
}
.ex-c4-cube-steps,
.ex-c4-foot-steps {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 44rem;
}
.ex-c4-cube-note,
.ex-c4-foot-note {
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--ui-text-toned);
}
.ex-c4-cube-sum,
.ex-c4-foot-sum {
  margin: 0;
  font-size: 0.9rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
  text-align: center;
  line-height: 1.7;
  max-width: 40rem;
}
.ex-c4-cube-sum b,
.ex-c4-foot-sum b {
  color: var(--ui-primary);
  font-size: 1rem;
}

/* ---------- 足球皮·按比分黑白 ---------- */
.ex-c4-foot {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  align-items: center;
  width: 100%;
  max-width: 616px;
}
.ex-c4-bar {
  display: flex;
  width: 100%;
  gap: 3px;
}
.ex-c4-seg {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  transition: flex-grow 0.3s;
}
.ex-c4-cells {
  display: flex;
  gap: 1px;
}
.ex-c4-per {
  flex: 1 1 0;
  min-width: 0;
  text-align: center;
  font-size: 0.66rem;
  font-weight: 800;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
  border-top: 2px dashed var(--ui-border-accented);
  padding-top: 0.1rem;
  overflow: hidden;
}
.ex-c4-block {
  padding: 0.55rem 0.4rem;
  border-radius: 0.5rem;
  text-align: center;
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.2;
  overflow-wrap: anywhere;
}
.ex-c4-block.dark {
  background: var(--ui-primary);
  color: var(--ui-bg);
}
.ex-c4-block.light {
  background: color-mix(in srgb, var(--ui-primary) 32%, white);
  color: var(--ui-text-highlighted);
}
.ex-c4-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  width: 100%;
}
.ex-c4-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  flex: 1 1 8rem;
  min-width: 7rem;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
}
.ex-c4-step.wide {
  flex: 1 1 100%;
}
.ex-c4-step small {
  font-size: 0.7rem;
  color: var(--ui-text-muted);
}
.ex-c4-step b {
  font-size: 0.86rem;
  font-family: ui-monospace, monospace;
  color: var(--ui-text-highlighted);
}
/* 过程态：当前这一步对应的卡片 / 量条段落点亮 */
.ex-c4-step.on {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
}
.ex-c4-seg.on .ex-c4-block {
  outline: 2px solid var(--ui-primary);
  outline-offset: 1px;
}
</style>
