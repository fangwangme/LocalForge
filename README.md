# LocalForge (HTML Tools)

LocalForge 是一个基于 **SharedWorker + sql.js** 的本地优先（Local-First）Web 工具集。它提供了一系列独立运行的 HTML 工具，所有工具共享同一个本地 SQLite 数据库，数据安全地存储在您的本地文件系统中。

## 🏗 核心架构 (Architecture)
- **多页应用 (MPA)**: 每个工具（如 LifeFlow、HIIT 计时器）都是独立的 HTML 文件，不依赖 `iframe`。
- **SharedWorker**: `js/shared-db-worker.js` 作为核心，托管内存中的 `sql.js` 数据库实例。所有打开的标签页连接到同一个 Worker，实现跨页面数据实时同步。
- **单写入者 (Single-Writer)**: 为了防止文件损坏，系统通过 `js/db-client.js` 协调一个"写入者"角色。只有拥有写入权限的标签页（通常是最近活动的页面或主页）负责调用 File System Access API 将数据从内存同步到本地 `.sqlite` 文件。
- **UI 组件化**: 使用 Web Components (`<local-header>`, `<local-sidebar>`) 实现统一的导航和界面风格。

## 📦 现有工具
*   **LifeFlow**: 个人生活日志，持续记录每一刻。支持计时器模式和快速记录，自定义标签分类。
*   **HIIT 计时器**: 高强度间歇训练计时，支持自定义运动/休息时间与轮数。
*   **图片编辑器**: 支持图片裁剪（16:9）、去水印（菱形填充算法）和格式转换。
*   **图片压缩**: 纯前端图片压缩工具，支持自定义大小和格式。

## 🚀 快速开始

1.  **启动服务**:
    由于使用了 ES Modules 和 SharedWorker，项目必须在 HTTP 服务器环境下运行（不能直接双击打开 html 文件）。
    ```bash
    ./start_server.sh start      # 正常模式 (端口 8092)
    ./start_server.sh --debug    # 调试模式 (端口 8093)
    ./start_server.sh stop       # 停止服务
    ./start_server.sh status     # 查看状态
    ```
2.  **访问**: 打开浏览器访问 `http://localhost:8092`。
3.  **数据库**: 首次使用时，建议在主页点击"设置 & 数据库" -> "新建本地数据库文件"，选择一个位置保存 `.sqlite` 文件。

## 💻 开发指南 (Development)

详细的开发规范请参考 [CONTRIBUTING.md](CONTRIBUTING.md)。

### 简要流程：
1.  **创建文件**: 复制现有工具的 HTML 结构。
2.  **引入组件**: 引入 `js/components.js` 和 `js/db-client.js`。
3.  **接入数据库**:
    ```javascript
    import { db } from './js/db-client.js';
    
    // 初始化表
    await db.execute("CREATE TABLE IF NOT EXISTS ...");
    
    // 查询
    const res = await db.query("SELECT * FROM ...");
    ```
4.  **注册导航**: 修改 `js/components.js` 将新工具加入侧边栏。

## 🛠 技术栈
*   **Frontend**: 原生 HTML5 / JavaScript (ES6+ Modules)
*   **Database**: [sql.js](https://sql.js.org/) (WebAssembly SQLite)
*   **State Sync**: SharedWorker
*   **Styling**: Tailwind CSS (CDN) + FontAwesome
*   **Charts**: Chart.js

## 📄 License
MIT