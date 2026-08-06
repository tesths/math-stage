import type { LabDef } from '../schema/lab'

/** 七 确定位置（书页 103-111） */
export const c7Labs: LabDef[] = [
  {
    id: 'g6-c7-coordinate',
    chapter: 'c7',
    page: 104,
    source: '例题',
    title: '用数对确定位置 · 严军的座位',
    prompt:
      '严军坐在第 3 列第 4 行，用数对（3，4）表示。竖排是列，横排是行；第几列从左往右数，第几行从前往后数。',
    kind: 'coordinate',
    params: [
      { key: 'col', label: '列', min: 1, max: 8, step: 1, default: 3 },
      { key: 'row', label: '行', min: 1, max: 6, step: 1, default: 4 },
    ],
    formula: '数对（列，行）',
    tip: '数对中的第一个数表示列，第二个数表示行；先列后行，顺序不能颠倒。',
  },
  {
    id: 'g6-c7-direction',
    chapter: 'c7',
    page: 106,
    source: '例题',
    title: '用方向和距离确定位置 · 浮雷',
    prompt:
      '浮雷 2 在舰艇的北偏东 30° 方向 2 千米处。要确定物体的位置，除了方向和角度，还必须知道距离。拖动滑块改变角度、方向与距离。',
    kind: 'direction',
    params: [
      { key: 'angle', label: '偏转角度', min: 0, max: 60, step: 5, default: 30, unit: '°' },
      { key: 'dist', label: '距离', min: 1, max: 8, step: 1, default: 3, unit: '千米' },
      { key: 'dir', label: '方向', min: 0, max: 3, step: 1, default: 0, unit: '0北偏东 1北偏西 2南偏东 3南偏西' },
    ],
    formula: '位置 = 方向 + 角度 + 距离',
    tip: '东北方向也叫北偏东方向；只说方向无法确定位置，必须加上距离（如北偏东 30° 方向 3 千米处）。',
  },
]
