import type { LabDef } from '../schema/lab'

/** 四 比和比例（书页 44-63）+ 探索规律"神奇的黄金比"（书页 64-67） */
export const c4Labs: LabDef[] = [
  {
    id: 'g6-c4-ratio-intro',
    chapter: 'c4',
    page: 45,
    source: '例题',
    title: '比的认识 · 橙汁饮料',
    prompt:
      '在 3 杯纯橙汁里加入 2 杯水。纯橙汁与水杯数的比是 3:2，前项 3 表示纯橙汁，后项 2 表示水。拖动滑块改变两种成分的份数。',
    kind: 'ratio-intro',
    params: [
      { key: 'a', label: '纯橙汁份数（前项）', min: 1, max: 8, step: 1, default: 3 },
      { key: 'b', label: '水份数（后项）', min: 1, max: 8, step: 1, default: 2 },
    ],
    formula: 'a:b = 前项:后项（表示两个量的倍数关系）',
    tip: '比表示两个数量之间的倍数关系；比号前面的数是前项，比号后面的数是后项，后项不能为 0。',
  },
  {
    id: 'g6-c4-ratio-value',
    chapter: 'c4',
    page: 47,
    source: '例题',
    title: '比值与形状 · 长方形名片',
    prompt:
      '90:54、90:45、80:40 的长宽比，前项除以后项的商（比值）分别是 5/3、2、2。长除以宽的商相等，长方形的形状就相同。',
    kind: 'ratio-value',
    params: [
      { key: 'w', label: '长', min: 20, max: 120, step: 5, default: 90, unit: '毫米' },
      { key: 'h', label: '宽', min: 20, max: 80, step: 1, default: 54, unit: '毫米' },
    ],
    formula: '比值 = 前项 ÷ 后项 = 长 ÷ 宽',
    tip: '比的前项除以后项所得的商叫作比值；比值相等的比，表示的两个量关系相同。',
  },
  {
    id: 'g6-c4-ratio-simplify',
    chapter: 'c4',
    page: 53,
    source: '例题',
    title: '化简比 · 化成最简整数比',
    prompt:
      '12:18 同时除以 6 得 2:3；1.8:0.09 同时乘 100 得 180:9 = 20:1。应用比的基本性质，把比化成前项、后项只有公因数 1 的最简整数比。',
    kind: 'ratio-simplify',
    params: [
      { key: 'sel', label: '化简示例', min: 0, max: 3, step: 1, default: 0, unit: '例题序号' },
    ],
    formula: '前项 ÷ 最大公因数（整数比）/ 同时乘公分母（分数比）/ 同时乘 100（小数比）',
    tip: '比的基本性质：比的前项和后项同时乘或除以相同的数（0 除外），比值不变。',
  },
  {
    id: 'g6-c4-ratio-distribute',
    chapter: 'c4',
    page: 54,
    source: '例题',
    title: '按比例分配 · 青团皮',
    prompt:
      '糯米粉与鼠曲草浆质量的比是 3:2，制作 500 克青团皮，需要糯米粉和鼠曲草浆各多少克？先算出每份多少克，再分别乘各自份数。',
    kind: 'ratio-distribute',
    params: [
      { key: 'a', label: '糯米粉份数', min: 1, max: 6, step: 1, default: 3 },
      { key: 'b', label: '鼠曲草浆份数', min: 1, max: 6, step: 1, default: 2 },
      { key: 'total', label: '总质量', min: 200, max: 1000, step: 10, default: 500, unit: '克' },
    ],
    formula: '每份 = 总量 ÷ (a + b)；各部分 = 每份 × 份数',
    tip: '先算总份数 a+b，每份质量 = 总量 ÷ 总份数，再分别乘各部分的份数。',
  },
  {
    id: 'g6-c4-proportion-basic',
    chapter: 'c4',
    page: 59,
    source: '例题',
    title: '比例的基本性质 · 内外项积',
    prompt:
      '在比例里，两个外项的积等于两个内项的积。课本例 4:2 = 3:1.5 中，4×1.5 = 2×3 = 6；拖动滑块改变比与放大倍数，验证外项积与内项积始终相等。',
    kind: 'proportion-basic',
    params: [
      { key: 'a', label: '第一个比的前项', min: 1, max: 9, step: 1, default: 4 },
      { key: 'b', label: '第一个比的后项', min: 1, max: 9, step: 1, default: 2 },
      { key: 'k', label: '放大倍数', min: 2, max: 6, step: 1, default: 2 },
    ],
    formula: 'a:b = a×k : b×k；外项积 a×(b×k) = 内项积 b×(a×k)',
    tip: '比例由两个相等的比组成；a:b = c:d 时，外项积 a×d 恒等于内项积 b×c。',
  },
  {
    id: 'g6-c4-solve-proportion',
    chapter: 'c4',
    page: 60,
    source: '例题',
    title: '解比例 · 同样甜的糖水',
    prompt:
      '吴欣丽用 25 克糖和 200 克水调制糖水，张明浩想用 300 克水调制同样甜的糖水，应加入多少克糖？根据比例的基本性质，外项的积等于内项的积。',
    kind: 'solve-proportion',
    params: [
      { key: 'a', label: '原来的糖', min: 5, max: 50, step: 5, default: 25, unit: '克' },
      { key: 'b', label: '原来的水', min: 50, max: 300, step: 10, default: 200, unit: '克' },
      { key: 'c', label: '新的水', min: 100, max: 500, step: 10, default: 300, unit: '克' },
    ],
    formula: 'a : b = x : c，x = a × c ÷ b',
    tip: '设应加 x 克糖，列出比例 25:200 = x:300，根据外项积 = 内项积得 200x = 25×300，x = 37.5。',
  },
  {
    id: 'g6-c4-golden-ratio',
    chapter: 'c4',
    page: 64,
    source: '探索',
    title: '神奇的黄金比 · 0.618',
    prompt:
      '宽与长的比约为 0.618 的长方形最协调、最美，叫作黄金长方形。拖动滑块改变宽，看看符合黄金比的长应是多少。',
    kind: 'golden-ratio',
    params: [{ key: 'w', label: '宽', min: 60, max: 400, step: 5, default: 200, unit: '毫米' }],
    formula: '长 = 宽 ÷ 0.618；宽 : 长 ≈ 0.618',
    tip: '黄金比约等于 0.618，人体、名画、建筑中都常见；构图时把画面按黄金比分割会更美观。',
  },
]
