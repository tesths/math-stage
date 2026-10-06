import type { LabDef } from '../schema/lab'

/** 一 图形的运动（书页 1-13） */
export const c1Labs: LabDef[] = [
  {
    id: 'g5-c1-translate-boat',
    chapter: 'c1',
    page: 2,
    source: '例题',
    title: '图形的平移 · 小船平移',
    prompt:
      '“小船”向右平移了 9 格。拖动滑块改变平移方向和格数，观察平移前后图形上每一组对应点之间的距离。',
    kind: 'translate',
    params: [
      { key: 'dir', label: '平移方向', min: 0, max: 3, step: 1, default: 0, unit: '0右 1下 2左 3上' },
      { key: 'grid', label: '平移格数', min: 1, max: 12, step: 1, default: 9, unit: '格' },
    ],
    fixed: { figure: 0 },
    formula: '平移距离 = 对应点之间的距离（格）',
    tip: '课本原题：小船向右平移了 9 格。图形平移后位置变了，但形状和大小都不变；平移前后每一组对应点之间的距离都相等（都是 9 格）。',
  },
  {
    id: 'g5-c1-translate-fish',
    chapter: 'c1',
    page: 3,
    source: '练一练',
    title: '图形的平移 · 小鱼平移',
    prompt: '小鱼向右平移了几格？用滑块试一试，数一数对应点之间的距离，说说你的发现。',
    kind: 'translate',
    params: [
      { key: 'dir', label: '平移方向', min: 0, max: 3, step: 1, default: 0, unit: '0右 1下 2左 3上' },
      { key: 'grid', label: '平移格数', min: 1, max: 12, step: 1, default: 4, unit: '格' },
    ],
    fixed: { figure: 1 },
    formula: '平移距离 = 对应点之间的距离（格）',
    tip: '先数出小鱼身上任意一组对应点之间的格数，再拖动滑块验证：每一组对应点之间的距离都一样。',
  },
  {
    id: 'g5-c1-rotate-lever',
    chapter: 'c1',
    page: 4,
    source: '例题',
    title: '图形的旋转 · 闸杆开合',
    prompt:
      '闸杆打开是绕中心点 O 顺时针旋转 90°。拖动滑块改变旋转角度和方向，观察旋转前后图形的位置变化。',
    kind: 'rotate',
    params: [
      { key: 'angle', label: '旋转角度', min: 0, max: 360, step: 15, default: 90, unit: '°' },
      { key: 'dir', label: '旋转方向', min: 0, max: 1, step: 1, default: 0, unit: '0顺 1逆' },
    ],
    fixed: { figure: 2 },
    formula: '旋转角 = 对应线段转过的角度（°）',
    tip: '课本原题：闸杆打开是绕中心点 O 顺时针旋转 90°。旋转时形状和大小不变，OA′ = OA，只是位置（方向）变了。',
  },
  {
    id: 'g5-c1-rotate-triangle',
    chapter: 'c1',
    page: 6,
    source: '练一练',
    title: '图形的旋转 · 三角形绕点 A',
    prompt: '在方格纸上画出三角形 ABC 绕点 A 旋转 90° 后的图形。用滑块调整角度，看看三角形转到了哪里。',
    kind: 'rotate',
    params: [
      { key: 'angle', label: '旋转角度', min: 0, max: 360, step: 15, default: 90, unit: '°' },
      { key: 'dir', label: '旋转方向', min: 0, max: 1, step: 1, default: 0, unit: '0顺 1逆' },
    ],
    fixed: { figure: 3 },
    formula: '旋转角 = 90°（绕点 A）',
    tip: '课本原题：画出三角形 ABC 绕点 A 旋转 90° 后的图形。旋转后 AB′ = AB、AC′ = AC，对应点到旋转中心 A 的距离不变。',
  },
  {
    id: 'g5-c1-axis-polygon',
    chapter: 'c1',
    page: 9,
    source: '例题',
    title: '轴对称图形 · 补全图形',
    prompt: '把下面的图形补全，使它成为一个轴对称图形。拖动对称轴位置，观察左右两边点到对称轴的距离。',
    kind: 'axis',
    params: [{ key: 'sym', label: '对称轴位置', min: 0, max: 2, step: 1, default: 1, unit: '0左 1中 2右' }],
    fixed: { figure: 0 },
    formula: '对称轴两边对应点到对称轴的距离相等',
    tip: '轴对称图形沿对称轴对折后两边完全重合；对应点到对称轴的距离相等。',
  },
]
