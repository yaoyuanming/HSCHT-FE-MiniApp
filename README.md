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

## My（我的）页面使用说明（不同 App 显示不同内容）

My 页位置：`src/pages/My/My.vue`

### 1. 差异点："我的服务"入口按 App 控制显示

My 页的差异主要在「我的服务」模块：页面内维护一份完整的服务列表（`allServiceList`），然后根据允许显示的 `key` 列表做过滤得到最终展示的 `serviceList`。

判定逻辑优先级：

- 优先使用环境变量 `VITE_MY_SERVICE_KEYS`（逗号分隔）
- 若 `VITE_MY_SERVICE_KEYS` 未配置或为空，则回退使用 `VITE_APP_KEY`（app1/app2）对应的默认映射

相关环境变量：

- `VITE_APP_KEY`：当前构建使用的业务标识（`app1` / `app2`）
- `VITE_MY_SERVICE_KEYS`：可选，手动指定“我的服务”显示项（例如：`health,company,gov`）

### 2. 当前默认映射（未配置 VITE_MY_SERVICE_KEYS 时）

默认映射定义在 `My.vue` 内：

- APP1（`VITE_APP_KEY=app1`）：`health`、`company`、`gov`、`consult`
- APP2（`VITE_APP_KEY=app2`）：`project`、`course`

对应的 `allServiceList`（key 清单）：

- `health`：健康档案
- `company`：企业档案
- `gov`：工单管理
- `consult`：服务咨询
- `project`：我的项目
- `course`：我的课程

### 3. 如何临时/按环境调整显示（推荐用于测试或灰度）

在对应 `.env.*` 中设置：

```env
VITE_MY_SERVICE_KEYS=health,company,gov,consult
```

说明：

- 不配置该变量时，会按 `VITE_APP_KEY` 走默认映射
- 配置为空字符串（例如 `VITE_MY_SERVICE_KEYS=`）会被当作“未配置/空”，同样回退到默认映射

### 4. 如何新增一个新的“我的服务”入口

- 在 `src/pages/My/My.vue` 的 `allServiceList` 中新增一项（包含 `name` / `icon` / `key`）
- 在 `onNavClick(type)` 的 `switch` 中新增对应 `case` 并实现跳转
- 若需要对不同 App 进行差异展示：
  - 给 `VITE_MY_SERVICE_KEYS` 增加对应 `key`，或
  - 在 `myServiceAllowByAppKey` 中为 `app1/app2` 增加对应 `key`

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
