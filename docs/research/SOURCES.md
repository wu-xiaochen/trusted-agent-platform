# Primary Reference Sources

**Checked:** 2026-11-03. These sources informed design choices. Product documentation and software versions can change; recheck before implementation and record the exact version used in ADRs.

## Product and architecture patterns

- [Salesforce Headless Toolkit](https://developer.salesforce.com/developer-centers/headless) — headless capabilities across APIs, MCP, skills, interfaces and delivery tools.
- [Salesforce Headless Toolkit core concepts](https://developer.salesforce.com/docs/platform/headless-get-started/guide/headless-toolkit-core-concepts.html) — APIs, hosted/custom/external MCP and skills as one business capability surface. We use this as a product pattern; the implementation remains platform-neutral.
- [Salesforce Agent Actions](https://developer.salesforce.com/docs/ai/agentforce/guide/get-started-actions.html) — named business actions exposed through supported APIs and actions.
- [Salesforce Headless Experience Layer](https://developer.salesforce.com/docs/platform/hxl/guide/agentforce-action-output.html) — structured action outputs can map into presentation widgets; informs controlled action-result UI.
- [Dify repository](https://github.com/langgenius/dify) — primary public description of the LLM application platform's workflow, RAG, Agent, model and observability scope; not an independent verification of quality.
- [n8n repository](https://github.com/n8n-io/n8n) — primary public description of AI workflow automation and its integration catalog; check current license and usage terms before reuse.
- [Flowise documentation](https://github.com/FlowiseAI/FlowiseDocs/blob/main/en/README.md) — primary public description of visual Agent/workflow builder, MCP, integrations and self-hosting.
- [Langflow repository](https://github.com/langflow-ai/langflow) — primary source for component-based visual Agent/workflow development and integration surfaces.

## Reusable open-source platforms and protocols

- [ObjectStack repository](https://github.com/objectstack-ai/objectstack) — metadata-driven business objects/actions/UI, plugins and self-hosted runtime; see its [package architecture](https://github.com/objectstack-ai/objectstack/blob/main/ARCHITECTURE.md), [package overview](https://github.com/objectstack-ai/objectstack/blob/main/content/docs/plugins/packages.mdx), [AI/MCP documentation](https://github.com/objectstack-ai/objectstack/blob/main/content/docs/ai/index.mdx) and [package licensing](https://github.com/objectstack-ai/objectstack/blob/main/LICENSING.md). Repository policy reports Apache-2.0 outside `ui/`, with the Console and `@object-ui/*` under MIT; verify the exact installed package and transitive assets.
- [Dify repository](https://github.com/langgenius/dify) — workflow, Agent and RAG authoring reference. Its [official license file](https://github.com/langgenius/dify/blob/main/LICENSE) adds conditions for multi-tenant use and frontend branding; inspect the exact release license before reuse or distribution.
- [OpenSPG](https://github.com/OpenSPG/openspg) and [KAG](https://github.com/OpenSPG/KAG) — domain semantic graph, knowledge construction and reasoning references.
- [AG-UI protocol](https://github.com/ag-ui-protocol/ag-ui/blob/main/docs/ag_ui.md) — event-based Agent/user interaction concepts. Its event semantics are not platform authorization.
- [AG-UI overview](https://docs.ag-ui.com/introduction) — distinguishes the Agent↔User event protocol from generative UI specifications such as A2UI. Checked 2026-11-03.
- [OpenAPI Specification v3.2.1](https://spec.openapis.org/oas/v3.2.1.html) — language-agnostic HTTP API description useful for discovery; it does not verify source semantics, permissions, or operation safety. Checked 2026-11-03.
- [GitHub Trending](https://github.com/trending) — live discovery page with day/week/month time windows; ranking values change continuously.
- [GitHub's published explanation of Trending](https://github.blog/news-insights/company-news/explore-what-is-trending-on-github/) — historical explanation updated 2019; not a current ranking formula contract.
- [GitHub Octoverse 2026](https://github.blog/news-insights/octoverse/octoverse-commits-pushes-reach-new-highs-in-2026-as-developers-build-with-agents/) — repository engagement/contributor analyses in a separate ranking context.
- [GitHub README guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes), [Community Standards](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories), and [Topics](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics) — official documentation for first-page content, community files, and repo classification.
- [MCP 2026-07-28 specification notes](https://blog.modelcontextprotocol.io/posts/2026-07-28/) — current authorization/protocol evolution at review time. Verify the official stable protocol revision and SDK support at implementation.
- [MCP TypeScript SDK authorization](https://ts.sdk.modelcontextprotocol.io/v2/serving/authorization) — HTTP MCP server as OAuth resource server; token validation and protected resource metadata.
- [Temporal TypeScript SDK](https://docs.temporal.io/develop/typescript) — workflow/activity development for durable execution.
- [LangGraph.js persistence and interrupts](https://langchain-ai.github.io/langgraphjs/concepts/human_in_the_loop/) — checkpointed human interaction and resume patterns; not an external side-effect ledger.

## Runtime, data and web framework references

- [Node.js release schedule](https://nodejs.org/en/about/previous-releases) and [Node.js releases](https://nodejs.org/en/blog) — LTS status checked for the runtime choice.
- [ObjectStack architecture](https://github.com/objectstack-ai/objectstack/blob/main/ARCHITECTURE.md) — selected reuse candidate's spec/runtime/plugin layers.
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) — database-level defense-in-depth behavior; application authorization remains required.
- [TanStack Query React overview](https://tanstack.com/query/latest/docs/framework/react/overview) — server-state/cache behavior and UX loading/error patterns.
- [Drizzle migration documentation](https://orm.drizzle.team/docs/migrations) — evaluated as a candidate; not selected if ObjectStack's SQL driver/migration pathway passes.

## License and source governance

Framework repository-level license is not sufficient for all packages, assets, and transitive dependencies. Before adding a package, record exact repository/tag/version, package-specific license, transitive license summary, security advisories, support policy, and any hosted/cloud-only feature dependency. Do not copy code from a repository with additional conditions without legal review. This reference list does not grant a license to third-party assets.

