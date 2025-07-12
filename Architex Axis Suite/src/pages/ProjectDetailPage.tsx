import { FC, useState } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import JobCard, { Task, TeamMember } from "@/components/project/JobCard";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Calendar,
  MessageSquare,
  ClipboardList,
  Clock,
  Plus,
  CalendarDays,
  Users,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import JobCardScreen from "@/components/project/JobCardScreen";
import TeamMemberDialog from "@/components/project/TeamMemberDialog";
import TimeEntryDialog, { TimeEntry } from "@/components/project/TimeEntryDialog";
import TimeEntryItem from "@/components/project/TimeEntryItem";
import { Input } from "@/components/ui/input";

interface ProjectData {
  id: string;
  name: string;
  client: string;
  description: string;
  deadline: Date;
  startDate: Date;
  status: "Active" | "On Hold" | "Completed" | "At Risk";
  progress: number;
  budget: number;
  // team: TeamMember[]; // Old structure
  teamAssignments: { userId: string; allocatedHours: number; role?: string }[]; // New structure
  customFields?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// Mock custom fields data (as defined in SettingsPage)
const mockCustomFields = [
  { id: 'cf_1', name: 'Client Contact Number', type: 'Text', entity: 'Project', isRequired: true },
  { id: 'cf_2', name: 'Permit Status', type: 'Select', entity: 'Project', isRequired: true, options: ['Not Started', 'Submitted', 'Approved', 'Rejected'] },
  { id: 'cf_3', name: 'Site Visit Required', type: 'Checkbox', entity: 'Task', isRequired: false },
  { id: 'cf_4', name: 'Budget Allocation', type: 'Number', entity: 'Project', isRequired: false },
  { id: 'cf_5', name: 'Next Follow-up Date', type: 'Date', entity: 'Project', isRequired: true },
  { id: 'cf_6', name: 'Project Notes', type: 'Textarea', entity: 'Project', isRequired: false },
];

// This TeamMember type is used by JobCard and TeamMemberDialog.
// It's more of a display representation of a user.
// The source of truth for user details should be UserData from UsersPage.
export type { TeamMember };


const project: ProjectData = {
  id: "p-1",
  name: "Harbor View Residences",
  client: "Coastal Development Corp",
  description: "A luxury residential complex featuring modern architecture with sea views, sustainable design elements, and community spaces. Located in the harbor district.",
  deadline: new Date(2025, 6, 15), // July 15, 2025
  startDate: new Date(2025, 0, 10), // January 10, 2025
  status: "Active",
  progress: 65,
  budget: 2500000,
  teamAssignments: [ // Updated to new structure
    { userId: "1", allocatedHours: 120, role: "Project Manager" }, // Alex Turner (User ID 1)
    { userId: "2", allocatedHours: 200, role: "Architect" },       // Maya Patel (User ID 2)
    { userId: "3", allocatedHours: 150, role: "Designer" },        // Sam Chen (User ID 3)
  ],
  customFields: {
    'cf_1': '+1-234-567-8901',
    'cf_2': 'Submitted',
    'cf_4': 500000,
    'cf_5': new Date(2025, 3, 1), // April 1, 2025
    'cf_6': 'Initial client meeting was positive. They are looking for a blend of modern and industrial styles. Key focus on sustainability and natural light.',
  }
};

// Sample user data that might be fetched or available globally
// For now, this helps map userId to user details for display in ProjectDetailPage
// This is a temporary solution. Ideally, UserData from UsersPage would be accessible.
const projectTeamMembersForDisplay: TeamMember[] = [
    {
      id: "1",
      name: "Alex Turner",
      role: "Project Manager",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop"
    },
    {
      id: "2",
      name: "Maya Patel",
      role: "Architect",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
    },
    {
      id: "3",
      name: "Sam Chen",
      role: "Designer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop"
    }
];

// Available team members for assignment (remains the same for dialogs)
const availableTeamMembers: TeamMember[] = [
  ...projectTeamMembersForDisplay,
  {
    id: "4",
    name: "Elena Rodriguez",
    role: "Interior Designer",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop"
  },
  {
    id: "5",
    name: "David Kim",
    role: "Structural Engineer",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80&h=80&fit=crop"
  },
  {
    id: "6",
    name: "Sarah Johnson",
    role: "Landscape Architect",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop"
  },
  {
    id: "7",
    name: "Thomas Wright",
    role: "Project Coordinator",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop"
  }
];

// Job cards with tasks
const initialJobCards = [
  {
    id: "job-1",
    title: "Site Analysis and Planning",
    description: "Evaluate the site and create initial planning documents",
    dueDate: new Date(2025, 1, 15), // February 15, 2025
    assignedTo: [projectTeamMembersForDisplay[0], projectTeamMembersForDisplay[1]], // Use mapped display members
    tasks: [
      { id: "task-1-1", title: "Conduct site visit", completed: true },
      { id: "task-1-2", title: "Analyze soil conditions", completed: true },
      { id: "task-1-3", title: "Review local building codes", completed: false },
      { id: "task-1-4", title: "Create preliminary site plan", completed: false }
    ]
  },
  {
    id: "job-2",
    title: "Concept Design",
    description: "Develop architectural concepts based on client requirements",
    dueDate: new Date(2025, 2, 20), // March 20, 2025
    assignedTo: [projectTeamMembersForDisplay[1], projectTeamMembersForDisplay[2]], // Use mapped display members
    tasks: [
      { id: "task-2-1", title: "Research similar architectural styles", completed: true },
      { id: "task-2-2", title: "Create initial sketches", completed: true },
      { id: "task-2-3", title: "Develop 3D concept models", completed: false },
      { id: "task-2-4", title: "Present concepts to client", completed: false }
    ]
  },
  {
    id: "job-3",
    title: "Detailed Design",
    description: "Create detailed architectural and engineering drawings",
    dueDate: new Date(2025, 4, 10), // May 10, 2025
    assignedTo: [projectTeamMembersForDisplay[1]], // Use mapped display members
    tasks: [
      { id: "task-3-1", title: "Create floor plans", completed: false },
      { id: "task-3-2", title: "Develop elevation drawings", completed: false },
      { id: "task-3-3", title: "Design structural components", completed: false },
      { id: "task-3-4", title: "Coordinate with engineering team", completed: false }
    ]
  }
];

// Messages in the communication tab
const messages = [
  {
    id: "msg-1",
    sender: {
      id: "client-1",
      name: "Robert Johnson",
      role: "Client",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&h=80&fit=crop"
    },
    content: "I've reviewed the initial concepts and I'm impressed with the direction. However, I would like to see more options for the facade material.",
    timestamp: new Date(2025, 1, 10, 14, 30),
    attachments: []
  },
  {
    id: "msg-2",
    sender: projectTeamMembersForDisplay[1], // Use mapped display members
    content: "Thank you for the feedback. We'll prepare alternative facade options for our next presentation. Are there specific materials you're interested in exploring?",
    timestamp: new Date(2025, 1, 10, 15, 45),
    attachments: []
  },
  {
    id: "msg-3",
    sender: {
      id: "client-1",
      name: "Robert Johnson",
      role: "Client",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&h=80&fit=crop"
    },
    content: "I'm particularly interested in sustainable materials that still provide a luxury appearance. Perhaps some combination of glass, stone, and reclaimed wood?",
    timestamp: new Date(2025, 1, 11, 9, 15),
    attachments: []
  }
];

// Time entries
const initialTimeEntries: TimeEntry[] = [
  {
    id: "time-1",
    user: projectTeamMembersForDisplay[1],  // Use mapped display members
    date: new Date(2025, 1, 8),
    hours: 6.5,
    description: "Site analysis and initial concept sketching",
    comment: "Completed the initial site analysis with preliminary sketches. The terrain has some challenging aspects that will require creative solutions.",
    attachments: [
      {
        id: "file-1",
        name: "site_sketches.pdf",
        size: "2.4 MB",
        type: "application/pdf"
      }
    ]
  },
  {
    id: "time-2",
    user: projectTeamMembersForDisplay[2], // Use mapped display members
    date: new Date(2025, 1, 9),
    hours: 8,
    description: "Research on sustainable materials and 3D modeling",
    comment: "Researched various eco-friendly materials that would suit the coastal environment while maintaining the luxury aesthetic.",
    adminComment: "Great work on the material research. The client is very pleased with the sustainable options presented.",
    attachments: [
      {
        id: "file-2",
        name: "materials_research.xlsx",
        size: "1.8 MB",
        type: "application/excel"
      },
      {
        id: "file-3",
        name: "concept_render.jpg",
        size: "5.2 MB",
        type: "image/jpeg"
      }
    ]
  },
  {
    id: "time-3",
    user: projectTeamMembersForDisplay[0], // Use mapped display members
    date: new Date(2025, 1, 10),
    hours: 4,
    description: "Client meeting preparation and project planning",
    comment: "Prepared presentation materials and agenda for the client meeting. Coordinated with the design team to ensure all materials were ready."
  }
];

const getStatusColor = (status: ProjectData["status"]) => {
  switch (status) {
    case "Active":
      return "bg-green-500 text-white";
    case "On Hold":
      return "bg-amber-500 text-white";
    case "Completed":
      return "bg-primary text-white";
    case "At Risk":
      return "bg-destructive text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const ProjectDetailPage: FC = () => {
  const { toast } = useToast();
  const [jobCards, setJobCards] = useState(initialJobCards);
  // The projectTeam state now stores the TeamMember[] for display purposes.
  // Actual assignments are in project.teamAssignments
  const projectTeamForDisplay = useMemo(() => 
    project.teamAssignments?.map(assignment => 
      getUserById(assignment.userId) // Fetch from user store
    ).filter(Boolean) || []
  , [project.teamAssignments]);
  const [timeEntries, setTimeEntries] = useState(initialTimeEntries);
  
  // Dialogs state
  const [isNewJobCardOpen, setIsNewJobCardOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isTimeEntryDialogOpen, setIsTimeEntryDialogOpen] = useState(false);
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | undefined>(undefined);
  const [timeEntrySearch, setTimeEntrySearch] = useState("");
  
  // Task handlers
  const handleTaskAdd = (jobCardId: string, taskTitle: string) => {
    setJobCards(jobCards.map(card => {
      if (card.id === jobCardId) {
        return {
          ...card,
          tasks: [
            ...card.tasks,
            {
              id: `task-${Date.now()}`,
              title: taskTitle,
              completed: false
            }
          ]
        };
      }
      return card;
    }));
    
    toast({
      title: "Task added",
      description: "New task has been added to the job card."
    });
  };
  
  const handleTaskToggle = (jobCardId: string, taskId: string) => {
    setJobCards(jobCards.map(card => {
      if (card.id === jobCardId) {
        return {
          ...card,
          tasks: card.tasks.map(task => {
            if (task.id === taskId) {
              return { ...task, completed: !task.completed };
            }
            return task;
          })
        };
      }
      return card;
    }));
  };
  
  // Job card handlers
  const handleDeleteJobCard = (jobCardId: string) => {
    setJobCards(jobCards.filter(card => card.id !== jobCardId));
    
    toast({
      title: "Job card deleted",
      description: "The job card and all its tasks have been removed."
    });
  };
  
  const handleAddJobCard = (jobCard: any) => {
    setJobCards([...jobCards, jobCard]);
    
    toast({
      title: "Job card created",
      description: "A new job card has been added to the project."
    });
  };
  
  const handleEditJobCard = (jobCardId: string, updatedJobCard: any) => {
    setJobCards(jobCards.map(card => {
      if (card.id === jobCardId) {
        return {
          ...updatedJobCard,
          id: jobCardId
        };
      }
      return card;
    }));
    
    toast({
      title: "Job card updated",
      description: "The job card has been successfully updated."
    });
  };
  
  // Team member handlers
  const handleAssignTeamMembers = (newMembers: TeamMember[]) => {
    // This function primarily updates the display list of team members.
    // Actual allocation changes would need to modify `project.teamAssignments`
    // and potentially a global state or backend.
    const updatedTeamForDisplay = [...projectTeamForDisplay];
    
    newMembers.forEach(member => {
      if (!updatedTeamForDisplay.some(m => m.id === member.id)) {
        updatedTeamForDisplay.push(member);
      }
    });
    
    setProjectTeamForDisplay(updatedTeamForDisplay);
    
    // TODO: Update project.teamAssignments here or via a more robust state management.
    // For now, this only updates the visual list in the Team tab.
    // Example of what might be needed:
    // const newAssignments = newMembers.map(m => ({ userId: m.id, allocatedHours: 0, role: m.role }));
    // project.teamAssignments = [...(project.teamAssignments || []), ...newAssignments.filter(na => !project.teamAssignments?.some(pa => pa.userId === na.userId))];


    toast({
      title: "Team members visually added",
      description: `${newMembers.length} new team member${newMembers.length !== 1 ? 's' : ''} added to the project display. Allocation data needs separate handling.`
    });
  };
  
  // Time entry handlers
  const handleAddTimeEntry = (entry: TimeEntry) => {
    if (currentTimeEntry) {
      setTimeEntries(timeEntries.map(item => 
        item.id === currentTimeEntry.id ? entry : item
      ));
      
      toast({
        title: "Time entry updated",
        description: "The time entry has been updated successfully."
      });
    } else {
      setTimeEntries([entry, ...timeEntries]);
      
      toast({
        title: "Time entry added",
        description: "A new time entry has been added to the project."
      });
    }
    
    setCurrentTimeEntry(undefined);
  };
  
  const handleEditTimeEntry = (entry: TimeEntry) => {
    setCurrentTimeEntry(entry);
    setIsTimeEntryDialogOpen(true);
  };
  
  const handleDeleteTimeEntry = (entryId: string) => {
    setTimeEntries(timeEntries.filter(entry => entry.id !== entryId));
    
    toast({
      title: "Time entry deleted",
      description: "The time entry has been removed from the project."
    });
  };
  
  // Calculate project metrics
  const totalTasks = jobCards.reduce((sum, card) => sum + card.tasks.length, 0);
  const completedTasks = jobCards.reduce(
    (sum, card) => sum + card.tasks.filter(task => task.completed).length, 
    0
  );
  
  // Filter time entries based on search
  const filteredTimeEntries = timeEntries.filter(entry => {
    const searchTerm = timeEntrySearch.toLowerCase();
    return entry.user.name.toLowerCase().includes(searchTerm) || 
           entry.description.toLowerCase().includes(searchTerm) ||
           entry.comment?.toLowerCase().includes(searchTerm) ||
           entry.adminComment?.toLowerCase().includes(searchTerm);
  });
  
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-secondary">{project.name}</h1>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">Client: {project.client}</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Export
              </Button>
              <Button 
                className="flex items-center gap-1"
                onClick={() => setIsNewJobCardOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Job Card
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{project.progress}%</div>
              <Progress value={project.progress} className="h-2 mt-2" />
              <div className="text-sm text-muted-foreground mt-2">
                {completedTasks} of {totalTasks} tasks completed
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted-foreground">Start Date</div>
                  <div className="font-medium">{format(project.startDate, "MMM d, yyyy")}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Deadline</div>
                  <div className="font-medium">{format(project.deadline, "MMM d, yyyy")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${project.budget.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Estimated total budget
              </div>
            </CardContent>
          </Card>

          {project.customFields && Object.keys(project.customFields).length > 0 && (
            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-2">
                {Object.entries(project.customFields).map(([fieldId, value]) => {
                  const fieldDef = mockCustomFields.find(f => f.id === fieldId);
                  if (!fieldDef) return null;

                  let displayValue = value;
                  if (fieldDef.type === 'Date' && value instanceof Date) {
                    displayValue = format(value, "MMM d, yyyy");
                  } else if (fieldDef.type === 'Checkbox') {
                    displayValue = value ? 'Yes' : 'No';
                  } else if (fieldDef.type === 'Number' && typeof value === 'number') {
                    displayValue = value.toLocaleString();
                  }

                  return (
                    <div key={fieldId} className="text-sm">
                      <p className="text-muted-foreground">{fieldDef.name}</p>
                      <p className="font-medium">{displayValue.toString()}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
        
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tasks" className="flex items-center gap-1">
              <ClipboardList className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="timeEntries" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Time Entries
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobCards.map(jobCard => (
                <JobCard
                  key={jobCard.id}
                  id={jobCard.id}
                  title={jobCard.title}
                  description={jobCard.description}
                  dueDate={jobCard.dueDate}
                  assignedTo={jobCard.assignedTo}
                  tasks={jobCard.tasks}
                  onTaskAdd={handleTaskAdd}
                  onTaskToggle={handleTaskToggle}
                  onDelete={handleDeleteJobCard}
                  onEdit={handleEditJobCard}
                  teamMembers={availableTeamMembers}
                />
              ))}
              
              <Card 
                className="border-dashed flex flex-col items-center justify-center py-8"
                onClick={() => setIsNewJobCardOpen(true)}
              >
                <Button variant="ghost" className="flex flex-col h-auto py-6">
                  <Plus className="h-8 w-8 mb-2" />
                  <span>Add New Job Card</span>
                </Button>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Project Team</CardTitle>
                <CardDescription>Team members assigned to this project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {projectTeamForDisplay.map(member => (
                    <div key={member.id} className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {member.role}
                          {/* Optionally, display allocated hours from project.teamAssignments if available */}
                          {project.teamAssignments?.find(a => a.userId === member.id) && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({project.teamAssignments.find(a => a.userId === member.id)?.allocatedHours || 0} hrs allocated)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-1"
                    onClick={() => setIsTeamDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Assign New Team Member
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Project Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[400px]">
                  <p className="text-muted-foreground">
                    Calendar view implementation coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Project Communication</CardTitle>
                <CardDescription>Messages and updates from the team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {messages.map(message => (
                    <div key={message.id} className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={message.sender.avatar} />
                        <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{message.sender.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(message.timestamp, "MMM d, h:mm a")}
                          </div>
                        </div>
                        <div className="text-sm mt-1">{message.content}</div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-6">
                    <textarea
                      className="w-full border rounded-md p-2 h-24"
                      placeholder="Write a message..."
                    ></textarea>
                    <div className="flex justify-end mt-2">
                      <Button>Send Message</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="timeEntries">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Time Entries</CardTitle>
                  <CardDescription>Track hours spent on the project</CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    setCurrentTimeEntry(undefined);
                    setIsTimeEntryDialogOpen(true);
                  }}
                >
                  Add Time Entry
                </Button>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search time entries..."
                    className="pl-8"
                    value={timeEntrySearch}
                    onChange={(e) => setTimeEntrySearch(e.target.value)}
                  />
                </div>
                
                <div className="space-y-4">
                  {filteredTimeEntries.length > 0 ? (
                    filteredTimeEntries.map(entry => (
                      <TimeEntryItem
                        key={entry.id}
                        entry={entry}
                        onEdit={handleEditTimeEntry}
                        onDelete={handleDeleteTimeEntry}
                        isAdmin={true}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {timeEntrySearch ? "No matching time entries found" : "No time entries yet"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialogs */}
      <JobCardScreen
        isOpen={isNewJobCardOpen}
        onClose={() => setIsNewJobCardOpen(false)}
        teamMembers={availableTeamMembers}
        onSave={handleAddJobCard}
      />
      
      <TeamMemberDialog
        isOpen={isTeamDialogOpen}
        onClose={() => setIsTeamDialogOpen(false)}
        availableMembers={availableTeamMembers}
        currentTeam={projectTeamForDisplay} // Pass the display team
        onAssign={handleAssignTeamMembers}
      />
      
      <TimeEntryDialog
        isOpen={isTimeEntryDialogOpen}
        onClose={() => setIsTimeEntryDialogOpen(false)}
        timeEntry={currentTimeEntry}
        teamMembers={projectTeamForDisplay} // Pass the display team
        onSave={handleAddTimeEntry}
        isAdmin={true}
      />
    </Layout>
  );
};

export default ProjectDetailPage;