/**
 * 构建/验收脚本共享的应用注册表。
 * 年级业务目录保持独立；构建入口只在这里维护一次路径、workspace 名和部署子路径。
 */
export const gradeApps = [
  { id: 'g1', label: '一年级', workspace: 'math-game', dir: 'g1/game', base: '/g1/', dist: '.output/public' },
  { id: 'g2', label: '二年级', workspace: 'math-game-g2', dir: 'g2/game', base: '/g2/', dist: '.output/public' },
  { id: 'g3', label: '三年级', workspace: 'math-game-g3', dir: 'g3/game', base: '/g3/', dist: '.output/public' },
  { id: 'g4', label: '四年级', workspace: 'math-game-g4', dir: 'g4/game', base: '/g4/', dist: '.output/public' },
  { id: 'g5', label: '五年级', workspace: 'math-game-g5', dir: 'g5/game', base: '/g5/', dist: '.output/public' },
  { id: 'g6', label: '六年级', workspace: 'math-game-g6', dir: 'g6/game', base: '/g6/', dist: '.output/public' },
]

export const portalApp = {
  id: 'portal',
  label: '门户',
  workspace: 'math-portal',
  dir: 'portal',
  base: '/',
  dist: '.output/public',
}

