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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { X, Plus } from "lucide-react";

import { UserData } from '@/types/user';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
  onSave: (updatedUser: UserData) => void; // Will be used later for saving changes
}

const UserProfileModal: FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    // Initialize local state when user prop changes (e.g., when modal opens for a different user)
    if (user) {
      setCurrentUserData(JSON.parse(JSON.stringify(user))); // Deep copy
    } else {
      setCurrentUserData(null);
    }
  }, [user]);

  if (!currentUserData) {
    return null;
  }

  const handleSkillAdd = () => {
    if (newSkill.trim() && !currentUserData.skills?.includes(newSkill.trim())) {
      setCurrentUserData({
        ...currentUserData,
        skills: [...(currentUserData.skills || []), newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setCurrentUserData({
      ...currentUserData,
      skills: currentUserData.skills?.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleSaveChanges = () => {
    if (currentUserData) {
      onSave(currentUserData);
    }
  };

  // Placeholder for badge colors, can be refactored later
  const getRoleBadgeColor = (role: UserData["role"]) => {
    switch (role) {
      case "Admin":
        return "bg-purple-500 text-white";
      case "Architect":
        return "bg-primary text-white";
      case "Designer":
        return "bg-accent text-white";
      case "Project Manager":
        return "bg-secondary text-white";
      case "Client":
        return "bg-amber-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBadgeColor = (status: "Active" | "Inactive") => {
    return status === "Active" ? "bg-green-500 text-white" : "bg-gray-400 text-white";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            View and edit user details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* User Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={currentUserData.avatar} alt={currentUserData.name} />
              <AvatarFallback>{currentUserData.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{currentUserData.name}</h2>
              <p className="text-sm text-muted-foreground">{currentUserData.email}</p>
              <div className="mt-1 flex gap-2">
                <Badge className={getRoleBadgeColor(currentUserData.role)}>{currentUserData.role}</Badge>
                <Badge className={getStatusBadgeColor(currentUserData.status)}>{currentUserData.status}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Basic Information Section (Read-only for now) */}
          <div>
            <h3 className="text-lg font-medium mb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userName">Name</Label>
                <Input id="userName" value={currentUserData.name} readOnly className="mt-1" />
              </div>
              <div>
                <Label htmlFor="userEmail">Email</Label>
                <Input id="userEmail" value={currentUserData.email} readOnly className="mt-1" />
              </div>
              <div>
                <Label htmlFor="userRole">Role</Label>
                <Input id="userRole" value={currentUserData.role} readOnly className="mt-1" />
              </div>
              <div>
                <Label htmlFor="userStatus">Status</Label>
                <Input id="userStatus" value={currentUserData.status} readOnly className="mt-1" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Skills Section */}
          {currentUserData.role !== 'Client' && (
            <div>
              <h3 className="text-lg font-medium mb-3">Skills</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSkillAdd();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleSkillAdd} variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {currentUserData.skills && currentUserData.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentUserData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <Button
                          variant="ghost"
                          size="xs"
                          className="h-auto w-auto p-0.5 hover:bg-destructive/20"
                          onClick={() => handleSkillRemove(skill)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No skills listed. Add some above.</p>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Availability Section */}
          {currentUserData.role !== 'Client' && (
            <div>
              <h3 className="text-lg font-medium mb-3">Availability</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="weeklyCapacity">Weekly Capacity (hours)</Label>
                  <Input
                    id="weeklyCapacity"
                    type="number"
                    placeholder="e.g., 40"
                    value={currentUserData.weeklyCapacity || ""}
                    onChange={(e) =>
                      setCurrentUserData({
                        ...currentUserData,
                        weeklyCapacity: e.target.value
                          ? Math.max(0, Math.min(168, parseInt(e.target.value, 10)))
                          : undefined,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="availabilityNotes">Availability Notes</Label>
                  <Textarea
                    id="availabilityNotes"
                    placeholder="e.g., On vacation next week, Dedicated to Project X..."
                    value={currentUserData.availabilityNotes || ""}
                    onChange={(e) =>
                      setCurrentUserData({
                        ...currentUserData,
                        availabilityNotes: e.target.value,
                      })
                    }
                    className="mt-1 min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="availabilitySummary">Availability Summary (Display Only)</Label>
                  <Input
                    id="availabilitySummary"
                    value={currentUserData.availabilitySummary || "N/A"}
                    readOnly
                    className="mt-1 bg-muted/50"
                  />
                   <p className="text-xs text-muted-foreground mt-1">
                    This summary is currently set in the mock data. It could be auto-calculated in the future.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
