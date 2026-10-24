import type { LabDef } from '../schema/lab'

/** 五 平移、旋转和轴对称（书页 59-67） */
export const c7Labs: LabDef[] = [
  {
    id: 'g3-c7-translate',
    chapter: 'c7',
    page: 60,
    source: '例题',
    title: '图形的平移',
    prompt:
      '升旗时国旗从下向上运动，自动门打开时左右移动。拖动平移方向和格数，观察图形怎样平移。',
    kind: 'translate',
    params: [
      {
        key: 'dir',
        label: '方向',
        min: 0,
        max: 3,
        step: 1,
        default: 0,
        choices: [
          { value: 0, label: '向右' },
          { value: 1, label: '向左' },
          { value: 2, label: '向上' },
          { value: 3, label: '向下' },
        ],
      },
      { key: 'steps', label: '平移格数', min: 1, max: 8, step: 1, default: 4, unit: '格' },
    ],
    formula: '图形沿水平/竖直方向移动',
    tip:
      '平移时物体沿直线运动，形状和大小都不变，只改变位置。国旗升起、自动门开关都是平移。易错点：数平移的格数要数"对应点之间"的格数，不是数图形中间。',
  },
  {
    id: 'g3-c7-rotate',
    chapter: 'c7',
    page: 61,
    source: '例题',
    title: '图形的旋转',
    prompt:
      '电风扇叶片按顺时针方向旋转，旋转木马按逆时针方向旋转。拖动方向和角度，观察旋转。',
    kind: 'rotate',
    params: [
      {
        key: 'dir',
        label: '方向',
        min: 0,
        max: 1,
        step: 1,
        default: 0,
        choices: [
          { value: 0, label: '顺时针' },
          { value: 1, label: '逆时针' },
        ],
      },
      { key: 'angle', label: '旋转角度', min: 30, max: 360, step: 30, default: 90, unit: '°' },
    ],
    formula: '图形绕中心顺时针/逆时针旋转',
    tip:
      '与时针转动方向相同叫顺时针，相反叫逆时针。旋转时形状、大小都不变，只是方向变了。易错点：顺时针和逆时针说反——先看时针往哪边走。',
  },
  {
    id: 'g3-c7-axis',
    chapter: 'c7',
    page: 63,
    source: '例题',
    title: '轴对称图形',
    prompt:
      '对折后折痕两边能完全重合的图形是轴对称图形。拖动选择不同的图形，观察它的对称轴。',
    kind: 'axis',
    params: [
      {
        key: 'shape',
        label: '图形',
        min: 0,
        max: 4,
        step: 1,
        default: 0,
        choices: [
          { value: 0, label: '松树' },
          { value: 1, label: '心形' },
          { value: 2, label: '蝴蝶' },
          { value: 3, label: '五角星' },
          { value: 4, label: '汉字「日」' },
        ],
      },
    ],
    formula: '对折 → 折痕两边完全重合',
    tip:
      '沿一条直线对折，两边能完全重合的图形叫轴对称图形，这条直线就是对称轴。蝴蝶、心形都是轴对称图形。易错点：五角星不止一条对称轴（有 5 条）。',
  },
  {
    id: 'g3-c7-symmetry',
    chapter: 'c7',
    page: 64,
    source: '练习',
    title: '剪轴对称图案',
    prompt:
      '把彩纸对折后剪出图案，展开就是轴对称图形。拖动选择图案，观察对折剪法。',
    kind: 'axis',
    params: [
      {
        key: 'shape',
        label: '图案',
        min: 0,
        max: 3,
        step: 1,
        default: 0,
        choices: [
          { value: 0, label: '小松树' },
          { value: 1, label: '心形' },
          { value: 2, label: '蝴蝶' },
          { value: 3, label: '五角星' },
        ],
      },
    ],
    formula: '对折剪 → 展开成轴对称图形',
    tip:
      '把纸对折，只画出图案的一半再剪，展开就得到一个轴对称图形——折痕就是对称轴。易错点：画了完整图案再剪，展开后两边一样但是"两半"拼接，不是对称的一半。',
  },
]
