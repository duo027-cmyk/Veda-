# Security Specification for VEDA Firebase Integration

## Data Invariants
1. `system/state`: Only one document `state` allowed in the `system` collection.
2. `memories`: Every memory must have a `content` that is a string and a `coherence` between 0 and 1.
3. `chat_logs`: Must have a `text` and a valid `role`.

## The Dirty Dozen (Test Payloads)
1. Unauthorized State Update: Try to update `system/state` as an unauthenticated user. (DENIED)
2. Malicious Memory Injection: Try to inject a memory with `coherence: 999`. (DENIED)
3. Large ID Poisoning: Try to create a document with a 2MB string as ID. (DENIED)
4. Spoofed Role in Chat: User tries to set `role: 'system_command'` in a chat log? Actually, we might allow it if it's logging their command, but we should be careful.
5. Injected Admin: User tries to write to `/admins/{uid}`. (DENIED)
6. State Shadow Field: Try to add `isHacked: true` to `system/state`. (DENIED)
7. Content Size Overflow: 10MB string in `Memory.content`. (DENIED)
8. Unauthorized List: Guest user listing `chat_logs`. (DENIED)
9. Memory Owner Spoofing: User A trying to write `userId: 'UserB'` in a memory. (DENIED)
10. System State Deletion: User trying to delete `system/state`. (DENIED)
11. Future Timestamp: Setting `timestamp` to year 3000. (DENIED)
12. Schema Mismatch: `axioms` as a string instead of an array. (DENIED)

## Test Runner
I will verify these patterns in the rules.
