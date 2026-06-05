import fs from "node:fs/promises";
import path from "node:path";
import * as artifact from "file:///C:/Users/chf_c/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const { Presentation, PresentationFile } = artifact;

const WORKSPACE = "D:/A-Lab/sdl-lecture/outputs/manual-20260604-lectureppt/presentations/ai-era-mse-lecture";
const ASSET_DIR = path.join(WORKSPACE, "assets");
const OUT_DIR = path.join(WORKSPACE, "output");
const FINAL_PPTX = path.join(OUT_DIR, "AI时代的材料科学实验_从DOE到Self-Driving-Labs_讲座设计_v2.pptx");
const SUMMARY_JSON = path.join(OUT_DIR, "deck-summary.json");

const W = 1280;
const H = 720;

const C = {
  bg: "#071426",
  panel: "#0E213A",
  panel2: "#0B1B31",
  line: "#1B3D68",
  cyan: "#13D6FF",
  blue: "#3B82F6",
  blue2: "#5B8CFF",
  yellow: "#FBBF24",
  red: "#FB7185",
  green: "#34D399",
  white: "#F5F7FA",
  text: "#D7DFEA",
  muted: "#93A4B8",
  soft: "#6E829D",
};

const FONT = { sans: "Aptos", mono: "Consolas" };

const SRC = {
  kuhn: "Kuhn, T. S. The Structure of Scientific Revolutions. University of Chicago Press, 1962/2012.",
  fourthParadigm: "Hey, T., Tansley, S., & Tolle, K. (eds.) The Fourth Paradigm: Data-Intensive Scientific Discovery. Microsoft Research, 2009. https://www.microsoft.com/en-us/research/publication/fourth-paradigm-data-intensive-scientific-discovery/",
  chemrevSDL: "Tom, G. et al. Self-Driving Laboratories for Chemistry and Materials Science. Chemical Reviews 124(16), 2024. https://pubs.acs.org/doi/10.1021/acs.chemrev.4c00055",
  natureSynthesisSDL: "Stach, E. A. et al. The rise of self-driving labs in chemical and materials sciences. Nature Synthesis 2, 2023. https://www.nature.com/articles/s44160-022-00231-0",
  futureSDL: "Häse, F. et al. The future of self-driving laboratories: from human in the loop interactive AI to gamification. Digital Discovery 3, 2024. https://pubs.rsc.org/en/content/articlehtml/2024/dd/d4dd00040d",
  frugalTwin: "Aguilar-Granda, A. et al. Review of low-cost self-driving laboratories in chemistry and materials science: the 'frugal twin' concept. Digital Discovery 3, 2024. https://pubs.rsc.org/en/content/articlehtml/2024/dd/d3dd00223c",
  communitySurvey: "Autonomous laboratories for accelerated materials discovery: a community survey and practical insights. Digital Discovery, 2024. https://pubs.rsc.org/en/content/articlelanding/2024/dd/d4dd00059e",
  hacking: "Hacking, I. Representing and Intervening. Cambridge University Press, 1983.",
  fisher: "Fisher, R. A. The Design of Experiments. Oliver & Boyd, 1935.",
  box: "Box, G. E. P., Hunter, W. G., & Hunter, J. S. Statistics for Experimenters. Wiley, 1978/2005.",
  montgomery: "Montgomery, D. C. Design and Analysis of Experiments. Wiley, 2017.",
  boReview: "Desimpel, R. et al. Bayesian optimization for chemical reactions. Chemical Society Reviews 55, 2026. https://pubs.rsc.org/en/content/articlehtml/2026/cs/d5cs00962f",
  shahriari: "Shahriari, B. et al. Taking the Human Out of the Loop: A Review of Bayesian Optimization. Proceedings of the IEEE 104(1), 2016.",
  nistSchema: "NIST Material Schema: Process. https://pages.nist.gov/material-schema/Process/",
  emmc: "EMMC CHADA / CHAMEO. https://emmc.eu/moda-chada/chada/",
  alabNature: "Szymanski, N. J. et al. An autonomous laboratory for the accelerated synthesis of inorganic materials. Nature 624, 2023. https://www.nature.com/articles/s41586-023-06734-w",
  alabNews: "Nature News: Robot chemist sparks row with claim it created new materials, 2023. https://www.nature.com/articles/d41586-023-03956-w",
  alabChemWorld: "Chemistry World: New analysis raises doubts over autonomous lab's materials 'discoveries', 2024. https://www.chemistryworld.com/news/new-analysis-raises-doubts-over-autonomous-labs-materials-discoveries/4018791.article",
  alabCEN: "C&EN: 'Nature' robot chemist paper corrected, but some questions remain unanswered, 2026. https://cen.acs.org/research-integrity/Nature-robot-chemist-paper-corrected/104/web/2026/01",
  berkeleyAlab: "Berkeley Lab News: Meet the Autonomous Lab of the Future, 2023. https://newscenter.lbl.gov/2023/04/17/meet-the-autonomous-lab-of-the-future/",
  nistAFL: "NIST Autonomous Formulation Lab. https://www.nist.gov/node/1895811",
  selfDrivingLabDemo: "Baird, S. G. self-driving-lab-demo. GitHub repository. https://github.com/sparks-baird/self-driving-lab-demo",
  courseSite: "SDL 讲座数字讲义站（当前项目线上版）: https://sdl-lecture.vercel.app",
};

function note(script, annotations = [], sources = [], pace = "", figureSuggestions = []) {
  const noteBlocks = [
    `讲解词：\n${script}`,
    `注解：\n${annotations.length ? annotations.map((x) => `- ${x}`).join("\n") : "- 无"}`,
  ];
  if (pace) {
    noteBlocks.push(`节奏建议：\n${pace}`);
  }
  if (figureSuggestions.length) {
    noteBlocks.push(`建议图表：\n${figureSuggestions.map((x) => `- ${x}`).join("\n")}`);
  }
  if (sources.length) {
    noteBlocks.push(`参考来源：\n${sources.map((x) => `- ${x}`).join("\n")}`);
  }
  return noteBlocks.join("\n\n");
}

function slideBase(presentation) {
  const slide = presentation.slides.add();
  const bg = slide.shapes.add({
    geometry: "rect",
    position: { left: 0, top: 0, width: W, height: H },
    fill: { type: "solid", color: C.bg },
    line: { width: 0, fill: C.bg },
  });
  bg.sendToBack();
  return slide;
}

function shape(slide, position, options = {}) {
  return slide.shapes.add({
    geometry: options.geometry || "roundRect",
    position,
    fill: options.fill || { type: "solid", color: C.panel },
    line: options.line || { width: 1, fill: C.line },
  });
}

function text(slide, position, value, options = {}) {
  const s = slide.shapes.add({
    geometry: "rect",
    position,
    fill: { type: "solid", color: options.fillColor || C.bg },
    line: { width: 0, fill: options.fillColor || C.bg },
  });
  s.text.style = {
    typeface: options.mono ? FONT.mono : FONT.sans,
    fontSize: options.fontSize || 20,
    color: options.color || C.text,
    bold: options.bold || false,
    italic: options.italic || false,
    alignment: options.align || "left",
    verticalAlignment: options.vAlign || "top",
  };
  s.text = value;
  return s;
}

function header(slide, section, page, total) {
  text(slide, { left: 56, top: 28, width: 400, height: 18 }, section, {
    fontSize: 10,
    mono: true,
    color: C.cyan,
  });
  text(slide, { left: 1100, top: 28, width: 120, height: 18 }, `${String(page).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, {
    fontSize: 10,
    mono: true,
    color: C.soft,
    align: "right",
  });
  slide.shapes.add({
    geometry: "rect",
    position: { left: 56, top: 52, width: 1168, height: 1 },
    fill: { type: "solid", color: C.line },
    line: { width: 0, fill: C.line },
  });
}

function titleBlock(slide, titleValue, subtitleValue = "") {
  text(slide, { left: 88, top: 86, width: 1040, height: 60 }, titleValue, {
    fontSize: 30,
    color: C.white,
    bold: true,
  });
  if (subtitleValue) {
    text(slide, { left: 88, top: 146, width: 1040, height: 50 }, subtitleValue, {
      fontSize: 14,
      color: C.muted,
    });
  }
}

function bullets(items) {
  return items.map((x) => `• ${x}`).join("\n");
}

function addNotes(slide, script, annotations, sources = [], pace = "", figureSuggestions = []) {
  slide.speakerNotes.setText(note(script, annotations, sources, pace, figureSuggestions));
}

function callout(slide, position, titleValue, bodyValue, accent = C.cyan) {
  shape(slide, position, {
    fill: { type: "solid", color: C.panel2 },
    line: { width: 1, fill: accent },
  });
  text(slide, { left: position.left + 16, top: position.top + 14, width: position.width - 32, height: 18 }, titleValue, {
    fontSize: 11,
    color: accent,
    mono: true,
  });
  text(slide, { left: position.left + 16, top: position.top + 40, width: position.width - 32, height: position.height - 48 }, bodyValue, {
    fontSize: 14,
    color: C.text,
  });
}

function bulletSlide(presentation, meta) {
  const slide = slideBase(presentation);
  header(slide, meta.section, meta.page, meta.total);
  titleBlock(slide, meta.title, meta.subtitle);
  shape(slide, { left: 88, top: 224, width: 720, height: 370 }, {
    fill: { type: "solid", color: C.panel2 },
    line: { width: 1, fill: C.line },
  });
  text(slide, { left: 116, top: 252, width: 650, height: 300 }, bullets(meta.bullets), {
    fontSize: 21,
    color: C.white,
  });
  callout(slide, { left: 850, top: 224, width: 320, height: 190 }, meta.rightTitle, meta.rightBody, meta.accent || C.cyan);
  if (meta.bottomTitle) {
    callout(slide, { left: 850, top: 438, width: 320, height: 156 }, meta.bottomTitle, meta.bottomBody, meta.bottomAccent || C.blue);
  }
  addNotes(slide, meta.script, meta.annotations, meta.sources, meta.pace, meta.figureSuggestions);
}

function dividerSlide(presentation, meta) {
  const slide = slideBase(presentation);
  header(slide, meta.section, meta.page, meta.total);
  text(slide, { left: 110, top: 176, width: 150, height: 110 }, meta.index, {
    fontSize: 72,
    mono: true,
    color: meta.accent || C.cyan,
    bold: true,
  });
  text(slide, { left: 270, top: 190, width: 820, height: 70 }, meta.title, {
    fontSize: 34,
    color: C.white,
    bold: true,
  });
  text(slide, { left: 272, top: 276, width: 780, height: 90 }, meta.subtitle, {
    fontSize: 20,
    color: C.muted,
  });
  slide.shapes.add({
    geometry: "rect",
    position: { left: 110, top: 412, width: 420, height: 8 },
    fill: { type: "solid", color: meta.accent || C.cyan },
    line: { width: 0, fill: meta.accent || C.cyan },
  });
  text(slide, { left: 110, top: 466, width: 900, height: 80 }, meta.caption, {
    fontSize: 18,
    color: C.text,
  });
  addNotes(slide, meta.script, meta.annotations, meta.sources, meta.pace, meta.figureSuggestions);
}

function cardsSlide(presentation, meta) {
  const slide = slideBase(presentation);
  header(slide, meta.section, meta.page, meta.total);
  titleBlock(slide, meta.title, meta.subtitle);
  const cols = meta.cols || 2;
  const gap = 18;
  const left = 88;
  const top = 224;
  const width = cols === 4 ? 268 : cols === 3 ? 360 : 540;
  const rows = Math.ceil(meta.cards.length / cols);
  const height = rows === 1 ? 170 : rows === 2 ? 154 : 128;
  meta.cards.forEach((card, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const x = left + c * (width + gap);
    const y = top + r * (height + gap);
    shape(slide, { left: x, top: y, width, height }, {
      fill: { type: "solid", color: card.fill || C.panel2 },
      line: { width: 1, fill: card.line || C.line },
    });
    text(slide, { left: x + 16, top: y + 14, width: width - 32, height: 20 }, card.title, {
      fontSize: 14,
      color: card.accent || C.cyan,
      bold: true,
    });
    text(slide, { left: x + 16, top: y + 40, width: width - 32, height: height - 50 }, card.body, {
      fontSize: card.fontSize || 15,
      color: C.text,
    });
  });
  addNotes(slide, meta.script, meta.annotations, meta.sources, meta.pace, meta.figureSuggestions);
}

function compareSlide(presentation, meta) {
  const slide = slideBase(presentation);
  header(slide, meta.section, meta.page, meta.total);
  titleBlock(slide, meta.title, meta.subtitle);
  const tableLeft = 88;
  const tableTop = 228;
  const widths = [220, 260, 260, 260];
  const rowH = 50;
  const headers = ["维度", ...meta.columns];
  let x = tableLeft;
  headers.forEach((h, i) => {
    shape(slide, { left: x, top: tableTop, width: widths[i], height: 46 }, {
      fill: { type: "solid", color: i === 0 ? C.panel : C.panel2 },
      line: { width: 1, fill: C.line },
    });
    text(slide, { left: x + 12, top: tableTop + 13, width: widths[i] - 24, height: 18 }, h, {
      fontSize: 14,
      color: i === 0 ? C.muted : C.white,
      bold: true,
      align: i === 0 ? "left" : "center",
    });
    x += widths[i];
  });
  meta.rows.forEach((row, r) => {
    let cx = tableLeft;
    row.forEach((cell, i) => {
      shape(slide, { left: cx, top: tableTop + 46 + r * rowH, width: widths[i], height: rowH }, {
        fill: { type: "solid", color: i === 0 ? C.panel2 : C.bg },
        line: { width: 1, fill: C.line },
      });
      text(slide, { left: cx + 12, top: tableTop + 56 + r * rowH, width: widths[i] - 24, height: 30 }, cell, {
        fontSize: 13,
        color: i === 0 ? C.white : C.text,
      });
      cx += widths[i];
    });
  });
  addNotes(slide, meta.script, meta.annotations, meta.sources, meta.pace, meta.figureSuggestions);
}

function processSlide(presentation, meta) {
  const slide = slideBase(presentation);
  header(slide, meta.section, meta.page, meta.total);
  titleBlock(slide, meta.title, meta.subtitle);
  const count = meta.steps.length;
  const gap = 16;
  const width = Math.floor((1100 - gap * (count - 1)) / count);
  meta.steps.forEach((step, i) => {
    const x = 90 + i * (width + gap);
    shape(slide, { left: x, top: 270, width, height: 180 }, {
      fill: { type: "solid", color: step.fill || C.panel2 },
      line: { width: 1, fill: step.line || C.line },
    });
    text(slide, { left: x + 16, top: 286, width: width - 32, height: 18 }, step.kicker, {
      fontSize: 10,
      mono: true,
      color: step.accent || C.cyan,
    });
    text(slide, { left: x + 16, top: 312, width: width - 32, height: 28 }, step.title, {
      fontSize: 18,
      color: C.white,
      bold: true,
    });
    text(slide, { left: x + 16, top: 352, width: width - 32, height: 86 }, step.body, {
      fontSize: 14,
      color: C.text,
    });
    if (i < count - 1) {
      slide.shapes.add({
        geometry: "rightArrow",
        position: { left: x + width + 4, top: 340, width: 24, height: 28 },
        fill: { type: "solid", color: C.blue },
        line: { width: 0, fill: C.blue },
      });
    }
  });
  addNotes(slide, meta.script, meta.annotations, meta.sources, meta.pace, meta.figureSuggestions);
}

function imageSlide(presentation, meta) {
  const slide = slideBase(presentation);
  header(slide, meta.section, meta.page, meta.total);
  titleBlock(slide, meta.title, meta.subtitle);
  const imagePath = `file:///${path.join(ASSET_DIR, meta.image).replace(/\\/g, "/")}`;
  const img = slide.images.add({
    path: imagePath,
    alt: meta.title,
    position: { left: 88, top: 224, width: 650, height: 370 },
    fit: meta.fit || "contain",
  });
  img.frame = { left: 88, top: 224, width: 650, height: 370 };
  callout(slide, { left: 780, top: 224, width: 390, height: 176 }, meta.rightTitle, meta.rightBody, meta.accent || C.cyan);
  callout(slide, { left: 780, top: 422, width: 390, height: 172 }, meta.bottomTitle, meta.bottomBody, meta.bottomAccent || C.blue);
  addNotes(slide, meta.script, meta.annotations, meta.sources, meta.pace, meta.figureSuggestions);
}

function quoteSlide(presentation, meta) {
  const slide = slideBase(presentation);
  header(slide, meta.section, meta.page, meta.total);
  text(slide, { left: 104, top: 164, width: 1000, height: 180 }, `“${meta.quote}”`, {
    fontSize: 32,
    color: C.white,
    bold: true,
  });
  text(slide, { left: 108, top: 394, width: 420, height: 32 }, meta.source, {
    fontSize: 16,
    color: meta.accent || C.cyan,
  });
  text(slide, { left: 108, top: 470, width: 900, height: 100 }, meta.body, {
    fontSize: 20,
    color: C.text,
  });
  addNotes(slide, meta.script, meta.annotations, meta.sources, meta.pace, meta.figureSuggestions);
}

function buildSlides() {
  return [
    {
      type: "cover",
      script: "我想先把题目压实一点。今天不是来盘点几个 AI 工具，也不是单讲某个优化算法。我真正想讨论的是：当 AI 进入材料研究之后，实验本身正在怎样被重新组织，DOE 又在这个过程中处在什么位置。",
      annotations: [
        "Self-Driving Labs（自驱实验室，SDL）",
        "Design of Experiments（实验设计，DOE）",
      ],
      sources: [SRC.fourthParadigm, SRC.chemrevSDL, SRC.futureSDL],
    },
    {
      type: "agenda",
      script: "先把路径说清楚：今天不是从算法入手，而是从实验入手。先问实验在材料科学里是什么，再问传统方法论做了什么，最后才进入 SDL、真实案例和最小 live demo。",
      annotations: ["建议把这页讲成“路径声明”，而不是流程说明"],
      pace: "3 分钟左右；只建立路线图，不展开细节。",
      sources: [SRC.box, SRC.chemrevSDL, SRC.alabNature],
    },
    {
      type: "bullet",
      section: "讲座定位",
      title: "这不是一场“AI 工具清单”讲座",
      subtitle: "本讲的中心对象是实验，不是某个单独模型。",
      bullets: [
        "我们关心的是：实验如何生产知识，而不是只关心模型是否更强。",
        "SDL 的出现，是实验方法论、硬件自动化、数据化与算法决策的合流。",
        "因此，本讲既谈传统方法，也谈 AI 时代的新组织形式。",
      ],
      rightTitle: "讲座产出",
      rightBody: "听完后，学生应该能回答三个问题：\n1. 为什么实验仍是中心\n2. DOE 与 SDL 的关系是什么\n3. 哪些问题适合做 SDL",
      bottomTitle: "态度",
      bottomBody: "既拥抱 AI，也质疑 AI。\n既重视算法，也坚持人的判断与科学伦理。",
      page: 3,
      total: 36,
      script: "先压住一个常见误解：这不是 AI 工具清单，也不是某种优化算法导论。更根本的问题是，当 AI 进入实验科学之后，实验本身的组织方式、节奏和判断链条发生了什么变化。",
      annotations: [
        "Human-in-the-loop（人在回路中）",
        "Human-on-the-loop（人在回路上）",
      ],
      sources: [SRC.futureSDL, SRC.chemrevSDL],
      pace: "4 分钟左右；先立问题意识，再进入实验主线。",
    },
    {
      type: "bullet",
      section: "讲座路径",
      title: "从网站到 PPT：两条交付链路，内容主线一致",
      subtitle: "网站负责动态演示，PPT 负责稳定交付。",
      bullets: [
        "网站版适合展示课程结构、A-Lab 案例页和 Case Studio live demo。",
        "PPT 版适合在网络、浏览器或现场环境不稳定时完整讲完。",
        "两条链路服务同一主线：实验 → 方法论 → SDL → 真实案例 → 最小闭环演示。",
      ],
      rightTitle: "为什么两者并存",
      rightBody: "网站适合系统与交互，PPT 适合稳定叙事；两者服务同一学术主线。",
      page: 4,
      total: 36,
      script: "网站和 PPT 不是两套内容，而是同一讲座的两种介质。网站更适合看系统、案例和交互，PPT 更适合把问题、观点和证据链顺着讲清楚。",
      annotations: ["网站地址：https://sdl-lecture.vercel.app"],
      sources: [SRC.courseSite],
    },
    {
      type: "divider",
      section: "第一部分",
      index: "01",
      title: "为什么今天必须重新理解实验",
      subtitle: "如果不先理解实验的地位，就很容易把 SDL 误解成“算法升级版 DOE”。",
      caption: "如果不先把实验放回中心，后面关于 DOE 和 SDL 的判断都会漂。",
      accent: C.cyan,
      page: 5,
      total: 36,
      script: "先讲一个更根本的问题：实验在科学里到底处在什么位置。只有把这个问题讲清楚，后面关于 DOE、自动化和 SDL 的讨论才不会变成简单的工具崇拜。",
      annotations: ["本部分建议控制在 20–25 分钟"],
      sources: [SRC.kuhn, SRC.fourthParadigm],
      pace: "1 分钟转场；明确进入“实验是什么”这一部分。",
    },
    {
      type: "bullet",
      section: "实验的地位",
      title: "实验不是理论的附庸，也不是数据的采样器",
      subtitle: "在材料科学中，实验本身就是知识生产机制。",
      bullets: [
        "实验不仅验证理论，也发现现象、制造样品、暴露异常、纠正错误。",
        "很多 MSE 问题无法由纯理论直接给出答案，必须依赖实验进入真实材料世界。",
        "因此，实验不是“最后一步确认”，而是研究链条中的主轴。",
      ],
      rightTitle: "在 MSE 中，实验承担什么",
      rightBody: "发现 / 制备 / 表征 / 测量 / 评价 / 失效分析 / 校准 / 纠错",
      bottomTitle: "关键判断",
      bottomBody: "谁能更高质量地组织实验，谁就可能更快地产生可靠知识。",
      page: 6,
      total: 36,
      script: "先把一个判断说清楚：在材料科学里，实验不是理论后的确认动作，而是直接进入真实材料世界、制造对象、暴露异常和推动纠错的知识生产机制。",
      annotations: ["Materials Science and Engineering（材料科学与工程，MSE）"],
      sources: [SRC.hacking, SRC.kuhn],
    },
    {
      type: "compare",
      section: "实验输出",
      title: "从实验类别到数据形态：SDL 关心的不只是“做了什么实验”",
      subtitle: "它更关心实验会产出什么观测，以及这些观测能否进入决策。",
      columns: ["典型输出", "常见数据形态", "SDL 化难点"],
      rows: [
        ["制备/加工", "样品状态变化", "配方表、工艺参数、批次记录", "样品历史难标准化，过程漂移强"],
        ["结构/成分表征", "相、成分、形貌", "谱图、峰位、图像、mapping", "高维数据多，解释链长"],
        ["物性/性能", "电、热、力、化学响应", "曲线、标量、循环数据", "目标常多元，测量时间不均一"],
        ["失效/可靠性", "寿命、退化、异常模式", "时间序列、统计分布", "成本高、时间长、噪声和偶然性强"],
      ],
      page: 15,
      total: 36,
      script: "后面讨论 SDL 时，真正的难点常常不在优化器，而在实验给出的观测到底是什么：是谱图、图像、曲线还是标量；这些观测能不能稳定、及时、低成本地进入决策回路。",
      annotations: ["measurement（观测）", "data modality（数据模态）", "high-dimensional observation（高维观测）"],
      sources: [SRC.nistSchema, SRC.emmc, SRC.chemrevSDL],
    },
    {
      type: "cards",
      section: "实验的角色",
      title: "实验如何贯穿一条典型的 MSE 知识链",
      subtitle: "它不是单点动作，而是一条连续工作流。",
      cols: 3,
      cards: [
        { title: "问题提出", body: "我们想优化什么、理解什么、验证什么？", accent: C.cyan },
        { title: "样品与制备", body: "材料从想法变成可被研究的真实对象。", accent: C.blue },
        { title: "表征与测量", body: "结构、组成、性能、失效等响应被观察和记录。", accent: C.yellow },
        { title: "数据与模型", body: "实验结果被整理、比较、建模和解释。", accent: C.green },
        { title: "判断与决策", body: "研究者决定下一个实验点、下一个变量或下一个机制假说。", accent: C.red },
        { title: "反馈与纠错", body: "异常、误差、重复性和反例推动科学自我修正。", accent: C.cyan },
      ],
      page: 7,
      total: 36,
      script: "把这条链看清楚很重要：从问题提出、样品制备到表征、建模、判断和纠错，实验始终贯穿其中。SDL 改变的不是实验的存在，而是这条链的组织方式、速度和可追踪性。",
      annotations: ["可与 Process–Structure–Property–Performance（工艺–结构–性能–服役）主线关联"],
      sources: [SRC.nistSchema, SRC.hacking],
    },
    {
      type: "bullet",
      section: "为什么是今天",
      title: "为什么今天谈 SDL，而不是十年前或二十年前",
      subtitle: "因为实验条件、数据条件和计算条件正在同时成熟。",
      bullets: [
        "实验硬件更自动化：样品制备、表征、搬运、调度逐渐可编排。",
        "实验数据更可计算：传感、记录、数据库和元数据体系更成熟。",
        "算法更能进入闭环：不只做离线预测，还能参与下一实验点决策。",
      ],
      rightTitle: "三条线收束",
      rightBody: "硬件自动化\n数据化\n模型驱动决策",
      bottomTitle: "因此",
      bottomBody: "SDL 不是突然出现的新名词，而是多条技术线索在实验系统中的收束。",
      page: 8,
      total: 36,
      script: "今天之所以能认真讨论 SDL，不是因为某个模型突然更聪明，而是实验硬件、数据基础设施和模型驱动决策这三条线终于能在一个系统里接上，形成可运行闭环。",
      annotations: ["Closed-loop experimentation（闭环实验）"],
      sources: [SRC.fourthParadigm, SRC.natureSynthesisSDL, SRC.chemrevSDL],
    },
    {
      type: "process",
      section: "科学范式",
      title: "从自然观察到自驱实验：知识生产方式如何演化",
      subtitle: "范式变化的关键，不只是工具变化，而是“如何得到知识”在变化。",
      steps: [
        { kicker: "P1", title: "观察", body: "以经验观察为主，积累现象和记述。", accent: C.cyan },
        { kicker: "P2", title: "理论", body: "通过抽象理论组织现象，形成定律和解释。", accent: C.blue },
        { kicker: "P3", title: "计算", body: "借助数值模拟和计算模型处理复杂系统。", accent: C.yellow },
        { kicker: "P4", title: "数据密集", body: "大量数据、数据库和统计/机器学习加入发现过程。", accent: C.green },
        { kicker: "P5", title: "自驱实验", body: "模型开始进入实验闭环，参与实验设计与执行节奏。", accent: C.red },
      ],
      page: 9,
      total: 36,
      script: "这一页不要当年表看，要当知识生产方式的演化图看。前面几种范式主要在回答‘我们怎样理解世界’，到这里开始多出一个新问题：模型是否已经进入行动链，开始参与下一步实验。",
      annotations: ["Fourth Paradigm（第四范式）", "Fifth Paradigm（第五范式）"],
      sources: [SRC.kuhn, SRC.fourthParadigm, SRC.natureSynthesisSDL, SRC.chemrevSDL],
      figureSuggestions: [
        "优先自绘五范式时间轴；若需引原出处，可参考 Hey et al., The Fourth Paradigm（2009）封面或导言中的 data-intensive science 叙事，再在备注中说明第五范式属于当前扩展性讲法。",
        "若要补 SDL 进入实验行动链的代表图，可参考 Stach et al., Nature Synthesis (2023) 或 Tom et al., Chemical Reviews (2024) 中的 SDL workflow schematic。"
      ],
    },
    {
      type: "compare",
      section: "范式比较",
      title: "第四范式与第五范式的差别，不在“数据更多”",
      subtitle: "真正的区别在于模型是否进入行动链。",
      columns: ["第四范式", "第五范式", "对实验的意义"],
      rows: [
        ["主要对象", "数据与模式", "数据、模式与行动", "从“看懂”走向“决定下一步”"],
        ["模型角色", "分析与预测", "分析、预测与推荐", "模型开始参与实验决策"],
        ["实验角色", "数据来源", "决策回路的一部分", "实验被更紧密地编排"],
        ["研究者角色", "解释者", "解释者 + 监督者 + 约束设定者", "人不退出，角色重构"],
      ],
      page: 10,
      total: 36,
      script: "第四范式强调的是数据密集科学；第五范式常被用来指模型进一步进入行动链，不再只解释数据，而开始推荐下一步实验。这意味着实验从被观察对象，逐步变成被编排系统。",
      annotations: ["数据密集科学", "agentic workflow（代理式工作流）"],
      sources: [SRC.fourthParadigm, SRC.futureSDL, SRC.chemrevSDL],
    },
    {
      type: "cards",
      section: "实验角色",
      title: "沿着五种范式看，实验的角色一直在变",
      subtitle: "同样叫“实验”，在不同范式中承担的知识功能并不一样。",
      cols: 3,
      cards: [
        { title: "观察范式", body: "实验更像现象采集与经验积累，重点是“看见什么”。", accent: C.cyan },
        { title: "理论范式", body: "实验常承担验证与校正作用，重点是“理论是否站得住”。", accent: C.blue },
        { title: "计算范式", body: "实验开始与模拟互相校准，重点是“模型与现实差多远”。", accent: C.yellow },
        { title: "数据密集范式", body: "实验既是数据来源，也是数据库和模型更新的入口。", accent: C.green },
        { title: "自驱实验范式", body: "实验进入闭环，被模型调度、被系统编排、被人监督。", accent: C.red },
        { title: "讲座结论", body: "SDL 不是取消实验，而是把实验推到更高频、更系统、更可追踪的位置。", accent: C.cyan },
      ],
      page: 11,
      total: 36,
      script: "一个容易被误解的地方在这里：范式变化并不意味着实验越来越不重要。恰恰相反，实验在新范式中更频繁、更系统，也更需要被清晰定义、严格记录和持续监督。",
      annotations: ["可与下一页“旧范式并未消失”连讲"],
      sources: [SRC.kuhn, SRC.fourthParadigm, SRC.futureSDL],
    },
    {
      type: "compare",
      section: "范式关系",
      title: "前三种范式并没有消失，而是被第四、第五范式重新组织",
      subtitle: "新范式不是替身，而是重组、串联和放大。",
      columns: ["前三范式留下什么", "第四/第五范式如何吸收", "对今天实验的含义"],
      rows: [
        ["经验与直觉", "成为目标设定、异常判断和早期摸底的重要来源", "人类经验仍在回路中"],
        ["理论与机制", "成为约束、先验和可解释性支撑", "不是只有数据拟合"],
        ["计算与模拟", "成为候选筛选、数字孪生和仿真试验台的一部分", "实验前端可被预压缩"],
        ["数据与自动化", "把前三者接入可更新、可执行的闭环系统", "方法论开始系统集成"],
      ],
      page: 12,
      total: 36,
      script: "更稳妥的讲法不是‘新范式取代旧范式’，而是旧范式被重新组织：经验仍然重要，理论仍然提供约束，计算仍然参与筛选，只是现在它们被接入了一个更强的数据化和闭环化系统。",
      annotations: ["这页可直接回应“旧范式会不会死”这一类问题"],
      sources: [SRC.kuhn, SRC.fourthParadigm, SRC.chemrevSDL],
    },
    {
      type: "quote",
      section: "过渡",
      quote: "问题不再只是‘我们如何理解实验结果’，而是‘我们如何组织下一轮实验’。",
      source: "本讲核心转折",
      body: "从这里开始，实验的对象、实验的流程、实验的决策者，都会被重新审视。",
      page: 11,
      total: 36,
      script: "这里开始转向另一类问题：传统研究常把重点放在解释已有结果；到 SDL 这里，重点开始前移到下一轮实验如何被设计、被推荐、被执行。",
      annotations: ["建议此页稍停顿，作为章节转场"],
      pace: "30–45 秒；停一下，让听众感到问题正在转向。",
      sources: [SRC.fourthParadigm, SRC.chemrevSDL],
    },
    {
      type: "divider",
      section: "第二部分",
      index: "02",
      title: "MSE 实验图谱与目录学",
      subtitle: "如果不先知道实验有哪些类型、各自输出什么数据，就谈不上 SDL 化。",
      caption: "按实验而不是按材料类别来组织，才能把数据、方法和 SDL 适配度放在同一张图里。",
      accent: C.blue,
      page: 12,
      total: 36,
      script: "这一部分换一个视角来组织材料科学：不是按金属、陶瓷或半导体分，而是按实验类型分。这样更容易看清实验输出、方法选择和 SDL 适配度之间的关系。",
      annotations: ["taxonomy（分类框架）", "catalog（目录学）"],
      sources: [SRC.nistSchema, SRC.emmc],
    },
    {
      type: "cards",
      section: "实验图谱",
      title: "以实验为中心的 MSE 图谱",
      subtitle: "实验是中心节点，向外连接问题、样品、测量、模型与工程约束。",
      cols: 4,
      cards: [
        { title: "研究问题", body: "目标、约束、假设" },
        { title: "样品状态", body: "粉末、薄膜、块体、器件" },
        { title: "制备/加工", body: "合成、热处理、沉积、成形" },
        { title: "表征/测量", body: "结构、成分、性能、失效" },
        { title: "数据", body: "谱图、图像、曲线、表格" },
        { title: "模型", body: "统计、机理、代理模型" },
        { title: "决策", body: "下一个点、下一个配方、下一个条件" },
        { title: "验证", body: "重复性、校准、边界条件" },
      ],
      page: 13,
      total: 36,
      script: "这一页可以看成全讲的骨架图：实验不是孤立动作，而是连接问题、样品、观测、数据、模型和决策的中心节点。后面讲 SDL，本质上就是在改造这张网里若干关键连接。",
      annotations: ["objective / measurement / decision 三者需要当场区分"],
      sources: [SRC.nistSchema, SRC.emmc],
    },
    {
      type: "cards",
      section: "分类总览",
      title: "我们采用的 8 类 MSE 实验框架",
      subtitle: "这是讲座版目录学，不假装是唯一标准，但足够教学和实现。",
      cols: 4,
      cards: [
        { title: "样品制备", body: "让材料样品被制造出来" },
        { title: "加工调控", body: "改变已有材料状态与组织" },
        { title: "结构表征", body: "材料是什么、长什么样" },
        { title: "物性测量", body: "材料有哪些基础性质" },
        { title: "功能测试", body: "材料在应用情境下表现如何" },
        { title: "稳定与失效", body: "材料能撑多久、怎么坏" },
        { title: "计量与校准", body: "结果是否可信、可比较" },
        { title: "高通量与闭环", body: "如何加速筛选与优化" },
      ],
      page: 14,
      total: 36,
      script: "这八类实验不是互斥的，而是从实验目的出发的组织方式。这样分类的最大好处，是能直接连接到输出数据类型和 SDL 适配度，而不是停留在学科目录层面。",
      annotations: ["NIST Material Schemas（美国国家标准与技术研究院材料模式）提供了重要启发"],
      sources: [SRC.nistSchema, SRC.emmc],
    },
    {
      type: "cards",
      section: "分类细化",
      title: "前四类：从做出样品，到知道样品是什么",
      subtitle: "这四类往往决定实验链的上半程。",
      cols: 2,
      cards: [
        { title: "样品制备", body: "定义：生成样品或样品库。\n例：固相合成、溶胶凝胶、CVD（化学气相沉积）、PVD（物理气相沉积）。\nSDL 关系：常是闭环中的执行端。", accent: C.cyan },
        { title: "加工调控", body: "定义：改变已有材料状态。\n例：退火、淬火、轧制、表面改性。\nSDL 关系：常与工艺优化、结构演化问题相连。", accent: C.blue },
        { title: "结构表征", body: "定义：回答材料的结构、成分与形貌。\n例：XRD（X射线衍射）、SEM（扫描电镜）、TEM（透射电镜）、XPS。", accent: C.yellow },
        { title: "物性测量", body: "定义：回答材料的本征或近本征性质。\n例：电导率、热导率、硬度、磁化、带隙。", accent: C.green },
      ],
      page: 15,
      total: 36,
      script: "前四类可以连成材料研究的上半程：先把样品做出来，再通过加工把状态调到合适区间，再通过表征知道它是什么，再通过测量知道它具有什么性质。",
      annotations: ["CVD（Chemical Vapor Deposition，化学气相沉积）", "PVD（Physical Vapor Deposition，物理气相沉积）"],
      sources: [SRC.nistSchema, SRC.emmc],
    },
    {
      type: "cards",
      section: "分类细化",
      title: "后四类：从能不能工作，到结果是否可信",
      subtitle: "这四类决定实验链的下半程和结果质量。",
      cols: 2,
      cards: [
        { title: "功能测试", body: "定义：材料在目标应用场景中表现如何。\n例：电池循环、催化转化率、器件 I–V 曲线、传感响应。", accent: C.cyan },
        { title: "稳定与失效", body: "定义：材料会不会退化、如何失效。\n例：疲劳、腐蚀、热循环、湿热老化、击穿。", accent: C.red },
        { title: "计量与校准", body: "定义：保证结果可重复、可比较、可追溯。\n例：标准样校准、空白对照、实验室间比对、不确定度评估。", accent: C.blue },
        { title: "高通量与闭环", body: "定义：将制备、测量与决策集成为加速系统。\n例：组合材料库、自动化 DOE、主动学习、自驱实验室。", accent: C.yellow },
      ],
      page: 16,
      total: 36,
      script: "后四类提醒我们，优化不是终点。功能、可靠性、计量和校准共同决定结果是否可信。SDL 如果只会加速试验，而不管校准和失效，最后很容易跑得快但结论不稳。",
      annotations: ["active learning（主动学习）", "high-throughput experimentation（高通量实验）"],
      sources: [SRC.nistSchema, SRC.emmc, SRC.chemrevSDL],
    },
    {
      type: "compare",
      section: "输出数据",
      title: "不同实验类型，天然对应不同数据形态",
      subtitle: "SDL 不是只优化一个分数，而是要面对不同观测输出。",
      columns: ["典型输出", "常见数据形态", "对 SDL 的启发"],
      rows: [
        ["结构表征", "衍射峰、谱图、显微图", "图像/谱图类输出需先定义可比较观测"],
        ["物性测量", "标量、曲线、张量", "目标函数常较清晰，但噪声与重复性关键"],
        ["功能测试", "效率、寿命、选择性、I–V 曲线", "往往是多目标、多约束"],
        ["失效实验", "寿命分布、失效模式、阈值", "时间成本高，闭环更需谨慎设计"],
      ],
      page: 17,
      total: 36,
      script: "这里要把讨论从“优化一个分数”拉出来。真实实验输出可能是谱图、图像、曲线或寿命分布；SDL 的一个核心难点，就是如何把这些复杂观测转成可比较、可决策的对象。",
      annotations: ["observation model（观测模型）", "objective function（目标函数）"],
      sources: [SRC.nistSchema, SRC.chemrevSDL],
    },
    {
      type: "divider",
      section: "第三部分",
      index: "03",
      title: "传统方法论：试错法与 DOE",
      subtitle: "SDL 不是从天而降，而是沿着传统实验方法论继续往前走。",
      caption: "理解传统方法的成功与边界，是理解 SDL 的前提。",
      accent: C.yellow,
      page: 18,
      total: 36,
      script: "这里先把一个误解拿掉：SDL 不是从天而降的新大陆。它和试错法、DOE 有明确的历史连续性，只是把实验设计、数据更新和推荐机制推进到了新的组织层级。",
      annotations: ["试错法、启发式方法、DOE（实验设计）"],
      sources: [SRC.fisher, SRC.box, SRC.boReview],
      pace: "1 分钟转场；从实验地位切入方法论历史。",
    },
    {
      type: "bullet",
      section: "试错法",
      title: "试错法为什么能长期存在",
      subtitle: "因为它并不愚蠢，而是把经验、直觉和局部反馈编织在一起。",
      bullets: [
        "很多实验空间在早期并不清楚，研究者先靠经验摸索局部可行区。",
        "资深研究者常具备强烈的材料直觉和工艺手感，这在复杂系统中非常有价值。",
        "当实验吞吐量低、变量数有限时，试错法往往是现实且高效的。",
      ],
      rightTitle: "要防止的误解",
      rightBody: "不能把传统方法 caricature 成“瞎试”。很多真正高水平的试错，本质上是压缩版的人类启发式搜索。",
      bottomTitle: "但",
      bottomBody: "一旦变量增多、实验代价升高、目标转为多目标优化，试错法就很快遇到上限。",
      page: 19,
      total: 36,
      script: "试错法长期存在，不是因为大家不懂方法，而是因为经验、直觉和局部反馈在很多实验里确实有用。它的问题不在于低级，而在于面对高维、昂贵、多约束问题时很难扩展。",
      annotations: ["heuristics（启发式方法）"],
      sources: [SRC.box, SRC.montgomery],
    },
    {
      type: "process",
      section: "DOE 谱系",
      title: "从 Fisher 到 Box：DOE 是现代实验方法论的主干之一",
      subtitle: "它先解决“怎么设计实验”，再逐步走向“怎么在实验中学习”。",
      steps: [
        { kicker: "1930s", title: "Fisher", body: "把随机化、重复和方差分析系统化，建立现代实验设计基础。", accent: C.cyan },
        { kicker: "1950s–70s", title: "工业 DOE", body: "全因子、部分因子、响应面等方法进入工程与工艺优化。", accent: C.blue },
        { kicker: "Box 时代", title: "序贯思想", body: "强调试验、学习、再试验；统计设计开始接近闭环思维。", accent: C.yellow },
        { kicker: "今天", title: "与 SDL 汇流", body: "DOE 继续负责初始化、筛选、结构化采样，并与 BO/SDL 集成。", accent: C.red },
      ],
      page: 20,
      total: 36,
      script: "如果把 DOE 只讲成几种设计表，那就低估它了。DOE 真正留下来的，是一种很强的方法论意识：预算有限时，实验不能乱做，而要设计成一轮一轮能学到东西的过程。这一点和后面的 SDL 是接得上的。",
      annotations: ["R. A. Fisher（费舍尔）", "George Box（乔治·博克斯）"],
      sources: [SRC.fisher, SRC.box, SRC.montgomery],
      figureSuggestions: [
        "建议引用 Fisher《The Design of Experiments》书影，作为 DOE 起点的原始出处提示。",
        "建议引用 Box, Hunter & Hunter《Statistics for Experimenters》封面或目录页，配合说明 DOE 从统计设计走向序贯学习。",
        "若要加方法图，优先选 Montgomery《Design and Analysis of Experiments》中响应面或因子设计总览图。"
      ],
    },
    {
      type: "bullet",
      section: "DOE",
      title: "DOE 的核心贡献：把实验从“凭感觉改变量”变成“结构化采样”",
      subtitle: "它解决的是实验设计问题，而不只是统计分析问题。",
      bullets: [
        "明确因素、水平、响应和约束。",
        "通过有计划的采样区分主效应、交互效应和噪声。",
        "在有限实验预算下，提高信息增益和解释能力。",
      ],
      rightTitle: "DOE 常见家族",
      rightBody: "全因子 / 部分因子 / 响应面 / 中心复合 / Box–Behnken",
      bottomTitle: "更重要的是",
      bottomBody: "DOE 的价值不仅在“省实验”，更在于让实验变得可解释、可复盘、可交流。",
      page: 20,
      total: 36,
      script: "DOE 的根本贡献不是省几个点，而是把实验设计本身变成可推理对象。它关心的不只是结果，更关心为什么这样采样、哪些因素重要、哪些交互值得追踪。",
      annotations: ["Box–Behnken design（Box–Behnken 设计）", "Response Surface Methodology（响应面方法）"],
      sources: [SRC.box, SRC.montgomery],
    },
    {
      type: "cards",
      section: "DOE 家族",
      title: "DOE 家族怎么选：筛选、建模、优化各有分工",
      subtitle: "DOE 不是一个方法，而是一组针对不同实验阶段的设计策略。",
      cols: 3,
      cards: [
        { title: "全因子", body: "因素少、预算足时，完整摸清主效应与交互。", accent: C.cyan },
        { title: "部分因子", body: "筛选阶段优先，快速找出重要因素。", accent: C.blue },
        { title: "中心复合", body: "适合建立二次响应面，观察曲率。", accent: C.yellow },
        { title: "Box–Behnken", body: "减少极端组合，常用于工艺优化。", accent: C.green },
        { title: "响应面方法", body: "在局部区域建立可解释近似模型。", accent: C.red },
         { title: "真正的顺序", body: "先问实验处在哪个阶段，再选 DOE，而不是反过来。", accent: C.cyan },
      ],
      page: 21,
      total: 36,
      script: "这里最重要的是阶段感。筛选阶段、建模阶段和局部优化阶段面对的问题并不一样，所以用的 DOE 也不一样。方法要跟着问题走，而不是先抱住某个设计名词。",
      annotations: ["factor screening（因素筛选）", "response surface（响应面）"],
      sources: [SRC.box, SRC.montgomery],
    },
    {
      type: "cards",
      section: "DOE 框架",
      title: "DOE 的最小词汇表",
      subtitle: "学生至少要区分这六个词，否则后面讲 SDL 会混。",
      cols: 3,
      cards: [
        { title: "因素", body: "我们主动控制的变量。", accent: C.cyan },
        { title: "水平", body: "每个因素允许取到的值。", accent: C.blue },
        { title: "响应", body: "实验测得的结果或输出。", accent: C.yellow },
        { title: "约束", body: "安全、成本、可行性边界。", accent: C.red },
        { title: "主效应", body: "单个因素变化带来的影响。", accent: C.green },
        { title: "交互效应", body: "因素组合共同作用产生的影响。", accent: C.cyan },
      ],
      page: 21,
      total: 36,
      script: "这六个词看起来基础，但后面 SDL 里的 objective、constraint、measurement、parameter space 都建立在这里。如果这里不分清，后面就很容易把响应和目标、变量和约束混为一谈。",
      annotations: ["factor（因素）", "response（响应）", "constraint（约束）"],
      sources: [SRC.fisher, SRC.box, SRC.montgomery],
    },
    {
      type: "compare",
      section: "方法比较",
      title: "试错法、DOE、SDL：不是替代关系，而是连续谱",
      subtitle: "每种方法都有适用边界。",
      columns: ["试错法", "DOE", "SDL"],
      rows: [
        ["策略", "经验与直觉驱动", "统计设计驱动", "模型与闭环决策驱动"],
        ["变量空间", "低维更友好", "中低维较合适", "高维潜力更大"],
        ["不确定性", "通常隐含处理", "残差与显著性分析", "显式后验与不确定性"],
        ["迭代速度", "慢，强依赖人工", "中等，常按批次", "快，可闭环运行"],
        ["最强项", "早期摸底", "筛选与主效应识别", "昂贵实验下的数据效率"],
      ],
      page: 22,
      total: 36,
      script: "更接近真实研究现场的讲法不是高下之分，而是连续谱：先靠经验摸边界，再用 DOE 组织设计，最后才在最昂贵、最关键的那段空间里上 SDL。",
      annotations: ["不要把 SDL 讲成“万能替代者”"],
      sources: [SRC.box, SRC.montgomery, SRC.boReview],
    },
    {
      type: "bullet",
      section: "连续性",
      title: "从试错法到 SDL：真正变化的是谁来提出“下一步做什么”",
      subtitle: "这是方法论上的连续性，也是一条自动化程度逐步提高的路线。",
      bullets: [
        "试错法：主要由研究者直觉提出下一步。",
        "DOE：由预先设计好的统计结构给出下一组实验。",
        "SDL：模型根据现有观测和不确定性，动态推荐下一步。",
      ],
      rightTitle: "所以",
      rightBody: "DOE 与 SDL 的区别，不只在模型更复杂，而在推荐逻辑从静态设计转向动态闭环。",
      bottomTitle: "关键问题",
      bottomBody: "“下一步做什么”由谁提出、依据什么提出、如何被验证。",
      page: 23,
      total: 36,
      script: "如果只用一句话概括这条方法论演化线，我会说：变化最大的是下一步实验的提出机制。从人提出、到设计提出、再到模型在闭环中提出，这改变了实验决策的来源与依据。",
      annotations: ["next experiment recommendation（下一实验推荐）"],
      sources: [SRC.box, SRC.shahriari, SRC.boReview],
    },
    {
      type: "compare",
      section: "DOE 与 SDL",
      title: "DOE 会死吗？不会：它会与 SDL 串联、并联、集成",
      subtitle: "真正的问题不是谁取代谁，而是谁在什么阶段更合适。",
      columns: ["典型场景", "DOE 的角色", "SDL 的角色"],
      rows: [
        ["串联", "做初始化、筛选、缩空间", "在高成本区域做序贯优化"],
        ["并联", "某些子问题用批量统计设计", "另一些子问题用动态推荐"],
        ["集成", "保留因素、响应、约束、设计点语言", "把 DOE 思想嵌入初始化和闭环更新"],
        ["共同边界", "可解释、结构化、低成本学习", "高数据效率、动态决策、显式不确定性"],
      ],
      page: 24,
      total: 36,
      script: "我对这个问题的判断很明确：DOE 不会死。更好的问法是，它会以什么方式继续存在。通常就是三种：串联、并联、集成。很多 SDL 工作流内部，本来就还在用 DOE 的语言、初始化和结构化采样思想。",
      annotations: ["这页可直接回应“AI 时代 DOE 是否过时”"],
      sources: [SRC.fisher, SRC.box, SRC.boReview, SRC.shahriari],
    },
    {
      type: "divider",
      section: "第四部分",
      index: "04",
      title: "AI 时代的实验：什么是 SDL",
      subtitle: "SDL 的关键，不在“用上了 AI”，而在“实验开始形成可更新、可执行、可复位的闭环”。",
      caption: "模型不再只解释已有结果，而开始进入实验行动链。",
      accent: C.green,
      page: 24,
      total: 36,
      script: "从这里开始，重点不再是某个模型名字，而是一个可运行的实验闭环怎样由软件、硬件、数据、模型和人类监督共同构成。",
      annotations: ["Self-Driving Labs（自驱实验室，SDL）"],
      sources: [SRC.chemrevSDL, SRC.natureSynthesisSDL, SRC.futureSDL],
      pace: "1 分钟转场；提醒听众现在开始从 DOE 进入 SDL。",
    },
    {
      type: "cards",
      section: "SDL 全景",
      title: "在聚焦单个案例前，先看一眼当前 SDL 领域全景",
      subtitle: "A-Lab 重要，但它不是唯一代表。",
      cols: 3,
      cards: [
        { title: "化学反应优化", body: "连续流、催化、反应条件优化是 SDL 最活跃方向之一。", accent: C.cyan },
        { title: "材料合成", body: "无机固相、薄膜、配方与聚合物是代表性场景。", accent: C.blue },
        { title: "自动化编排", body: "ChemOS、工作流调度和设备编排提供系统骨架。", accent: C.yellow },
        { title: "高成本实验", body: "昂贵、慢速或低通量实验更强调数据效率。", accent: C.red },
        { title: "低成本 SDL", body: "frugal twin 与低成本平台强调可复制和教育可及性。", accent: C.green },
        { title: "主流挑战", body: "标准化、观测定义、验证口径和人机协作仍是共性难点。", accent: C.cyan },
      ],
      page: 25,
      total: 36,
      script: "在进 A-Lab 之前，我想先把视野拉宽一点。SDL 不是一条单线叙事，它至少覆盖反应优化、材料合成、自动化编排和低成本平台几条路线。这样看完再回到 A-Lab，才知道它重要在什么地方，也局限在什么地方。",
      annotations: ["ChemOS（自动化实验编排平台）", "frugal twin（低成本孪生）"],
      sources: [SRC.chemrevSDL, SRC.natureSynthesisSDL, SRC.futureSDL, SRC.frugalTwin, SRC.communitySurvey],
      figureSuggestions: [
        "建议引用 Tom et al., Chemical Reviews (2024) 的 SDL 全景/分类综述图，作为领域地图主图候选。",
        "建议引用 Digital Discovery (2024) community survey 中的系统类型或平台比较图/表，帮助说明领域并非只有 A-Lab 一条路线。"
      ],
    },
    {
      type: "bullet",
      section: "SDL 定义",
      title: "SDL：模型驱动的实验闭环，不是单次预测",
      subtitle: "它至少包含目标、观测、更新、推荐和执行五个环节。",
      bullets: [
        "定义目标：我们到底要优化什么、约束什么、测什么。",
        "执行实验：真实硬件或仿真实验台给出观测结果。",
        "更新模型：把新观测吸收进当前知识状态。",
        "推荐下一点：根据目标与不确定性提出下一个实验。",
      ],
      rightTitle: "一句话定义",
      rightBody: "SDL = 可自动迭代的实验—观测—建模—决策—再实验系统。",
      bottomTitle: "要强调",
      bottomBody: "预测模型本身不等于 SDL；进入闭环才是 SDL。",
      page: 25,
      total: 36,
      script: "把 SDL 理解成‘用机器学习预测实验结果’，还是太浅了。真正关键的地方在于闭环：模型不只解释结果，还要参与下一步行动；而且这个行动必须真的能被执行、被观测、再被验证。",
      annotations: ["closed-loop experimentation（闭环实验）"],
      sources: [SRC.chemrevSDL, SRC.natureSynthesisSDL],
      figureSuggestions: [
        "建议引用 Stach et al., Nature Synthesis (2023) 中 SDL 闭环 workflow 图，适合做这一页主图。",
        "可备选 Tom et al., Chemical Reviews (2024) 中的 closed-loop experimentation schematic。"
      ],
    },
    {
      type: "process",
      section: "闭环结构",
      title: "一个最小 SDL 闭环包含哪几步",
      subtitle: "推荐—执行—观测—更新—再推荐。",
      steps: [
        { kicker: "1", title: "定义目标", body: "目标函数、约束与可测指标被明确。", accent: C.cyan },
        { kicker: "2", title: "执行实验", body: "硬件或模拟器运行一次实验。", accent: C.blue },
        { kicker: "3", title: "获得观测", body: "得到谱图、曲线、图像或标量。", accent: C.yellow },
        { kicker: "4", title: "更新模型", body: "模型吸收新数据，修正对空间的理解。", accent: C.green },
        { kicker: "5", title: "推荐下一点", body: "在探索与利用之间做平衡。", accent: C.red },
      ],
      page: 26,
      total: 36,
      script: "这一页其实就是后面看 Case Studio 的认知模板。只要把这五步记住，后面看到推荐点变化时，就不会把那理解成黑箱魔法，而会知道闭环到底在做什么。",
      annotations: ["exploration vs exploitation（探索与利用）"],
      sources: [SRC.chemrevSDL, SRC.shahriari],
    },
    {
      type: "cards",
      section: "概念分辨",
      title: "目标、约束、测量：这三个概念必须分开",
      subtitle: "它们在很多讨论里被混在一起，但在 SDL 设计中完全不同。",
      cols: 3,
      cards: [
        { title: "目标", body: "我们希望优化的东西，例如产率、匹配分数、寿命。", accent: C.cyan },
        { title: "约束", body: "不能越过的边界，例如安全、成本、时间、材料稳定性。", accent: C.red },
        { title: "测量", body: "实验可直接得到的观测，例如峰位、颜色、光谱、电压。", accent: C.yellow },
      ],
      page: 27,
      total: 36,
      script: "这三个概念一定要分开：目标不一定能直接测，约束也不是附属条件，测量更不等于最终目标。很多高质量 SDL 设计，首先赢在这三者分得清楚。",
      annotations: ["objective（目标）", "constraint（约束）", "measurement（测量）"],
      sources: [SRC.chemrevSDL, SRC.nistSchema],
    },
    {
      type: "cards",
      section: "核心概念",
      title: "SDL 的三个核心概念：代理模型、不确定性、采集函数",
      subtitle: "它们共同回答“下一步做什么”。",
      cols: 3,
      cards: [
        { title: "Surrogate model（代理模型）", body: "用较便宜的统计模型近似真实实验响应面。", accent: C.cyan },
        { title: "Uncertainty（不确定性）", body: "告诉我们哪些区域还看不清，因此值得继续探索。", accent: C.blue },
        { title: "Acquisition（采集函数）", body: "平衡探索与利用，给出下一实验点。", accent: C.yellow },
      ],
      page: 28,
      total: 36,
      script: "这三者的关系可以讲得很清楚：代理模型负责形成当前知识地图，不确定性负责标出盲区，采集函数负责把目标和盲区综合成下一步行动。三者合起来，才构成推荐逻辑。",
      annotations: [
        "Gaussian Process（高斯过程，GP）",
        "Expected Improvement（期望提升，EI）",
      ],
      sources: [SRC.shahriari, SRC.boReview],
    },
    {
      type: "compare",
      section: "代理模型",
      title: "代理模型不止一种：关键是你要近似什么、数据有多贵",
      subtitle: "不同 surrogate model（代理模型）适合不同实验地形。",
      columns: ["代表方法", "优势", "局限"],
      rows: [
        ["Gaussian Process（高斯过程）", "小样本、可给不确定性、解释性较强", "高维和大样本下成本上升"],
        ["Random Forest / Tree ensembles", "鲁棒、对离散变量友好", "不确定性表述相对间接"],
        ["Neural surrogate / deep model", "适合高维复杂观测", "更吃数据，校准与可解释性更难"],
        ["Physics-informed / hybrid", "可把机制先验并入学习", "建模门槛更高，依赖领域知识"],
      ],
      page: 29,
      total: 36,
      script: "代理模型怎么选，不能只看谁最流行，而要看你面对的到底是什么实验空间、什么数据量、什么变量类型。小样本昂贵实验常偏向 GP；一旦观测高维、结构复杂，就可能转向树模型、深模型或混合模型。",
      annotations: ["surrogate model selection（代理模型选择）"],
      sources: [SRC.shahriari, SRC.boReview, SRC.chemrevSDL],
      figureSuggestions: [
        "建议引用 Shahriari et al., Proceedings of the IEEE (2016) 中 GP/BO 示意图，说明 surrogate 的经典语境。",
        "若希望更贴近 SDL 语境，可引用 Chemical Reviews (2024) 中对 surrogate model 家族的总结表或分类图。"
      ],
    },
    {
      type: "cards",
      section: "不确定性",
      title: "不确定性不是“没把握”三个字，而是可表示、可利用的对象",
      subtitle: "SDL 的数据效率，很大程度上来自对不确定性的显式处理。",
      cols: 3,
      cards: [
        { title: "它表示什么", body: "模型对某区域了解不够、数据稀疏或观测噪声较大。", accent: C.cyan },
        { title: "如何表示", body: "常见为后验方差、置信区间、ensemble 分歧或校准分布。", accent: C.blue },
        { title: "如何利用", body: "决定哪些地方值得继续探索，而不是只盯当前最优。", accent: C.yellow },
        { title: "为什么重要", body: "没有不确定性，很多推荐会退化成贪心搜索。", accent: C.red },
        { title: "实践难点", body: "模型校准不良时，不确定性会“看起来有，实际上不可信”。", accent: C.green },
        { title: "结论", body: "SDL 的高效，不只是预测准，更是知道自己哪里不准。", accent: C.cyan },
      ],
      page: 30,
      total: 36,
      script: "这一页最重要的一句其实很简单：好的 SDL 不只是预测得准，而是知道自己哪里还不准。不确定性不是抽象形容词，它直接决定预算该往哪里投，哪些区域该继续探索，哪些区域可以先不碰。",
      annotations: ["posterior variance（后验方差）", "calibration（校准）"],
      sources: [SRC.shahriari, SRC.boReview, SRC.chemrevSDL],
      figureSuggestions: [
        "建议引用 Shahriari et al. (2016) 中 GP posterior mean/variance 示意图，最适合解释 uncertainty 的可视化含义。",
        "若强调 calibration，可补一张 BO/SDL 综述中的 uncertainty calibration 或 ensemble disagreement 示例图。"
      ],
    },
    {
      type: "cards",
      section: "采集函数",
      title: "采集函数是在替你回答：现在先做哪一个点",
      subtitle: "它不是固定唯一的，也可以按目标和风险偏好自定义。",
      cols: 3,
      cards: [
        { title: "EI / PI", body: "强调改进当前最优，常用于单目标优化。", accent: C.cyan },
        { title: "UCB", body: "显式平衡均值与不确定性，调参直观。", accent: C.blue },
        { title: "信息型方法", body: "更关注哪一步最能减少整体认知不确定。", accent: C.yellow },
        { title: "怎么选", body: "看是更重速度、稳健性还是全局认知更新。", accent: C.red },
        { title: "能否自定义", body: "可以，只要目标、约束和风险偏好定义清楚。", accent: C.green },
        { title: "本质", body: "采集函数是方法论选择，不只是公式替换。", accent: C.cyan },
      ],
      page: 31,
      total: 36,
      script: "采集函数不要背成菜单。它本质上在回答一个方法论问题：你现在更想尽快吃到当前最优，还是愿意花预算去补盲区、降不确定性？不同项目、不同阶段，这个答案本来就可能不一样。",
      annotations: ["Expected Improvement（期望提升）", "Upper Confidence Bound（上置信界）"],
      sources: [SRC.shahriari, SRC.boReview],
      figureSuggestions: [
        "建议引用 Shahriari et al. (2016) 中 EI/UCB 等 acquisition function 对比示意图。",
        "若需要更课堂化的图，可选 Desimpel et al., CSR (2026) 中说明 exploration–exploitation trade-off 的图或表。"
      ],
    },
    {
      type: "bullet",
      section: "SDL 难点",
      title: "从成本看，为什么很多实验问题更值得 SDL 化",
      subtitle: "关键不只是算法，而是实验输出本身很贵、很慢、很难。",
      bullets: [
        "真实实验输出可能是谱图、图像、曲线或寿命数据，本身就昂贵且难处理。",
        "很多高价值实验耗时长、成本高、噪声大，盲目试验会迅速耗尽预算。",
        "因此 SDL 的优势不仅是“更聪明”，更是用更少实验换更多信息。",
      ],
      rightTitle: "为什么序贯方法重要",
      rightBody: "实验越昂贵、吞吐越低、观测越复杂，越需要把每一步预算花在更有信息量的点上。",
      bottomTitle: "这也解释了",
      bottomBody: "为什么许多 SDL 案例会先用仿真器、代理实验台或低成本平台验证闭环逻辑。",
      page: 32,
      total: 36,
      script: "如果从成本和效率看，SDL 的优势就很好理解了：实验越贵、越慢、越 noisy，越不能靠蛮力去堆点数。真正重要的是，让每一步实验都尽量多带回信息，这也是序贯学习和显式不确定性真正值钱的地方。",
      annotations: ["forward model（前向模型）", "simulator（模拟器）", "experimental emulator（实验仿真器）"],
      sources: [SRC.boReview, SRC.frugalTwin, SRC.chemrevSDL],
      figureSuggestions: [
        "建议引用 Desimpel et al., CSR (2026) 中关于实验预算、反应优化成本或数据效率的综述图/表。",
        "若强调低成本与教学可及性，可引用 Aguilar-Granda et al., Digital Discovery (2024) 中 frugal twin 平台对比图。"
      ],
    },
    {
      type: "bullet",
      section: "人类角色",
      title: "人为什么仍不可替代：不只因为伦理，也因为科学判断本身需要人",
      subtitle: "人在回路中，也在回路上；更重要的是，人仍然提供模型没有的东西。",
      bullets: [
        "人设定目标、约束、研究问题与可接受风险，这些不是模型自动长出来的。",
        "人提供领域知识、异常直觉、机制假设和反事实想象，这是很多突破的来源。",
        "人监督模型、纠正口径、解释结果，并对最终科学结论负责。",
      ],
      rightTitle: "不能让渡的东西",
      rightBody: "问题定义\n异常识别\n机制想象\n责任承担",
      bottomTitle: "因此",
      bottomBody: "高质量 SDL 不是“去人化”，而是把人的角色从重复动作上移到判断、监督、解释与创造上。",
      page: 33,
      total: 36,
      script: "这里我不想只把人的作用讲成伦理兜底。更关键的是，问题是谁提的，异常是谁先察觉的，机制是谁敢提出的，最后结论又是谁来负责的。至少到今天，这几件事仍然主要掌握在人手里，所以高质量 SDL 必然是强人机协作系统。",
      annotations: ["Human-in-the-loop", "Human-on-the-loop"],
      sources: [SRC.futureSDL, SRC.communitySurvey, SRC.chemrevSDL],
      figureSuggestions: [
        "建议引用 Häse et al., Digital Discovery (2024) 中 human-in-the-loop / gamification / interactive AI 的概念图。",
        "可补 community survey（2024）中关于 human oversight、platform bottleneck 或 adoption barrier 的汇总图表。"
      ],
    },
    {
      type: "compare",
      section: "适配边界",
      title: "哪些问题更适合 SDL，哪些问题暂时不适合",
      subtitle: "不是所有实验都该 SDL 化。",
      columns: ["更适合", "不太适合", "判断依据"],
      rows: [
        ["可自动化、可标准化", "强依赖手工艺与个人手感", "执行是否能稳定复现"],
        ["可快速测量", "观测极慢、极昂贵", "闭环速度是否可接受"],
        ["目标和约束较清楚", "目标定义模糊", "推荐是否有可判定依据"],
        ["数据可结构化记录", "过程难以被数据化", "能否形成持续更新模型"],
      ],
      page: 30,
      total: 36,
      script: "SDL 不是所有实验问题的默认答案。它更适合那些可自动化、可标准化、可快速观测、目标与约束较清楚的问题；反之，它也会有明显边界。",
      annotations: ["feasibility（可行性）", "throughput（吞吐量）"],
      sources: [SRC.chemrevSDL, SRC.communitySurvey, SRC.frugalTwin],
    },
    {
      type: "cards",
      section: "代表系统",
      title: "聚焦 A-Lab 前，先看几条常被引用的 SDL 路线",
      subtitle: "A-Lab 很重要，但它只是 SDL 全景中的一个代表。",
      cols: 2,
      cards: [
        { title: "ChemOS / 反应优化", body: "强项：把实验编排、设备控制和 BO 工作流接起来。\n局限：更偏平台与工作流，不等于某一具体学科问题已被完全解决。", accent: C.cyan },
        { title: "NIST AFL（自治配方实验室）", body: "强项：配方、流变、材料加工场景清晰。\n局限：更适合特定 formulation 场景，通用性需谨慎解读。", accent: C.blue },
        { title: "A-Lab（自治实验室）", body: "强项：固相无机材料发现链条完整、传播度高。\n局限：争议也最集中，定义口径和验证链必须细看。", accent: C.red },
        { title: "低成本 SDL / frugal twin", body: "强项：可复制、教育友好、便于快速验证闭环逻辑。\n局限：常不能替代高价值真实实验的复杂语义。", accent: C.green },
      ],
      page: 35,
      total: 36,
      script: "这页的作用，是先把 SDL 地图摊开，再把 A-Lab 放回去。这样学生会知道：A-Lab 值得讲，不是因为它代表一切，而是因为它正好站在一个很容易被看见、也很容易被质疑的位置上。",
      annotations: ["ChemOS（实验编排平台）", "AFL（Autonomous Formulation Lab，自治配方实验室）"],
      sources: [SRC.chemrevSDL, SRC.nistAFL, SRC.frugalTwin, SRC.communitySurvey],
      figureSuggestions: [
        "建议引用 community survey（Digital Discovery, 2024）中的平台/应用谱系图或比较表。",
        "若要单列配方方向，可引用 NIST Autonomous Formulation Lab 官网示意图；若要单列低成本方向，可引用 frugal twin 综述中的平台照片或架构图。"
      ],
    },
    {
      type: "divider",
      section: "第五部分",
      index: "05",
      title: "A-Lab：真实系统案例",
      subtitle: "A-Lab 之所以重要，不只是因为它“做成了什么”，也因为它暴露了什么。",
      caption: "讲真实案例，必须同时讲能力、争议、修正与启示。",
      accent: C.red,
      page: 31,
      total: 36,
      script: "现在把视角收窄到一个具体案例。A-Lab 值得讲，不只是因为它把自治实验系统做得很完整，也因为它在高关注度之下经历了质疑、复查和修正。",
      annotations: ["A-Lab（自治实验室）", "Nature 2023 论文与后续修正"],
      sources: [SRC.alabNature, SRC.alabNews, SRC.alabChemWorld, SRC.alabCEN],
      pace: "1 分钟转场；先从全景收束到案例，再展开细节。",
    },
    {
      type: "bullet",
      section: "A-Lab 概览",
      title: "A-Lab 想做什么",
      subtitle: "目标是把固相无机材料发现组织成一个自治实验流程。",
      bullets: [
        "在候选材料空间中筛选目标，自动生成合成配方。",
        "自动完成配料、加热、研磨和 XRD（X射线衍射）测量。",
        "利用机器学习辅助相鉴定，并继续选择下一实验。"
      ],
      rightTitle: "为什么它有代表性",
      rightBody: "它不是 toy benchmark，而是把计算筛选、机器人执行、表征和决策放进同一系统。",
      bottomTitle: "更关键的是",
      bottomBody: "它让人看到 SDL 不是单个算法，而是一整套实验系统工程。",
      page: 32,
      total: 36,
      script: "A-Lab 的代表性，不是它某一个算法特别神，而是它把筛选、执行、表征和决策真的接成了一条链。所以这页最值得学生看的，不是 buzzword，而是一个真实 SDL 系统到底长什么样。",
      annotations: ["XRD（X-ray Diffraction，X射线衍射）"],
      sources: [SRC.alabNature, SRC.berkeleyAlab],
      figureSuggestions: [
        "建议引用 Nature 624 (2023) A-Lab 论文中的 graphical abstract 或系统总览图，最适合做这一页主图。",
        "可备选 Berkeley Lab News 对 A-Lab 的系统照片或示意图，用来增强场景感。"
      ],
    },
    {
      type: "process",
      section: "A-Lab 架构",
      title: "把 A-Lab 拆开看：它至少包含四个关键层",
      subtitle: "筛选、执行、表征、解释。",
      steps: [
        { kicker: "L1", title: "目标筛选", body: "从计算数据库中选出值得尝试的候选。", accent: C.cyan },
        { kicker: "L2", title: "自动执行", body: "机器人与炉子完成配料、加热、研磨。", accent: C.blue },
        { kicker: "L3", title: "表征", body: "XRD 输出结构信息，形成实验观测。", accent: C.yellow },
        { kicker: "L4", title: "解释与推荐", body: "模型辅助相鉴定，并推动后续实验。", accent: C.red },
      ],
      page: 33,
      total: 36,
      script: "真正的 SDL 系统一定是分层的。你可以去质疑其中任何一层做得够不够好，但不能把它简化成一个模型名字。A-Lab 的教学价值，恰好就在于这些层都能被拆出来、逐层审视。",
      annotations: ["Materials Project（材料项目数据库）", "ML-assisted phase identification（机器学习辅助相鉴定）"],
      sources: [SRC.alabNature, SRC.berkeleyAlab],
      figureSuggestions: [
        "建议引用 Nature 624 (2023) 中 A-Lab workflow / system architecture 图，逐层对应筛选、执行、表征、解释。",
        "若要补数据库前端，可配 Materials Project 相关示意截图，但应在备注中注明其与 A-Lab 的前端筛选关系。"
      ],
    },
    {
      type: "cards",
      section: "A-Lab 目标筛选",
      title: "A-Lab 的候选筛选逻辑，本质上是“先缩空间，再进实验”",
      subtitle: "这也是很多 SDL 系统的常见策略。",
      cols: 2,
      cards: [
        { title: "先缩空间", body: "从大量计算候选中，优先保留热力学上较稳定、空气中较可行、前驱体可得的目标。", accent: C.cyan },
        { title: "再进实验", body: "把真正昂贵的实验预算，集中花在更有希望的候选上。", accent: C.blue },
        { title: "优势", body: "显著减少盲目搜索，提高实验预算利用率。", accent: C.green },
        { title: "风险", body: "如果前端计算假设有系统偏差，后端实验就可能被整体带偏。", accent: C.red },
      ],
      page: 34,
      total: 36,
      script: "A-Lab 的一个关键策略，是先缩空间，再进实验。这个逻辑很常见，也很合理；但它的风险同样明显：如果前端筛选假设有系统偏差，后端自动化就会高效放大这种偏差。",
      annotations: ["thermodynamic stability（热力学稳定性）"],
      sources: [SRC.alabNature, SRC.chemrevSDL],
    },
    {
      type: "bullet",
      section: "A-Lab 结果",
      title: "A-Lab 引发关注，是因为它同时报告了速度与成功率",
      subtitle: "但学生必须学会区分“报告结果”和“最终共识”。",
      bullets: [
        "论文报告了 17 天连续运行、58 个目标尝试、355 次实验。",
        "原始论文将 41 个目标视为成功案例，并给出约 71% 的目标级成功率表述。",
        "这些数字让 A-Lab 成为全球讨论 SDL 的标志性案例。"
      ],
      rightTitle: "阅读口径",
      rightBody: "报告结果 ≠ 最终共识。\n科研论文发表后，仍可能经历独立复核、争议和修正。",
      bottomTitle: "因此",
      bottomBody: "真实案例最值得学的，不只是“数字多漂亮”，而是后续如何被检验。",
      page: 35,
      total: 36,
      script: "这一页不要把数字讲成奖状，而要讲成案例事实。A-Lab 之所以迅速出圈，确实和这些速度、吞吐量、成功率口径有关；但这些数字只是故事的开头，绝不是故事的结论。",
      annotations: ["Nature 624 (2023)", "需区分 target-level 与 recipe-level 口径"],
      sources: [SRC.alabNature, SRC.alabNews, SRC.alabChemWorld],
      figureSuggestions: [
        "建议引用 Nature 624 (2023) 论文中的结果总表或 summary figure，用原始口径展示 17 天、58 个目标、355 次实验等数字。",
        "若担心口径误读，可在图旁并列一张自制小表，区分 target-level、recipe-level 与后续争议口径。"
      ],
    },
    {
      type: "process",
      section: "A-Lab 时间线",
      title: "把 A-Lab 放回时间线里，才能看清它真正教会我们的东西",
      subtitle: "发布、传播、质疑、再分析、修正，缺一不可。",
      steps: [
        { kicker: "2023", title: "发布", body: "Nature 论文让 A-Lab 迅速成为 SDL 标志性案例。", accent: C.cyan },
        { kicker: "随后", title: "传播", body: "媒体与学界大量转述速度、成功率和自治能力。", accent: C.blue },
        { kicker: "2024", title: "质疑", body: "独立分析开始追问“新材料”“成功”的定义边界。", accent: C.yellow },
        { kicker: "再分析", title: "修正", body: "社群逐步把案例从宣传口径拉回到可核查口径。", accent: C.red },
      ],
      page: 36,
      total: 36,
      script: "把 A-Lab 放回时间线里看，才能避免把它讲成静态海报。更值得关注的是：一个高影响力 SDL 结果如何被传播、被质疑、被重新界定，又如何在社群中被更严谨地理解。",
      annotations: ["scientific self-correction（科学自我纠错）", "claim auditing（声称审计）"],
      sources: [SRC.alabNature, SRC.alabNews, SRC.alabChemWorld, SRC.alabCEN],
    },
    {
      type: "compare",
      section: "争议与修正",
      title: "A-Lab 的真正教学价值：科学自我纠错",
      subtitle: "争议不是这件事的失败，而是这件事的重要组成部分。",
      columns: ["原始声称", "后续质疑", "对学生的启示"],
      rows: [
        ["发现了大量新材料", "部分“新材料”可能是已知无序相的有序写法", "“新”必须先定义清楚"],
        ["自动相鉴定有效", "独立分析认为部分鉴定并不稳", "自动化不等于免验证"],
        ["自治系统表现突出", "系统前端与后端都可能引入系统偏差", "系统工程必须接受复核"],
      ],
      page: 36,
      total: 36,
      script: "如果把 A-Lab 当成英雄叙事，这一页就讲不明白。真正值得学生看到的是：一个高影响力 SDL 结果怎样被质疑、复查、修正。这件事本身就在提醒我们，系统越自动化，定义审计和人类验证越不能省。",
      annotations: [
        "ChemRxiv 2024 独立再分析",
        "C&EN 2026 关于更正的报道",
      ],
      sources: [SRC.alabNature, SRC.alabChemWorld, SRC.alabCEN],
      figureSuggestions: [
        "这一页可优先做并列表：左列 Nature 2023 原始声称，右列 Chemistry World / C&EN 报道中的后续质疑与更正口径。",
        "若坚持引原图，建议分别截取 Nature 论文结果图与后续报道中的关键表述，再在页上明确标示“原始声称 / 后续复核”。"
      ],
    },
    {
      type: "bullet",
      section: "A-Lab 启示",
      title: "A-Lab 给学生的六个启示",
      subtitle: "真正值得带走的，不是口号，而是判断框架。",
      bullets: [
        "SDL 是系统工程，不是单模型工程。",
        "高质量实验语义比漂亮数学曲面更重要。",
        "观测与解释之间，永远可能存在鸿沟。",
        "自动化必须接受独立验证与重复性检验。",
        "“发现”是强概念，定义必须先行。",
        "人类监督不是阻碍，而是可信科学的条件。"
      ],
      rightTitle: "更值得带走的是",
      rightBody: "不要只记住数字，要带走判断自治实验系统的框架。",
      page: 37,
      total: 36,
      script: "A-Lab 这一章真正值得带走的，不是几个漂亮数字，而是一套判断自治实验系统的框架：系统结构、观测可信度、定义边界、人类验证，以及发现口径是否足够严格。",
      annotations: ["可作为 A-Lab 章节的收束页"],
      sources: [SRC.alabNature, SRC.alabChemWorld, SRC.alabCEN],
    },
    {
      type: "divider",
      section: "第六部分",
      index: "06",
      title: "Case Studio：最小 live demo",
      subtitle: "在课堂上，让学生真正看到“下一实验点为何变化”。",
      caption: "讲复杂 SDL 系统之前，先让闭环逻辑在一个可解释的小系统里变得可见。",
      accent: C.cyan,
      page: 38,
      total: 36,
      script: "最后回到一个最小 live demo。真实系统当然更复杂，但在复杂性之前，先把闭环结构讲清楚更重要：目标、观测、更新、推荐到底是如何串起来的。",
      annotations: ["benchmark case（基准案例）"],
      pace: "45 秒转场；把复杂真实系统切回可见的最小闭环。",
      sources: [SRC.selfDrivingLabDemo, SRC.courseSite],
    },
    {
      type: "bullet",
      section: "Case Studio",
      title: "为什么选 RGB LED（RGB 发光二极管）颜色匹配作为 live demo",
      subtitle: "因为它简单、稳定、可重复，而且能清楚体现闭环决策。",
      bullets: [
        "参数空间只有三个控制量，学生容易立刻建立直觉。",
        "目标颜色、当前最佳结果和下一推荐点可以同时显示。",
        "固定 seed（随机种子）后，演示过程可复位、可重复、可比较。",
      ],
      rightTitle: "它教什么",
      rightBody: "目标是什么\n观测是什么\n推荐为什么变\n闭环如何收敛",
      bottomTitle: "它不教什么",
      bottomBody: "它不是真实材料仿真，也不取代真实化学/材料案例，只负责把 SDL 闭环讲明白。",
      page: 39,
      total: 36,
      script: "RGB LED 这个案例的价值，不在科研深度，而在教学透明度。目标颜色、当前最佳结果和下一推荐点都摆在同一屏里，所以学生不是在看一个黑箱，而是在看一个闭环到底怎样一步一步收敛。",
      annotations: ["PWM（Pulse Width Modulation，脉宽调制）", "seeded reproducibility（固定种子复现实验）"],
      sources: [SRC.selfDrivingLabDemo, SRC.courseSite],
      figureSuggestions: [
        "建议放当前课程网站 Case Studio 的真实截图，优先截取 target、best-so-far、next recommendation 同屏界面。",
        "若要补外部出处，可引用 sparks-baird/self-driving-lab-demo 仓库 README 或演示截图，作为教学 benchmark 的来源。"
      ],
    },
    {
      type: "cards",
      section: "Case Studio 机制",
      title: "这个最小案例里，SDL 的每一步都能说清楚",
      subtitle: "参数、观测、评分与推荐逻辑都显式可见。",
      cols: 2,
      cards: [
        { title: "参数", body: "R、G、B 三个控制量，分别对应三路发光强度。", accent: C.cyan },
        { title: "观测", body: "系统根据参数给出当前颜色，并计算与目标颜色的距离。", accent: C.blue },
        { title: "评分", body: "距离越小，匹配分数越高。于是问题被转成一个可优化目标。", accent: C.yellow },
        { title: "推荐", body: "模型综合已有观测与不确定性，给出下一实验点。", accent: C.green },
      ],
      page: 40,
      total: 36,
      script: "这页把 live demo 说透。参数、观测、评分、推荐四个环节都清楚，所以学生能直观看到‘下一步为什么是这个点’。这是它比很多黑箱 demo 更适合教学的地方。",
      annotations: ["match score（匹配分数）", "recommendation logic（推荐逻辑）"],
      sources: [SRC.selfDrivingLabDemo, SRC.courseSite],
    },
    {
      type: "bullet",
      section: "观看方法",
      title: "学生在 live demo 里应该看什么，而不只是看分数变化",
      subtitle: "把注意力放在闭环机制上。",
      bullets: [
        "先看目标：系统到底在追什么？",
        "再看当前最佳：系统已经学到了什么？",
        "再看下一推荐：为什么不是别的点？",
        "最后看 reset：同样的 seed（随机种子）是否给出同样演示路径？",
      ],
      rightTitle: "课堂操作建议",
      rightBody: "先单步，再五步；先解释，再收敛；最后 reset 证明可复现。",
      bottomTitle: "讲座意义",
      bottomBody: "这里让学生第一次“沉浸式”看到 AI 进入实验决策链。",
      page: 41,
      total: 36,
      script: "live demo 最怕变成‘看按钮点了几下，数字变好了’。真正应该让学生看的，是推荐逻辑怎样随着观测更新而变化，以及同样的初始条件下，这套系统是否可复现。",
      annotations: ["seed（随机种子）", "reset / replay（复位 / 重放）"],
      pace: "演示前 1 分钟说明观看方法；演示过程中不断回指这四个观察点。",
      sources: [SRC.selfDrivingLabDemo, SRC.courseSite],
    },
    {
      type: "divider",
      section: "收束",
      index: "07",
      title: "回到主题：AI 时代，实验发生了什么",
      subtitle: "不是实验消失了，而是实验被更深地数据化、编排化、模型化与监督化。",
      caption: "到这里，讲座应从“知道 SDL 是什么”推进到“知道该如何判断 SDL”。",
      accent: C.blue,
      page: 42,
      total: 36,
      script: "最后一部分不是重复总结，而是把前面所有内容收束成几条判断。学生不需要记住每个案例细节，但应带走对实验、方法论和 SDL 的整体认识框架。",
      annotations: [],
      pace: "30 秒转场；从内容回收束到判断框架。",
      sources: [SRC.fourthParadigm, SRC.box, SRC.chemrevSDL, SRC.alabNature],
    },
    {
      type: "cards",
      section: "核心结论",
      title: "三条最重要的结论",
      subtitle: "如果只能带走三句话，我希望是这三句。",
      cols: 3,
      cards: [
        { title: "实验仍是中心", body: "AI 并没有替代实验，而是在重构实验的组织方式。", accent: C.cyan },
        { title: "SDL 有前史", body: "SDL 不是孤立新范式，它连接试错法、DOE、自动化与数据化。", accent: C.blue },
        { title: "可信比炫酷更重要", body: "真正高水平的 SDL，必须经得住定义、验证、复现与伦理审查。", accent: C.red },
      ],
      page: 43,
      total: 36,
      script: "三条结论里，第一条讲对象，第二条讲历史，第三条讲标准。也就是说，我们既要知道 SDL 来自哪里，也要知道怎样判断一个 SDL 系统是否真的站得住。",
      annotations: ["scientific rigor（科学严谨性）"],
      sources: [SRC.fourthParadigm, SRC.box, SRC.chemrevSDL, SRC.alabNature],
    },
    {
      type: "bullet",
      section: "课程立场",
      title: "既拥抱 AI，也质疑 AI",
      subtitle: "这不是折中，而是对实验科学最负责任的立场。",
      bullets: [
        "拥抱 AI：用它组织知识、辅助研究、开发工具、提高实验效率。",
        "质疑 AI：坚持人的直觉、领域知识、实践技能与伦理责任。",
        "负责任的 AI 使用，不是迷信输出，而是让模型进入可监督的科学工作流。",
      ],
      rightTitle: "给学生的要求",
      rightBody: "会用 AI\n会审 AI\n会纠 AI\n会承担结论责任",
      bottomTitle: "讲座之外",
      bottomBody: "这也是整门课程后续建设的最高层原则。",
      page: 44,
      total: 36,
      script: "这一页把我们的价值立场讲出来：我们不把 AI 神化，也不把它妖魔化。最重要的是让学生形成一种成熟的人机协作观：既能借力，也能质疑，既会使用，也能负责。",
      annotations: ["responsible AI（负责任的 AI）"],
      sources: [SRC.futureSDL, SRC.communitySurvey, SRC.chemrevSDL],
    },
    {
      type: "bullet",
      section: "带走什么",
      title: "这场讲座之后，学生至少应能完成四件事",
      subtitle: "如果做不到，说明讲座还没有讲清楚。",
      bullets: [
        "从实验视角，而不是从 buzzword（热词）视角理解 SDL。",
        "区分试错法、DOE 与 SDL 的关系与边界。",
        "识别一个研究问题是否适合 SDL 化。",
        "对真实自治实验系统提出更严谨的判断与质疑。"
      ],
      rightTitle: "更高一级的目标",
      rightBody: "把自己的课题逐步翻译成 objective、constraint、measurement、workflow 语言。",
      page: 45,
      total: 36,
      script: "如果学生能带走这四件事，这场讲座就值了。尤其是最后两条：识别哪些问题适合 SDL，和对真实系统保持判断能力。这比记住几个术语更重要。",
      annotations: [],
      sources: [SRC.fourthParadigm, SRC.box, SRC.chemrevSDL, SRC.alabNature],
    },
    {
      type: "bullet",
      section: "讲座资源",
      title: "讲座之后：继续从数字讲义站进入课程主线",
      subtitle: "网站不是展示品，而是课后继续学习的入口。",
      bullets: [
        "从 Foundations（基础）部分回看实验、DOE 与 SDL 的主线。",
        "从 A-Lab（自治实验室）案例页复读真实系统、争议与纠错。",
        "从 Case Studio 自己运行最小 live demo，观察推荐逻辑如何变化。",
      ],
      rightTitle: "建议学生课后做什么",
      rightBody: "重看 Foundations（基础）\n阅读 A-Lab 案例页\n自己运行 Case Studio demo",
      bottomTitle: "讲者用途",
      bottomBody: "网站保留动态演示与后续课程扩展空间；PPT 保留稳定教学交付能力。",
      page: 46,
      total: 36,
      script: "最后告诉学生，网站不是讲座结束后就无关了。它是课程的入口，也是案例和 demo 的继续学习平台。讲座结束之后，学生仍然可以从网站回到今天的主线继续理解。",
      annotations: ["网站：sdl-lecture.vercel.app"],
      sources: [SRC.chemrevSDL, SRC.alabNature],
    },
    {
      type: "quote",
      section: "结束页",
      quote: "在 AI 时代，重要的不是把实验交给机器，而是学会如何让机器进入负责任的实验科学。",
      source: "谢谢",
      body: "欢迎提问与讨论。",
      page: 47,
      total: 36,
      script: "我会用这句话收尾：关键不在于把实验交给机器，而在于如何让机器进入负责任的科学工作流。然后进入问答，优先接学生对适用边界、案例可信度和课题迁移的提问。",
      annotations: [],
      sources: [SRC.futureSDL, SRC.chemrevSDL],
      pace: "结束页停 10–15 秒，再进入问答；优先接边界、争议和迁移类问题。",
    },
  ];
}

function renderDeck(presentation, slides) {
  const total = slides.length;
  slides.forEach((meta, idx) => {
    const page = idx + 1;
    meta.page = page;
    meta.total = total;
    if (meta.type === "cover") {
      const slide = slideBase(presentation);
      header(slide, "讲座封面", page, total);
      shape(slide, { left: 88, top: 126, width: 210, height: 34 }, {
        fill: { type: "solid", color: C.panel },
        line: { width: 1, fill: C.line },
      });
      text(slide, { left: 108, top: 136, width: 190, height: 16 }, "研究生讲座 / 数字讲义版", {
        fontSize: 11,
        color: C.cyan,
        mono: true,
      });
      text(slide, { left: 88, top: 194, width: 980, height: 136 }, "AI时代的材料科学实验：\n从 DOE 到 Self-Driving Labs", {
        fontSize: 34,
        color: C.white,
        bold: true,
      });
      text(slide, { left: 92, top: 348, width: 900, height: 48 }, "重新理解实验、方法论与自驱实验室", {
        fontSize: 20,
        color: C.cyan,
      });
      text(slide, { left: 92, top: 430, width: 760, height: 72 }, "本讲面向材料科学与工程相关研究生和高年级本科生。\n主线不是“AI 更强了”，而是“实验正在被重新组织”。", {
        fontSize: 18,
        color: C.text,
      });
      slide.shapes.add({
        geometry: "rect",
        position: { left: 92, top: 560, width: 160, height: 6 },
        fill: { type: "solid", color: C.cyan },
        line: { width: 0, fill: C.cyan },
      });
      slide.shapes.add({
        geometry: "rect",
        position: { left: 264, top: 560, width: 260, height: 6 },
        fill: { type: "solid", color: C.blue },
        line: { width: 0, fill: C.blue },
      });
      slide.shapes.add({
        geometry: "rect",
        position: { left: 536, top: 560, width: 120, height: 6 },
        fill: { type: "solid", color: C.yellow },
        line: { width: 0, fill: C.yellow },
      });
      text(slide, { left: 92, top: 606, width: 900, height: 24 }, "关键词：Experiment（实验） / Design of Experiments（实验设计，DOE） / Self-Driving Labs（自驱实验室，SDL）", {
        fontSize: 12,
        color: C.soft,
      });
      addNotes(slide, meta.script, meta.annotations, meta.sources, meta.pace, meta.figureSuggestions);
      return;
    }
    if (meta.type === "agenda") {
      const slide = slideBase(presentation);
      header(slide, "讲座结构", page, total);
      titleBlock(slide, "今天的六个部分", "三小时讲座的主线是“实验”而不是“算法清单”。");
      const items = [
        "为什么今天必须重新理解实验",
        "MSE（材料科学与工程）实验图谱与目录学",
        "传统方法论：试错法与 DOE（实验设计）",
        "AI 时代的实验：什么是 SDL（自驱实验室）",
        "A-Lab（自治实验室）作为真实系统案例",
        "Case Studio：最小 live demo 与课程总结",
      ];
      items.forEach((item, i) => {
        const top = 220 + i * 62;
        shape(slide, { left: 104, top, width: 1060, height: 44 }, { fill: { type: "solid", color: i === 0 ? C.panel : C.panel2 } });
        text(slide, { left: 124, top: top + 10, width: 50, height: 18 }, `${String(i + 1).padStart(2, "0")}`, {
          fontSize: 12,
          mono: true,
          color: C.cyan,
        });
        text(slide, { left: 188, top: top + 10, width: 920, height: 18 }, item, {
          fontSize: 18,
          color: C.white,
        });
      });
      addNotes(slide, meta.script, meta.annotations, meta.sources, meta.pace, meta.figureSuggestions);
      return;
    }
    if (meta.type === "bullet") return bulletSlide(presentation, meta);
    if (meta.type === "divider") return dividerSlide(presentation, meta);
    if (meta.type === "cards") return cardsSlide(presentation, meta);
    if (meta.type === "compare") return compareSlide(presentation, meta);
    if (meta.type === "process") return processSlide(presentation, meta);
    if (meta.type === "image") return imageSlide(presentation, meta);
    if (meta.type === "quote") return quoteSlide(presentation, meta);
  });
}

async function build() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const presentation = Presentation.create({ slideSize: { width: W, height: H } });
  const slides = buildSlides();
  renderDeck(presentation, slides);
  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(FINAL_PPTX);
  await fs.writeFile(SUMMARY_JSON, `${JSON.stringify({ out: FINAL_PPTX, slideCount: presentation.slides.count }, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ out: FINAL_PPTX, slideCount: presentation.slides.count }, null, 2));
}

await build();
