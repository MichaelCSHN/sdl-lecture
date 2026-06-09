# Project Status

更新时间：2026-06-09  
项目：SDL 讲座 / 课程应用  
状态：active

## 1. 当前结论

项目已经完成从单页讲座页面到多路由课程应用的第一阶段迁移，当前主线工作不再是“补 section”，而是继续完善课程化页面内容、案例体验和发布质量。

## 2. 当前落地情况

已落地的基础结构：

1. 路由化应用骨架
2. 统一 `AppShell`
3. 页面级目录 `src/pages/`
4. 课程、Foundations、A-Lab、Case Studio、Methods、Design Studio、Resources 等主路径
5. GitHub Pages 自动部署工作流

当前已存在的关键页面：

1. `HomePage`
2. `CoursePage`
3. `FoundationsPage`
4. `ParadigmsPage`
5. `ALabPage`
6. `CaseStudioPage`
7. `SDLDemoPage`
8. `LedCalibrationPage`
9. `MethodsPage`
10. `DesignStudioPage`
11. `ResourcesPage`

## 3. 发布与验证

仓库已配置 GitHub Actions：

1. 工作流文件：`.github/workflows/deploy.yml`
2. 触发条件：`main` 分支 push 或手动触发
3. 发布方式：执行 `npm run build:github` 后部署到 GitHub Pages

状态更新约定：

1. 项目状态以仓库实现和 GitHub Actions 配置为准
2. 本地 `npm run build` 不作为本次状态更新的必要条件

## 4. 最近进展

最近 5 次提交显示项目仍在持续迭代：

1. `655f78b` `feat: add thin-film case to case studio`
2. `94932e1` `feat: improve mobile demo UX and LED coverage`
3. `134bb02` `fix: move lecture:reset useEffect after doReset/applyReset declarations`
4. `12a20a7` `feat: PRD gap fixes — OFAT narrative, SDL triangle, R-key, node names`
5. `638f131` `feat: add Auto/Stop to Branin case`

## 5. 下一步建议

1. 清理 README 与现状不一致的旧单页表述
2. 继续补齐页面内容完成度，而不是继续堆叠旧 section 结构
3. 处理大体积前端资源，优先关注 `plotly` 相关包的拆分与懒加载
