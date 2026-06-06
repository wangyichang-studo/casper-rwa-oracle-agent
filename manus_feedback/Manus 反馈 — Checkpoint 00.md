# Manus 反馈 — Checkpoint 00

Captured from Manus on 2026-06-06 after submitting `manus_outbox/checkpoint-00-submit.md`.

## Manus 审查反馈：Phase 0 - 通过（附改进建议）

### 审查结论

Phase 0 的项目脚手架工作通过，目录结构清晰，安全规则到位，文档体系完整。以下是对你三个决策点的具体指导：

### 决策点回复

#### 1. 方向选择：RWA Compliance Agent vs RWA Oracle

建议采用 "RWA Oracle Agent with Verifiable On-Chain Identity" 方向，而非纯KYC/Compliance方向。原因：

- 这是官方明确列出的4个推荐方向之一（第2个），评审时天然有"对标感"。
- 纯KYC/Compliance方向（官方第4个方向）需要Zero-Knowledge技术，实现复杂度高，30天内难以做到production-ready。
- RWA Oracle方向的核心链路更清晰：抓取链下数据 → AI风险评估 → 链上发布验证数据 → 维护链上身份和声誉分，每一步都能产生链上交易（满足硬性要求）。
- 可以自然集成x402（Agent付费获取外部数据源）和MCP（查询链上状态），工具包利用率最大化。

项目重新定义为：Casper RWA Oracle Agent — 一个能自主抓取链下RWA数据（如房产估值、债券利率）、运行AI风险评估模型、通过x402付费获取高级数据、并将验证结果发布到链上的自主代理，同时维护可验证的链上身份和历史准确率声誉分。

#### 2. 合约设计：最小权限 vs 可升级

建议先做最小权限模型，Phase 2结束后评估是否加入可升级设计：

- Phase 1先实现核心功能：OracleRegistry（注册Oracle身份）+ DataFeed（发布数据）+ ReputationScore（声誉分计算）。
- Odra框架天然支持合约升级（Upgrading Contracts tutorial），但升级逻辑会增加测试复杂度。
- 在Phase 2测试通过后，如果时间充裕，再追加升级能力作为加分项。

#### 3. 前端需求

CLI + README + Demo视频足够通过资格赛。但建议：

- Phase 5完成后评估时间余量。如果剩余 > 5天，追加一个轻量的Next.js仪表盘（展示Oracle发布的数据流和声誉分）。
- 如果时间紧张，用一个精心设计的终端UI（如 blessed 或 ink）也能在视频中展示良好的UX。

### Phase 1 具体指导

Phase 1目标：智能合约开发与本地测试

请执行以下任务：

1. 在 `contracts/` 目录下使用Odra框架初始化项目。
2. 编写三个核心合约模块：
   - `src/oracle_registry.rs` — Oracle身份注册：
     - `register_oracle(name: String, public_key: Address)`: 注册新Oracle。
     - `get_oracle_info(oracle_id: Address) -> OracleInfo`: 查询Oracle信息。
     - `is_registered(address: Address) -> bool`: 检查是否已注册。
   - `src/data_feed.rs` — 数据发布：
     - `publish_data(asset_id: String, value: U256, timestamp: u64, confidence: u8)`: 仅注册Oracle可调用，发布RWA估值数据。
     - `get_latest_data(asset_id: String) -> DataPoint`: 获取最新数据。
     - `get_history(asset_id: String, count: u32) -> Vec<DataPoint>`: 获取历史数据。
   - `src/reputation.rs` — 声誉分：
     - `update_reputation(oracle_id: Address, accuracy_delta: i32)`: 根据数据验证结果更新声誉。
     - `get_reputation(oracle_id: Address) -> u64`: 查询声誉分。
     - `slash(oracle_id: Address, reason: String)`: 惩罚不准确的Oracle。
3. 编写单元测试，覆盖：
   - Oracle注册和重复注册拦截。
   - 已注册Oracle发布数据成功。
   - 未注册地址发布数据失败。
   - 声誉分增减和slash机制。
4. 运行 `cargo odra test` 确保全部通过。

### Phase 1 汇报要求

- 三个合约模块的完整代码。
- `cargo odra test` 的完整通过日志。
- 如有设计取舍（如数据结构选择），列出待确认点。

请按以上指导执行Phase 1，完成后向我汇报。

