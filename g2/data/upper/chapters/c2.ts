import type { LabDef } from '../schema/lab'

/** 二 1~6的表内除法（书页 19-32） */
export const c2Labs: LabDef[] = [
  {
    id: 'g2-c2-divide-share',
    chapter: 'c2',
    page: 20,
    source: '例题',
    title: '平均分',
    prompt:
      '把 8 个松果平均分给 2 只松鼠，每只分得 4 个。拖动"总数"和"份数"，把物品平均分成几份，观察每份同样多（平均分）。',
    kind: 'divide-share',
    params: [
      { key: 'total', label: '总数', min: 6, max: 24, step: 1, default: 8, unit: '个' },
      { key: 'groups', label: '份数', min: 2, max: 6, step: 1, default: 2, unit: '份' },
    ],
    formula: '每份几个 = 总数 ÷ 份数',
    tip: '把一些物体平均分成几份，每份分得同样多叫作平均分：每份几个 = 总数 ÷ 份数。课本的分法是「先拿 2 个，每只松鼠分 1 个，再照这样接着分」。易错点：每份不一样多就不是平均分；分不完剩下的部分不能再塞进某一份。',
  },
  {
    id: 'g2-c2-divide-group',
    chapter: 'c2',
    page: 22,
    source: '例题',
    title: '每几个一份',
    prompt:
      '8 个松果，每只松鼠分 2 个，可以分给 4 只松鼠。拖动"总数"和"每份几个"，看看能分成几份。',
    kind: 'divide-group',
    params: [
      { key: 'total', label: '总数', min: 8, max: 30, step: 1, default: 8, unit: '个' },
      { key: 'per', label: '每份几个', min: 2, max: 6, step: 1, default: 2, unit: '个' },
    ],
    formula: '分成几份 = 总数 ÷ 每份几个',
    tip: '每几个一份地圈一圈，求圈出几份，也是平均分：份数 = 总数 ÷ 每份几个。易错点：商是「份数」，每份几个是另一个数——8 个每 2 个一份，商 4 指 4 份，不是 4 个。',
  },
  {
    id: 'g2-c2-quotient',
    chapter: 'c2',
    page: 28,
    source: '例题',
    title: '用乘法口诀求商',
    prompt:
      '每辆自行车安装 2 个车轮，8 个车轮能安装 4 辆。8 ÷ 2 = ? 先想"几个 2 是 8"，二（四）得八，商是 4。拖动滑块试一试。',
    kind: 'quotient',
    params: [
      { key: 'b', label: '除数', min: 2, max: 6, step: 1, default: 2, unit: '' },
      { key: 'a', label: '商（几个除数）', min: 1, max: 6, step: 1, default: 4, unit: '' },
    ],
    formula: '被除数 ÷ 除数 = 商（被除数 = 除数 × 商）',
    tip: '求商时想乘法口诀：除数 ×（ ）= 被除数，括号里是几，商就是几。8 ÷ 2 想「二（四）得八」，商是 4。易错点：一定要念「几个除数」，不能念成「八（ ）得八」。',
  },
]
