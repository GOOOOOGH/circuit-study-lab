# GitHub 源码与运行说明

目标仓库：GOOOOOGH/circuit-study-lab，公开源码。网站现有 Sites 访问权限独立保留，公开仓库不等于网站公开可访问。

## 本地运行

需要 Node.js 20.19+ 或 22.12+、pnpm，以及项目依赖。复制/克隆仓库后在根目录运行：

```sh
pnpm install --frozen-lockfile
pnpm run build
pnpm run test
pnpm run dev
```

开发地址 http://127.0.0.1:5173/ 。生产构建在 dist/；可运行 `pnpm run preview` 从 http://127.0.0.1:4173/ 查看。停止服务按 Ctrl+C。构建先同步课程并生成项目包，因此首次安装后先 build 再 test；不要双击 dist/index.html。

macOS 的启动文件优先使用系统 Node，再检查当前用户的 Codex 运行时；没有 Node 时会明确提示。其他系统直接使用上面的 pnpm 命令。

## 内容维护

- docs/01–04 是课程范围、网站架构、质量规则和修改流程的依据。
- content/lessons.json 和 content/courses/*.json 是原始讲义；教材、来源、案例、术语、路线、项目分别保存在 content/ 对应文件。
- src/components 是页面和实验显示；src/experiments 是独立计算模型；tests 验证公式、边界和旧学习记录契约。
- public/projects 保留原创任务/模板；构建生成模型结果和 ZIP。生成的 src/generated、public/curriculum、public/planning 不作为编辑入口。
- 学习记录在浏览器本地存储，不包含于仓库，也不因重建自动清除。稳定课程 ID 和已有题目键不能随意改名。

指定教材正文审核和真实硬件实测仍待完成。课程为原创讲义，不包含教材扫描件、第三方完整教材或虚构硬件测量结果；引用范围详见 docs/08。

## 导出范围

GitHub 交付版本保留课程、大纲、网页源码、测试、锁文件和原创项目模板；排除 `.git/`、`.openai/`、`.env*`、依赖目录、构建输出、日志和自动生成缓存。现有 Sites 项目身份留在原本地项目，不能将其当作其他用户自己的站点配置。

仓库中没有给出第三方资料的再发布许可，参考链接不代表对应教材/图片/资料可以随意复制。原作者授权和项目开源许可证是独立事项；此处不擅自替用户选择许可证。
