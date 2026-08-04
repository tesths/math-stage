export interface MatchstickItem {
  /** 显示的不成立算式（火柴棒渲染） */
  bad: string
  /** 移动一根后成立 */
  good: string
  /** 干扰选项 */
  distractors: string[]
}

/**
 * 火柴棒题库：good 与 bad 仅差一根火柴（七段数字 +/− 一根段）。
 * 变换对：2↔3、5↔3、0↔6、0↔9、6↔9（单根段位移）。
 */
export const MATCHSTICK_LEVELS: MatchstickItem[] = [
  { bad: '2+2=5', good: '2+3=5', distractors: ['2+2=3', '3+2=6'] },
  { bad: '3+2=7', good: '5+2=7', distractors: ['3+2=8', '5+2=4'] },
  { bad: '5+6=9', good: '3+6=9', distractors: ['5+6=11', '3+6=8'] },
  { bad: '9+3=9', good: '6+3=9', distractors: ['9+3=12', '6+3=10'] },
  { bad: '9+6=6', good: '0+6=6', distractors: ['9+6=15', '0+6=5'] },
  { bad: '9+4=10', good: '6+4=10', distractors: ['9+4=13', '6+4=9'] },
  { bad: '3+5=10', good: '5+5=10', distractors: ['3+5=8', '5+5=11'] },
  { bad: '9+0=6', good: '6+0=6', distractors: ['9+0=15', '6+0=9'] },
  { bad: '3+6=8', good: '2+6=8', distractors: ['3+6=9', '2+6=7'] },
  { bad: '0+2=8', good: '6+2=8', distractors: ['0+2=2', '6+2=7'] },
]

/** 渲染算式用：拆成字符序列（数字 + 符号） */
export function toChars(expr: string): string[] {
  return expr.split('')
}
