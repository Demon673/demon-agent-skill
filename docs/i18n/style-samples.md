# 翻译语体样例（style samples）

本文件是翻译语体的校准锚点：每组样例是一段英文原文与一段人工定稿的中文译文，覆盖本仓库文档的主要文体。**译文的语体以这些样例为准**——文体样例的效力高于对语气的文字描述，但术语表、忠实性与结构规则仍然优先。翻译或评审时对照最接近的文体样例。本文件中英对照、自成双语，不参与配对（见 [README.md](README.md) 排除清单）。

维护方式：人工评审校准出新的金标段落后追加到对应文体；发现语义、结构或术语错误时直接修正。新增或修正样例都需经过 PR 评审。

## ① 机制描述

> The consistency record holds the full git blob hash of each side as of the last time the two were confirmed to say the same thing. Blob hashes, not commit hashes, so the record is computable for files edited in the same change, and consistency is a pure content comparison.

一致性记录保存两侧在上一次确认表达相同内容时的完整 git blob 哈希。用的是 blob 哈希而非提交哈希，因此记录可以在同一变更中编辑的文件上计算，一致性是纯粹的内容比较。

## ② 政策声明

> The gate's limit, stated plainly: a green gate means the pair was confirmed consistent at these exact contents, not that the confirmation was sound. It checks hashes and Markdown structure; it cannot judge whether the two sides actually say the same thing — that is the reviewer's half of the contract.

门禁的局限要说明白：绿灯意味着配对在这些确切内容上被确认一致，而不是确认本身可靠。它检查哈希和 Markdown 结构；它无法判断两侧是否真的表达了相同内容——那是评审者的一半契约。

## ③ Agent Note 论证

> Keep it active when its alternatives, ownership boundary, negative guarantee, or reintroduction condition remains useful. Never archive a proposed note: reject an obsolete proposal. Keep a rejected note only while it prevents a plausible mistake.

当它的备选方案、所有权边界、负面保证或重新引入条件仍然有用时，保持活跃。提案类 note 永不封存：废弃的提案应予以否决。仅当被否决的 note 仍能防止一个似是而非的错误时才保留。

## 从样例提炼的要点

- 语体是规范制度文：完整主谓、确定语气；不口语化，也不学术腔。
- 给句子补显式执行主体：英文的被动句和抽象主语，中文写成「系统／门禁／工具／评审人」做主语。
- 用中文工程惯用语替换直译：false positive/negative → 误报／漏检、reviewable act → 评审凭证。
- 类别名词说中文并在首现括注英文：实操手册（cookbook）、事故复盘（postmortem）；指目录或路径时保留代码体英文。
- 母语重写不等于删减：原文每个语义成分都要落地。
- 样例与 [terminology.md](terminology.md) 冲突时，以术语表为准。
- 代码体标识符（命令、标志、文件路径、事件名）在译文中保留 code span 原文，不得口语化改写。
