import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamMember } from "./JobCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";

interface TeamMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  availableMembers: TeamMember[];
  currentTeam: TeamMember[];
  onAssign: (members: TeamMember[]) => void;
}

const TeamMemberDialog: FC<TeamMemberDialogProps> = ({
  isOpen,
  onClose,
  availableMembers,
  currentTeam,
  onAssign,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([]);

  // Filter out members already in the team
  const filteredAvailableMembers = availableMembers.filter(
    (member) => !currentTeam.some((teamMember) => teamMember.id === member.id)
  );

  // Apply search and role filters
  const displayedMembers = filteredAvailableMembers.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Get unique roles for the filter dropdown
  const roles = Array.from(
    new Set(filteredAvailableMembers.map((member) => member.role))
  );

  const handleToggleMember = (member: TeamMember) => {
    if (selectedMembers.some((m) => m.id === member.id)) {
      setSelectedMembers(selectedMembers.filter((m) => m.id !== member.id));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleAssign = () => {
    onAssign(selectedMembers);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Team Members</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-md">
            <div className="max-h-[300px] overflow-y-auto p-1">
              {displayedMembers.length > 0 ? (
                displayedMembers.map((member) => {
                  const isSelected = selectedMembers.some(
                    (m) => m.id === member.id
                  );
                  return (
                    <div
                      key={member.id}
                      onClick={() => handleToggleMember(member)}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                        isSelected ? "bg-primary/10" : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.role}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {isSelected && (
                          <div className="h-full w-full flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No matching team members found
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span>
              {selectedMembers.length} member{selectedMembers.length !== 1 && "s"} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMembers([])}
              disabled={selectedMembers.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={selectedMembers.length === 0}>
            Assign {selectedMembers.length > 0 && `(${selectedMembers.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberDialog;