# Claude Code Task 01: Phase 1 Reset

状态：completed  
日期：2026-06-04  
更新：2026-06-09

## 1. 任务目标

基于以下文档，启动项目重构第一阶段：

1. [00_Project_Charter.md](/D:/A-Lab/sdl-lecture/docs/00_Project_Charter.md)
2. [01_PRD.md](/D:/A-Lab/sdl-lecture/docs/01_PRD.md)
3. [02_Product_Spec.md](/D:/A-Lab/sdl-lecture/docs/02_Product_Spec.md)
4. [03_Technical_Spec.md](/D:/A-Lab/sdl-lecture/docs/03_Technical_Spec.md)
5. [04_Operating_Model.md](/D:/A-Lab/sdl-lecture/docs/04_Operating_Model.md)
6. [06_Course_Outline.md](/D:/A-Lab/sdl-lecture/docs/06_Course_Outline.md)
7. [07_Syllabus.md](/D:/A-Lab/sdl-lecture/docs/07_Syllabus.md)
8. [08_Learning_Objectives_Matrix.md](/D:/A-Lab/sdl-lecture/docs/08_Learning_Objectives_Matrix.md)

## 2. 你本轮要完成什么

1. 将项目从单页结构迁移到 route-based 课程结构。
2. 建立统一 app shell。
3. 把首页重做成课程入口页。
4. 把旧 section 迁移为页面级内容骨架。
5. 保留可复用内容，但不保留旧产品结构。
6. 明确为 Foundations 的背景知识与实验目录学预留位置。

## 2.1 优先级原则

你不是在做“讲座页面改版”，而是在做“课程平台的讲座版 MVP”。

执行时必须同时满足：

1. 架构上对齐完整课程。
2. 交付上优先满足当前讲座 deadline。

因此优先顺序为：

1. 首页与课程入口
2. Foundations 骨架
3. A-Lab 页面
4. Case Studio 页面骨架
5. 讲者模式所需的最小导航与控制能力

## 3. 必须实现的路由

1. `/`
2. `/course`
3. `/foundations`
4. `/a-lab`
5. `/case-studio`
6. `/methods`
7. `/design-studio`
8. `/resources`

## 4. 允许的策略

1. 保留现有 UI 基础组件。
2. 保留部分旧内容。
3. 重写 `App.tsx` 与导航结构。
4. 如旧 section 阻碍重构，可直接拆分或废弃。

## 5. 禁止事项

1. 不要继续在单页结构上加 section。
2. 不要先扩写 toy case。
3. 不要把大量静态文案继续塞进单个巨型组件。

## 6. 交付物

1. 可运行的路由化应用。
2. 新页面结构说明。
3. `npm run build` 结果。
4. 对 legacy 代码保留与删除的说明。

## 7. 提交要求

至少分三次提交：

1. 路由与 app shell
2. 首页与课程页
3. 页面迁移与收尾

每次提交后汇报：

1. commit SHA
2. 修改内容
3. 构建结果
4. 下一步计划

## 8. 验收结论

Phase 1 目标已完成，项目已从单页讲座结构迁移为 route-based 课程应用。

已确认项：

1. 统一 `AppShell` 已落地。
2. 首页、课程页、Foundations、A-Lab、Case Studio 等页面级结构已建立。
3. `src/sections/` 中的 legacy section 已从主入口移出，仅作为内容复用来源保留。
4. 项目已配置 GitHub Actions 部署链路，主分支推送时由 `.github/workflows/deploy.yml` 执行 `npm run build:github` 并发布到 GitHub Pages。

## 9. 当前实现状态快照

当前已实现路由：

1. `/`
2. `/course`
3. `/foundations`
4. `/a-lab`
5. `/case-studio`
6. `/methods`
7. `/design-studio`
8. `/resources`

当前额外扩展路由：

1. `/paradigms`
2. `/sdl-demo`
3. `/led-calibration`

对应实现位置：

1. 路由定义：`src/app/router.tsx`
2. 应用壳层：`src/layouts/AppShell.tsx`
3. 页面目录：`src/pages/`
4. 复用内容与算法：`src/components/`、`src/lib/`、`src/data/`

## 10. 进入下一阶段前的建议

1. 以 GitHub Actions 结果作为发布验证基准，不再要求本地构建作为日常状态更新前提。
2. 下一阶段优先处理页面内容一致性、导航收口和 demo 资产体积控制。
3. `plotly` 相关产物体积较大，后续应考虑代码分割或懒加载。
