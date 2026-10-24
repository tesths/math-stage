import type { LabDef } from '../schema/lab'

/** 三 7~9的表内乘除法（书页 39-55） */
export const c4Labs: LabDef[] = [
  {
    id: 'g2-c4-mult-table-7',
    chapter: 'c4',
    page: 40,
    source: '例题',
    title: '7 的乘法口诀',
    prompt:
      '用 1 副七巧板拼 1 只猫，拼 2 只、3 只……需要多少块？1 个 7 是 7，2 个 7 相加得 14。拖动滑块数一数，编出 7 的乘法口诀。',
    kind: 'mult-table',
    params: [{ key: 'n', label: '几个 7', min: 1, max: 7, step: 1, default: 3, unit: '个' }],
    fixed: { base: 7 },
    formula: '几个7 → 7 × n = 得数',
    tip: '7 的乘法口诀：几个 7 相加得几，每多一个 7 得数就多 7。易错点：三七二十一是 21，常被记成 24。',
  },
  {
    id: 'g2-c4-mult-table-8',
    chapter: 'c4',
    page: 44,
    source: '例题',
    title: '8 的乘法口诀',
    prompt:
      '摆 1 个要用 8 个小正方体，摆 2 个、3 个……需要多少个？从"一八得八"开始按顺序编出 8 的乘法口诀。',
    kind: 'mult-table',
    params: [{ key: 'n', label: '几个 8', min: 1, max: 8, step: 1, default: 4, unit: '个' }],
    fixed: { base: 8 },
    formula: '几个8 → 8 × n = 得数',
    tip: '8 的乘法口诀：几个 8 相加得几；四八三十二表示 8+8+8+8。易错点：三八二十四和四八三十二都是「二十多、三十多」，别把个数和得数对错了。',
  },
  {
    id: 'g2-c4-mult-table-9',
    chapter: 'c4',
    page: 48,
    source: '例题',
    title: '9 的乘法口诀',
    prompt:
      '9 的乘法口诀得数有个规律：1 个 9 比 10 少 1，2 个 9 比 20 少 2……拖动滑块数一数，看看得数有什么规律。',
    kind: 'mult-table',
    params: [{ key: 'n', label: '几个 9', min: 1, max: 9, step: 1, default: 4, unit: '个' }],
    fixed: { base: 9 },
    formula: '几个9 → 9 × n = 得数',
    tip: '9 的乘法口诀有一个好用规律：n 个 9 比 n 个 10 少 n，所以 9n = 10n − n；得数十位与个位上的数相加正好是 9。易错点：六九五十四是 54，不是 56。',
  },
  {
    id: 'g2-c4-table-calc',
    chapter: 'c4',
    page: 52,
    source: '复习',
    title: '表内乘除混合计算',
    prompt:
      '学过的乘法口诀要能算乘法和除法。拖动两个因数，选择乘法或除法，用乘法口诀直接说出得数。',
    kind: 'table-calc',
    params: [
      { key: 'a', label: '因数 a', min: 2, max: 9, step: 1, default: 6, unit: '' },
      { key: 'b', label: '因数 b', min: 2, max: 9, step: 1, default: 7, unit: '' },
      { key: 'mode', label: '运算', min: 0, max: 1, step: 1, default: 0, unit: '0乘1除' },
    ],
    formula: '乘：a × b = ?   除：a × b ÷ a = ?',
    tip: '一句乘法口诀能算 1 道乘法和 2 道除法：积 ÷ 一个乘数 = 另一个乘数，乘法和除法可以互相验算。易错点：写除法时被除数是「积」，两个乘数当除数与商；两个乘数相同的口诀（如四四十六）只能写 1 道除法。',
  },
]
