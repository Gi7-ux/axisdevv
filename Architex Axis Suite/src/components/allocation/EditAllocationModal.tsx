import { FC, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserData } from "@/components/user/UserProfileModal"; // correct export location
import { ProjectSelectItem } from "@/pages/ResourceOverviewPage"; // ✅ this is correct

export interface AssignmentData {
  projectId: string;
  projectName?: string; // Optional here, as it's mainly for display from project list
  allocatedHours: number;
  projectDeadline?: Date; // Keep for compatibility with UserData.currentAssignments
}

interface EditAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
  assignmentToEdit?: AssignmentData | null; // The specific assignment to edit
  allProjects: ProjectSelectItem[];
  onSaveAssignment: (userId: number, assignmentData: AssignmentData, isNew: boolean) => void;
}

const EditAllocationModal: FC<EditAllocationModalProps> = ({
  isOpen,
  onClose,
  user,
  assignmentToEdit,
  allProjects,
  onSaveAssignment,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [allocatedHours, setAllocatedHours] = useState<number | string>(""); // Use string for input flexibility
  const [validationError, setValidationError] = useState<string>("");

  const isEditing = !!assignmentToEdit;

  useEffect(() => {
    if (isOpen) {
      setValidationError(""); // Reset error on open
      if (isEditing && assignmentToEdit) {
        setSelectedProjectId(assignmentToEdit.projectId);
        setAllocatedHours(assignmentToEdit.allocatedHours);
      } else {
        // Reset for new assignment
        setSelectedProjectId("");
        setAllocatedHours("");
      }
    }
  }, [isOpen, isEditing, assignmentToEdit]);

  if (!user) return null;

  const availableProjectsForAssignment = allProjects.filter(
    (p) => !user.currentAssignments?.some(a => a.projectId === p.projectId) || (isEditing && p.projectId === selectedProjectId)
  );

  const handleSubmit = () => {
    const hours = Number(allocatedHours);
    if (!selectedProjectId) {
      setValidationError("Please select a project.");
      return;
    }
    if (isNaN(hours) || hours <= 0) {
      setValidationError("Allocated hours must be a positive number.");
      return;
    }
    setValidationError("");

    const projectDetails = allProjects.find(p => p.projectId === selectedProjectId);

    onSaveAssignment(
      user.id,
      {
        projectId: selectedProjectId,
        projectName: projectDetails?.projectName, // Add projectName for consistency if needed elsewhere
        allocatedHours: hours,
        // projectDeadline: projectDetails?.projectDeadline, // If available and needed
      },
      !isEditing
    );
    onClose(); // Close modal after save
  };

  const currentProjectName = isEditing ? assignmentToEdit?.projectName || allProjects.find(p=>p.projectId === assignmentToEdit?.projectId)?.projectName : "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit Allocation for ${user.name}` : `Assign Project to ${user.name}`}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Modifying assignment for project: ${currentProjectName}`
              : "Select a project and set the allocated hours for this user."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="project">Project</Label>
            {isEditing ? (
              <Input id="project" value={currentProjectName} readOnly className="mt-1 bg-muted/50" />
            ) : (
              <Select
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
                disabled={isEditing}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {availableProjectsForAssignment.length > 0 ? (
                    availableProjectsForAssignment.map((proj) => (
                      <SelectItem key={proj.projectId} value={proj.projectId}>
                        {proj.projectName}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">No new projects to assign.</div>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label htmlFor="allocatedHours">Allocated Hours</Label>
            <Input
              id="allocatedHours"
              type="number"
              placeholder="e.g., 20"
              value={allocatedHours}
              onChange={(e) => setAllocatedHours(e.target.value)}
              className="mt-1"
            />
          </div>
          {validationError && <p className="text-sm text-red-500">{validationError}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? "Save Changes" : "Add Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAllocationModal;
