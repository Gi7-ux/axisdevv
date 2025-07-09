import { FC, useState, useEffect } from "react";
import Layout from "@/components/Layout";
import UserWorkloadCard, { UserWorkloadData } from "@/components/user/UserWorkloadCard";
// Adjust the import path for initialUsers if UserData is not directly exported from UsersPage or a shared types file
// For now, assuming initialUsers is accessible or we'll redefine a mock here.
// Ideally, this data would come from a global state or API call.
import { initialUsers } from "./UsersPage"; // This might need adjustment if UsersPage doesn't export it.

// Temporary: If initialUsers is not directly exportable from UsersPage.tsx,
// we might need to duplicate or move the mock data definition.
// For this step, I'll proceed assuming we can access a UserData[] array.
// Let's define a type compatible with what UserWorkloadCard expects, based on UserData from UsersPage
type PageUserData = typeof initialUsers[0];


const ResourceOverviewPage: FC = () => {
  // In a real app, users data would be fetched or come from a global state
  const [teamMembers, setTeamMembers] = useState<PageUserData[]>([]);

  useEffect(() => {
    // Filter out clients and users without capacity for a cleaner overview
    const relevantMembers = initialUsers.filter(
      user => user.role !== 'Client' && user.weeklyCapacity && user.weeklyCapacity > 0
    );
    setTeamMembers(relevantMembers);
  }, []);

  return (
    <Layout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-secondary mb-4 md:mb-0">
            Team Resource Overview
          </h1>
          {/* Add filter/sort options here in the future */}
        </div>

        {teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <UserWorkloadCard key={member.id} user={member as UserWorkloadData} />
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
    </Layout>
  );
};

export default ResourceOverviewPage;
