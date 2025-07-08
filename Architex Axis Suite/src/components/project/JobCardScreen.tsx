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
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task, TeamMember } from "./JobCard";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";

interface JobCardData {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  assignedTo: TeamMember[];
  tasks: Task[];
}

interface JobCardScreenProps {
  isOpen: boolean;
  onClose: () => void;
  jobCard?: JobCardData;
  teamMembers: TeamMember[];
  onSave: (jobCard: JobCardData) => void;
}

const JobCardScreen: FC<JobCardScreenProps> = ({
  isOpen,
  onClose,
  jobCard,
  teamMembers,
  onSave,
}) => {
  const isEditing = Boolean(jobCard);
  const [tasks, setTasks] = useState<Task[]>(jobCard?.tasks || []);
  const [newTask, setNewTask] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>(
    jobCard?.assignedTo || []
  );

  const form = useForm<{
    title: string;
    description: string;
    dueDate: Date;
  }>({
    defaultValues: {
      title: jobCard?.title || "",
      description: jobCard?.description || "",
      dueDate: jobCard?.dueDate || new Date(),
    },
  });

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        {
          id: `task-${Date.now()}`,
          title: newTask,
          completed: false,
        },
      ]);
      setNewTask("");
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleAddTeamMember = (memberId: string) => {
    const memberToAdd = teamMembers.find((m) => m.id === memberId);
    if (
      memberToAdd &&
      !selectedMembers.some((member) => member.id === memberId)
    ) {
      setSelectedMembers([...selectedMembers, memberToAdd]);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== memberId));
  };

  const onSubmit = form.handleSubmit((data) => {
    onSave({
      id: jobCard?.id || `job-${Date.now()}`,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      assignedTo: selectedMembers,
      tasks,
    });
    onClose();
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Job Card" : "Create New Job Card"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter job title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter job description..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
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
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Team Members</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{member.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <Select onValueChange={handleAddTeamMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign team members" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers
                    .filter(
                      (member) =>
                        !selectedMembers.some((m) => m.id === member.id)
                    )
                    .map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage
                              src={member.avatar}
                              alt={member.name}
                            />
                            <AvatarFallback>
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {member.name} - {member.role}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <FormLabel>Tasks</FormLabel>
              <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={task.id}
                        checked={task.completed}
                        onCheckedChange={() => handleToggleTask(task.id)}
                      />
                      <label
                        htmlFor={task.id}
                        className={`text-sm ${
                          task.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {task.title}
                      </label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    No tasks added yet
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add a new task..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddTask();
                    }
                  }}
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddTask}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Save Changes" : "Create Job Card"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default JobCardScreen;