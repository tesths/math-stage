import type { LabDef } from '../schema/lab'

/** 四 认识三位数（书页 61-73） */
export const c6Labs: LabDef[] = [
  {
    id: 'g2-c6-place-value',
    chapter: 'c6',
    page: 65,
    source: '例题',
    title: '三位数的组成',
    prompt:
      '篮球馆东区有 124 个座位。124 由 1 个百、2 个十和 4 个一组成，124 = 100 + 20 + 4。拖动百位、十位、个位的珠子，数一数组成。',
    kind: 'place-value',
    params: [
      { key: 'h', label: '百位', min: 0, max: 9, step: 1, default: 1, unit: '个' },
      { key: 't', label: '十位', min: 0, max: 9, step: 1, default: 2, unit: '个' },
      { key: 'o', label: '个位', min: 0, max: 9, step: 1, default: 4, unit: '个' },
    ],
    formula: '数 = 百×100 + 十×10 + 一',
    tip: '从右边起，第一位是个位、第二位是十位、第三位是百位；每个数位上的数表示「几个」这样的计数单位，相邻两个计数单位之间的进率是 10（10 个一 = 1 个十）。易错点：124 里的「1」表示 1 个百（100），不是 1。',
  },
  {
    id: 'g2-c6-compare',
    chapter: 'c6',
    page: 67,
    source: '练习',
    title: '三位数比大小',
    prompt:
      '200 ○ 100，760 ○ 720，402 ○ 385。比较三位数的大小：先看百位，百位相同看十位，十位相同看个位。拖动两个数试一试。',
    kind: 'compare',
    params: [
      { key: 'a', label: '第一个数', min: 100, max: 999, step: 1, default: 402, unit: '' },
      { key: 'b', label: '第二个数', min: 100, max: 999, step: 1, default: 385, unit: '' },
    ],
    formula: '比较百位 → 十位 → 个位',
    tip: '位数相同的两个三位数比大小，从高位比起：百位大的就大，百位相同比十位，十位相同比个位。易错点：402 与 385 由百位 4 > 3 决定，不能因为 402 的个位小就判它小。',
  },
  {
    id: 'g2-c6-abacus',
    chapter: 'c6',
    page: 69,
    source: '例题',
    title: '算盘拨珠',
    prompt:
      '一颗下珠表示 1，一颗上珠表示 5。拨珠时要先确定哪一档是个位。切换示例，在算盘上读出表示的数。',
    kind: 'abacus',
    params: [{ key: 'sel', label: '示例', min: 0, max: 4, step: 1, default: 0, unit: '' }],
    formula: '下珠 = 1，上珠 = 5',
    tip: '算盘上一颗下珠表示 1，一颗上珠表示 5，读数前先确定哪一档是个位。易错点：5 要用一颗上珠表示，不要拨 5 颗下珠；一档上最多 1 颗上珠、4 颗下珠。',
  },
]
