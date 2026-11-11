# 页面配图

architecture.png 与 worktable.png 由内置 imagegen 生成，作为 E「柔和人文」设计的装饰配图。它们不代表公司的实际办公地址、办公场所或已交付项目。原始提示词见同目录 prompts.json。

页面通过 Astro Image 组件引用原图，由 Astro 在构建时生成不同宽度的 WebP；首屏图优先加载，其余图片延迟加载。替换图片时应同时检查手机裁切与桌面显示。
