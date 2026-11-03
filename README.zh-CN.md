# 可信 Agent 平台

**把企业现有 API 变成经过验证、受权限约束的业务任务应用。**

[产品战略](docs/product/PRODUCT-STRATEGY.md) · [产品需求](docs/product/PRD.md) · [总体架构](docs/architecture.md) · [数据架构](docs/architecture/DATA-ARCHITECTURE.md) · [开源采用计划](docs/product/OPEN-SOURCE-ADOPTION.md) · [AI 编码交接规范](docs/engineering/AI-CODING-HANDOFF.md) · [TP-02 执行计划](docs/superpowers/plans/2026-11-03-runtime-qualification.md) · [开发路线图](docs/roadmap.md) · [当前进度](docs/progress.md)

当前交付是完整的产品与工程设计基线，**尚不是可运行的企业 Agent 平台**。已有最小业务任务契约和静态校验工具，但没有真实系统连接器、运行时授权、Agent 执行、生成式业务应用或可靠写入能力。

产品从一个具体任务开始：引导业务人员和方案架构师说明目标、接入获准能力、确认业务规则、测试案例并发布受控应用。相同的业务能力由服务层提供给 Web、API、Agent 和 MCP；数据保留来源与时效，写操作经过精确确认、独立审批（如需）、幂等和结果核对。

设计优先评估复用 ObjectStack 的开源元数据/业务运行时，避免再造第二套本体、权限和界面引擎。该技术路线仍需通过 [TP-02 资格探针](docs/backlog.json)；在验证外部 OIDC、权限边界、数据库、连接器和插件能力前，不应开始重度依赖其核心实现。

首个场景为维修准备与备件申请，第二个场景为企业设备申领。项目不承诺所有旧系统零改造，也不进入 PLC/DCS 实时控制回路。请在公开问题和示例中使用合成数据；个人材料、客户数据和凭据不应进入版本库。

