import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, PaperclipIcon, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { TeamMember } from "./JobCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface TimeEntry {
  id: string;
  user: TeamMember;
  date: Date;
  hours: number;
  description: string;
  comment?: string;
  adminComment?: string;
  attachments?: {
    id: string;
    name: string;
    size: string;
    type: string;
  }[];
}

interface TimeEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  timeEntry?: TimeEntry;
  teamMembers: TeamMember[];
  onSave: (timeEntry: TimeEntry) => void;
  isAdmin?: boolean;
}

const TimeEntryDialog: FC<TimeEntryDialogProps> = ({
  isOpen,
  onClose,
  timeEntry,
  teamMembers,
  onSave,
  isAdmin = false,
}) => {
  const isEditing = Boolean(timeEntry);
  const [attachments, setAttachments] = useState<
    { id: string; name: string; size: string; type: string }[]
  >(timeEntry?.attachments || []);

  const form = useForm<{
    user: string;
    date: Date;
    hours: number;
    description: string;
    comment: string;
    adminComment: string;
  }>({
    defaultValues: {
      user: timeEntry?.user?.id || "",
      date: timeEntry?.date || new Date(),
      hours: timeEntry?.hours || 0,
      description: timeEntry?.description || "",
      comment: timeEntry?.comment || "",
      adminComment: timeEntry?.adminComment || "",
    },
  });

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments = Array.from(files).map((file) => {
      // Format file size to readable format
      const size =
        file.size < 1024 * 1024
          ? `${Math.round(file.size / 1024)} KB`
          : `${Math.round(file.size / (1024 * 1024))} MB`;

      return {
        id: `file-${Date.now()}-${file.name}`,
        name: file.name,
        size,
        type: file.type,
      };
    });

    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((att) => att.id !== id));
  };

  const onSubmit = form.handleSubmit((data) => {
    const selectedUser = teamMembers.find((m) => m.id === data.user);
    
    if (!selectedUser && !timeEntry?.user) {
      form.setError("user", {
        type: "manual",
        message: "Please select a team member",
      });
      return;
    }

    onSave({
      id: timeEntry?.id || `time-${Date.now()}`,
      user: selectedUser || timeEntry!.user,
      date: data.date,
      hours: data.hours,
      description: data.description,
      comment: data.comment,
      adminComment: data.adminComment,
      attachments,
    });
    
    onClose();
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Time Entry" : "Add Time Entry"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            {(isAdmin || !isEditing) && (
              <FormField
                control={form.control}
                name="user"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Member</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isEditing && !isAdmin}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} - {member.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => field.onChange(date || new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.25"
                        min="0.25"
                        max="24"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the work done..."
                      {...field}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Freelancer Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add your comments about this work..."
                      {...field}
                      rows={2}
                      disabled={isAdmin && !isEditing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isAdmin && (
              <FormField
                control={form.control}
                name="adminComment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Comment</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add admin feedback or notes..."
                        {...field}
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-2">
              <FormLabel>Attachments</FormLabel>
              <div className="border rounded-md p-4">
                <div className="space-y-2">
                  {attachments.map((file) => (
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(file.id)}
                        className="h-8 w-8 p-0"
                      >
                        <span className="sr-only">Remove file</span>
                        <span aria-hidden="true">×</span>
                      </Button>
                    </div>
                  ))}

                  {attachments.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No files attached
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-1 rounded-md border border-dashed p-3 cursor-pointer hover:bg-muted transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">Upload files</span>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleAttachmentUpload}
                    />
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Save Changes" : "Add Entry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TimeEntryDialog;