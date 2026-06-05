# 面向遥感地面定标的多通道光谱校准光源设计

版本：v1  
状态：CTO 基线规格  
日期：2026-06-04

## 1. 定位

本案例用于替代当前过于简化的 `RGB LED` 主案例，作为讲座与后续课程中的**真实感主案例**。

它的目标不是“做一个好看的光谱玩具”，而是构建一个具有明确工程语义、可快速仿真、可做单目标/多目标优化、可用于 SDL 闭环演示的**虚拟实验台（oracle）**。

应用背景明确为：

- 遥感地面定标
- 多通道可调光谱校准源设计
- 传感器 band-response 匹配
- 成本 / 功耗 / 寿命 / 通道数约束下的光谱合成

## 2. 核心问题定义

设计一套由多种 LED 通道构成的光谱校准光源，使其在 `400-1000 nm` 波段内尽可能逼近目标光谱，或在目标传感器的各个波段响应上尽可能逼近目标响应。

### 2.1 输入

- LED 类型选择
- 各 LED 是否启用
- 各 LED 驱动电流或归一化功率

### 2.2 输出

- 合成光谱 `SPD_mix(lambda)`
- 与目标光谱的匹配误差
- 目标传感器 band-response 偏差
- 总成本
- 总功耗
- 最差寿命
- 启用通道数

### 2.3 优化目标

至少支持以下多目标优化：

1. 最小化光谱匹配误差
2. 最小化 band-response 偏差
3. 最小化总成本
4. 最小化总功耗
5. 最小化启用通道数
6. 最大化最差寿命

在 UI 中不必同时暴露全部目标，但 oracle 与目标函数设计必须为这些目标预留位置。

## 3. 为什么选这个案例

相对于 `RGB LED`，这个案例有更强的真实性与课程价值：

1. 输出不是三刺激值，而是完整光谱或多波段响应。
2. 输入包含离散变量与连续变量，是典型的 mixed-variable 优化问题。
3. 目标天然是多目标，不需要人为硬凑。
4. 有明确应用场景：遥感定标、成像系统校准、可调照明源设计。
5. 光谱混合可通过快速前向模型完成，适合课堂里的 SDL 闭环演示。

## 4. 范围界定

## 4.1 V1 波段范围

V1 固定为：

- `400-1000 nm`

原因：

1. 可见到近红外短波段的 LED 可获得性较高。
2. 公开产品与谱线数据相对容易收集。
3. 对 `VNIR` 遥感定标演示已经足够。
4. 可在架构上预留扩展到 `1100 nm`，但不作为 V1 的交付前提。

## 4.2 V1 不做的事

V1 明确不做：

1. `1000-2500 nm` 全波段覆盖
2. 荧光粉物理高保真建模
3. 完整电热耦合与老化模型
4. 工程级标定器设计精度承诺
5. 实际硬件控制

## 4.3 V2 预留

V2 可扩展：

1. `400-1100 nm`
2. phosphor-converted channels（荧光粉转换通道）
3. 目标传感器自定义 band set
4. 功率上限、热负载、驱动器通道数等硬约束

## 5. 物理定义

## 5.1 目标模式

V1 支持两种目标模式：

### A. 光谱匹配模式

目标是匹配目标光谱 `SPD_target(lambda)`。

适合：

- 目标校准光谱复现
- 标准光源近似
- 教学中展示“完整光谱匹配”

### B. Band-response 匹配模式

目标是匹配目标传感器在各个 band 上的响应。

即：

- 给定传感器响应函数 `R_i(lambda)`
- 计算每个 band 的积分响应
- 优化使 `Response_mix_i` 接近 `Response_target_i`

适合：

- 遥感地面定标
- 多光谱相机校准
- 说明“工程上不一定要求逐 nm 完美拟合”

## 5.2 LED 混合前向模型

V1 采用简化但可信的线性叠加模型：

`SPD_mix(lambda) = sum_i w_i * SPD_i(lambda)`

其中：

- `SPD_i(lambda)`：第 `i` 个 LED 通道的归一化光谱功率分布
- `w_i`：该通道的驱动权重或归一化辐射输出

V1 允许采用以下简化假设：

1. 通道间无光学串扰
2. 各通道线性叠加
3. 谱形不随驱动电流显著漂移，或只做弱漂移修正
4. 温度效应忽略或折算到寿命/功耗项中

这些假设对课程演示是可接受的，但 UI 与文档中必须明确：

- 这是 **literature-grounded emulator**
- 不是工程级高保真电光热联合仿真器

## 6. 数据结构

每个 LED 通道至少包含以下字段：

```ts
type LedChannel = {
  id: string
  name: string
  family: string
  peak_nm: number
  fwhm_nm: number
  wavelength_nm: number[]
  spd: number[]
  price: number
  lifetime_hours: number
  power_max_w: number
  current_max_a?: number
  notes?: string
}
```

V1 可以先内置一个课程级 LED 库，规模建议：

- `12-24` 个通道

覆盖建议：

- 蓝紫：`400-470 nm`
- 绿黄：`500-590 nm`
- 红：`620-700 nm`
- 近红外：`730-940 nm`
- 可选扩展：`970-1050 nm`

## 7. 目标函数设计

## 7.1 光谱误差

至少实现以下指标中的 `2-3` 个：

1. `RMSE`
2. `L1 distance`
3. `SAM`（spectral angle mapper）
4. `weighted band error`

建议：

- 默认主指标：`SAM + RMSE`
- 讲座中重点解释：`SAM`

## 7.2 Band-response 误差

对每个 band：

`y_i = integral SPD(lambda) * R_i(lambda) d_lambda`

再计算：

- `band RMSE`
- `max band deviation`
- `weighted band deviation`

## 7.3 成本

`cost_total = sum_i enabled_i * price_i`

V1 可先按单颗价格估算，不做驱动器/热管理/BOM 全成本。

## 7.4 功耗

`power_total = sum_i power_i`

V1 可用归一化功率或简化线性功率模型。

## 7.5 寿命

使用保守定义：

`lifetime_system = min_i(lifetime_i of enabled channels)`

原因：

1. 易理解
2. 工程上有保守意义
3. 适合讲座

## 7.6 通道数

`channel_count = number of enabled channels`

该项用于体现系统复杂度和成本约束。

## 8. 优化变量与问题类型

这是一个典型的 mixed-variable 优化问题。

### 离散变量

- LED 类型是否启用

### 连续变量

- 各通道驱动权重 / 归一化功率

### 派生变量

- 总功耗
- 通道数
- 最差寿命

V1 不强制要求使用严格 mixed-integer BO。

允许采用分层求解：

1. 先做通道选择或稀疏初始化
2. 再连续调权重
3. 再把结果包装到 SDL 演示工作流中

原则是：

- 优先保证结果合理、可解释、可快速演示
- 不为算法纯洁性牺牲讲座稳定性

## 9. SDL 演示中的角色

该案例在网站中应明确定位为：

- **真实感主案例**

与现有 `SDL Demo / Benchmark Lab` 的分工为：

- `Benchmark Lab`：方法机制案例
- `Remote Sensing LED Case`：真实应用案例

与现有 `RGB LED` 的关系为：

- `RGB LED` 降级为附属教学 benchmark
- 本案例升级为光谱级主案例

## 10. 前端表现形式

建议独立为 `Case Studio` 内的新主 tab，或独立路由。

推荐命名：

- `遥感定标光源`
- `多通道光谱校准源`
- `Remote Sensing Calibration Source`

## 10.1 页面结构

### A. 左侧：问题设置

- 目标模式：光谱匹配 / band-response 匹配
- 目标数据集选择
- 波段范围
- 优化目标选择
- 约束开关

### B. 中央：主可视化

1. 目标光谱 vs 当前合成光谱
2. 残差曲线
3. 各通道 LED 光谱叠加

### C. 右侧：工程指标

- 当前误差
- 总成本
- 总功耗
- 最差寿命
- 通道数
- 推荐下一点解释

### D. 下方：历史与 Pareto

- 历史最佳误差曲线
- 多目标 Pareto front
- 当前方案列表

## 10.2 必须支持的讲者操作

1. `Run 1`
2. `Run 5`
3. `Auto`
4. `Reset`
5. `Fixed seed`

## 10.3 必须能讲清的解释

1. 当前目标是什么
2. 当前方案为什么好或不好
3. 下一推荐方案是更偏 exploration 还是 exploitation
4. 多目标下当前推荐在牺牲什么、改善什么

## 11. 目标数据

V1 建议内置 `3-5` 个目标：

1. 平滑宽带目标
2. 红边明显的植被样式目标
3. 具有近红外高响应的材料目标
4. 人工构造的多峰目标

这些目标可以来自：

- 简化标准光谱
- 遥感 band-response 模拟目标
- 文献启发的材料反射样式

V1 不要求一开始就接入大型外部光谱库。

## 12. 实现优先级

## 12.1 V1 必做

1. `400-1000 nm` 光谱轴
2. 内置 LED 通道库
3. 光谱匹配模式
4. band-response 匹配模式
5. 成本 / 功耗 / 寿命 / 通道数计算
6. 单目标与多目标演示
7. 讲者控制

## 12.2 V1 可选

1. 稀疏通道惩罚项
2. 简化非线性功率模型
3. 用户自定义目标光谱上传

## 12.3 V2 方向

1. `400-1100 nm`
2. phosphor-converted channels
3. 真实传感器 band set
4. 更严格的 mixed-variable 优化
5. 更真实的寿命和热管理代理项

## 13. 风险与约束

## 13.1 数据风险

公开 LED 光谱数据库未必完整统一，因此 V1 的 LED 库可以是：

- 文献启发
- 厂商数据整理
- 必要时课程级归一化整理结果

但必须在文档和 UI 中明确：

- 该库用于教学与方案演示
- 不是采购级器件数据库

## 13.2 物理保真度风险

V1 的线性叠加模型是课程级近似。

不能宣称：

- 工程落地时无需再标定
- 可以直接替代真实硬件开发

## 13.3 目标定义风险

如果采用“物体反射率”作为目标，必须明确目标是：

- 反射率曲线本身
- 或参考照明下的反射输出

对遥感定标，更推荐：

- 目标传感器 band-response 匹配

## 14. 推荐资料

以下资料用于支撑本案例方向与后续实现：

1. NIST tunable LED source  
   [Development of a Tunable LED-Based Colorimetric Source](https://www.nist.gov/publications/development-tunable-led-based-colorimetric-source-0)

2. NIST spectrally tunable radiometric applications  
   [Spectrally Tunable Sources for Advanced Radiometric Applications](https://pmc.ncbi.nlm.nih.gov/articles/PMC4657789/)

3. 商业可调 LED 标准源  
   [Labsphere Spectra-FT](https://www.labsphere.com/product/spectra-ft-fine-tunable-test-and-calibration-reference-sources/)

4. SWIR tunable light source  
   [Gamma Scientific RS-7-1-SWIR](https://gamma-sci.com/wp-content/uploads/2021/11/RS-7-1-SWIR_SpectralLED_Infrared-Tunable-Light-Source_rev.11.02.21.pdf?srsltid=AfmBOopwEQQKHKwdh0CtvAGegbmpM-RrtsLlF_alGkrHWFN64vMq4YHl)

## 15. 给 Claude 的实现要求摘要

后续交给 Claude 实现时，必须坚持：

1. 先做 `400-1000 nm`，不要擅自扩波段。
2. 先做纯 LED 通道，不要一开始上荧光粉模型。
3. 保持静态前端可运行，不依赖后端服务。
4. 先保证 oracle 稳定、讲者可演示，再谈算法复杂度升级。
5. 文案必须清楚区分：
   - 真实工程问题
   - 课程级 emulator
   - 尚未实现项

---

本文件是本案例的 CTO 基线规格。  
后续如需扩展到 phosphor-converted channels，应另写 `v2` 规格，不应在 `v1` 实现中边做边改题。
