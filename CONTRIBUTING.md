# LocalForge 开发指南

本文档旨在为 LocalForge 项目添加新工具（Tool）提供标准化的开发规范。遵循此规范可确保新工具与现有系统在架构、UI 和数据持久化方面保持一致。

## 1. 目录结构

所有新工具应遵循以下文件组织结构：

```text
LocalForge/
├── your_tool_name.html      # 工具入口 HTML
├── js/
│   ├── your_tool_name.js    # 工具核心业务逻辑
│   ├── components.js        # [共享] UI 组件 (Header, Sidebar)
│   └── db-client.js         # [共享] 数据库客户端
├── css/
│   └── style.css            # [共享] 全局样式
```

## 2. HTML 模板规范

新工具的 HTML 文件应包含以下核心部分：

### 2.1 头部引用 (Head)

必须引入 Tailwind CSS、FontAwesome、全局样式和组件脚本。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>工具名称 - LocalForge</title>
    
    <!-- 依赖库 (按需添加其他库) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    
    <!-- 核心样式与组件 -->
    <link rel="stylesheet" href="css/style.css">
    <script type="module" src="js/components.js"></script>
</head>
```

### 2.2 页面布局 (Body Layout)

必须使用 Flex 布局以支持侧边栏 (`local-sidebar`)。

```html
<body class="bg-slate-900 text-white font-sans h-screen flex overflow-hidden">
    
    <!-- 1. 全局侧边栏 -->
    <local-sidebar></local-sidebar>

    <!-- 2. 内容包装器 -->
    <div class="flex-1 flex flex-col min-w-0">
        
        <!-- 3. 工具页眉 -->
        <local-header title="工具名称">
            <!-- 图标 (slot="icon") -->
            <i slot="icon" class="fas fa-tools text-blue-500"></i>
            
            <!-- 顶部操作按钮 (slot="actions") -->
            <div slot="actions" class="flex items-center gap-2">
                <button id="myActionBtn" class="...">操作</button>
            </div>
        </local-header>

        <!-- 4. 主内容区域 (可滚动) -->
        <div class="flex-1 overflow-y-auto">
            <main class="max-w-4xl mx-auto px-4 py-8">
                <!-- 你的工具界面代码 -->
            </main>
        </div>
    </div>
    
    <!-- 5. 业务逻辑脚本 -->
    <script type="module" src="js/your_tool_name.js"></script>
</body>
</html>
```

## 3. 数据库接入规范 (Optional)

如果您的工具需要持久化存储数据（如历史记录、设置），请使用 `js/db-client.js`。

### 3.1 引入数据库

在 `js/your_tool_name.js` 中：

```javascript
import { db } from './db-client.js';

// 监听数据库就绪事件
db.on('db_opened', async () => {
    await initSchema();
    await loadData();
});

// 如果脚本加载时数据库已就绪（例如从其他页面跳转过来）
if (db.isOpen) {
    initSchema();
    loadData();
}
```

### 3.2 初始化表结构 (Schema)

工具应自行负责其所需的数据库表。使用 `IF NOT EXISTS` 避免重复创建。

```javascript
async function initSchema() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS my_tool_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT,
            created_at TEXT
        )
    `);
}
```

### 3.3 数据操作

使用 `db.query()` 查询数据，使用 `db.execute()` 修改数据。

```javascript
// 查询
const results = await db.query("SELECT * FROM my_tool_data ORDER BY created_at DESC");
// 结果格式: [{ columns: [...], values: [[...], [...]] }]

// 插入/更新
await db.execute(
    "INSERT INTO my_tool_data (content, created_at) VALUES (?, ?)", 
    ["Hello World", new Date().toISOString()]
);
```

**注意**: 数据修改后，`db-client.js` 会自动触发持久化逻辑（保存到 IndexedDB，如果是 Writer 还会保存到本地文件），无需手动调用保存方法。

## 4. 侧边栏导航注册

为了让新工具在侧边栏中显示，你需要修改 `js/components.js` 中的 `LocalSidebar` 类。

1.  打开 `js/components.js`。
2.  找到 `render()` 方法中的 `innerHTML` 模板。
3.  在合适的分类下添加新的 `<li>` 链接：

```html
<li>
    <a href="your_tool_name.html" class="flex items-center px-4 py-3 ... group ${justifyClass}">
        <i class="fas fa-tools w-6 text-center ... group-hover:text-green-400 ..."></i>
        <span class="${hideTextClass}">工具名称</span>
    </a>
</li>
```

## 5. UI/UX 风格指南

*   **配色**: 使用 Tailwind CSS 的 Slate 色系 (`bg-slate-900`, `text-slate-200`) 作为深色模式基调。
*   **强调色**: 使用 `text-blue-500`, `text-rose-500` 等区分不同功能或状态。
*   **交互**: 按钮应有 `hover` 效果和 `transition` 过渡动画。
*   **滚动条**: 系统会自动应用 `css/style.css` 中的自定义滚动条样式，无需额外处理。
