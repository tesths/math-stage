import type { LabDef } from '../schema/lab'

/** 一 混合运算与数量关系（一）（书页 1-10） */
export const c1Labs: LabDef[] = [
  {
    id: 'g3-c1-mix-multadd',
    chapter: 'c1',
    page: 2,
    source: '例题',
    title: '乘加混合运算',
    prompt:
      '豆豆买 3 本笔记本和 1 个书包，一共要付多少元？拖动单价和数量，观察先算乘法、再算加法的过程。',
    kind: 'mix-calc',
    params: [
      { key: 'price', label: '笔记本单价', min: 1, max: 20, step: 1, default: 5, unit: '元' },
      { key: 'count', label: '笔记本数量', min: 1, max: 9, step: 1, default: 3, unit: '本' },
      { key: 'bag', label: '书包单价', min: 10, max: 100, step: 1, default: 50, unit: '元' },
    ],
    formula: '单价 × 数量 + 书包价',
    tip: '算式里既有乘法又有加法，要先算乘法、再算加法（先乘除后加减）。易错点：从左往右依次算，先算了 5 + 50。',
  },
  {
    id: 'g3-c1-mix-divadd',
    chapter: 'c1',
    page: 4,
    source: '例题',
    title: '除加混合运算',
    prompt:
      '买 1 支钢笔和 1 个订书机，应付多少元？1 盒钢笔 5 支共 40 元。拖动数据，观察先算除法再算加法的过程。',
    kind: 'mix-calc',
    params: [
      { key: 'box', label: '钢笔盒价', min: 10, max: 90, step: 1, default: 40, unit: '元' },
      { key: 'each', label: '每盒支数', min: 2, max: 9, step: 1, default: 5, unit: '支' },
      { key: 'stapler', label: '订书机价', min: 2, max: 30, step: 1, default: 12, unit: '元' },
    ],
    formula: '盒价 ÷ 支数 + 订书机价',
    tip: '算式里既有除法又有加法，要先算除法、再算加法。易错点：把 40 ÷ 5 + 12 算成 40 ÷ (5 + 12)。',
  },
  {
    id: 'g3-c1-mix-order',
    chapter: 'c1',
    page: 5,
    source: '练习',
    title: '混合运算的顺序',
    prompt: '比较算式 12 + 8 × 5 与（12 + 8）× 5 的得数。拖动两个数，感受小括号怎样改变运算顺序。',
    kind: 'bracket',
    params: [
      { key: 'a', label: '数 a', min: 1, max: 50, step: 1, default: 12, unit: '' },
      { key: 'b', label: '数 b', min: 1, max: 20, step: 1, default: 8, unit: '' },
      { key: 'c', label: '数 c', min: 1, max: 20, step: 1, default: 5, unit: '' },
    ],
    formula: 'a + b × c 与 (a + b) × c',
    tip: '小括号能改变运算顺序：12 + 8 × 5 先乘后加，而（12 + 8）× 5 先算括号。易错点：以为带不带括号结果一样。',
  },
  {
    id: 'g3-c1-mix-bracket',
    chapter: 'c1',
    page: 7,
    source: '例题',
    title: '小括号的作用',
    prompt:
      '芳芳带 100 元，买 1 个书包（50 元）后，剩下的钱可以买几本笔记本？拖动数据，观察为什么必须加小括号。',
    kind: 'bracket',
    params: [
      { key: 'money', label: '带的钱', min: 20, max: 200, step: 1, default: 100, unit: '元' },
      { key: 'bag', label: '书包价', min: 10, max: 150, step: 1, default: 50, unit: '元' },
      { key: 'notebook', label: '笔记本价', min: 1, max: 20, step: 1, default: 5, unit: '元' },
    ],
    formula: '(带的钱 − 书包价) ÷ 笔记本价',
    tip: '要先算「剩下的钱」，综合算式里就必须添小括号：（100 − 50）÷ 5。易错点：写成 100 − 50 ÷ 5，先算了除法。',
  },
]
