import { workspaceDirections } from '../lib/learner-directions';
export function WorkspaceStart({
  where,
  action = '',
}: {
  where: string;
  action?: string;
}) {
  return (
    <p className="workspace-start">
      <strong>Start here: </strong>
      {workspaceDirections(where, action)}
    </p>
  );
}
