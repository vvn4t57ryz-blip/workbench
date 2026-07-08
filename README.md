# 效率工作台 - 云端数据同步版本

一个简约商务风格的效率工作台应用，支持待办管理、日程规划、资讯浏览等功能，现已支持云端数据同步。

## ✨ 核心特性

- 📝 **待办管理** - 四象限分类、优先级设置、进度跟踪
- 📅 **日程规划** - 甘特图视图、关联待办、时间管理
- 📊 **信息看板** - 行业资讯聚合、实时更新
- ☁️ **云端同步** - Supabase 支持，跨设备数据同步
- 🔐 **用户认证** - 邮箱登录，数据按用户隔离
- 📱 **响应式设计** - 手机、平板、电脑全平台适配
- 💾 **降级模式** - 未配置云端时自动使用 localStorage

---

## 🚀 快速开始

### 方式一：本地运行（无需云端配置）

1. 克隆项目到本地
2. 直接打开 `index.html` 文件
3. 应用将使用 localStorage 本地存储模式

### 方式二：云端同步部署

按照以下步骤配置 Supabase 云端同步功能。

---

## 📋 Supabase 配置指南

### 第一步：注册 Supabase 账号

1. 访问 [Supabase 官网](https://supabase.com/)
2. 点击 "Start your project" 注册账号
3. 可以使用 GitHub 账号直接登录（推荐）
4. 验证邮箱后即可创建项目

**注意**：Supabase 免费套餐提供：
- 500MB 数据库存储
- 1GB 文件存储
- 50,000 月活跃用户
- 无限 API 请求（有速率限制）

对于个人使用完全足够！

---

### 第二步：创建 Supabase 项目

1. 登录 Supabase Dashboard
2. 点击 "New Project"
3. 填写项目信息：
   - **Name**：效率工作台（或自定义名称）
   - **Database Password**：设置数据库密码（请记住）
   - **Region**：选择离您最近的区域（推荐 Northeast Asia (Tokyo)）
4. 点击 "Create new project"
5. 等待项目初始化完成（约 2 分钟）

---

### 第三步：创建数据库表

项目初始化完成后，需要在 SQL Editor 中执行以下脚本创建数据表。

#### 打开 SQL Editor

1. 在项目 Dashboard 左侧菜单找到 "SQL Editor"
2. 点击进入 SQL Editor
3. 点击 "New query" 创建新查询

#### 执行建表脚本

复制以下 SQL 脚本并执行：

```sql
-- ============================================
-- 效率工作台数据库表结构
-- ============================================

-- 1. 待办任务表
CREATE TABLE todos (
  id BIGINT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'week',
  deadline TEXT,
  quadrant TEXT DEFAULT 'normal-normal',
  priority TEXT DEFAULT 'medium',
  partners TEXT DEFAULT '',
  progress INTEGER DEFAULT 0,
  description TEXT DEFAULT '',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 日程表
CREATE TABLE schedules (
  id BIGINT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  start TEXT NOT NULL,
  end TEXT NOT NULL,
  name TEXT NOT NULL,
  parent_todo_id BIGINT,
  quadrant TEXT DEFAULT 'normal-normal',
  status TEXT DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  location TEXT DEFAULT '',
  participants TEXT DEFAULT '',
  note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 收藏表
CREATE TABLE favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  news_id BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, news_id)
);

-- 4. 浏览历史表
CREATE TABLE history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  news_id BIGINT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, news_id)
);

-- ============================================
-- 创建索引以提升查询性能
-- ============================================

-- todos 表索引
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_deadline ON todos(deadline);

-- schedules 表索引
CREATE INDEX idx_schedules_user_id ON schedules(user_id);
CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_schedules_parent_todo ON schedules(parent_todo_id);

-- favorites 表索引
CREATE INDEX idx_favorites_user_id ON favorites(user_id);

-- history 表索引
CREATE INDEX idx_history_user_id ON history(user_id);
CREATE INDEX idx_history_viewed_at ON history(viewed_at);

-- ============================================
-- 设置 Row Level Security (RLS) 确保数据隔离
-- ============================================

-- 启用 RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- todos 表策略
CREATE POLICY "用户只能查看自己的待办" ON todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的待办" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的待办" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的待办" ON todos
  FOR DELETE USING (auth.uid() = user_id);

-- schedules 表策略
CREATE POLICY "用户只能查看自己的日程" ON schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的日程" ON schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的日程" ON schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的日程" ON schedules
  FOR DELETE USING (auth.uid() = user_id);

-- favorites 表策略
CREATE POLICY "用户只能查看自己的收藏" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的收藏" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的收藏" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- history 表策略
CREATE POLICY "用户只能查看自己的历史" ON history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的历史" ON history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的历史" ON history
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 创建更新时间触发器
-- ============================================

-- 创建更新时间函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- todos 表触发器
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- schedules 表触发器
CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

4. 点击 "Run" 执行脚本
5. 确认所有表和策略创建成功

---

### 第四步：获取 API 密钥

1. 在项目 Dashboard 左侧菜单找到 "Settings" > "API"
2. 复制以下两个值：
   - **Project URL**：格式为 `https://your-project-id.supabase.co`
   - **anon public key**：一个很长的字符串

**重要提示**：
- `anon key` 是公开密钥，可以在前端代码中安全使用
- `service_role key` 是服务密钥，**千万不要**在前端使用或公开

---

### 第五步：配置环境变量

#### 本地开发配置

在 `index.html` 的 `<head>` 标签中添加以下脚本：

```html
<script>
  // Supabase 配置 - 仅用于本地测试，生产环境请使用部署平台的环境变量
  window.SUPABASE_URL = 'https://your-project-id.supabase.co';
  window.SUPABASE_ANON_KEY = 'your-anon-key-here';
</script>
```

**注意**：这种方式仅用于本地测试，生产环境请使用部署平台的环境变量配置。

#### Vercel 部署配置

1. 登录 [Vercel](https://vercel.com/)
2. 导入项目（从 GitHub 或直接上传）
3. 在项目设置中找到 "Environment Variables"
4. 添加以下变量：
   - `SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `SUPABASE_ANON_KEY` = `your-anon-key-here`
5. 在项目根目录创建 `vercel.json`（已在项目中提供）
6. 部署项目

#### Netlify 部署配置

1. 登录 [Netlify](https://www.netlify.com/)
2. 点击 "Add new site" > "Deploy manually"
3. 上传项目文件夹
4. 在 Site settings > Build & deploy > Environment 中添加：
   - `SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `SUPABASE_ANON_KEY` = `your-anon-key-here`
5. 在项目根目录创建 `netlify.toml`（已在项目中提供）
6. 部署项目

---

## 📱 跨设备使用指南

### 电脑端使用

1. 在浏览器中打开部署后的网址（如 https://your-app.vercel.app）
2. 首次使用时，点击右上角头像 > "登录"
3. 输入邮箱和密码注册/登录
4. 登录后，所有数据将自动同步到云端

### 手机端使用

1. 在手机浏览器中打开部署后的网址
2. 使用相同的账号登录
3. 数据将自动从云端同步
4. 可以随时添加/编辑待办和日程

### 数据同步说明

- ✅ 登录后，所有操作实时同步到云端
- ✅ 手机和电脑数据保持一致
- ✅ 支持多台设备同时登录使用
- ⚠️ 未登录时，数据存储在本地浏览器，无法跨设备同步
- ⚠️ 退出登录不会删除云端数据，但本地缓存会被清除

---

## 🔧 技术架构

### 前端技术栈

- **纯原生 HTML/CSS/JavaScript** - 无框架依赖
- **Tailwind CSS** - 响应式 UI 设计
- **Lucide Icons** - 现代图标库
- **Supabase JavaScript SDK** - 云端数据同步

### 数据存储架构

```
┌─────────────────┐
│   应用层 (App)   │
│   - 待办管理     │
│   - 日程规划     │
│   - 资讯浏览     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  数据服务层      │
│  DataService     │
│  - 统一接口      │
│  - 自动降级      │
└─────────────────┘
         │
         ├─────► Supabase (云端)
         │       - PostgreSQL
         │       - Auth
         │       - RLS 策略
         │
         └─────► localStorage (本地)
                 - 离线支持
                 - 降级备份
```

### 自动降级机制

当 Supabase 未配置或连接失败时，DataService 会自动降级到 localStorage：

1. 检测 Supabase 连接状态
2. 云端不可用时切换到本地模式
3. 用户无感知，应用正常运行
4. 下次连接成功后自动同步数据

---

## 🛡️ 安全保障

### Row Level Security (RLS)

每张表都配置了 RLS 策略，确保：
- 用户只能查看自己的数据
- 用户只能修改自己的数据
- 用户无法访问其他用户的数据

### API Key 安全

- `anon public key` 安全用于前端
- 通过 RLS 策略限制数据访问权限
- 不暴露敏感的服务密钥

---

## 📁 项目文件结构

```
效率工作台/
├── index.html              # 主页面
├── vercel.json             # Vercel 部署配置
├── netlify.toml            # Netlify 部署配置
├── .env.example            # 环境变量示例
├── README.md               # 项目文档
├── src/
│   ├── scripts/
│   │   ├── supabaseClient.js  # Supabase 客户端
│   │   ├── dataService.js     # 数据服务层
│   │   └ app.js               # 主应用逻辑
│   ├── styles/
│   │   └ main.css            # 样式文件
│   └── assets/
│       └ images/             # 图片资源
└── .trae/
    └ documents/             # 项目文档
```

---

## ❓ 常见问题

### Q1: 部署后数据无法同步？

**检查步骤**：
1. 确认已在 Supabase 创建了所有数据表
2. 确认环境变量配置正确
3. 打开浏览器开发者工具，查看 Console 是否有错误
4. 检查 Network 标签页，查看 Supabase API 请求状态

### Q2: 登录后看不到之前的数据？

**原因**：之前的数据存储在 localStorage 中，登录后需要手动迁移。

**解决方案**：
- 在登录前导出数据（使用分享功能）
- 登录后导入数据
- 或者直接重新创建待办和日程

### Q3: 免费套餐够用吗？

**够用情况**：
- 个人使用，数据量不大
- 日常待办和日程管理
- 不存储大量文件或图片

**不够用情况**：
- 团队协作（需要付费套餐）
- 大量历史数据存储
- 需要高级功能（如实时订阅）

### Q4: 如何备份数据？

**方法一**：使用分享功能
- 在首页点击日程卡片右上角的分享按钮
- 复制生成的链接保存
- 需要恢复时打开链接即可导入

**方法二**：导出 localStorage
- 打开浏览器开发者工具
- Application > Local Storage > 找到项目域名
- 复制 `workbench_todos` 和 `workbench_schedules` 的值

### Q5: 手机端如何添加书签？

**iOS Safari**：
1. 点击分享按钮
2. 选择"添加到主屏幕"
3. 应用将以快捷方式形式运行

**Android Chrome**：
1. 点击菜单按钮
2. 选择"添加到主屏幕"
3. 应用将以独立窗口运行

---

## 🔄 更新日志

### v2.0 - 云端同步版本

**新增功能**：
- ✨ Supabase 云端数据同步
- 🔐 邮箱登录认证
- 📱 跨设备数据同步
- 💾 自动降级到 localStorage
- 🛡️ RLS 数据隔离策略

**优化改进**：
- 重构数据存储架构
- 统一数据服务层
- 异步数据操作
- 错误处理增强

---

## 📞 技术支持

如有问题或建议，请通过以下方式联系：

1. 查看 README 文档
2. 检查 Supabase Dashboard
3. 查看浏览器 Console 错误信息

---

## 📄 许可证

本项目仅供学习和个人使用。

---

## 🎯 未来规划

- [ ] 实时协作功能
- [ ] 团队项目管理
- [ ] 数据统计分析
- [ ] 移动端 App
- [ ] 离线增强支持
- [ ] 第三方登录（GitHub、Google）

---

**祝您使用愉快！让效率工作台助您高效完成每一项任务！** 🎉