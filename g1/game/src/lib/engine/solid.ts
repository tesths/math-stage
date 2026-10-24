/**
 * 立体图形的事实表与「数面」过程（一年级上册 认识图形（一））
 *
 * 为什么单独成模块：面/棱/顶点这些数必须是对的（圆柱的「曲面」不能算成平面），
 * 而且「一个一个数」的过程要能被单测断言，不能只画一张好看的图。
 */
export type SolidName = '长方体' | '正方体' | '圆柱' | '球'

export interface FaceStep {
  /** 第几个面 */
  no: number
  /** 这个面叫什么（上面/下面/前面/后面/左面/右面/圆面/曲面） */
  face: string
  /** 平面 / 曲面 */
  kind: '平面' | '曲面'
  /** 一句话描述 */
  say: string
}

export interface SolidFact {
  name: SolidName
  /** 平面个数 */
  flatFaces: number
  /** 曲面个数 */
  curvedFaces: number
  /** 顶点个数（球、圆柱「没有顶点」按 0 记） */
  corners: number
  /** 能否滚动，及滚动方向 */
  roll: string
  faces: FaceStep[]
}

const BOX_FACES: { face: string; say: string }[] = [
  { face: '上面', say: '上面是一个平平的长方形' },
  { face: '下面', say: '下面和上面一样大，也是平平的' },
  { face: '前面', say: '前面是平平的长方形' },
  { face: '后面', say: '后面和前面一样大' },
  { face: '左面', say: '左面是平平的长方形' },
  { face: '右面', say: '右面和左面一样大' },
]

export const SOLID_FACTS: Record<SolidName, SolidFact> = {
  长方体: {
    name: '长方体',
    flatFaces: 6,
    curvedFaces: 0,
    corners: 8,
    roll: '不能滚，只能推着走',
    faces: BOX_FACES.map((f, i) => ({ no: i + 1, face: f.face, kind: '平面', say: f.say })),
  },
  正方体: {
    name: '正方体',
    flatFaces: 6,
    curvedFaces: 0,
    corners: 8,
    roll: '不能滚，只能推着走',
    faces: BOX_FACES.map((f, i) => ({
      no: i + 1,
      face: f.face,
      kind: '平面',
      say: `正方体的${f.face}是正方形，6 个面一样大`,
    })),
  },
  圆柱: {
    name: '圆柱',
    flatFaces: 2,
    curvedFaces: 1,
    corners: 0,
    roll: '能滚，但只能顺着一个方向滚',
    faces: [
      { no: 1, face: '上面（圆面）', kind: '平面', say: '上面是一个平平的圆' },
      { no: 2, face: '下面（圆面）', kind: '平面', say: '下面和上面一样，也是一个圆' },
      { no: 3, face: '侧面（曲面）', kind: '曲面', say: '侧面是弯的曲面，摸上去光滑，放倒就能滚' },
    ],
  },
  球: {
    name: '球',
    flatFaces: 0,
    curvedFaces: 1,
    corners: 0,
    roll: '往哪个方向都能滚',
    faces: [{ no: 1, face: '曲面', kind: '曲面', say: '球只有一个弯弯的曲面，没有平平的面' }],
  },
}

/** 数面的过程：一个面一步 */
export function faceSteps(shape: string): FaceStep[] {
  const fact = SOLID_FACTS[shape as SolidName] ?? SOLID_FACTS['正方体']
  return fact.faces
}

/** 这个图形一共有几个面（平面 + 曲面） */
export function totalFaces(shape: string): number {
  const fact = SOLID_FACTS[shape as SolidName] ?? SOLID_FACTS['正方体']
  return fact.flatFaces + fact.curvedFaces
}
