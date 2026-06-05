# SDL Course App Technical Spec

版本：1.0  
日期：2026-06-04  
状态：active

## 1. 技术基线

1. 前端：`React 19 + TypeScript + Vite`
2. 样式：沿用现有 `Tailwind + shadcn/ui`
3. 路由：`react-router`
4. Python：用于案例原型、数据处理和后续 benchmark 准备
5. 内容资产：课程、实验目录学、案例元数据应分离存储

## 2. 运行环境

默认开发环境：

1. Windows 本地
2. `conda` 环境统一 Python 与 Node 版本

暂不强制进入 WSL。只有在出现 Linux 兼容性优势明显时再切。

## 3. 代码结构目标

建议第一轮收敛到：

1. `src/app`
2. `src/layouts`
3. `src/pages`
4. `src/navigation`
5. `src/content`
6. `src/catalog`
7. `src/cases`
8. `src/course`
7. `src/components`
8. `src/lib`

## 4. Case Engine 抽象

每个案例至少定义以下字段：

1. `id`
2. `title`
3. `domain`
4. `parameterSchema`
5. `constraints`
6. `observationModel`
7. `evaluator`
8. `initialDesign`
9. `recommender`
10. `historyColumns`
11. `seedConfig`

## 5. 案例计算设计原则

1. 不再以 `objectiveFn(values) => score` 作为唯一形态。
2. 统一采用：
   - 参数输入
   - 观测生成
   - 目标比较
   - 推荐解释
3. 至少一个案例要明确区分：
   - target
   - measured output
   - distance metric

## 6. 质量门槛

1. `npm run build` 必须通过。
2. 主讲链路不得依赖在线 API。
3. 所有核心案例支持固定 seed。
4. 所有重要页面可在桌面和移动端访问。

## 7. Phase 1 技术任务

1. 引入页面路由。
2. 建立 app shell。
3. 将单页 sections 迁移为页面级结构。
4. 将 legacy 页面逻辑隔离。
5. 为 Foundations 与实验目录学预留独立内容层。

## 8. Phase 2 技术任务

1. 抽象 case engine。
2. 重做 RGB LED benchmark。
3. 重做一个反应优化案例。
4. 建立讲者模式。

## 9. Phase 3 技术任务

1. Methods Lab 与 Design Studio 解耦。
2. 增加本地持久化。
3. 增加导出能力。

## 10. 版本策略

1. 顶层规格先行。
2. 每个阶段独立提交。
3. 不允许把所有重构压成一个巨型提交。
4. 课程文档、实验目录学和代码实现必须保持可追踪映射。
