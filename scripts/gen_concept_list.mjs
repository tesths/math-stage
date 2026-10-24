#!/usr/bin/env node
/**
 * 生成《五六年级例题重点概念清单》：把每道例题「想建立什么概念」写成一份可复核的参考，
 * 并逐题附上教材原文要点（书页 + 题源）、可调参数、当前可视化落点。
 *
 * 数据来源（不依赖网络）：
 *   ① 教材原文 OCR：`gX/ocr/upper/book/上册_正文.md`（结论由人写进本脚本的 UNITS 表，逐条对照书页）
 *   ② Lab 数据：`gX/data/upper/chapters/*.ts`（id / 书页 / 题源 / 题干 / 公式 / tip 机器读取）
 *
 * 用法：node scripts/gen_concept_list.mjs
 * 输出：docs/research/五六年级例题重点概念清单.md
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')

/** 单元级「教材意图 / 教案关键环节 / 常见误区」（人工撰写，逐条对照课本 OCR 与课标） */
const UNITS = {
  g5: {
    c1: {
      title: '一 图形的运动',
      pages: '1-13',
      intent: '平移、旋转、轴对称三种运动的共同本质：形状和大小不变，只改变位置。判断属于哪种运动，都要看「对应点」——平移看对应点之间的距离，旋转看对应点到旋转中心的距离与转过的角度，轴对称看对应点到对称轴的距离。',
      steps: '在方格纸上数出一组对应点之间的格数 → 由这一组对应点画出其他对应点 → 说出判断依据（距离/角度/垂直平分）。',
      mistakes: '把平移格数数成两个图形之间的空格数；旋转中心找错或顺、逆时针说反；轴对称只凭「看起来像」而不检验对应点到轴的距离。',
    },
    c2: {
      title: '二 统计表和条形统计图（二）',
      pages: '17-25',
      intent: '复式统计表和复式条形统计图把两组相关联的数据放在一起，便于比较；复式条形图必须用不同颜色（图例）区分两组数据。',
      steps: '收集数据 → 填复式统计表（验算合计行与合计列）→ 画复式条形图（两组直条并列、标明图例与单位）→ 看图说出比较结论。',
      mistakes: '合计行/列算错；把两组直条画成一条；看图时先看直条高低而不看颜色对应的图例。',
    },
    c3: {
      title: '三 多边形的面积',
      pages: '30-50',
      intent: '本单元的核心思想是「转化」：把没学过的图形转化成学过的图形。平行四边形用割补（沿高剪下、平移）拼成长方形；三角形和梯形用「倍拼」（两个完全一样的图形拼成平行四边形）。组合图形用分割或添补。',
      steps: '数方格（每格代表 100 平方米）→ 提出猜想 → 剪一剪、拼一拼 → 找对应关系（底↔长、高↔宽）→ 推出公式 → 回顾「面积与形状无关、只与底和高有关」。',
      mistakes: '把斜边当高；三角形、梯形忘记除以 2；组合图形割补后漏算或重复算；长度单位与面积单位混淆；1 公顷 = 10000 平方米、1 平方千米 = 100 公顷。',
    },
    c4: {
      title: '四 小数乘法和除法（一）',
      pages: '55-64',
      intent: '算理与整数一致：小数乘整数先按整数乘法算，再看因数中一共有几位小数，就从积的右边起数出几位点上小数点；小数除以整数按整数除法除，商的小数点要和被除数的小数点对齐，余数添 0 继续除；小数点移动引起小数大小变化（×10 向右移一位，÷10 向左移一位）。',
      steps: '用方格/面积模型表示「0.6 × 3」→ 竖式分步（部分积怎么对齐）→ 观察小数点「搬家」后每一位的位值变化 → 用「元、角、分」验证结果。',
      mistakes: '积的小数点位置数错；商的小数点忘点或点错；小数点移动位数不够时不补 0；把除以 10 与乘 10 的方向搞反。',
    },
    c5: {
      title: '五 可能性',
      pages: '65-73',
      intent: '可能性的大小由所占的份数（面积、个数）决定：区域越大、球越多，落在它那里的可能性就越大；各区域相等时可能性相等。试验次数越多，实验频率越接近理论可能性。',
      steps: '观察转盘/袋中球的结构说出可能性大小 → 动手试验并记录（正字计数）→ 比较实验频率与理论可能性 → 用「份数」说明理由。',
      mistakes: '只看结果不看份数；把少量试验的频率当成可能性本身；认为「这次转到红色，下次就一定不是红色」。',
    },
    c6: {
      title: '六 因数与倍数',
      pages: '74-95',
      intent: '因数是「能整除」的关系：能整除 n 的数就是 n 的因数，因数是成对出现的；一个数的倍数有无限多个，最小的倍数是它本身。质数与合数按「因数的个数」分类。公因数/最大公因数、公倍数/最小公倍数用集合（交集）的观点理解。',
      steps: '用同样大的正方形拼长方形找因数 → 百数表里划去倍数筛出质数 → 用列举法找公因数、公倍数 → 用韦恩图或两条数轴把「公有」的部分显出来。',
      mistakes: '因数与倍数概念混淆；找因数时漏掉 1 和它本身；把 1 当成质数；把「互质」误认为「两个数都是质数」。',
    },
    c7: {
      title: '七 用字母表示数量关系（一）',
      pages: '96-109',
      intent: '用字母表示数，是把具体的数量关系一般化：字母式既能表示关系，也能代入求值。s = v × t 这样的字母式就是一个可反复使用的模型。',
      steps: '由具体数字列式 → 把变化的数换成字母 → 写出字母式 → 代入求值并解释字母的取值范围。',
      mistakes: '把 a² 与 2a 混为一谈；只会代入求值而说不清字母式表示的关系；写式子时漏掉乘号的省略规范（4a、a²）。',
    },
    c8: {
      title: '八 观察物体（三）· 探索规律 钉子板上的多边形',
      pages: '110-118',
      intent: '从前面、右面、上面三个方向观察同一个物体，得到三张视图；三视图与摆法可以相互确定，同一个视图也可以由不同摆法得到。钉子板探索规律：多边形面积与边上的钉子数、内部的钉子数之间有确定关系（皮克定理 S = n/2 + b − 1）。',
      steps: '用小正方体摆出物体 → 从前、右、上三个方向观察并画出看到的图形 → 根据视图还原摆法并说明理由 → 钉子板上数边上的钉子和内部钉子，寻找面积规律。',
      mistakes: '把「看到的平面图形」与「立体形状」混为一谈；只凭一个方向的视图就断定摆法；数钉子时漏数边上的钉子。',
    },
  },
  g6: {
    c1: {
      title: '一 小数乘法和除法（二）',
      pages: '1-13',
      intent: '乘一个小于 1 的数，积会比原来的数小——这与「乘法越乘越大」的旧经验冲突，需要用方格模型说明理由；求积、商的近似值要先把结果算出来再四舍五入；按实际意义决定用进一法还是去尾法。',
      steps: '方格模型把 0.6×0.4 看成「6/10 × 4/10」→ 比较积与因数的大小并说出理由 → 先算再取近似值 → 结合情境判断「最多买几支 / 至少准备几个」。',
      mistakes: '认为乘法一定使结果变大；先取近似值再计算；把进一法、去尾法与四舍五入混用；循环小数的循环节写错。',
    },
    c2: {
      title: '二 混合运算与数量关系（三）· 生活中的分段计费',
      pages: '14-29',
      intent: '分数四则混合运算的顺序与整数相同，整数运算律对分数同样适用。线段图把「一个数的几分之几」「比一个数多（少）几分之几」变成看得见的量。工程问题把工作总量看作单位「1」。分段计费要按区间分段计算。',
      steps: '画线段图 → 找准单位「1」→ 列式并说明每一步求的是什么 → 检验结果是否符合实际（人数、天数必须是整数）。',
      mistakes: '单位「1」找错；「比一个数多几分之几」直接乘那个分数；除不尽时不检查实际意义；分段计费忘记「不足 1 千米按 1 千米计算」。',
    },
    c3: {
      title: '三 数与运算的再认识 · 二进制的秘密',
      pages: '30-43',
      intent: '数的组成都是「计数单位的个数」；相邻计数单位之间的进率都是 10。四则运算的意义是一致的：加减法是相同计数单位个数的加减，乘法是计数单位相乘、个数相乘，除法在计数单位相同时可以直接用个数相除。二进制是「满二进一」的计数方法。',
      steps: '拆数位、说计数单位 → 比较大小先化成相同的计数单位 → 用计数单位解释四则运算 → 用数珠/位权表把十进制与二进制互相改写。',
      mistakes: '小数与整数的运算「规则不同」的误解；数位与计数单位混淆；二进制把「（10）₂」读成「十」而不是逐位读「一零」。',
    },
    c4: {
      title: '四 比和比例 · 神奇的黄金比',
      pages: '44-67',
      intent: '比表示两个数量之间的倍数关系，比值 = 前项 ÷ 后项；比的基本性质（前项、后项同时乘或除以相同的数，0 除外）用来化简比。比例是两个比相等，a:b = c:d 时外项积等于内项积。按比例分配先求总份数、再求每份。黄金比约等于 0.618。',
      steps: '先算比值再定义比例 → 用份数图理解按比例分配 → 交叉相乘验证比例 → 用黄金比解释名画、建筑中的构图。',
      mistakes: '把比当成一个「除法结果」而说不清表示的关系；后项为 0；化简比与求比值混为一谈；按比例分配忘记先求总份数。',
    },
    c5: {
      title: '五 圆',
      pages: '68-87',
      intent: '圆是曲线围成的图形。圆的周长与直径的比是一个固定的数 π（化曲为直：滚圆、绕线）。圆的面积用「等分剪拼」转化成近似长方形：长 = πr、宽 = r，所以 S = πr²（份数越多越接近，体现极限思想）。圆环面积 = 外圆面积 − 内圆面积。',
      steps: '滚圆一周或绕线量出周长 → 算 C ÷ d 发现都是 3 倍多一些 → 把圆 8、16、32、64 等分剪拼 → 找底与高的对应关系 → 推出面积公式。',
      mistakes: '把 π 当成精确值 3.14；周长与面积公式混用；半径与直径混淆；圆环面积写成 π(R − r)²。',
    },
    c6: {
      title: '六 放大与缩小',
      pages: '92-102',
      intent: '按比放大或缩小，是「每条对应边都乘或除以同一个数」，形状不变、大小改变；面积按这个比的平方 n² 变化。比例尺 = 图上距离 : 实际距离，包括求实际距离、求图上距离、求比例尺三种问法。',
      steps: '在方格纸上按比画出放大或缩小后的图形 → 量对应边验证比相等 → 比较面积的倍数 → 用比例尺在三种问法间换算。',
      mistakes: '认为放大后形状改变了；认为面积也乘 n；比例尺方向搞反；图上距离与实际距离单位不统一就换算。',
    },
    c7: {
      title: '七 确定位置',
      pages: '103-111',
      intent: '用数对确定位置时，第一个数表示列、第二个数表示行，先列后行。用方向和距离确定位置时，必须说清「以谁为观测点」，且只说方向不够、必须加上距离；东北方向也叫北偏东方向。',
      steps: '在座位图上写数对 → 在方格纸上按数对走出路线（数对逐个变化）→ 用方向标量出角度、用格数表示距离 → 换一个观测点再描述同一个位置。',
      mistakes: '列与行颠倒；只说方向不说距离；不说清观测点；量角度时不以正北为始边。',
    },
  },
}

/** 解析一个 Lab 块里的参数：单行 `{ key, label }` 与多行 `{\n key,\n label }` 都要认，
 *  并把「这个参数自己有没有 options 按钮」标在它身上（不是标在整个 Lab 上）。 */
function extractParams(block) {
  const matches = [...block.matchAll(/key: '([^']+)',\s*label: '([^']+)'/g)]
  return matches.map((m, i) => {
    const end = i + 1 < matches.length ? matches[i + 1].index : block.length
    const segment = block.slice(m.index, end)
    return { key: m[1], label: m[2], hasOptions: /options: \[/.test(segment) }
  })
}

/** 从章节 TS 文件里粗解析 Lab（与 scripts/visual-shots.mjs 同一套数据来源，不依赖运行时） */
function parseLabs(grade) {
  const dir = path.join(root, `${grade}/data/upper/chapters`)
  const labs = []
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.ts') && x !== 'meta.ts').sort()) {
    const text = readFileSync(path.join(dir, f), 'utf8')
    for (const block of text.split(/\n  \{\n/).slice(1)) {
      const id = /id: '([^']+)'/.exec(block)?.[1]
      if (!id) continue
      labs.push({
        id,
        chapter: /chapter: '([^']+)'/.exec(block)?.[1] ?? 'c?',
        page: Number(/page: (\d+)/.exec(block)?.[1] ?? 0),
        source: /source: '([^']+)'/.exec(block)?.[1] ?? '',
        title: /title: '([^']+)'/.exec(block)?.[1] ?? '',
        kind: /kind: '([^']+)'/.exec(block)?.[1] ?? '',
        formula: /formula: '([^']+)'/.exec(block)?.[1] ?? '',
        tip: /tip:\s*\n?\s*'([\s\S]*?)',\n/.exec(block)?.[1]?.replace(/\s+/g, ' ').trim() ?? '',
        params: extractParams(block),
      })
    }
  }
  return labs
}

const lines = []
lines.push('# 五、六年级例题「重点概念」清单（教学解析参考）')
lines.push('')
lines.push('> 生成时间：2026-10 · 生成脚本：`node scripts/gen_concept_list.mjs`')
lines.push('>')
lines.push('> **本清单解决的问题**：每个例题在可视化的同时，学生/老师要能一眼看到「这道题想建立什么概念」。')
lines.push('> 在此之前，数据层 `LabDef.tip` 已经写好了这些概念，但**页面从不渲染它**——本清单把它整理出来，')
lines.push('> 同时在 Lab 页面上新增 `重点概念` 卡（默认收起，点开对照），80 个 Lab 全部覆盖。')
lines.push('>')
lines.push('> **资料方法与限制（如实记录）**：本轮 `web_search` 不可用（未配置 API key），')
lines.push('> 直连百度/必应/360/头条等搜索引擎均被反爬降级、无法返回有效教案结果；')
lines.push('> 因此「教材意图 / 教案关键环节 / 常见误区」以**教材原文 OCR**（`gX/ocr/upper/book/上册_正文.md`，逐页对照）')
lines.push('> 与仓库既有调研（`docs/research/数学可视化调研-国内实践.md`、`-国际平台与前端实现.md`）、《义务教育数学课程标准（2022 年版）》')
lines.push('> 的核心概念为准重建，不引用无法核实的网页来源。')
lines.push('')
lines.push('## 目录')
lines.push('')
for (const grade of ['g5', 'g6']) {
  const units = [...new Set(parseLabs(grade).map((l) => l.chapter))]
  lines.push(`- ${grade === 'g5' ? '五年级上册' : '六年级上册'}：` + units.map((c) => `[${UNITS[grade][c].title}](#${grade}-${c})`).join(' · '))
}
lines.push('')

for (const grade of ['g5', 'g6']) {
  const labs = parseLabs(grade)
  const units = [...new Set(labs.map((l) => l.chapter))]
  lines.push(`---`)
  lines.push('')
  lines.push(`# ${grade === 'g5' ? '五年级上册' : '六年级上册'}（${labs.length} 个 Lab）`)
  lines.push('')
  for (const c of units) {
    const u = UNITS[grade][c]
    const group = labs.filter((l) => l.chapter === c)
    lines.push(`<a id="${grade}-${c}"></a>`)
    lines.push('')
    lines.push(`## ${u.title}（书页 ${u.pages}，${group.length} 个 Lab）`)
    lines.push('')
    lines.push(`**教材意图（这道例题要建立的概念）**：${u.intent}`)
    lines.push('')
    lines.push(`**教案关键环节（课堂上学生要做的事）**：${u.steps}`)
    lines.push('')
    lines.push(`**常见误区（教学难点）**：${u.mistakes}`)
    lines.push('')
    lines.push('| Lab | 书页/题源 | 可调参数 | 重点概念（数据层 tip，已在页面「重点概念」卡呈现） |')
    lines.push('| --- | --- | --- | --- |')
    for (const l of group) {
      const params = l.params.length
        ? l.params.map((p) => `${p.label}(${p.key})${p.hasOptions ? ' ▸选项' : ''}`).join('、')
        : '—'
      lines.push(`| \`${l.id}\`<br>${l.title} | ${l.page} 页 · ${l.source} | ${params} | ${l.tip || '（缺）'} |`)
    }
    lines.push('')
  }
}

const out = path.join(root, 'docs/research/五六年级例题重点概念清单.md')
writeFileSync(out, lines.join('\n'), 'utf8')
console.log(`written ${path.relative(root, out)}`)
console.log(`g5 labs=${parseLabs('g5').length} g6 labs=${parseLabs('g6').length}`)
