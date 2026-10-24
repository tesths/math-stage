import type { LabDef } from '../schema/lab'

/** 一 两、三位数除以两位数（书页 1-16） */
export const c1Labs: LabDef[] = [
  {
    id: 'g4-c1-div-oral',
    chapter: 'c1',
    page: 2,
    source: '例题',
    title: '整十数除以整十数 · 给图书打包',
    prompt:
      '60 本《童话世界》，每 20 本打一包，能打几包？拖动书本数和每包本数，观察怎样把整十数除法口算成表内除法。',
    kind: 'div-oral',
    params: [
      { key: 'base', label: '书本数', min: 20, max: 900, step: 10, default: 60, unit: '本' },
      { key: 'div', label: '每包本数', min: 10, max: 90, step: 10, default: 20, unit: '本' },
    ],
    formula: '60 ÷ 20 = 6 个十 ÷ 2 个十',
    tip: '把整十数看成「几个十」，转化成表内除法口算，商不变：60 ÷ 20 就是 6 个十 ÷ 2 个十 = 3。易错点：把 60 ÷ 20 算成 30（把 20 当 2）。',
  },
  {
    id: 'g4-c1-div-try',
    chapter: 'c1',
    page: 5,
    source: '例题',
    title: '用竖式试商 · 图书展览会',
    prompt:
      '96 本科普书，每架放 24 本，需要几个书架？拖动被除数和除数，观察怎样把除数看作整十数来试商。',
    kind: 'div-try',
    params: [
      { key: 'num', label: '书的本数', min: 20, max: 200, step: 1, default: 96, unit: '本' },
      { key: 'div', label: '每架本数', min: 21, max: 40, step: 1, default: 24, unit: '本' },
    ],
    formula: '96 ÷ 24 = 4',
    tip: '把除数 24 四舍五入看成 20 来试商；初商乘积超过被除数就调小，余数不小于除数就调大，定商后再乘、再减。易错点：试出初商就直接写，不检查初商偏大还是偏小。',
  },
  {
    id: 'g4-c1-div-pen',
    chapter: 'c1',
    page: 9,
    source: '例题',
    title: '笔算两、三位数除以两位数',
    prompt:
      '《科幻天地》有 156 页，计划 12 天看完，平均每天看多少页？拖动页数和天数，观察竖式从哪一位除起、商写在哪一位。',
    kind: 'div-pen',
    params: [
      { key: 'num', label: '总页数', min: 100, max: 900, step: 1, default: 156, unit: '页' },
      { key: 'div', label: '天数', min: 11, max: 99, step: 1, default: 12, unit: '天' },
    ],
    formula: '156 ÷ 12 = 13',
    tip: '除数是两位数，先除被除数的前两位；不够商 1 就除前三位。除到哪一位，商就写在那一位的上面。易错点：把商写错位（156 ÷ 12 的 3 写到十位上），或余数比除数还大。',
  },
  {
    id: 'g4-c1-div-route',
    chapter: 'c1',
    page: 11,
    source: '例题',
    title: '两步连除 · 书架平均放书',
    prompt:
      '2 个书架、每个书架 4 层，一共放 224 本书。平均每层放多少本？拖动书本数、书架数和层数，观察两种连除方法。',
    kind: 'div-route',
    params: [
      { key: 'total', label: '总本数', min: 100, max: 900, step: 2, default: 224, unit: '本' },
      { key: 'shelf', label: '书架数', min: 2, max: 5, step: 1, default: 2, unit: '个' },
      { key: 'floor', label: '每架层数', min: 2, max: 6, step: 1, default: 4, unit: '层' },
    ],
    formula: '224 ÷ 2 ÷ 4',
    tip: '连除可以分两步算：先求一共有多少层（2 × 4 = 8），再求每层本数；也可以先求每个书架放多少本。易错点：先乘后除的顺序搞反，或用 224 ÷ 2 × 4 从左往右算。',
  },
]
