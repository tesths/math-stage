import type { LabDef } from '../schema/lab'

/** 四 毫米、分米和千米（书页 50-58） */
export const c6Labs: LabDef[] = [
  {
    id: 'g3-c6-mm-cm',
    chapter: 'c6',
    page: 51,
    source: '例题',
    title: '毫米与厘米',
    prompt:
      '数学课本封面的宽是 18 厘米 6 毫米。拖动厘米和毫米，观察复名数与毫米之间的换算。',
    kind: 'length-convert',
    params: [
      { key: 'cm', label: '厘米', min: 1, max: 30, step: 1, default: 18, unit: '厘米' },
      { key: 'mm', label: '毫米', min: 0, max: 9, step: 1, default: 6, unit: '毫米' },
      { key: 'to', label: '换算成', min: 0, max: 1, step: 1, default: 0, unit: '' },
    ],
    formula: '1 厘米 = 10 毫米',
    tip: '1 厘米 = 10 毫米，18 厘米 = 180 毫米，再加 6 毫米是 186 毫米。',
  },
  {
    id: 'g3-c6-dm-m',
    chapter: 'c6',
    page: 53,
    source: '例题',
    title: '分米与米',
    prompt:
      '教室窗户的宽是 1 米 90 厘米。拖动米和厘米，观察与分米之间的换算。',
    kind: 'length-convert',
    params: [
      { key: 'm', label: '米', min: 0, max: 9, step: 1, default: 1, unit: '米' },
      { key: 'cm', label: '厘米', min: 0, max: 99, step: 1, default: 90, unit: '厘米' },
      { key: 'to', label: '换算成', min: 0, max: 1, step: 1, default: 1, unit: '' },
    ],
    formula: '1 米 = 10 分米 = 100 厘米',
    tip: '10 厘米是 1 分米，90 厘米是 9 分米；1 米 90 厘米 = 10 分米 + 9 分米 = 19 分米。',
  },
  {
    id: 'g3-c6-km-m',
    chapter: 'c6',
    page: 55,
    source: '例题',
    title: '千米与米',
    prompt:
      '再开 1 千米就到六塘服务区了。拖动千米数，观察千米与米的换算，感受 1000 米就是 1 千米。',
    kind: 'length-convert',
    params: [
      { key: 'value', label: '数值', min: 1, max: 9, step: 1, default: 3, unit: '千米' },
      { key: 'to', label: '换算成', min: 0, max: 1, step: 1, default: 0, unit: '' },
    ],
    formula: '1 千米 = 1000 米',
    tip: '计量较长的路程用千米，10 个 100 米是 1000 米，1000 米就是 1 千米。',
  },
  {
    id: 'g3-c6-length-mix',
    chapter: 'c6',
    page: 52,
    source: '想想做做',
    title: '长度单位综合换算',
    prompt:
      '7 厘米 = （）毫米，45 毫米 = （）厘米（）毫米。拖动数值，进行毫米/厘米/分米/米之间的换算。',
    kind: 'length-convert',
    params: [
      { key: 'value', label: '长度数值', min: 1, max: 200, step: 1, default: 45, unit: '毫米' },
      { key: 'from', label: '原单位', min: 0, max: 4, step: 1, default: 0, unit: '' },
      { key: 'to', label: '目标单位', min: 0, max: 4, step: 1, default: 1, unit: '' },
    ],
    formula: '长度 = 数值 × 原单位进率 ÷ 目标单位进率',
    tip: '单位表：1 千米 = 1000 米，1 米 = 10 分米 = 100 厘米 = 1000 毫米。大单位化小单位乘进率。',
  },
]
