import { FC } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit3, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Assuming UserData will be imported from a shared types file or UsersPage
// For now, defining a simplified version for this component's needs
export interface UserAssignment { // Exporting for use in ResourceOverviewPage
  projectId: string;
  projectName: string;
  allocatedHours: number;
  projectDeadline?: Date;
}

export interface UserWorkloadData {
  id: number;
  name: string;
  avatar?: string;
  role: "Admin" | "Client" | "Architect" | "Designer" | "Project Manager"; // Should match UserData roles
  weeklyCapacity?: number;
  currentAssignments?: UserAssignment[];
  skills?: string[]; // For potential future display on card
}

interface UserWorkloadCardProps {
  user: UserWorkloadData;
  onEditAssignmentClick: (user: UserWorkloadData, assignment: UserAssignment) => void;
  onAddAssignmentClick: (user: UserWorkloadData) => void;
}

const UserWorkloadCard: FC<UserWorkloadCardProps> = ({
  user,
  onEditAssignmentClick,
  onAddAssignmentClick
}) => {
  const { name, avatar, role, weeklyCapacity = 0, currentAssignments = [] } = user;
  
  const getRoleBadgeColor = (role: UserWorkloadData["role"]) => {
    // This function should ideally be imported from a shared utils file
    switch (role) {
      case "Admin": return "bg-purple-500 text-white";
      case "Architect": return "bg-primary text-white";
      case "Designer": return "bg-accent text-white";
      case "Project Manager": return "bg-secondary text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };


  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <Badge className={`mt-1 text-xs ${getRoleBadgeColor(user.role)}`}>{user.role}</Badge>
            </div>
          </div>
          {/* Future: Add action button like "View Details" or "Assign Project" */}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="text-muted-foreground">Workload</span>
            <span>
              {totalAllocatedHours}h / {weeklyCapacity > 0 ? `${weeklyCapacity}h` : 'N/A'}
            </span>
          </div>
          <Progress
            value={Math.min(workloadPercentage, 100)} // Cap at 100 for visual display if over-allocated
            className={cn(
              "h-2",
              workloadPercentage > 100 ? "bg-red-200 dark:bg-red-900 [&>*]:bg-red-500 dark:[&>*]:bg-red-400" :
              workloadPercentage > 90 ? "bg-red-200 dark:bg-red-900 [&>*]:bg-red-500 dark:[&>*]:bg-red-400" :
              workloadPercentage > 70 ? "bg-yellow-200 dark:bg-yellow-900 [&>*]:bg-yellow-500 dark:[&>*]:bg-yellow-400" :
              "bg-green-200 dark:bg-green-900 [&>*]:bg-green-500 dark:[&>*]:bg-green-400"
            )}
          />
           {workloadPercentage > 100 && (
            <p className="text-xs text-red-500 mt-1">Over allocated by {totalAllocatedHours - weeklyCapacity}h ({workloadPercentage.toFixed(0)}%)</p>
          )}
          {weeklyCapacity === 0 && <p className="text-xs text-muted-foreground mt-1">Weekly capacity not set.</p>}
        </div>

        <div className="space-y-2 pt-2">
          <h4 className="text-sm font-medium text-muted-foreground mb-1.5">Current Assignments:</h4>
          {user.currentAssignments && user.currentAssignments.length > 0 ? (
            <div className="max-h-32 overflow-y-auto space-y-1 pr-1"> {/* Reduced pr for scrollbar visibility */}
              {user.currentAssignments.map((assignment) => (
                <div key={assignment.projectId} className="text-xs p-2 bg-muted/50 rounded-md hover:bg-muted/70 transition-colors group">
                  <div className="flex justify-between items-center">
                    <div className="truncate">
                      <span className="font-medium block truncate" title={assignment.projectName}>
                        {assignment.projectName}
                      </span>
                      {assignment.projectDeadline && (
                        <p className="text-muted-foreground text-xs">
                          Deadline: {new Date(assignment.projectDeadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Badge variant="outline" className="whitespace-nowrap">{assignment.allocatedHours}h</Badge>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onEditAssignmentClick(user, assignment)}
                        >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit Assignment</span>
                        </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2">No current assignments.</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center gap-1.5 text-xs"
          onClick={() => onAddAssignmentClick(user)}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Assign to Project
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserWorkloadCard;
