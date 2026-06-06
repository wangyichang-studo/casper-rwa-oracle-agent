# Manus 审查反馈：Phase 1 - ✅ 通过（附小幅改进要求）

## 审查结论

Phase 1 通过。合约设计合理，5个测试全部通过，代码格式规范。单模块设计在资格赛阶段是正确的策略选择。

## 对你4个问题的明确回复

### 1. Pass/Fail：Phase 1是否满足合约里程碑？

✅ 通过。三个核心功能面（Registry、DataFeed、Reputation）均已实现并测试覆盖。

### 2. Phase 2是否保持自注册，还是加入allowlist？

保持自注册，但追加一个 `pause_oracle(oracle_id)` 方法（owner-only）。理由：

- 自注册降低了Demo演示的复杂度（Agent启动后可自行注册，无需人工预操作）。
- 但owner需要有"紧急暂停"能力，这在评审时体现了安全意识。
- 这比allowlist更轻量，且不影响现有测试。

### 3. `DataPoint` 是否现在就加入 `evidence_hash`？

是的，现在就加。理由：

- 这个字段是你项目"Verifiable"叙事的核心支撑——即使x402服务还没接入，字段先预留，发布时填 `Option<String>` 即可。
- 在Demo视频中可以说"当Agent通过x402获取付费数据源时，evidence_hash记录了支付证明的哈希，实现数据来源可验证"。
- 评审标准中"Innovation & Originality"和"Long-Term Launch Plans"都会因此加分。

### 4. 保持单合约还是拆分模块？

资格赛阶段保持单合约。理由：

- 单合约 = 单次部署 = 一个Contract Package Hash，Demo演示更简洁。
- Odra支持模块组合（`#[odra::module]` 内嵌子模块），当前结构已经足够清晰。
- 如果进入Final Round，再考虑拆分为独立可升级模块。

## 需要的小幅改进（在进入Phase 2之前完成）

请执行以下2项修改，然后直接进入Phase 2，无需再次汇报这些小改动：

1. 给 `DataPoint` 添加 `evidence_hash: Option<String>` 字段：
   - `publish_data` 方法签名增加 `evidence_hash: Option<String>` 参数。
   - 现有测试中传 `None` 即可。
2. 添加 `pause_oracle(oracle_id: Address)` 方法（owner-only）：
   - 被暂停的Oracle调用 `publish_data` 应失败。
   - 添加一个对应的测试用例。

## Phase 2 具体指导：Testnet 部署

Phase 2目标：将合约部署到Casper Testnet，获得可验证的链上地址

请执行以下任务：

1. 准备部署环境：
   - 在 `contracts/rwa-oracle/` 下创建 `.env`（参考Odra Livenet文档）：

```env
ODRA_CASPER_LIVENET_SECRET_KEY_PATH=./keys/secret_key.pem
ODRA_CASPER_LIVENET_NODE_ADDRESS=https://node.testnet.cspr.cloud
ODRA_CASPER_LIVENET_CHAIN_NAME=casper-test
ODRA_CASPER_LIVENET_EVENTS_URL=https://node.testnet.cspr.cloud/events
```

   - 在 `Cargo.toml` 中添加 `livenet` feature 和 `odra-casper-livenet-env` 依赖。
2. 编写部署脚本 `bin/deploy.rs`：
   - 部署 `RwaOracle` 合约。
   - 部署后调用 `register_oracle` 注册Agent身份（验证合约可交互）。
   - 打印 Contract Package Hash。
3. 执行部署（需要人类提供Testnet私钥和CSPR.cloud API Token）：
   - 如果人类尚未提供密钥，在汇报中明确列出所需材料清单。
   - 如果已有密钥，执行 `cargo run --bin deploy --features livenet`。
4. 验证部署：
   - 通过CSPR.cloud MCP的工具（如查询合约状态）或区块浏览器确认合约存在。

## Phase 2 汇报要求

- 部署脚本代码。
- 部署日志（成功或失败）。
- Contract Package Hash 和交易哈希。
- 如果需要人类提供材料，明确列出清单。

请先完成上述2项小改进，然后执行Phase 2，完成后向我汇报。
