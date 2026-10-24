import type { LabDef } from '../schema/lab'

/** 欢乐购物街（书页 86-90，综合与实践：认识人民币） */
export const c8Labs: LabDef[] = [
  {
    id: 'g2-c8-money',
    chapter: 'c8',
    page: 87,
    source: '综合实践',
    title: '认识人民币',
    prompt:
      '人民币有纸币和硬币，面额有 1 角、5 角、1 元、5 元、10 元、20 元、50 元、100 元等。切换面额，看看它们怎样互换。',
    kind: 'money',
    params: [{ key: 'sel', label: '面额', min: 0, max: 5, step: 1, default: 0, unit: '' }],
    formula: '1 元 = 10 角，1 角 = 10 分',
    tip: '人民币的单位是元、角、分，相邻单位间的进率是 10：1 元 = 10 角，1 角 = 10 分，所以 1 元 = 100 分。易错点：换钱时单位要统一，1 元不是 10 分。',
  },
  {
    id: 'g2-c8-money-calc',
    chapter: 'c8',
    page: 89,
    source: '综合实践',
    title: '购物付钱与找零',
    prompt:
      '一本书标价 6 元，你付 10 元，应找回 4 元。拖动商品价格和付出的钱，算一算应找回多少。',
    kind: 'money-calc',
    params: [
      { key: 'price', label: '商品价格', min: 1, max: 20, step: 1, default: 6, unit: '元' },
      { key: 'paid', label: '付出的钱', min: 5, max: 50, step: 5, default: 10, unit: '元' },
    ],
    formula: '找回的钱 = 付出的钱 - 商品价格',
    tip: '付的钱比商品价格多时，多出的部分就是应找回的钱：找回 = 付出 − 价格。易错点：付出的钱比价格少时没有「找回」，要说「还差多少」。',
  },
]
