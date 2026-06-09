from __future__ import annotations

import html
import shutil
import zipfile
from pathlib import Path


PPT_PATHS = [
    Path(r"D:\WPS Cloud Files\579814678\WPS云盘\年度任务\2026\800讲座\SDL-Course-Premium.pptx"),
    Path(r"D:\WPS Cloud Files\579814678\WPS云盘\年度任务\2026\800讲座\SDL-Course-Premium-reviewed.pptx"),
    Path(r"D:\A-Lab\SDL-Course-Premium-reviewed.pptx"),
]

REPLACEMENTS: dict[int, list[tuple[str, str]]] = {
    36: [
        ("GNoME扩散模型", "GNoME图网络筛选"),
        (
            "生成候选晶体结构→GNN评估稳定性→DFT验证。38万通过DFT验证。",
            "graph networks扩展候选空间→DFT验证稳定性。约380K稳定候选；不是扩散模型。",
        ),
    ],
    40: [
        (
            "GNN+扩散模型预测稳定结构，381K经DFT验证，约20K被实验合作伙伴验证。",
            "graph networks扩展候选结构，DFT验证约381K稳定候选；实验可合成性仍需逐项证明。",
        ),
        ("引用量截至2025年初>3000次。", "代表了计算筛选规模跃迁。"),
        (
            "355次实验/17天/41种新化合物，71%成功率。首次全流程SDL无机合成。",
            "355次实验/17天；原始声称41/58，Nature修正记录36/57。",
        ),
        ("17天，71%成功率", "17天，36/57修正记录"),
        (
            "三篇论文同期于2023年11月–12月发表于Nature，引发广泛关注。DOI: s41586-023-06734-w / s41586-023-06734-w / s41586-023-06792-0",
            "三篇论文同期于2023年11月–12月发表于Nature，引发广泛关注。DOI: s41586-023-06735-9 / s41586-023-06734-w / s41586-023-06792-0",
        ),
    ],
    41: [
        (
            "扩散模型生成候选结构 → GNN评估热力学稳定性 → DFT精确计算验证",
            "graph networks扩展结构候选 → DFT验证热力学稳定性 → 发布稳定候选数据",
        ),
        ("381K候选，仅~20K实验验证。", "381K稳定候选仍需要后续实验合成与功能验证。"),
        ("GNoME数据集开放，材料领域首个AI自博弈代理", "GNoME数据集开放，候选材料推动后续筛选与实验验证"),
    ],
    47: [
        ("71%", "63%"),
        ("声称目标成功率", "Nature修正记录"),
        ("41/58目标材料（原始口径）", "36/57目标材料（勘误后）"),
        (
            "来源：Szymanski NJ, Rendy B, Fei Y et al. (2023) Nature 624:86-91. DOI:10.1038/s41586-023-06734-w。注：此页保留论文原始口径，需与2024再分析和2026 Author Correction区分。",
            "来源：Szymanski NJ, Rendy B, Fei Y et al. (2023) Nature 624:86-91. DOI:10.1038/s41586-023-06734-w。注：原始声称为41/58；Nature当前修正记录为36/57，需与2024再分析争议区分。",
        ),
    ],
    49: [
        ("目标成功率71%", "目标级口径：原始声称与修正记录"),
        ("41 / 58 目标材料", "41/58 原始声称；36/57 修正记录"),
        (
            "在58个目标材料中，A-Lab原论文声称成功合成41个。",
            "原论文声称在58个目标中成功41个；Nature当前修正记录为57个目标中成功36个。",
        ),
        (
            "这不是“新材料数”的唯一口径，也不等于每个样品都通过了独立专家复核。",
            "课堂表述必须先说明口径，再讨论是否构成新材料发现。",
        ),
        ("这意味着：找到每个成功材料，平均需要尝试约8–9个配方", "这意味着：目标级成功与单次配方成功不是同一指标"),
        ("不是每步都成功，但比随机搜索好得多", "它反映的是执行层效率，不直接证明新颖性"),
        ("随机搜索成功率估计", "随机基线需按任务定义"),
        ("<10%)。", ")。"),
        ("两个数字都是真的，代表两个不同的问题：", "多个数字都有来源，但代表不同问题："),
    ],
    50: [
        (
            '参考：Leeman J, Liu Y, Stiles J, Bhatt M et al. (2024) "Challenges in High-throughput Inorganic Materials Synthesis." ChemRxiv DOI:10.26434/chemrxiv-2024-5p9j4. / C&EN (2026年1月报道A-Lab ',
            "参考：Leeman et al. (2024) PRX Energy / ChemRxiv DOI:10.26434/chemrxiv-2024-5p9j4；正式版本 DOI:10.1103/PRXEnergy.3.011002。C&EN（2026年1月）报道 Nature Author Correction。",
        ),
        ("Nature论文勘误", ""),
        (").", ""),
        ("C&EN报道，2026年1月", "Nature Author Correction，2026年1月"),
    ],
    51: [
        ("BO在引导合成空间搜索上优于随机采样", "BO可作为结构化的序贯搜索策略"),
        ("(37%成功率 vs 随机~10%估计)。", "（37%配方级成功率；随机基线需按任务另行定义）。"),
        (
            "从Materials Project数百万条目中提取合理候选，比人工文献检索快数百倍。",
            "从 Materials Project 等数据库中提取候选，比纯人工文献检索更系统。",
        ),
    ],
    67: [
        ("注：预测为作者基于文献趋势的主观判断，存在高度不确定性。", "注：讲者判断/情景推演，非定量预测；存在高度不确定性。"),
    ],
    83: [
        ("GNoME扩散模型", "GNoME图网络筛选"),
        ("<a:t>扩散模型</a:t>", "<a:t>graph networks</a:t>"),
        ("(Diffusion Model)", "(Graph Networks + DFT)"),
        ("迭代去噪生成晶体结构", "扩展候选晶体空间"),
        ("生成2.2M候选结构，381K通过DFT验证", "筛选约2.2M候选结构，约381K稳定候选通过DFT验证"),
    ],
    85: [
        ("路线图为作者基于当前趋势的主观预测，存在高度不确定性。", "路线图为讲者判断/情景推演，非定量预测；存在高度不确定性。"),
    ],
    99: [
        ("柱状图为示意性趋势判断，非定量调研数据。", "柱状图为讲者判断/情景推演，非定量调研数据。"),
    ],
    100: [
        ("数字为近似估计，不同检索策略结果差异显著。", "数字为近似估计，不同检索策略结果差异显著；趋势解读为讲者判断，非定量预测。"),
    ],
}


def replace_text(xml: str, old: str, new: str) -> tuple[str, int]:
    count = 0
    variants = {
        (old, new),
        (html.escape(old, quote=False), html.escape(new, quote=False)),
    }
    for source, target in variants:
        hits = xml.count(source)
        if hits:
            xml = xml.replace(source, target)
            count += hits
    return xml, count


def edit_pptx(path: Path) -> int:
    tmp = path.with_suffix(".tmp.pptx")
    changed_slides = 0
    replacement_hits = 0

    with zipfile.ZipFile(path, "r") as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename.startswith("ppt/slides/slide") and item.filename.endswith(".xml"):
                try:
                    slide_no = int(item.filename.removeprefix("ppt/slides/slide").removesuffix(".xml"))
                except ValueError:
                    slide_no = -1
                if slide_no in REPLACEMENTS:
                    xml = data.decode("utf-8")
                    before = xml
                    for old, new in REPLACEMENTS[slide_no]:
                        xml, hits = replace_text(xml, old, new)
                        replacement_hits += hits
                    if xml != before:
                        changed_slides += 1
                    data = xml.encode("utf-8")
            zout.writestr(item, data)

    shutil.move(tmp, path)
    print(f"{path}: changed slides={changed_slides}, replacement hits={replacement_hits}")
    return replacement_hits


def main() -> None:
    existing = [path for path in PPT_PATHS if path.exists()]
    if not existing:
        raise FileNotFoundError("No PPTX files found.")
    for path in existing:
        edit_pptx(path)


if __name__ == "__main__":
    main()
