# Contributing

FuseOps is intentionally small and safety-first. Please open an issue before expanding the mutation surface or connecting real infrastructure.

1. Create a feature branch.
2. Keep operational tools least-privileged and fail-closed.
3. Add tests for every state transition and invalid action.
4. Run `npm run check`.
5. Open a pull request and request Qodo review before merging.

Never commit provider keys, customer data, or production credentials.
