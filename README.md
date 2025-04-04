# Yeap Finance - 区块链借贷平台

Yeap Finance 是一个去中心化借贷平台，提供安全、高效、透明的区块链借贷服务。本工程使用 Next.js 构建，集成了 Apollo GraphQL 和 Tailwind CSS。

## 技术栈

- **框架**: Next.js 15.1.0
- **状态管理**: Apollo Client
- **样式**: Tailwind CSS
- **UI 组件库**: shadcn/ui
- **钱包集成**: Aptos Wallet Adapter
- **图表库**: Recharts

## 开发环境设置

1. **克隆仓库**

```bash
git clone https://github.com/your-repo/yeap-finance.git
cd yeap-finance
```

2. **安装依赖**

```bash
npm install
```

3. **启动开发服务器**

```bash
npm run dev
```

4. **访问应用**

打开浏览器访问 `http://localhost:3000`

## 项目结构

```
.
├── app/                  # Next.js 页面路由
├── components/           # 可复用组件
├── graphql/              # GraphQL 查询和 mutations
├── lib/                  # 工具函数和配置
├── services/             # API 服务层
├── styles/               # 全局样式
└── public/               # 静态资源
```

## 页面路由

| 页面名称       | URL 路径                          | 描述                                 |
|----------------|-----------------------------------|--------------------------------------|
| 首页           | `/`                               | 应用首页                             |
| 金库列表       | `/vaults`                         | 查看所有可用金库                     |
| 金库详情       | `/vaults/:id`                     | 查看特定金库的详细信息               |
| 存款页面       | `/vaults/:id/supply`              | 向特定金库存入资产                   |
| 借款页面       | `/vaults/:id/borrow`              | 从特定金库借入资产                   |
| 赎回页面       | `/vaults/:id/withdraw`            | 从特定金库赎回资产                   |
| 仓位管理       | `/positions`                      | 查看和管理用户的借贷仓位             |

## 样式指南

- 使用 Tailwind CSS 进行样式编写
- 遵循 shadcn/ui 的组件设计规范
- 颜色使用 `slate` 调色板

## 代码规范

- 使用 TypeScript 进行开发
- 组件使用 PascalCase 命名
- 函数和变量使用 camelCase 命名
- 使用 ESLint 和 Prettier 进行代码格式化

## 贡献指南

1. Fork 本仓库
2. 创建新分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request


润天，整理了一下目前的 demo。
frontend 主要以功能实现为主，还不是完整的产品。合约暂时只开源了 interface。
欢迎提意见（无论功能还是产品逻辑）。

- contract interfaces:https://github.com/yeap-finance/yeap-finance-contract-interface
- test token mint: https://yeap-test-token-faucet.vercel.app/
- frontend: https://yeap-finace-fe.vercel.app/