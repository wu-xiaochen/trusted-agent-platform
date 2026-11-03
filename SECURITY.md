# Security Policy

## Scope

This repository currently contains design and static contract tooling only. It is not a production Agent runtime. Security-sensitive implementation is gated by `docs/architecture/THREAT-MODEL.md` and TP-13.

## Reporting a vulnerability

Do not post credentials, personal data, customer records, or an exploitable vulnerability in a public issue. When the GitHub repository is published, enable GitHub Private Vulnerability Reporting and use its advisory form. If that feature is not enabled yet, contact the repository owner through the verified GitHub profile and request a private reporting channel. Include affected revision, impact, reproduction in synthetic data, and suggested mitigation where possible.

## Response expectations

The maintainer will acknowledge reports as soon as practical, assess severity and affected supported releases, coordinate a fix and disclosure timeline with the reporter, and publish a security advisory when appropriate. No response SLA is promised before a supported runtime and maintainer coverage exist.

## Safe testing

Test only local synthetic deployments or systems you own and are explicitly authorized to assess. Do not attempt to access another organization's source system.

