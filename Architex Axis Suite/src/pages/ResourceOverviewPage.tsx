import { FC, useState, useEffect } from "react";
import Layout from "@/components/Layout";
import UserWorkloadCard, { UserWorkloadData, UserAssignment } from "@/components/user/UserWorkloadCard";
import EditAllocationModal, { AssignmentData as ModalAssignmentData } from "@/components/allocation/EditAllocationModal";
import { initialUsers, UserData as PageUserData } from "./UsersPage"; // Ensuring PageUserData is the full UserData type
import { useToast } from "@/hooks/use-toast";


export interface ProjectSelectItem {
  projectId: string;
  projectName: string;
}

// Mock list of all available projects in the system
// This would typically come from a projects API endpoint or a global state
export const mockProjectsList: ProjectSelectItem[] = [
  { projectId: "p-1", projectName: "Harbor View Residences" },
  { projectId: "p-2", projectName: "Riverfront Boutique Hotel" },
  { projectId: "p-3", projectName: "Metropolitan Office Complex" },
  { projectId: "p-4", projectName: "Sunset Valley Community Center" },
  { projectId: "p-5", projectName: "Tech Innovation Campus" }, // Matches a completed project in ReportsPage mock data
  { projectId: "p-6", projectName: "Downtown Art Museum" },
  { projectId: "p-7", projectName: "Greenfield Eco-Villas" },
  { projectId: "p-8", projectName: "Skyline Tower Renovation" },
];


const ResourceOverviewPage: FC = () => {
  // In a real app, users data would be fetched or come from a global state
  // For now, using a state variable that's a mutable copy of initialUsers
  const { toast } = useToast();
  // Replace JSON-based deep clone with built-in structuredClone for efficiency and fidelity
  const [usersData, setUsersData] = useState<PageUserData[]>(() => structuredClone(initialUsers));
  const [teamMembersForDisplay, setTeamMembersForDisplay] = useState<PageUserData[]>([]);

  const [isEditAllocationModalOpen, setIsEditAllocationModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PageUserData | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<UserAssignment | null>(null);


  useEffect(() => {
    // Filter out clients and users without capacity for a cleaner overview
    const relevantMembers = usersData.filter(
      user => user.role !== 'Client' && user.weeklyCapacity && user.weeklyCapacity > 0
    );
    setTeamMembersForDisplay(relevantMembers);
  }, [usersData]);

  const handleOpenEditAllocationModal = (user: PageUserData, assignment?: UserAssignment) => {
    setEditingUser(user);
    setEditingAssignment(assignment || null);
    setIsEditAllocationModalOpen(true);
  };

  const handleCloseEditAllocationModal = () => {
    setIsEditAllocationModalOpen(false);
    setEditingUser(null);
    setEditingAssignment(null);
  };

  const handleSaveAssignment = (userId: number, assignmentData: ModalAssignmentData, isNew: boolean) => {
    const projectInfo = mockProjectsList.find(p => p.projectId === assignmentData.projectId);
    
    setUsersData(prevUsers =>
      prevUsers.map(user => {
        if (user.id === userId) {
          const updatedAssignments = [...(user.currentAssignments || [])];

          if (isNew) {
            // Ensure not adding a duplicate projectId silently, though modal filters this
            if (!updatedAssignments.some(a => a.projectId === assignmentData.projectId)) {
              updatedAssignments.push({
                ...assignmentData,
                projectName: projectInfo?.projectName || "Unknown Project", // Get projectName from mockProjectsList
                // projectDeadline: projectInfo?.projectDeadline, // If project list had deadlines
              });
            }
          } else { // Editing existing
            const assignmentIndex = updatedAssignments.findIndex(a => a.projectId === assignmentData.projectId);
            if (assignmentIndex !== -1) {
              updatedAssignments[assignmentIndex] = {
                ...updatedAssignments[assignmentIndex], // Keep existing details like deadline
                ...assignmentData, // Overwrite with new hours, potentially new projectName if it changed (though it shouldn't for edit)
                projectName: projectInfo?.projectName || updatedAssignments[assignmentIndex].projectName,
              };
            }
          }
          return { ...user, currentAssignments: updatedAssignments };
        }
        return user;
      })
    );
    toast({
        title: `Assignment ${isNew ? 'added' : 'updated'}`,
        description: `${editingUser?.name} is now allocated ${assignmentData.allocatedHours}h to ${assignmentData.projectName || projectInfo?.projectName}.`,
    });
    handleCloseEditAllocationModal();
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-secondary mb-4 md:mb-0">
            Team Resource Overview
          </h1>
          {/* Add filter/sort options here in the future */}
        </div>

        {teamMembersForDisplay.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teamMembersForDisplay.map((member) => (
              <UserWorkloadCard
                key={member.id}
                user={member as UserWorkloadData}
                onEditAssignmentClick={(userToEdit, assignment) => handleOpenEditAllocationModal(userToEdit as PageUserData, assignment)}
                onAddAssignmentClick={(userToAddFor) => handleOpenEditAllocationModal(userToAddFor as PageUserData)}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] border rounded-md">
            <p className="text-muted-foreground">
              No team members with capacity found or data is loading.
            </p>
          </div>
        )}
      </div>
      {editingUser && (
        <EditAllocationModal
          isOpen={isEditAllocationModalOpen}
          onClose={handleCloseEditAllocationModal}
          user={editingUser}
          assignmentToEdit={editingAssignment}
          allProjects={mockProjectsList}
          onSaveAssignment={handleSaveAssignment}
        />
      )}
    </Layout>
  );
};

export default ResourceOverviewPage;
