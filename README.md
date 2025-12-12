# LocalForge (HTML Tools)

这是一个基于 **App Shell** 架构的本地 HTML 工具集。

## 🏗 架构说明
- **App Shell (`index.html`)**: 
  - **角色**: 主控台 & 数据库宿主。
  - **职责**: 负责 UI 框架、路由（通过 `iframe` 切换工具）、以及基于 `sql.js` + `File System Access API` 的统一数据库管理。
- **工具页面 (`*.html`)**: 
  - **角色**: 独立的子应用。
  - **职责**: 具体的业务逻辑。如果需要持久化数据，通过 `postMessage` 请求主控台处理。

---

## 🚀 如何添加新工具 (How to Add a New Tool)

根据工具是否需要保存数据，分为两种集成模式。

### 场景 A：添加独立工具 (无需数据库)
此类工具仅在前端运行（如计算器、文本转换、正则表达式测试），不需要保存结构化数据。

#### 开发步骤:
1. **创建文件**: 新建 `my_tool.html`。
2. **注册入口**:
   - 在 `index.html` 的 side bar (`<nav>`) 添加链接。
   - 在 `index.html` 的 Dashboard (`#dashboard-view`) 添加卡片。
3. **完成**: 无需编写任何后端逻辑。

#### 🤖 AI Prompt 示例:
> "请帮我添加一个【颜色转换器】工具。这是一个纯前端工具，支持 HEX 转 RGB。请创建 `color_converter.html`，并在 `index.html` 的侧边栏和主页卡片中添加对应的入口。"


### 场景 B：添加数据集成工具 (需要读写数据库)
此类工具需要保存记录（如记账、日记、打卡、待办事项），需与 `index.html` 进行通信。

#### 开发步骤:
1. **定义数据结构**: 确定需要存储的字段（表名、列名）。
2. **创建文件**: 新建 `my_data_tool.html`。
3. **实现通信**:
   - 使用 `window.parent.postMessage` 发送操作请求（如 `SAVE_ITEM`, `DELETE_ITEM`）。
   - 监听 `message` 事件接收 `DB_UPDATED` 或查询结果。
4. **更新 App Shell (`index.html`)**:
   - **初始化表**: 在 `initAllTables()` 函数中添加新表的 `CREATE TABLE` 语句。
   - **处理消息**: 在 `message` 事件监听器中添加 `else if (msg.type === 'YOUR_ACTION')` 分支，执行 SQL 并调用 `saveDatabaseToDisk()`。
5. **注册入口**: 同场景 A。

#### 🤖 AI Prompt 示例:
> "请帮我添加一个【简易记账】工具。
> 1. 创建 `expense.html`，界面包含金额输入框和历史列表。
> 2. 此工具需要读写数据库。请在 `index.html` 中：
>    - 创建一个 `expenses` 表 (字段: id, date, item, amount, category)。
>    - 实现 `SAVE_EXPENSE` 和 `DELETE_EXPENSE` 的消息处理逻辑，确保数据能保存到本地文件。
> 3. 在主页和侧边栏添加入口。"

---

## 🛠 开发参考

### 通信协议 (Window PostMessage)
**1. 查询数据 (Query)**
```javascript
// 在子页面调用
window.parent.postMessage({
    type: 'REQUEST_DB_DATA',
    requestId: 'req_' + Date.now(),
    sql: "SELECT * FROM my_table ORDER BY date DESC"
}, '*');
```

**2. 保存数据 (Save/Update)**
```javascript
// 在子页面调用
window.parent.postMessage({
    type: 'SAVE_MY_DATA', // 自定义类型
    data: { name: 'test', value: 123 }
}, '*');
```

### 数据库初始化
在 `index.html` 中扩展 `initAllTables`:
```javascript
function initAllTables() {
    initHiitTables(); // 现有工具
    initMyNewToolTables(); // 新增工具 <--- 添加这一行
}

function initMyNewToolTables() {
    db.run("CREATE TABLE IF NOT EXISTS my_table (...)");
}
```
