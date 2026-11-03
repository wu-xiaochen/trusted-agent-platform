# Third-Party Notices

This design baseline does not embed third-party framework code. The existing local static tooling dependencies are listed in `requirements-dev.txt` and must be license-checked in the release process.

ObjectStack, Temporal, MCP SDK, AG-UI, Dify, OpenSPG/KAG and other projects linked in `docs/research/` are research references, not bundled dependencies. Their mention does not imply endorsement or grant rights to their code, logos, documentation, or assets.

Before adding any dependency, record the exact package/version and license (including transitive dependencies and UI assets), required notices, source/commit, security advisory status, and whether any feature requires a commercial service. Update this file and the generated SBOM for each release. Do not rely only on a monorepo's root license when package subdirectories have their own license terms.

