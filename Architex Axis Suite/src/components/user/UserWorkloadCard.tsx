import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Removed CardDescription
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils"; // Import cn utility

// Assuming UserData will be imported from a shared types file or UsersPage
// For now, defining a simplified version for this component's needs
interface UserAssignment {
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
}

const UserWorkloadCard: FC<UserWorkloadCardProps> = ({ user }) => {
  const totalAllocatedHours = user.currentAssignments?.reduce(
    (sum, assignment) => sum + assignment.allocatedHours,
    0
  ) || 0;

  const weeklyCapacity = user.weeklyCapacity || 0;
  const workloadPercentage = weeklyCapacity > 0 ? (totalAllocatedHours / weeklyCapacity) * 100 : 0;
  // Note: This percentage calculation might need refinement.
  // E.g., if allocatedHours are total for project, and weeklyCapacity is per week.
  // For now, it's a direct comparison. A more accurate model would consider project timelines.
  // Let's assume allocatedHours here are "current weekly allocated hours" for simplicity in this first pass.
  // Or, if allocatedHours is total for a project, then workloadPercentage makes less sense without project duration.
  // For this card, let's interpret `allocatedHours` in `currentAssignments` as "active weekly hours on this project".
  // And `weeklyCapacity` is the user's total capacity per week.

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
          <h4 className="text-sm font-medium text-muted-foreground">Current Assignments:</h4>
          {user.currentAssignments && user.currentAssignments.length > 0 ? (
            <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
              {user.currentAssignments.map((assignment) => (
                <div key={assignment.projectId} className="text-xs p-2 bg-muted/50 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate" title={assignment.projectName}>
                      {assignment.projectName}
                    </span>
                    <Badge variant="outline">{assignment.allocatedHours}h</Badge>
                  </div>
                  {assignment.projectDeadline && (
                     <p className="text-muted-foreground text-xs">
                       Deadline: {new Date(assignment.projectDeadline).toLocaleDateString()}
                     </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No current assignments.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserWorkloadCard;
