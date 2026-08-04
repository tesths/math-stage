import type { ChapterId } from '@data/schema/example'
import { chapters } from '@data/chapters/meta'

/** 游戏专区概念分组 */
export type ArcadeGroup = 'pair' | 'numline' | 'calc' | 'logic'

export const GROUP_LABELS: Record<ArcadeGroup, string> = {
  pair: '数感与数的组成',
  numline: '数序与数轴',
  calc: '口算与情境',
  logic: '图形与逻辑',
}

/** 单元 id → 单元序号（第几单元） */
export function unitNoOf(chapter: ChapterId): number {
  return chapters.find((c) => c.id === chapter)!.no
}

export interface ArcadeMeta {
  /** 路由 slug，唯一 */
  slug: string
  name: string
  icon: string
  group: ArcadeGroup
  summary: string
  /** 玩法说明（游戏页帮助） */
  howTo: string
  /** 适配单元 */
  chapters: ChapterId[]
}

export const ARCADE_GAMES: ArcadeMeta[] = [
  {
    slug: 'memory',
    name: '记忆翻牌',
    icon: '🃏',
    group: 'pair',
    summary: '翻开两张卡片，配对数与量、算式与得数',
    howTo: '点击翻开两张卡片，如果一张是数字、一张是同样数量的物品（或算式与得数），就配对成功。全部翻开配对即过关。',
    chapters: ['c1', 'c2', 'c6'],
  },
  {
    slug: 'friend',
    name: '找朋友',
    icon: '🤝',
    group: 'pair',
    summary: '找出两张相加等于目标数的牌，让它们交朋友',
    howTo: '桌上有 8 张数字牌，先看目标数（8、9 或 10）。每次点两张牌，如果两张牌上的数相加等于目标数，它们就成为好朋友被拿走。',
    chapters: ['c2', 'c6', 'c7'],
  },
  {
    slug: 'gofish',
    name: '数字钓鱼',
    icon: '🎣',
    group: 'pair',
    summary: '钓起两条能凑成 10 的鱼',
    howTo: '湖里有 6 条数字鱼。先钓一条，再钓一条，两条鱼身上的数相加等于 10 就能收进鱼篓。钓完所有鱼过关！',
    chapters: ['c6', 'c7'],
  },
  {
    slug: 'balance',
    name: '天平平衡',
    icon: '⚖️',
    group: 'pair',
    summary: '给天平另一边放上一样多的砝码',
    howTo: '天平左边放着物品，从砝码里选一个数放在右边，让天平平衡（两边一样多）。',
    chapters: ['c2', 'c6'],
  },
  {
    slug: 'guess',
    name: '猜数字',
    icon: '💣',
    group: 'numline',
    summary: '电脑想了一个 0~19 的数，用"大了/小了"猜中它',
    howTo: '电脑心里想了一个 0 到 19 的数。你点一个数，电脑会告诉你"大了"还是"小了"。每次猜中间的数，最快猜中！',
    chapters: ['c8'],
  },
  {
    slug: 'boardrace',
    name: '骰子走格',
    icon: '🎲',
    group: 'numline',
    summary: '掷骰子在 1~20 数轴上赛跑，答对口算加速',
    howTo: '掷骰子，小人在数轴上向前走。走到问号格要口算答题：答对前进 2 格，答错后退 1 格。先到 20 就赢啦！',
    chapters: ['c8', 'c9'],
  },
  {
    slug: 'frogjump',
    name: '青蛙跳荷叶',
    icon: '🐸',
    group: 'numline',
    summary: '青蛙在数轴上跳，跳到正确的荷叶',
    howTo: '青蛙在荷叶上，要往前跳几格。点中正确的荷叶（原来的数加上跳的格数），青蛙就跳过去。',
    chapters: ['c8'],
  },
  {
    slug: 'maze',
    name: '数字迷宫',
    icon: '🌀',
    group: 'numline',
    summary: '只能踩"比当前大 1"的格子，走出迷宫',
    howTo: '从入口出发，每次只能走到相邻的、比当前数字大 1 的格子里。一步一步走到终点就成功啦！',
    chapters: ['c8', 'c9'],
  },
  {
    slug: 'rocket',
    name: '火箭倒计时',
    icon: '🚀',
    group: 'numline',
    summary: '按 10、9、8…0 的顺序点亮数字，发射火箭',
    howTo: '数字按钮是乱排的。从 10 开始，按倒数的顺序（10、9、8…0）一个一个点，全部点亮火箭就发射！',
    chapters: ['c8'],
  },
  {
    slug: 'pattern',
    name: '找规律',
    icon: '🧩',
    group: 'numline',
    summary: '发现数字和图形的排列规律，填出空缺',
    howTo: '看一行数字或图形的排列，找出规律，从选项里选出空缺处应该是什么。连续答对 5 题过关！',
    chapters: ['c8', 'c9'],
  },
  {
    slug: 'relay',
    name: '口算接龙',
    icon: '🐲',
    group: 'calc',
    summary: '上一题的得数就是下一题的已知数，连答 5 题',
    howTo: '一共 5 道口算题：第一题随意算，之后的题目里会用到上一题的得数。又快又对就能上榜单！',
    chapters: ['c4', 'c6', 'c9'],
  },
  {
    slug: 'puzzle',
    name: '算式拼图',
    icon: '🖼️',
    group: 'calc',
    summary: '答对一题揭开一块拼图，拼出完整图画',
    howTo: '画面被 9 块拼图盖住。每答对一道题，就揭开一块拼图。全部揭开，就能看到完整的图画！',
    chapters: ['c1', 'c2', 'c4', 'c6', 'c8', 'c9'],
  },
  {
    slug: 'whack',
    name: '打地鼠',
    icon: '🐹',
    group: 'calc',
    summary: '60 秒限时，敲中答案正确的算式地鼠',
    howTo: '中央会显示一道算式，洞里不断冒出带着数字的地鼠。敲中得数相同的地鼠 +10 分，敲错 -5 分。60 秒内得分越多越好！',
    chapters: ['c4', 'c6', 'c9'],
  },
  {
    slug: 'codebreak',
    name: '破译密码锁',
    icon: '🔐',
    group: 'calc',
    summary: '连续答对 3 道题，打开宝箱',
    howTo: '宝箱有 3 道密码锁，每答对一道锁就解开一格。答错当前锁会重置，加油一口气解开 3 道！',
    chapters: ['c2', 'c4', 'c6'],
  },
  {
    slug: 'picking',
    name: '摘果子',
    icon: '🍎',
    group: 'calc',
    summary: '一边摘果子一边算：一共摘了几个？还剩几个？',
    howTo: '小树上有一些果子，第一次摘几个，第二次又摘几个。认真看动画，算出"一共摘了多少"或"还剩多少"。',
    chapters: ['c4', 'c6'],
  },
  {
    slug: 'shaperiddle',
    name: '图形特征猜谜',
    icon: '🧊',
    group: 'logic',
    summary: '读特征猜一猜是哪个立体图形',
    howTo: '听一段特征的描述（比如"上下一样粗，两头都是圆"），想一想说的是哪个立体图形，然后选出来。',
    chapters: ['c5'],
  },
  {
    slug: 'shapebuild',
    name: '图形拼搭',
    icon: '🏠',
    group: 'logic',
    summary: '按图纸挑选图形，拼出目标造型',
    howTo: '看图纸上要拼的造型需要哪些图形、各要几个，从图形池里把它们点出来。选齐了就拼好啦！',
    chapters: ['c5'],
  },
  {
    slug: 'warbattle',
    name: '翻牌对战',
    icon: '⚔️',
    group: 'calc',
    summary: '双方各翻两张牌比大小，和大的赢走牌',
    howTo: '你和电脑对战：每人翻出两张牌，把两数相加，和大的赢走这轮 4 张牌。多轮之后牌多的一方获胜！',
    chapters: ['c4', 'c6'],
  },
  {
    slug: 'sudoku',
    name: '4×4 数独',
    icon: '🔢',
    group: 'logic',
    summary: '每行每列每宫 1~4 不重复，填满小方格',
    howTo: '4×4 的小宫格，每行、每列、每个 2×2 小方块都要有 1、2、3、4 各一个。点一个空格，从候选数里选正确的数填进去。',
    chapters: ['c9'],
  },
  {
    slug: 'matchstick',
    name: '火柴棒算式',
    icon: '🪄',
    group: 'logic',
    summary: '火柴棒拼的算式不对，移动一根就成立',
    howTo: '火柴棒拼出了一个不对的算式。聪明的你移动一根火柴就能让它成立——选一选移动后正确的算式吧！',
    chapters: ['c6', 'c9'],
  },
]
