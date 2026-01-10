# HSCHT-FE-MiniApp

## 技术栈

- **框架**：uni-app（Vue3）
- **构建工具**：Vite
- **状态管理**：Vuex
- **UI 组件库**：uview-plus
- **网络请求**：luch-request（封装于 `src/utils/request.js`）
- **样式**：SCSS

## 环境要求

- Node.js（建议 16+）
- npm
- 微信开发者工具（运行微信小程序时需要）

## 安装依赖

```bash
npm install
```

## 启动（开发）

### 微信小程序（APP1/APP2）

项目内置了切换脚本，会把对应配置覆盖到 `src/pages.json` / `src/manifest.json` / `.env`：

- APP1（海丝）：

```bash
npm run dev:mp-weixin:app1
```

- APP2（易广善）：

```bash
npm run dev:mp-weixin:app2
```

编译完成后，用微信开发者工具导入：

```
dist/dev/mp-weixin
```

### 其他平台（可选）

- App：

```bash
npm run dev:app
```

- H5：

```bash
npm run dev:h5
```

## 构建（发布）

### 微信小程序（APP1/APP2）

- APP1：

```bash
npm run build:mp-weixin:app1
```

- APP2：

```bash
npm run build:mp-weixin:app2
```

输出目录示例：

```
dist/build/mp-weixin
```

## 配置说明（APP1/APP2 切换）

- `src/pages.app1.json` / `src/pages.app2.json`：页面路由与 tabBar
- `src/manifest.app1.json` / `src/manifest.app2.json`：应用配置
- `.env.app1` / `.env.app2`：环境变量

业务标识：

- APP1：海丝
- APP2：易广善

切换命令：

- `npm run switch:app1`
- `npm run switch:app2`

## 常见问题

### 1. 微信开发者工具提示找不到 `pages/**/**.wxml`/`.wxss`

通常是当前构建产物里没有生成该页面：

- 建议先删除 `dist` 目录，再重新执行构建命令（避免旧产物干扰）：

```bash
rm -rf dist
```

Windows PowerShell：

```powershell
Remove-Item -Recurse -Force dist
```

- 确认运行的脚本是正确的（`dev:mp-weixin:app1` 或 `dev:mp-weixin:app2`）
- 确认微信开发者工具导入的是当前编译输出目录：`dist/dev/mp-weixin`
- 确认对应页面已在当前使用的 `src/pages.json`（由切换脚本生成）中配置

### 2. 编译提示 `uni-app 有新版本发布...`

这是**升级提示**，不影响编译是否能跑；是否升级按项目需要决定.
