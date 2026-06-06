# Manus 审查反馈：Phase 2 - ✅ 通过

## 审查结论

Phase 2 通过。部署流程设计合理，7个测试全部通过，WASM编译成功，部署脚本逻辑完整（部署 → 注册 → 发布demo数据点），且正确处理了密钥材料的安全隔离。

## 对你3个问题的明确回复

1. 是否可以在Testnet密钥待定的情况下进入Phase 3（Agent开发）？

✅ 是的，立即进入Phase 3。理由：

- Agent逻辑开发不依赖链上部署（可以先用mock/本地模拟）。
- 密钥材料由人类后续提供，届时一条命令即可完成部署。
- 并行推进是正确的时间管理策略。

2. 单命令 deploy/register/publish runner 是否满足资格赛要求？

✅ 完全满足。这个设计非常好：

- 一条命令产生多笔链上交易（deploy + register + publish），直接满足"transaction-producing on-chain component"的硬性要求。
- 评审者可以通过区块浏览器验证所有交易，体验流畅。
- Demo视频中展示这条命令的执行过程也很有说服力。

3. Demo是否需要包含 pause_oracle 交易？

❌ 不需要。保持为"已测试的安全功能"即可。理由：

- Demo视频时间有限（3-5分钟），应聚焦核心价值流（数据采集 → AI评估 → 链上发布）。
- pause_oracle 在README中说明即可，评审者看代码和测试就能确认安全机制存在。
- 如果进入Final Round的Demo Day，再考虑展示治理/安全功能。

## Phase 3 具体指导：AI Agent 核心逻辑开发

Phase 3目标：开发完整的Agent主循环，实现"数据采集 → AI评估 → 链上发布"的自主工作流

请执行以下任务：

### 1. 项目初始化

- 在 agent-backend/ 初始化TypeScript项目（推荐 ts-node + axios）。
- 安装依赖：casper-js-sdk（用于构建和签名交易）。

### 2. 实现三个核心模块

模块A：数据采集器 (src/data-collector.ts)

- 从公开API获取RWA相关数据（建议选择以下之一作为Demo数据源）：
- 房产指数（如Zillow API或模拟数据）
- 国债利率（如US Treasury API）
- 大宗商品价格（如Gold/Oil公开API）
- 同时通过 CSPR.trade MCP 的 get_tokens / get_quote 获取链上DeFi数据作为参考。
- 输出标准化的 RawDataPoint { asset_id, raw_value, source, timestamp }。

模块B：AI风险评估引擎 (src/risk-assessor.ts)

- 接收 RawDataPoint，运行评估逻辑：
- 规则引擎：检查数据是否在合理范围内（异常值检测）。
- 置信度计算：基于数据源可靠性、历史波动率等因素，输出 confidence: 0-100。
- 决策：confidence >= 60 则发布，否则跳过并记录原因。
- 输出 AssessedDataPoint { asset_id, value, confidence, evidence_hash, publish_decision }。

模块C：链上发布器 (src/chain-publisher.ts)

- 使用 casper-js-sdk 构建调用 publish_data 的Deploy。
- 使用本地PEM密钥签名。
- 提交到Testnet节点（https://node.testnet.cspr.cloud ）。
- 记录交易哈希。
- 如果Testnet尚未部署：实现mock模式，打印"would publish to contract [hash]"并输出完整的unsigned deploy JSON。

### 3. 主循环 (src/agent.ts)

```text
Agent启动
  → 检查Oracle是否已注册（查询链上状态或跳过）
  → 进入循环：
      1. 调用数据采集器获取最新数据
      2. 调用风险评估引擎评估
      3. 如果决策为"发布"：调用链上发布器
      4. 记录完整日志（时间戳、数据、决策、交易哈希）
      5. 等待间隔（如60秒）
      6. 重复
```

### 4. 日志系统

- 每一步决策都必须有结构化日志输出。
- 日志格式建议：[TIMESTAMP] [MODULE] [ACTION] [DETAIL]。
- 这些日志将直接用于Demo视频的终端演示。

### 5. MCP集成（加分）

- 如果MCP工具可用，在数据采集阶段调用 get_tokens 和 get_quote 获取CSPR生态内的DeFi数据。
- 这展示了Agent同时处理链下RWA数据和链上DeFi数据的能力。

## Phase 3 汇报要求

- Agent完整代码（所有模块）。
- package.json 依赖列表。
- 一次完整循环的日志输出（mock模式即可）。
- 如果Testnet已部署：至少一笔成功的链上交易哈希。
- 架构决策说明（如为什么选择某个数据源）。

允许进入Phase 3，请开始开发。完成后向我汇报。
