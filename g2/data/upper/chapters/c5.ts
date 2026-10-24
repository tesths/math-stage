import type { LabDef } from '../schema/lab'

/** 生活中的方向（书页 56-60，综合与实践） */
export const c5Labs: LabDef[] = [
  {
    id: 'g2-c5-direction',
    chapter: 'c5',
    page: 57,
    source: '综合实践',
    title: '辨认东、南、西、北',
    prompt:
      '早晨面向太阳，前面是东，后面是西，左边是北，右边是南。拖动"面向"的方向，观察前、后、左、右各是什么方向。',
    kind: 'direction',
    params: [{ key: 'face', label: '面向', min: 0, max: 3, step: 1, default: 0, unit: '0东1南2西3北' }],
    formula: '东和西相对，南和北相对',
    tip: '早晨面向太阳，前面是东、后面是西、左边是北、右边是南；东和西相对，南和北相对。易错点：面向南时左右会互换（左手边是东），不能照搬面向东时的左右。',
  },
]
