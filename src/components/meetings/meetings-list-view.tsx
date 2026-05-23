import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPill } from "@/components/status-pill";
import { MeetingRowActions } from "@/components/meetings/meeting-row-actions";
import { MeetingsListSkeleton } from "@/components/skeletons/meetings/meetings-list-skeleton";
import type { Meeting } from "@/types/meeting";

type MeetingsListViewProps = {
  meetings: Meeting[];
  isLoading?: boolean;
  onEditMeeting?: (meeting: Meeting) => void;
  onDeleteMeeting?: (meeting: Meeting) => void;
  actionsDisabled?: boolean;
};

export function MeetingsListView({
  meetings,
  isLoading,
  onEditMeeting,
  onDeleteMeeting,
  actionsDisabled
}: MeetingsListViewProps) {
  const showActions = onEditMeeting != null || onDeleteMeeting != null;

  if (isLoading && meetings.length === 0) {
    return <MeetingsListSkeleton showActions={showActions} />;
  }

  if (!isLoading && meetings.length === 0) {
    return (
      <div className="flex items-center justify-center px-6 py-16 text-sm text-muted-foreground">
        No meetings found.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead>Title</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Campaign</TableHead>
          <TableHead className="min-w-[180px]">Meeting Date & Time</TableHead>
          <TableHead className="min-w-[100px]">Booked At</TableHead>
          <TableHead>Status</TableHead>
          {showActions ? <TableHead className="w-[180px] text-right">Actions</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {meetings.map((m) => (
          <TableRow key={m.id} className="hover:bg-primary/5">
            <TableCell className="font-medium">{m.leadName}</TableCell>
            <TableCell>{m.company}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{m.campaign}</TableCell>
            <TableCell className="text-sm">{m.date}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{m.bookedAt}</TableCell>
            <TableCell>
              <StatusPill status={m.status} />
            </TableCell>
            {showActions ? (
              <TableCell className="text-right">
                <MeetingRowActions
                  meeting={m}
                  onEdit={onEditMeeting}
                  onDelete={onDeleteMeeting}
                  disabled={actionsDisabled}
                  className="justify-end"
                />
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
