# 🔬 自主实验室与闭环发现 — SDL 讲座交互式网页应用

面向材料科学研究生的 2–3 小时专题讲座交互工具，以 A-Lab 为核心案例，系统讲解 Self-driving Labs 的概念、技术栈与前沿进展。

## 功能模块

1. **首页** — 讲座概览 + 传统 vs SDL 效率对比
2. **背景知识** — 实验史时间轴 + MSE 工序全景 + 交互式知识图谱（60+ 节点）
3. **SDL 核心概念** — 闭环流程图 + 关键组件解析
4. **A-Lab 案例** — 时间线 + 设备画廊 + 合成材料数据
5. **互动演示** — 7 个 Live Cases 的 BO 仿真 + DOE 对比 + Deepseek LLM 实验规划 + Quiz
6. **挑战与未来** — 局限性分析 + 课题 SDL 化评估
7. **资源总结** — 论文 + 工具 + BibTeX 下载

## 技术栈

React 19 + TypeScript + Vite 7 + Tailwind CSS + Framer Motion + Plotly.js + D3-force + Three.js

## 开发

```bash
npm install
npm run dev
```

## 部署

```bash
npm run build
# dist/ 目录可部署到 Vercel / Netlify / GitHub Pages
```

## LLM 配置

互动演示中的 AI 实验规划助手使用 Deepseek API。在应用内输入 API Key（仅存储在本地浏览器 localStorage 中）。无 Key 时自动切换到离线预设回答模式。
