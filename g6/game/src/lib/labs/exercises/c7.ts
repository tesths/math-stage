import type { C7ExerciseKind, ParamValues } from '@data/schema/lab'
import type { LabResult } from '../types'
import { toFixed2 } from '@/lib/engine/math'

/** 七 确定位置 · 练习题求值 */
export function computeC7(kind: C7ExerciseKind, p: ParamValues): LabResult {
  switch (kind) {
    case 'ex-c7-route-path': {
      const x0 = Math.round(p.x0 ?? 6)
      const k = Math.round(p.k ?? 3)
      const m = Math.round(p.m ?? 2)
      const y0 = 2
      const xEnd = x0 + k
      const yEnd = y0 + m
      return {
        value: k + m,
        text: `数对从（${toFixed2(x0)}，${toFixed2(y0)}）依次变到（${toFixed2(xEnd)}，${toFixed2(yEnd)}），共走 ${toFixed2(k + m)} 格`,
        steps: [
          {
            expr: `向东段：列 ${toFixed2(x0)} → ${toFixed2(xEnd)}，行始终是 ${toFixed2(y0)}`,
            result: `数对第 1 个数加 ${toFixed2(k)}，第 2 个数不变`,
          },
          {
            expr: `向北段：行 ${toFixed2(y0)} → ${toFixed2(yEnd)}，列始终是 ${toFixed2(xEnd)}`,
            result: `数对第 2 个数加 ${toFixed2(m)}，第 1 个数不变`,
          },
          {
            expr: `终点数对`,
            result: `（${toFixed2(xEnd)}，${toFixed2(yEnd)}）`,
          },
          {
            expr: `一共走的格数 = ${toFixed2(k)} + ${toFixed2(m)}`,
            result: `共走 ${toFixed2(k + m)} 格`,
          },
        ],
        conclusion:
          x0 === 6 && k === 3 && m === 2
            ? `向东走时数对的第一个数依次加 1、第二个数不变；向北走时第二个数依次加 1、第一个数不变。从（6，2）一路变到（9，4），正好是小丽从电影院到学校的路线，一共走 3 + 2 = 5 格。`
            : `向东走时数对的第一个数加 1、第二个数不变；向北走时第二个数加 1、第一个数不变。数对从（${toFixed2(x0)}，${toFixed2(y0)}）依次变到（${toFixed2(xEnd)}，${toFixed2(yEnd)}），一共走 ${toFixed2(k)} + ${toFixed2(m)} = ${toFixed2(k + m)} 格。`,
      }
    }
    case 'ex-c7-observer-point': {
      const angle = Math.round(p.angle ?? 60)
      const dist = Math.round(p.dist ?? 400)
      const dist2 = Math.round(p.dist2 ?? 200)
      const GX = 4
      const GY = 3
      const SX = 9
      const SY = 3
      const U = 100
      const gridL = dist2 / U
      const r = dist / U
      const rad = (angle * Math.PI) / 180
      const north = r * Math.cos(rad)
      const west = r * Math.sin(rad)
      const xL = GX
      const yL = GY + gridL
      const xY = SX - west
      const yY = SY + north
      const gapGrid = xY - xL
      const gapM = Math.round(gapGrid * U)
      const rowDelta = north - gridL
      const sameRow = Math.abs(rowDelta) < 0.05
      return {
        value: dist,
        text: `晓雨家在商店的北偏西 ${toFixed2(angle)}° 方向 ${toFixed2(dist)} 米处`,
        steps: [
          {
            expr: `小琳家：打谷场正北 ${toFixed2(dist2)} 米`,
            result: `${toFixed2(dist2)} ÷ ${U} = ${toFixed2(gridL)} 格 →（${toFixed2(xL)}，${toFixed2(yL)}）`,
          },
          {
            expr: `晓雨家：商店北偏西 ${toFixed2(angle)}° 方向 ${toFixed2(dist)} 米`,
            result: `${toFixed2(dist)} ÷ ${U} = ${toFixed2(r)} 格；向北 ${toFixed2(r)} × cos${angle}° = ${toFixed2(north)} 格、向西 ${toFixed2(r)} × sin${angle}° ≈ ${toFixed2(west)} 格`,
          },
          {
            expr: `晓雨家坐标 =（${SX} − ${toFixed2(west)}，${SY} + ${toFixed2(north)}）`,
            result: `（${toFixed2(xY)}，${toFixed2(yY)}）`,
          },
          sameRow
            ? {
                expr: `两家都在街道北面 ${toFixed2(gridL)} 格（同一排）`,
                result: `从小琳家一直向东约 ${toFixed2(gapGrid)} 格（约 ${gapM} 米）就能到`,
              }
            : {
                expr: `两家不在同一排：小琳家在第 ${toFixed2(yL)} 格、晓雨家在第 ${toFixed2(yY)} 格`,
                result: `从小琳家先向东约 ${toFixed2(gapGrid)} 格，再向${rowDelta > 0 ? '北' : '南'}约 ${toFixed2(Math.abs(rowDelta))} 格`,
              },
        ],
        conclusion: `说位置要说清“以谁为观测点”：晓雨家从商店量（北偏西 ${toFixed2(angle)}° 方向 ${toFixed2(dist)} 米），小琳家从打谷场量（正北 ${toFixed2(dist2)} 米）；方向和距离配成一对，位置才能确定。${
          sameRow
            ? `两家都在街道北面 ${toFixed2(gridL)} 格，在同一排上，从小琳家一直向东约 ${toFixed2(gapGrid)} 格（约 ${gapM} 米）就到晓雨家。`
            : `两家不在同一排：从小琳家先向东约 ${toFixed2(gapGrid)} 格，再向${rowDelta > 0 ? '北' : '南'}约 ${toFixed2(Math.abs(rowDelta))} 格就到晓雨家。`
        }`,
      }
    }
  }
}
