# SDL 网站链接审计记录

本文件记录已替换或需要特殊处理的链接。链接检查脚本位于 `scripts/check-links.mjs`。

| 链接/位置 | 问题 | 处理方式 | 备份/替代 |
| --- | --- | --- | --- |
| `/a-lab#validation` | A-Lab 页面不存在 `validation` 锚点。 | 已改为 `/a-lab#controversy`。 | `src/pages/ParadigmsPage.tsx` |
| `https://en.wikipedia.org/wiki/Self-driving_lab` | 404。 | 从知识图谱节点移除。 | 使用课程内定义或 Autonomous Laboratory 相关论文/机构来源。 |
| `https://zh.wikipedia.org/wiki/自主实验室` | 中文维基条目不稳定/死链。 | 从知识图谱节点移除。 | 使用课程内定义。 |
| `https://zh.wikipedia.org/wiki/高通量筛选` | 中文维基条目不稳定/死链。 | 移除中文链接，保留英文 `High-throughput_screening`。 | 英文维基或专业教材。 |
| `https://zh.wikipedia.org/wiki/实验室自动化` | 中文维基条目不稳定/死链。 | 移除中文链接，保留英文 `Laboratory_automation`。 | 英文维基或机构资料。 |
| ChemRxiv A-Lab 再分析页面 | 常见脚本环境返回 403。 | 网站可见入口改为 PRX Energy 正式 DOI 链接；事实登记保留 ChemRxiv DOI。 | `https://link.aps.org/doi/10.1103/PRXEnergy.3.011002`; `10.26434/chemrxiv-2024-5p9j4` |
| `https://api.deepseek.com/chat/completions` | API endpoint 返回 401，不应作为公开学习资源链接。 | 位于未渲染旧版 `src/sections`，不纳入正式链接扫描；已添加 archive 提醒。 | 使用官方文档页面而非 endpoint。 |
| RSC `articlelanding` 旧链接 | 旧版 `src/sections` 中出现 404。 | 旧版 sections 标记 archive，不作为正式站点内容复用。 | 若恢复使用，必须替换为 DOI 或 RSC 当前页面。 |
| Materials Project next-gen 页面 | 自动脚本可能返回 403，但浏览器可访问。 | 保留官方 community/docs 作为事实来源；403 作为 guarded link warning。 | `https://next-gen.materialsproject.org/community` |

## 检查规则

- 内部路由和锚点必须为 0 错误。
- 外链 404 必须为 0。
- 401/403/429 不直接判失败，但必须在本文件或页面附近提供 DOI、官方文档或机构备份链接。
- `src/sections` 是旧版未渲染内容，默认不进入正式链接扫描；若重新启用，必须先完成事实和链接审计。
