# ACH 分析工具 v2.0

![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.1-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-cyan)

一个专业的**竞争性假设分析**（Analysis of Competing Hypotheses，ACH）工具，帮助分析师进行结构化的假设评估和决策支持。

## 🎯 项目简介

ACH分析是由美国中央情报局（CIA）资深分析师Richards Heuer开发的一种结构化分析技术，用于减少分析偏见，提高情报分析的客观性和准确性。本工具将ACH方法论数字化，提供完整的8步分析流程。

### 🔍 什么是ACH分析？

ACH分析通过系统性地评估多个竞争性假设与可用证据的一致性，帮助分析师：
- 识别和减少认知偏见
- 提高分析结论的可靠性
- 明确假设之间的区别
- 评估证据的诊断价值

## ✨ 功能特性

### 🎨 用户界面
- **现代化设计**：采用TailwindCSS的响应式UI设计
- **直观导航**：清晰的步骤指引和进度跟踪
- **实时反馈**：即时的操作反馈和状态提示
- **多主题支持**：适配不同使用场景

### 📊 分析功能
- **假设管理**：支持假设的增删改查、排序和优先级设置
- **证据收集**：多维度证据管理，包含权重和可靠性评估
- **分析矩阵**：可视化的假设-证据评分矩阵
- **敏感性分析**：测试结论对参数变化的敏感程度
- **智能建议**：基于数据质量的优化建议
- **报告生成**：多格式的专业分析报告

### 🔧 技术特性
- **数据持久化**：本地存储分析数据
- **实时计算**：动态的得分计算和排序
- **导出功能**：支持CSV、文本等多种格式
- **项目管理**：多项目管理和切换

## 🛠️ 技术栈

### 前端框架
- **React 18.3.1** - 用户界面框架
- **TypeScript 5.5.3** - 类型安全的JavaScript超集
- **Vite 5.4.1** - 现代化构建工具

### UI组件
- **TailwindCSS 3.4.1** - 实用优先的CSS框架
- **Radix UI** - 无障碍的UI基础组件
- **Lucide React** - 现代化图标库
- **Framer Motion** - 动画库

### 状态管理
- **Zustand** - 轻量级状态管理库

### 开发工具
- **ESLint** - 代码质量检查
- **PostCSS** - CSS处理工具

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装和运行

```bash
# 克隆项目
git clone <repository-url>
cd ach-analysis-tool-v2

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 开发命令

```bash
# 代码检查
npm run lint

# 类型检查
npm run type-check

# 启动开发服务器
npm run dev
```

## 📋 使用指南

### 8步分析流程

#### 步骤1：提出假设 💡
- 针对分析议题制定3-7个相互排斥的假设
- 设置假设的初始置信度和优先级
- 支持假设的拖拽排序和批量管理

#### 步骤2：列出论据清单 📄
- 收集支持或反对各假设的证据
- 评估证据的权重和可靠性
- 按类型分类管理证据（支持/反对/中性）

#### 步骤3：构建分析矩阵 📊
- 创建假设-证据评分矩阵
- 使用-2到+2的评分尺度
- 实时计算假设得分和排序

#### 步骤4：精简矩阵 🔍
- 智能识别低价值证据
- 检测相似假设并建议合并
- 提供矩阵优化建议

#### 步骤5：得出初步结论 🎯
- 基于矩阵分析自动生成结论
- 计算结论置信度
- 识别关键支撑证据

#### 步骤6：分析证据敏感性 📈
- 单变量敏感性测试
- 权重和可靠性敏感性分析
- 评估结论稳定性

#### 步骤7：报告结论 📋
- 生成专业分析报告
- 支持多种导出格式
- 包含完整的分析过程和结果

#### 步骤8：分析总结 📊
- 分析质量评估
- 完整性检查
- 生成分析洞察和改进建议

### 项目管理
- **项目创建**：快速创建新的分析项目
- **项目切换**：在多个分析项目间切换
- **进度跟踪**：实时显示分析进度
- **数据备份**：支持项目数据的导入导出

## 📁 项目结构

```
ach-analysis-tool-v2/
├── public/                 # 静态资源
├── src/
│   ├── components/         # React组件
│   │   ├── steps/         # 8步分析组件
│   │   ├── ui/            # 基础UI组件
│   │   └── layout/        # 布局组件
│   ├── store/             # Zustand状态管理
│   ├── types/             # TypeScript类型定义
│   ├── lib/               # 工具函数
│   └── styles/            # 样式文件
├── package.json           # 项目配置
├── vite.config.ts         # Vite配置
├── tailwind.config.js     # TailwindCSS配置
└── tsconfig.json          # TypeScript配置
```

### 核心组件
- `ACHAnalysis.tsx` - 主分析界面
- `ProjectManagement.tsx` - 项目管理
- `steps/Step*.tsx` - 8步分析组件
- `analysisStore.ts` - 分析数据状态管理

## 🔧 配置说明

### 环境变量
项目使用默认配置，无需额外环境变量。

### 自定义配置
- 修改 `tailwind.config.js` 自定义样式主题
- 修改 `vite.config.ts` 自定义构建配置

## 🤝 贡献指南

我们欢迎任何形式的贡献！

### 提交流程
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发规范
- 遵循 ESLint 规则
- 使用 TypeScript 严格模式
- 组件采用函数式编程
- 提交信息使用约定式提交格式

## 📚 ACH方法论参考

- Richards J. Heuer Jr. "Psychology of Intelligence Analysis"
- CIA训练教材：Structured Analytic Techniques
- 《情报分析心理学》中文版

## 🐛 问题反馈

如果您发现bug或有功能建议，请：
1. 查看现有的 [Issues](../../issues)
2. 创建新的 Issue 并提供详细信息
3. 包含复现步骤和环境信息

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Richards J. Heuer Jr.](https://en.wikipedia.org/wiki/Richards_J._Heuer_Jr.) - ACH方法论创始人
- [CIA Center for the Study of Intelligence](https://www.cia.gov/resources/csi/) - 结构化分析技术
- React、TypeScript、TailwindCSS 等开源项目

## 📞 联系方式

- 项目地址：[GitHub Repository](../../)
- 问题反馈：[Issues](../../issues)
- 讨论交流：[Discussions](../../discussions)

---

**🎯 ACH分析工具 - 让决策更科学，让分析更客观**
