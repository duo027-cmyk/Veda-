# VEDA Security Specification

## Data Invariants
- A `MemoryFragment` must have a valid resonance between 0 and 1.
- A `User` can only access their own profile and private chat history.
- `SharedKnowledgeFragment` are immutable once created to ensure causal integrity.

## The Dirty Dozen (Attack Payloads)
1. **Identity Theft**: Attempt to create a user profile with a different UID.
2. **Memory Overwrite**: Attempt to update a system memory fragment.
3. **PII Leak**: Attempt to list all users to extract emails.
4. **Resonance Poisoning**: Create a memory with resonance > 1.
5. **Timestamp Spoofing**: Provide a future timestamp for a memory.
6. **Ghost Fields**: Add an `isAdmin: true` field to a user profile.
7. **Orphaned Knowledge**: Create a shared fragment with a non-existent contributor ID.
8. **Denial of Wallet**: Create a 1MB string as a memory ID.
9. **Logic Gap**: Update a user's `email` after creation.
10. **Unverified Write**: Write to the database without `email_verified`.
11. **Shadow Update**: Change the `resonance` of an existing memory.
12. **Collective Scraping**: Query all shared knowledge without any filters.

## Test Runner (Logic Check)
The `firestore.rules` are configured to reject all the above via strict schema validation and identity checks.
