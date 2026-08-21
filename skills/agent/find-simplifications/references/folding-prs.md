# Folding another PR or branch

Diff the sibling branch against the base branch (e.g. `origin/master`), not against the current PR branch, so you see its independent contribution. For each item:

- Port non-overlapping Agent Notes or TODOs that meet the quality bar.
- Consolidate overlapping material into the existing Agent Note that owns the topic.
- Do not port duplicate or lower-confidence proposals just to preserve the count.
- Update the PR body so reviewers see the true candidate count and scope.
- Close the duplicate PR only when the user asked you to, or when you clearly own that housekeeping.
