## Features

- [ ] Mutation State. Expose the mutation state (e.g., `pending=true`) as a property on the component `withMutation`.
- [ ] Handle cases where the mutation context (`withMutations(Component)`) un-mounts before the mutation returns (symptom would be state update on unmounted component).
- [ ] "Resolve" `InputObjectTypes` to prepare input data for resolver.
