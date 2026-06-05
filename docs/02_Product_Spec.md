# SDL Course App Product Spec

版本：1.0  
日期：2026-06-04  
状态：active

## 1. 信息架构

本产品按“完整课程平台”设计，讲座版由课程路径裁切生成。

当前交付优先级：

1. 先让讲座版 MVP 可用。
2. 但实现方式必须直接服务完整课程结构。

### 一级路由

1. `/`
2. `/course`
3. `/foundations`
4. `/a-lab`
5. `/case-studio`
6. `/methods`
7. `/design-studio`
8. `/resources`

### 共用壳层

1. 顶部全局导航
2. 桌面端课程侧栏
3. 移动端折叠菜单
4. 当前页面的关键术语、下载或跳转区

## 2. 页面规格

### 首页 `/`

目标：作为课程入口页。

必须有：

1. 一句话定义
2. 适合人群
3. 两阶段目标说明：Phase A / Phase B
4. 三个主入口：
   - 开始课程
   - 进入案例工作台
   - 查看 A-Lab 档案

### Course `/course`

目标：解释整个课程结构。

必须有：

1. 课程地图
2. 每章目标
3. 推荐顺序
4. 完整课程与讲座压缩版的区别

### Foundations `/foundations`

目标：建立实验中心视角，以及 SDL 方法与闭环直觉。

必须有：

1. 实验的历史角色与演变
2. MSE 实验图谱与目录学
3. 试错法、DOE 与 SDL 的比较
4. surrogate / uncertainty / acquisition 的关系
5. 至少两个可交互说明块
6. 至少一张“实验中心 MSE 图谱”

### A-Lab `/a-lab`

目标：把 A-Lab 做成案例档案，而不是展板。

必须有：

1. 问题定义
2. 系统组成
3. 执行闭环
4. 关键结果
5. 争议与再分析
6. 对学生的真实启示

### Case Studio `/case-studio`

目标：让学生看到 SDL 如何选下一个实验。

必须有：

1. 案例选择器
2. 参数与约束区
3. 当前观测与目标
4. 推荐点与推荐理由
5. 历史表与 best-so-far
6. reset / replay

### Methods `/methods`

目标：将方法教学与案例工作台分开。

必须有：

1. DOE 方法对比
2. BO acquisition 对比
3. exploration / exploitation
4. noise 影响

### Design Studio `/design-studio`

目标：将研究问题结构化为 SDL 设计草案。

必须有：

1. 输入表单或向导
2. 固定输出模版：
   - Objective
   - Parameters
   - Constraints
   - Measurements
   - Suggested strategy
   - Risks
   - Human judgment needed
   - Validation plan

### Resources `/resources`

目标：提供可学习的资源体系。

必须有：

1. 阅读路径
2. 工具清单
3. benchmark 清单
4. 术语表入口
5. MSE 实验目录入口

## 3. 讲者模式

Lecture MVP 必须支持一个轻量讲者模式：

1. 一键 reset 当前案例
2. 一键推进多步实验
3. 高亮当前最优点与下一推荐点

## 3.1 Lecture MVP 页面要求

讲座版 MVP 阶段必须优先完成：

1. 首页
2. Course
3. Foundations 的讲座所需部分
4. A-Lab
5. Case Studio

## 4. 内容与组件分层

1. 课程文案不再深埋巨型组件。
2. 页面、布局、导航、案例引擎分层。
3. 案例元数据与案例计算逻辑分层。
4. 课程内容、实验目录学和案例工作台分层。
5. AI 相关模块必须支持人类审查与反馈，而不是只做单向输出。

## 5. Legacy 代码复用原则

允许保留：

1. 基础 UI 组件
2. 局部图表工具
3. 可复用数据表和术语表

建议替换：

1. 单页 `App.tsx` 结构
2. 旧首页叙事
3. 旧 A-Lab 模块
4. 旧 DemoSection 的一体化结构
