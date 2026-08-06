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
    tip: '一七得七、二七十四、三七二十一、四七二十八、五七三十五、六七四十二、七七四十九。',
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
    tip: '一八得八、二八十六、三八二十四、四八三十二、五八四十、六八四十八、七八五十六、八八六十四。',
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
    tip: '一九得九、二九十八、三九二十七、四九三十六、五九四十五、六九五十四、七九六十三、八九七十二、九九八十一。',
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
    tip: '根据乘法口诀，一句口诀可以算一道乘法算式和两道除法算式。',
  },
]
