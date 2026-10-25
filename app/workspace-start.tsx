import { ServerRoleText } from './server-role-text';
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
      <ServerRoleText text={workspaceDirections(where, action)} />
    </p>
  );
}
