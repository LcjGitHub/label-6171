# Book Journal - 阅读记录管理系统

一个基于 Vue 3 + TypeScript + Vite 构建的个人阅读记录与愿望清单管理应用。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **类型系统**: TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia (带持久化插件)
- **路由**: Vue Router
- **UI 组件库**: Element Plus
- **日期处理**: Day.js
- **模糊搜索**: Fuse.js

## 本地开发

### 环境要求

- Node.js >= 20.x
- npm >= 10.x

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

开发服务器默认运行在 `http://localhost:3101`，支持热模块替换（HMR）。

## 构建与预览

### 类型检查与生产构建

```bash
npm run build
```

该命令会依次执行以下操作：
1. 运行 `vue-tsc -b` 进行全局 TypeScript 类型检查
2. 类型检查通过后，执行 `vite build` 生成优化后的生产环境代码

构建产物将输出到 `dist/` 目录。

### 本地预览生产构建

```bash
npm run preview
```

在本地启动一个静态服务器来预览 `dist/` 目录中的生产构建产物，用于在部署前验证构建结果。

## 持续集成 (CI) 流水线

项目配置了 GitHub Actions 持续集成流水线，在以下场景会自动触发：

- **代码推送 (Push)**: 向任意分支推送代码时
- **合并请求 (Pull Request)**: 向任意分支发起或更新合并请求时

流水线配置文件位于 [.github/workflows/ci.yml](.github/workflows/ci.yml)。

### 流水线阶段说明

流水线包含三个核心阶段，任一阶段失败都会标记整个检查为不通过（❌），阻止问题代码进入主分支。

#### 1. 安装依赖 (Install dependencies)

```bash
npm ci
```

- **作用**: 根据 `package-lock.json` 安装项目所有依赖
- **特点**: 使用 `npm ci` 而非 `npm install`，确保依赖版本与锁定文件完全一致，避免版本漂移问题
- **失败原因**: 通常是 `package.json` 与 `package-lock.json` 不同步，或依赖包发布源不可用
- **缓存优化**: 通过 `actions/setup-node` 的 npm 缓存机制，加速后续流水线运行

#### 2. 类型检查 (Type check)

```bash
npx vue-tsc -b
```

- **作用**: 对整个项目进行 TypeScript 静态类型检查，包括 `.ts` 文件和 `.vue` 单文件组件中的脚本
- **重要性**: 在编译前捕获类型错误，防止运行时因类型不匹配导致的 Bug
- **检查范围**: 
  - 所有 `src/**/*.ts`、`src/**/*.tsx`、`src/**/*.vue` 文件
  - 启用严格模式（strict）、未使用变量/参数检测等严格规则
- **失败原因**: 类型不匹配、缺少类型定义、使用了未定义的变量或导入等

#### 3. 生产构建 (Production build)

```bash
npm run build
```

- **作用**: 执行完整的生产环境构建流程，验证代码能否成功编译打包
- **包含内容**:
  - 再次执行类型检查（作为 `npm run build` 脚本的一部分）
  - Vite 打包优化：代码压缩、Tree-shaking、资源哈希、分包策略等
  - 生成可部署的静态资源文件到 `dist/` 目录
- **失败原因**: 语法错误、模块解析失败、资源路径问题等编译时错误

### 查看流水线结果

1. 进入 GitHub 仓库页面
2. 点击 **Actions** 标签页
3. 选择对应的 CI 工作流运行记录
4. 展开 **build-and-check** 任务查看各阶段的详细日志
