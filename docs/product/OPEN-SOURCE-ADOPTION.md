# Open-Source Adoption and GitHub Discovery Plan

**Status:** Strategy hypothesis · **Reviewed:** 2026-11-03 · **Owner:** Maintainer

## Goal and constraint

The ambition is to become a widely adopted open-source project and earn the possibility of appearing in GitHub Trending's top 20. There is no complete, controllable checklist that guarantees a rank. GitHub's Trending page shows a top-25 selection over day/week/month windows. GitHub's published 2013 explanation (updated 2019) describes weighted signals including stars, forks, commits, follows and page views with recency; this is not a current ranking contract. The 2026 Octoverse uses distinct contributors and a blended stars/forks/issue/PR engagement measure for its own rankings, which is also not the Trending algorithm. Treat both as evidence that recent, real participation matters, not as a recipe to game rankings.

As of this review, the public repository page shows 0 stars, 0 forks, three commits, and a design-only status. That is an honest starting point; it is not adoption evidence. Recheck volatile counts before any public report.

## Current launch-readiness gaps

The repository has a README in Chinese and English, Apache-2.0 license, contribution instructions, security policy and issue templates. It still has no operational product/runtime, no working five-minute end-user demo, no release artifact or independent install evidence, and no meaningful contributor history. A repository `CODE_OF_CONDUCT.md` is missing; GitHub Actions/CI and branch protection are not yet configured; repository topics are not set. The GitHub Community Standards checklist should be reviewed before a launch announcement. **The current repo is not launch-ready for a Trending campaign.** A code-free design repo can gather feedback from known domain practitioners, but claims of product utility require the runnable demo and external task evidence.

## Competitive reality and proposed wedge

Adjacent open-source products already cover substantial parts of this platform's proposed scope:

| Project | Public product center | What it means for our scope |
|---|---|---|
| Dify | LLM app development with workflows, RAG, Agent, model support, observability and self-hosting | Do not compete on the breadth of model/workflow/RAG builders. Use it as a workflow and authoring benchmark. |
| n8n | Workflow and AI automation with a large integration catalog, human approvals, deployment and operations | Do not promise connector count parity. A workflow engine and business-system connector directory alone are not differentiation. Review its license/usage model separately before integration or code reuse. |
| Flowise / Langflow | Visual Agent/workflow composition, components, data/tools, APIs/MCP and self-hosting | A canvas, MCP support, or natural-language flow generation is not a unique product claim. |
| Salesforce Headless | Business capabilities exposed to agents and multiple experience surfaces | A useful product pattern; customer-specific Salesforce services cannot be assumed by a self-hosted open platform. |

**Recommended wedge:** “Turn an existing enterprise API into a verified, permission-aware business task application—with the business evidence, test cases, human decisions, and recovery path visible.” The product must prove the whole path on one synthetic-to-real task. The intended difference is the executable business contract and guarded operation across existing systems; it is a hypothesis until target users choose it over current tools and complete real tasks with it.

Do not lead with a list of all intended modules (“data bus + ontology + Agent harness + AG-UI + MCP + K8s”). Lead with the user's result and a runnable demonstration. Keep broad platform architecture behind a proven first task.

## Launch gates before a discovery push

1. **Clone-to-value:** clean-clone demo starts with one documented command or a short, tested set of commands, needs no commercial keys or customer system, and gets a user to a visible result in under five minutes. The demo uses synthetic fixtures and shows an actual capability boundary, not a static architecture mock.
2. **Proof of the wedge:** demonstrate import/configure → inspect operation scope → test an authorized read → map/confirm business meaning → run an edge case → render a task UI → block an unsafe action with a clear reason. Capture a short video and a screenshot/GIF from the working product.
3. **Truthful README:** first screen says who it helps, the task it solves, why existing agent/workflow builders are insufficient for this specific task, current implementation status, setup, security boundary, limitations, and next contribution path. Never call design docs a working runtime.
4. **Contribution readiness:** license, README, Code of Conduct, contribution guide, security reporting, issue/PR templates, roadmap, changelog, supported versions, quickstart, architecture decisions, and a genuinely maintainable first-issue queue. Check the repository's GitHub Community Standards profile.
5. **Audience fit:** publish English and Chinese user-facing entry points. Use a small, accurate set of repository topics that match the tested product and language; GitHub describes topics as a discovery and contribution aid, not a ranking guarantee.
6. **Operational credibility:** release only tested containers, publish checksums/SBOM and compatibility limitations, and show how to disable/recover an action. No unsupported security certification or universal connector claims.
7. **Maintainer sustainability:** handle installation issues and review outside contributions promptly enough to keep trust. Do not manufacture activity or trade/purchase stars; optimize for repeated use and useful contribution.

## Adoption funnel and evidence

Measure the funnel with privacy-respecting aggregate metrics and voluntary user interviews:

- Qualified repo visit → README to working demo completion.
- Demo completion → first real, authorized read in a supported system.
- First read → task package/app validated by a business owner.
- Validated task → repeat run or second workflow.
- External installation → successful upgrade/recovery.
- External use → independent issue, PR, connector, template, tutorial, or case study.

Stars and Trending appearance are secondary signals. The leading product signals are successful independent installs, time to first verified task, repeat use, external connectors/templates, and distinct contributors. Set numeric conversion targets only after recording a baseline from the first cohorts; don't invent success percentages without traffic and user evidence.

## Distribution sequence

1. Deliver the synthetic five-minute demo and clear screenshots/video.
2. Invite a small group of industrial AI developers and solution architects to complete a defined task; observe instead of presenting only slides.
3. Fix friction found in setup, permissions, provenance, and error recovery; publish short, reproducible learning notes.
4. Release a tagged alpha with support matrix, compatibility boundaries, demo data, and one easy contributor task.
5. Share in communities where these developers already discuss enterprise integration, agent operations, and industrial software. Every post should link to a useful demo or lesson, not ask for stars.
6. Expand only when external users repeat the task or contribute a connector/template; keep the second-domain test as evidence that the abstraction generalizes.

The top-20 ambition is a time-bounded visibility outcome. The project succeeds even if it never ranks when it is independently useful and produces verifiable business value; reaching a ranking without reuse is not product success.

## Research references

- [GitHub Trending](https://github.com/trending) — current page and day/week/month views.
- [GitHub's published explanation of Trending](https://github.blog/news-insights/company-news/explore-what-is-trending-on-github/) — historical explanation, updated 2019; not a current formula guarantee.
- [GitHub Octoverse 2026](https://github.blog/news-insights/octoverse/octoverse-commits-pushes-reach-new-highs-in-2026-as-developers-build-with-agents/) — public data on current engagement and contribution patterns; distinct ranking methodology from Trending.
- [GitHub README guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes) and [community profile guidance](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories).
- [GitHub topics guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics).
- [Dify](https://github.com/langgenius/dify), [n8n](https://github.com/n8n-io/n8n), [Flowise](https://github.com/FlowiseAI/Flowise), and [Langflow](https://github.com/langflow-ai/langflow) — competitor claims cited in their public repositories/documentation; independent product quality and adoption are not inferred from their marketing pages alone.
