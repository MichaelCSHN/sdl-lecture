# AI 时代的材料实验：从自动到自主

> **Self-Driving Labs & AI for Materials — Graduate Course**  
> 课程网站：[michaelcshn.github.io/sdl-lecture](https://michaelcshn.github.io/sdl-lecture)

---

## 课程简介

本课程以**自驱动实验室（SDL）**为载体，帮助材料科学研究生在 AI 时代完成三件事：

1. **认识实验本身的认识论基础**——你过去的实验，真的可以相信吗？
2. **理解 AI 的能力边界**——机器的逻辑是什么，我如何驾驭它？
3. **找到自己在人机协作中的具体位置**——你在这里面，究竟做什么？

SDL 不是这门课的主题，是**镜子**。

---

## 课程 DNA：五条设计原则

| 原则 | 含义 |
|------|------|
| 问题先行，知识随后 | 每节课从真实问题出发，不从知识点出发 |
| 体验先行，概念随后 | 先接触真实情境，再引入概念框架 |
| 判断力优先于执行力 | 核心目标是"能判断"，不是"会操作" |
| AI 是放大器，不是替代品 | 使用 AI 是鼓励的，但每个判断必须能被追问 |
| 诚实地面对不确定性 | 教师和学生都是在研究实践中形成判断的主体 |

---

## 课程架构（13 周）

```
阶段一：清醒（第1–2周）    "你现在在哪里？"
阶段二：诊断（第3–5周）    "你过去的实验，真的可以相信吗？"
阶段三：扩展（第6–9周）    "机器的逻辑是什么，我如何驾驭它？"
阶段四：整合（第10–12周）  "你在这里面，究竟做什么？"
阶段五：开放（第13周）     "你现在在哪里？"（回到第1周）
```

---

## 仓库结构

```
sdl-lecture/
├── src/                          # React + Vite + TypeScript 课程网站
│   ├── pages/                    # 各功能页面
│   └── lib/                      # GP/BO 核心算法
├── docs/                         # 课程文档
│   ├── course-design/            # 课程设计方案（核心文档）
│   │   └── SDL课程设计方案-v3.md  ← 从这里开始
│   ├── papers/                   # 学术论文（本课程相关）
│   │   ├── SDL有人的席位吗.md
│   │   ├── SDL硬件技术演化与展望.md
│   │   └── AI-for-Materials-现状与未来.md
│   ├── lecture-notes/            # 讲解稿
│   │   └── SDL-讲解稿-120分钟.md
│   ├── conversation/             # 课程设计过程记录
│   │   └── 2026-06-07-课程设计对话摘要.md
│   └── [其他已有文档...]
└── outputs/                      # 生成文件（PPT 等）
```

---

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

---

## 核心文档入口

| 文档 | 说明 |
|------|------|
| [课程设计方案 v3](docs/course-design/SDL课程设计方案-v3.md) | 完整课程设计，包含13周周历、PAVE协议、项目方案 |
| [SDL有人的席位吗](docs/papers/SDL有人的席位吗.md) | 人类知识在SDL中的六个接入口 |
| [SDL硬件技术演化](docs/papers/SDL硬件技术演化与展望.md) | 400年仪器史+TRL路线图 |
| [AI for Materials 专论](docs/papers/AI-for-Materials-现状与未来.md) | 现状、困境与突破路径 |
| [120分钟讲解稿](docs/lecture-notes/SDL-讲解稿-120分钟.md) | 配合PPT使用的完整讲解稿 |
| [对话摘要](docs/conversation/2026-06-07-课程设计对话摘要.md) | 课程设计过程的关键决策记录 |

---

## 技术栈

- **前端**：React 19 + TypeScript + Vite 7 + Tailwind CSS + shadcn/ui
- **算法**：自实现 GP（Cholesky 求逆）+ BO（EI/UCB 采集函数）
- **可视化**：Plotly.js + D3 + Mermaid

---

## License

MIT
