import type { LabDef } from '../schema/lab'

/** 间隔排列（探索规律，书页 86-87） */
export const c9Labs: LabDef[] = [
  {
    id: 'g3-c9-interval',
    chapter: 'c9',
    page: 86,
    source: '探索',
    title: '间隔排列的规律',
    prompt:
      '小兔和蘑菇一个隔一个排成一行。拖动小兔的只数和两端物体的类型，探索间隔排列的数量规律。',
    kind: 'interval',
    params: [
      { key: 'count', label: '两端物体的个数', min: 2, max: 12, step: 1, default: 6, unit: '个' },
      {
        key: 'end',
        label: '两端物体',
        min: 0,
        max: 2,
        step: 1,
        default: 0,
        choices: [
          { value: 0, label: '两端都是□' },
          { value: 1, label: '两端不同' },
          { value: 2, label: '两端都是○' },
        ],
      },
    ],
    formula: '两端相同：个数差 1；两端不同：个数相等',
    tip:
      '间隔排列的两种物体：两端相同时，两端那种物体多 1 个；两端不同时，两种一样多。一组一组圈一圈就能发现。易错点：把"两端不同"也当成多 1 个。',
  },
  {
    id: 'g3-c9-interval-circle',
    chapter: 'c9',
    page: 87,
    source: '探索',
    title: '围成一圈的间隔排列',
    prompt:
      '男生和女生一个隔一个手拉手围成一圈做游戏。拖动人数，观察围成圈时两种物体数量相等。',
    kind: 'interval',
    params: [
      { key: 'count', label: '男生人数', min: 2, max: 12, step: 1, default: 6, unit: '人' },
    ],
    formula: '围成一圈：男生人数 = 女生人数',
    tip: '围成一圈时，起点和终点连在一起，间隔排列的两种物体数量相等。',
  },
]
