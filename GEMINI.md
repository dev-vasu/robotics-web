# RoboVibe Development Protocols

## Branching Strategy (Safe-State)
To ensure the stability of the production environment and facilitate easy rollbacks, all development MUST follow this branching model:

1. **`main` (Production):** Always represents the latest stable, verified build. Direct commits to `main` are prohibited for significant features or risky fixes.
2. **`feature/name` (Development):** New games, UI sectors, or functional modules must be built in a dedicated feature branch.
3. **`fix/issue` (Hotfixes):** Bug fixes and theme adjustments should happen in focused fix branches.

## Deployment Workflow
1. Create a new branch: `git checkout -b feature/your-feature`.
2. Implement and verify work within the branch.
3. Commit frequently with descriptive messages.
4. Merge to `main` ONLY after the user has approved the verified state.
5. If an update is "corrupted" or unwanted, simply discard the branch or revert the merge on `main`.

## Visual Engineering
- Maintain "Cyber-Vapor" aesthetic (Hyper-Pink, Cyber-Blue, Electric-Volt).
- Support both `VOID_VIBE` and `FLASHBANG` themes using CSS variables.
- Prioritize high-speed, hardware-accelerated animations (8s-12s cycle time).
