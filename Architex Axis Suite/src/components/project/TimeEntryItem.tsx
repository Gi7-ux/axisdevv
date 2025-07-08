import { FC } from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  PaperclipIcon,
  MessageCircle,
  Pencil,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TimeEntry } from "./TimeEntryDialog";
import { Badge } from "@/components/ui/badge";

interface TimeEntryItemProps {
  entry: TimeEntry;
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entryId: string) => void;
  isAdmin?: boolean;
}

const TimeEntryItem: FC<TimeEntryItemProps> = ({
  entry,
  onEdit,
  onDelete,
  isAdmin = false,
}) => {
  const hasAttachments = entry.attachments && entry.attachments.length > 0;
  const hasComments = entry.comment || entry.adminComment;

  return (
    <div className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={entry.user.avatar} alt={entry.user.name} />
            <AvatarFallback>{entry.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{entry.user.name}</div>
            <div className="text-sm text-muted-foreground">{entry.user.role}</div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(entry)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(entry.id)}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Date</div>
          <div className="text-sm font-medium">
            {format(entry.date, "MMM d, yyyy")}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Hours</div>
          <div className="text-sm font-medium">{entry.hours} hours</div>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-sm text-muted-foreground">Description</div>
        <div className="text-sm mt-1">{entry.description}</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {hasComments && (
          <Badge variant="outline" className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" /> Comments
          </Badge>
        )}
        
        {hasAttachments && (
          <Badge variant="outline" className="flex items-center gap-1">
            <PaperclipIcon className="h-3 w-3" /> 
            {entry.attachments!.length} attachment{entry.attachments!.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {(hasComments || hasAttachments) && (
        <Collapsible className="mt-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex justify-center p-1 h-8 text-xs">
              Show Details
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-2 border-t pt-4">
            {entry.comment && (
              <div>
                <div className="text-sm font-medium flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> Freelancer Comment
                </div>
                <div className="text-sm mt-1 bg-muted p-3 rounded-md">
                  {entry.comment}
                </div>
              </div>
            )}

            {entry.adminComment && (
              <div>
                <div className="text-sm font-medium flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> Admin Comment
                </div>
                <div className="text-sm mt-1 bg-primary/10 p-3 rounded-md">
                  {entry.adminComment}
                </div>
              </div>
            )}

            {isAdmin && !entry.adminComment && (
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(entry)}
                  className="text-sm"
                >
                  <MessageCircle className="h-3 w-3 mr-1" /> Add Admin Comment
                </Button>
              </div>
            )}

            {hasAttachments && (
              <div>
                <div className="text-sm font-medium mb-2 flex items-center gap-1">
                  <PaperclipIcon className="h-3 w-3" /> Attachments
                </div>
                <div className="space-y-2">
                  {entry.attachments!.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between bg-muted rounded-md p-2"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <PaperclipIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="truncate">
                          <p className="truncate text-sm font-medium">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {file.size}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 text-xs">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export default TimeEntryItem;