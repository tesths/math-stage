import type { GameQuestion } from '../schema/example'

/** 七、好玩的"抢10"（书页 75-77） */
export const c7Examples: GameQuestion[] = [
  {
    id: 'c7-ten-01',
    chapter: 'c7',
    source: '活动',
    page: 75,
    title: '选两张：抢10',
    prompt: '从下面的扑克牌中选出两张，使牌上的数相加等于10。可以怎样选？',
    type: 'ten',
    config: { type: 'ten', target: 10, cards: [1, 2, 3, 6, 7], answer: [3, 7] },
  },
  {
    id: 'c7-ten-02',
    chapter: 'c7',
    source: '活动',
    page: 75,
    title: '选三张：抢10',
    prompt: '从下面的扑克牌中选出三张，使牌上的数相加等于10。可以怎样选？',
    type: 'ten',
    config: { type: 'ten', target: 10, cards: [1, 2, 3, 5, 6, 8], answer: [1, 3, 6] },
  },
  {
    id: 'c7-ten-03',
    chapter: 'c7',
    source: '活动',
    page: 76,
    title: '三张相加等于10',
    prompt: '发现几张牌上的数相加等于10，就抢先说出来：2+3+5等于10。选一选。',
    type: 'ten',
    config: { type: 'ten', target: 10, cards: [2, 3, 4, 5, 8], answer: [2, 3, 5] },
  },
  {
    id: 'c7-ten-04',
    chapter: 'c7',
    source: '活动',
    page: 76,
    title: '几数相加等于10',
    prompt: '几个数相加等于10：1+2+7等于10。选一选。',
    type: 'ten',
    config: { type: 'ten', target: 10, cards: [1, 2, 4, 7], answer: [1, 2, 7] },
  },
]