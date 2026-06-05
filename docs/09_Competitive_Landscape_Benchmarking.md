# Competitive Landscape / Benchmarking

状态：active  
日期：2026-06-04  
角色：CTO 参考文档

## 1. 文档目的

本文件用于回答三个问题：

1. 市面上是否已有与本课程相近的课程或训练项目。
2. 它们分别覆盖了什么，缺了什么。
3. 我们的课程应该借鉴什么，又必须避免变成什么。

## 2. 总体判断

当前外部供给大致分成四类：

1. `AI / autonomous experimentation for materials` 课程
2. `DOE / statistics / Bayesian optimization` 方法课
3. `materials characterization / experimental methods` 实验课
4. `autonomous lab / research infrastructure` 工作坊或平台项目

结论：

1. 有不少相邻课程。
2. 几乎没有课程把“实验”本身作为中心主轴。
3. 几乎没有课程同时覆盖：
   - MSE 实验的历史与地位
   - MSE 实验目录学
   - 试错法与 DOE
   - 实验硬件与工作流
   - SDL 闭环
   - 课程化案例工作台

## 3. 代表性参考对象

### 3.1 最接近的课程

#### University of Chicago

课程：`MENG 35640: AI, Automation, and Autonomous Experimentation for Materials Discovery`

可借鉴点：

1. 明确把 `AI-guided`, `automated`, `autonomous experimentation` 放到同一课程框架里。
2. 覆盖实验表示、数据表示、AI 决策和实验案例。
3. 说明 SDL 课程可以是正式课程，而不是临时 workshop。

局限：

1. 更偏 autonomous experimentation 与 materials discovery。
2. 不是以 MSE 实验目录学为主线。

来源：

1. [UChicago Molecular Engineering catalog](https://graduateannouncements.uchicago.edu/graduate/molecularengineering/)

#### Northwestern

课程：`MAT_SCI 459: Materials Informatics`

可借鉴点：

1. 将材料信息学与 autonomous labs 放在同一个当代语境中。
2. 明确连接数据、表征工具和 AI。

局限：

1. 主轴是 materials informatics，不是 experiment-centered MSE。
2. 对传统实验方法论衔接较弱。

来源：

1. [Northwestern MAT_SCI 459](https://www.mccormick.northwestern.edu/materials-science/academics/courses/descriptions/459.html)

#### MIT Professional Education

课程：`Applied AI for Materials Discovery`

可借鉴点：

1. 前沿 AI 叙事更新快。
2. 强调从 prediction 走向 closed-loop discovery。
3. 强调验证与 agentic AI。

局限：

1. 更偏 professional / industry training。
2. 不以实验体系和实验工作流为课程中心。

来源：

1. [MIT Applied AI for Materials Discovery](https://professional.mit.edu/course-catalog/applied-ai-materials-discovery)

### 3.2 DOE / 统计 / 优化类课程

#### Cornell

课程：`MSE 5730: Probability, Statistics, and Data Analysis for the Physical Sciences`

可借鉴点：

1. 明确覆盖误差、不确定度和 DOE。
2. 适合支撑我们课程中的传统实验方法论部分。

局限：

1. 不以 SDL 为重点。
2. 不直接进入实验平台与自治闭环。

来源：

1. [Cornell course catalog](https://courses.cornell.edu/courses/mse/)

#### Duke

课程：`STA 643: Modern Design of Experiments`

可借鉴点：

1. 把 DOE 连到 Bayesian sampling 与 optimization。
2. 对我们“DOE 到 SDL”的桥接特别有帮助。

局限：

1. 不是 MSE 课程。
2. 缺少实验硬件和材料语境。

来源：

1. [Duke STA 643](https://stat.duke.edu/courses/modern-design-experiments)

#### Purdue

课程：`ECE 59500: Data Analysis, Design of Experiments and Machine Learning`

可借鉴点：

1. 说明 DOE、数据分析和 ML 课程可以自然耦合。

局限：

1. 不是实验中心课程。
2. 不提供 MSE 实验结构。

来源：

1. [Purdue ECE 59500](https://engineering.purdue.edu/ECE/Academics/Undergraduates/UGO/CourseInfo/courseInfo?courseid=722&show=true&type=grad)

### 3.3 MSE 实验与表征类课程

#### Carnegie Mellon

课程：`27-305 Introduction to Materials Characterization`

可借鉴点：

1. 说明表征课在 MSE 里很稳定。
2. hands-on 与 instrumentation 组织方式值得借鉴。

局限：

1. 主要是表征方法课。
2. 不进入 DOE 与 SDL。

来源：

1. [CMU 27-305](https://www.materials.cmu.edu/education/courses/undergraduate/27-305-intro-to-materials-characterization.html)

#### Purdue

课程：`MSE 33500 Materials Characterization Laboratory`

可借鉴点：

1. 对传统 MSE 实验教学结构很有代表性。
2. 可以借鉴其实验条目组织思路。

局限：

1. 仍然是“表征实验课”，不是实验方法论与 SDL 课程。

来源：

1. [Purdue MSE 33500](https://engineering.purdue.edu/MSE/academics/courses/MSE33500)

#### Georgia Tech

课程：`MSE 8803 Data Driven Experimental Design`

可借鉴点：

1. 很接近“实验 + 数据 + 设计”的交叉形态。
2. 强调误差、结构测量和真实研究 proposal。

局限：

1. 仍然不是完整的 experiment-centered SDL 课程。

来源：

1. [Georgia Tech MSE 8803 syllabus](https://syllabus.gatech.edu/sites/default/files/2026-04/MSE%208803%20Data%20Driven%20Experimental%20Design.pdf)

### 3.4 Autonomous Lab 生态与训练项目

#### CMU AI Science Foundry

定位：研究基础设施 / 平台

可借鉴点：

1. 非常适合做“真实系统案例”参考。
2. 强调 agent 参与实验设计、执行管理和数据分析。

局限：

1. 不是课程。

来源：

1. [CMU AI Science Foundry](https://ai-science-foundry.cmu.edu/about-ai-science-foundry)

#### Argonne ALCF

项目：`Autonomous Laboratory Short Workshop`

可借鉴点：

1. 说明 laboratory autonomy 已形成独立 training 主题。

局限：

1. 更偏 workshop 和研究生态。

来源：

1. [ALCF workshop page](https://www.alcf.anl.gov/events/autonomous-laboratory-short-workshop)

#### Argonne CNM Polybot

定位：真实自治实验平台

可借鉴点：

1. 适合做平台级案例。
2. 强调 automation、data services、active learning library。

局限：

1. 不是教学课程。

来源：

1. [Polybot](https://cnm.anl.gov/pages/polybot)

## 4. 我们的差异化空间

横向比较后，可以确认外部课程的空白主要在：

1. `实验中心视角`
2. `MSE 实验目录学`
3. `试错法 -> DOE -> SDL` 的连续主线
4. `实验硬件 + 数据 + 决策` 的完整闭环教学
5. `课程平台 + Case Studio + Design Studio` 的数字课程实现

## 5. 应借鉴的点

1. 向 UChicago 学整体 SDL 课程框架。
2. 向 Cornell / Duke 学 DOE 与 uncertainty 的严谨性。
3. 向 Purdue / CMU 学传统 MSE 实验教学组织。
4. 向 MIT 学前沿 AI 叙事更新。
5. 向 AI Science Foundry / Polybot 学真实自治系统案例呈现。

## 6. 不应误入的方向

1. 不要把课程做成泛泛的 `materials informatics` 课。
2. 不要把课程做成纯 `BO / ML methods` 课。
3. 不要把课程做成传统 `characterization survey` 课。
4. 不要把课程做成一次性的讲座网页。

## 7. 对产品的直接要求

1. Foundations 必须强化实验史、实验图谱和方法比较。
2. Resources 必须包含课程自己的 MSE 实验目录学。
3. Case Studio 必须体现实验语义，而不是函数优化换皮。
4. A-Lab 页面必须承担“真实系统分析”角色。
