export type MemoryNamespace =
  | "company_profile"
  | "workflow_state"
  | "decision_log"
  | "repo_structure";

export type MemoryRecord<
  T = unknown
> = {
  id: string;
  namespace: MemoryNamespace;
  key: string;
  value: T;
  createdAt: string;
};
