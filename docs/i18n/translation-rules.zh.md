# 翻译规则

[English](translation-rules.md) | 中文

如何在本仓库的文档配对两侧之间进行翻译。两种语言具有同等效力（[README.md](README.md)）：变更可以先以任一语言撰写，那一侧就是该次更新的来源——这些规则约束对应版本的生成或更新。它们对人和 agent 同样有效。常规的 agent 工作在一次术语引导的单遍中直接翻译变更内容；扩展的 [`translate-docs`](../../.agents/skills/translate-docs/SKILL.md) 工作流仅在用户显式调用时运行。规则级别遵循 RFC 2119 用法：**MUST** / **MUST NOT** 是门禁或评审阻断项；**SHOULD** 需要说明理由才能偏离；**MAY** 可自行决定。

## 忠实性

- 对应版本 MUST 表达撰写侧所述的内容——不增加任何行为、前置条件、警告、版本声明或示例，也不遗漏任何内容。如果配对在实质上不一致，任何语言都不默认获胜：修正错误的一侧，然后在同一变更中把另一侧同步过来。
- 对应版本 SHOULD 以目标语言读起来像自然的母语技术写作，而不是逐字对译。翻译意思，在目标语法需要处重组句子，并保持作者的语域——简洁的保持简洁。
- 不要翻译不可译之物：如果一句话因依赖源语言习语而难以自然呈现，翻译其意思，而非习语。

## 语态

- 以母语技术作者复述内容的方式来写，而不是以译者逐句转写的方式来写，同时保留每一个源句：不增不减——流畅性绝不能成为丢失句子的理由。
- 当目标语言会使主语含糊时，给句子一个明确的施动者；对中文，用实际施动者（系统、门禁、评审人）替换含糊的被动或抽象主语。
- 优先使用目标语言既有的工程惯用语，而非生硬的直译（false positive/negative 作 误报／漏检，enforcement frontier 作 执行红线）；本地化隐喻而不是照搬。
- 按语义单元拆分长段落——一个想法一段。段落边界 MAY 与源文不同；结构签名不统计段落。
- 译入中文时，类别名词用中文并在首次出现处加英文标注（实操手册（cookbook））；译入英文时，使用惯用的英文类别名。字面意义上的目录或文件引用保持代码格式的英文。
- 第二人称用 你，不用 您。

## 结构保持

配对门禁检查标题层级、围栏代码块、表格行列数量、列表类型、有序列表起始值、列表条目数量和链接目标。其余框架手工保持；配对文件 MUST 一一对应地匹配：

- 标题层级（相同级别、相同顺序——标题文本要翻译），
- 列表形态与编号，
- 表格（相同列、相同行序；表头单元格按术语表翻译），
- 围栏代码块——逐字节相同，包括注释；配对签名比较它们的 info 字符串和内容，
- 行内代码段（命令、标志、配置键、文件路径、事件名、API 名、版本号）——逐字保留，永不翻译或重排，
- 链接与锚点：每个相对链接 MUST 在两个文件中指向相同目标——按约定是 `.md` 路径，而非 `.zh.md` 同级文件——这样当一个配对先于其邻居落地时链接不会失效。唯一的中文专属链接是语言切换链接。链接文本要翻译；目标不翻译。

仓库的 Markdown 约定原样适用于 `.zh.md` 文件：每段一行（`verify-md-wrap`）、相对链接可解析（`verify-md-links`）、恰好一个末尾换行。

## 术语

- [terminology.md](terminology.md) 是双向的权威来源。翻译前加载它；每个已列术语 MUST 遵循其行和其禁用译法。中文目标用「中文」列；英文目标用「English」列。
- 对中文目标，未列出的技术术语 MAY 采用主流中文开源或厂商来源的既定译法，并在 PR 中注明出处。没有此类先例时，它 MUST 保持英文并列入「待定术语」，附一个建议译法。
- 对英文目标，使用既定的英文技术术语。如果源术语没有无歧义的既定对应，保留它并加简短说明性注释，列入待定术语。两个方向都不得临时发明译法；已定术语在同一 PR 或后续 PR 中进入 [terminology.md](terminology.md)。

## 排版

这些规则约束中文侧；英文侧遵循仓库常规的 Markdown 约定。中英混排规则遵循 [MDN 简体中文翻译指南](https://github.com/mdn/translated-content/blob/main/docs/zh-cn/translation-guide.md)、[Kubernetes zh-cn 本地化指南](https://kubernetes.io/zh-cn/docs/contribute/localization_zh/) 和 [中文文案排版指北](https://github.com/sparanoid/chinese-copywriting-guidelines) 的跨项目共识：

- MUST 在中文与拉丁文之间、中文与数字之间加一个半角空格：`每个 skill 注册 3 个 tool`。全角标点与任何字符之间不加空格。
- MUST 在中文行文中使用全角（中文）标点：`，。：；？！（）「」`。半角标点保留在代码段内和数字中（`3.5`、`1,024`）。
- 中文行文 SHOULD 优先使用冒号、句号、逗号或圆括号而非破折号。仅当没有其他标点能自然保留句子时才保留破折号。
- 枚举逗号：中文并列项列表使用顿号（、），不用逗号。
- MUST NOT 使用全角数字或全角拉丁字母——绝不 `１２３`，总是 `123`。
- 专有名词保持规范大小写：GitHub、TypeScript、DeepSeek——除非引用代码，否则绝不写作 `github`/`Github`。
- 强调标记（`**粗体**`、`*斜体*`）保持在源文的相同跨度上；中文没有斜体，所以不要替换为引号或其他装饰。

## 质量门槛

- 当一位双语工程师单独阅读任一文件，都能得到阅读另一文件读者所得的一切——相同的事实、相同的注意事项、相同的语气——且不多任何东西时，配对才算完成。
- 运行 `node scripts/verify-translation-pairing.mjs` 以及 `npm run doc-gates` 的其余部分，检查记录、切换链接、标题层级、代码块、表格行列数量、列表类型、有序列表起始值、列表条目数量、链接和仓库 Markdown 规则。人工评审负责列表与表格顺序、非规范列表编号、行内代码、强调、含义、术语和语气。

## 参考资料

- [中文文案排版指北](https://github.com/sparanoid/chinese-copywriting-guidelines) —— 中英混排空格与标点的事实社区标准。
- [MDN zh-CN translation guide](https://github.com/mdn/translated-content/blob/main/docs/zh-cn/translation-guide.md) —— 空格、标点和术语表实践。
- [Kubernetes zh-cn localization guide](https://kubernetes.io/zh-cn/docs/contribute/localization_zh/) —— 术语首次出现和标点实践。
- [Microsoft Simplified Chinese style guide](https://learn.microsoft.com/en-us/globalization/reference/microsoft-style-guides) —— 正式的厂商本地化基线。
