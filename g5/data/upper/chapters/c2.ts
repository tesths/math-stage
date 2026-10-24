import type { LabDef } from '../schema/lab'

/** 二 统计表和条形统计图（二）（书页 17-25） */
export const c2Labs: LabDef[] = [
  {
    id: 'g5-c2-stats-table',
    chapter: 'c2',
    page: 18,
    source: '例题',
    title: '复式统计表 · 民族乐器兴趣小组',
    prompt:
      '城北小学民族乐器兴趣小组（古筝、琵琶、笛子、二胡）的男生、女生各有多少人？把四张单式统计表合成一张复式统计表，拖动各小组男女生人数，观察合计与总计的变化。',
    kind: 'stats-table',
    params: [
      { key: 'a1', label: '古筝男生', min: 10, max: 40, step: 1, default: 18, unit: '人' },
      { key: 'b1', label: '古筝女生', min: 10, max: 40, step: 1, default: 22, unit: '人' },
      { key: 'a2', label: '琵琶男生', min: 10, max: 40, step: 1, default: 25, unit: '人' },
      { key: 'b2', label: '琵琶女生', min: 10, max: 40, step: 1, default: 15, unit: '人' },
      { key: 'a3', label: '笛子男生', min: 10, max: 40, step: 1, default: 20, unit: '人' },
      { key: 'b3', label: '笛子女生', min: 10, max: 40, step: 1, default: 26, unit: '人' },
      { key: 'a4', label: '二胡男生', min: 10, max: 40, step: 1, default: 16, unit: '人' },
      { key: 'b4', label: '二胡女生', min: 10, max: 40, step: 1, default: 30, unit: '人' },
    ],
    formula: '合计 = 男生 + 女生；总计 = 各班合计相加',
    tip: '复式统计表可以把几组相关联的数据放在一张表里，便于比较；合计行/列要算准确。',
  },
  {
    id: 'g5-c2-stats-bar',
    chapter: 'c2',
    page: 25,
    source: '练习',
    title: '复式条形统计图 · 双休日安排',
    prompt:
      '你和同桌双休日各花多少时间做家务、做作业、体育锻炼、课外阅读、看电视？拖动数据，观察复式条形统计图。',
    kind: 'stats-chart',
    params: [
      { key: 's1', label: '自己·做家务', min: 0, max: 8, step: 0.5, default: 1, unit: '时' },
      { key: 'd1', label: '同桌·做家务', min: 0, max: 8, step: 0.5, default: 0.5, unit: '时' },
      { key: 's2', label: '自己·做作业', min: 0, max: 8, step: 0.5, default: 2, unit: '时' },
      { key: 'd2', label: '同桌·做作业', min: 0, max: 8, step: 0.5, default: 3, unit: '时' },
      { key: 's3', label: '自己·体育锻炼', min: 0, max: 8, step: 0.5, default: 1.5, unit: '时' },
      { key: 'd3', label: '同桌·体育锻炼', min: 0, max: 8, step: 0.5, default: 1, unit: '时' },
      { key: 's4', label: '自己·课外阅读', min: 0, max: 8, step: 0.5, default: 1, unit: '时' },
      { key: 'd4', label: '同桌·课外阅读', min: 0, max: 8, step: 0.5, default: 0.5, unit: '时' },
      { key: 's5', label: '自己·看电视', min: 0, max: 8, step: 0.5, default: 0.5, unit: '时' },
      { key: 'd5', label: '同桌·看电视', min: 0, max: 8, step: 0.5, default: 1.5, unit: '时' },
    ],
    formula: '条形越长，表示的时间越长；复式图便于比较自己和同桌',
    tip: '复式条形统计图用不同颜色的直条表示不同数据，看图时先看颜色对应的图例。',
  },
]
