import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Filter,
  User,
  Building,
  UserCog
} from "lucide-react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserProfileModal, { UserData as ModalUserData } from "@/components/user/UserProfileModal"; // Import modal and its UserData type


// Keep UserData interface local to UsersPage for now, ensure compatibility with ModalUserData
// In a larger app, this would be a shared type
interface UserData extends ModalUserData {}

const initialUsers: UserData[] = [
  {
    id: 1,
    name: "Alex Turner",
    email: "alex.turner@example.com",
    role: "Admin",
    status: "Active",
    lastActive: "Today at 10:23 AM",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop",
    skills: ["System Administration", "Security Management", "User Support"],
    weeklyCapacity: 40,
    availabilitySummary: "90% Capacity",
    availabilityNotes: "Available for critical issues."
  },
  {
    id: 2,
    name: "Maya Patel",
    email: "maya.patel@example.com",
    role: "Architect",
    status: "Active",
    lastActive: "Today at 9:15 AM",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop",
    skills: ["CAD Software", "Sustainable Design", "Building Codes", "3D Modeling"],
    weeklyCapacity: 40,
    availabilitySummary: "Fully Booked",
    availabilityNotes: "Lead on Harbor View Residences."
  },
  {
    id: 3,
    name: "Sam Chen",
    email: "sam.chen@example.com",
    role: "Designer",
    status: "Active",
    lastActive: "Yesterday at 4:45 PM",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop",
    skills: ["Graphic Design", "UI/UX", "Adobe Creative Suite"],
    weeklyCapacity: 35,
    availabilitySummary: "Available",
    availabilityNotes: "Working on marketing materials."
  },
  {
    id: 4,
    name: "Jamie Rodriguez",
    email: "jamie.rodriguez@example.com",
    role: "Project Manager",
    status: "Active",
    lastActive: "Today at 11:30 AM",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=32&h=32&fit=crop",
    skills: ["Agile Methodology", "Risk Management", "Client Communication", "Budgeting"],
    weeklyCapacity: 40,
    availabilitySummary: "Med Capacity",
    availabilityNotes: "Overseeing two major projects."
  },
  {
    id: 5,
    name: "Sarah Kim",
    email: "sarah.kim@example.com",
    role: "Architect",
    status: "Inactive",
    lastActive: "3 days ago",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop",
    skills: ["CAD Software", "Residential Design"],
    weeklyCapacity: 40,
    availabilitySummary: "Inactive",
  },
  {
    id: 6,
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    role: "Client", // Clients typically wouldn't have skills/availability tracked this way
    status: "Active",
    lastActive: "Today at 8:50 AM",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=32&h=32&fit=crop"
  },
  {
    id: 7,
    name: "Emma Davis",
    email: "emma.davis@example.com",
    role: "Designer",
    status: "Active",
    lastActive: "Yesterday at 2:30 PM",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=32&h=32&fit=crop",
    skills: ["Interior Design", "Space Planning", "Material Selection"],
    weeklyCapacity: 40,
    availabilitySummary: "High Capacity",
    availabilityNotes: "Available for new assignments."
  },
];

const clients = [
  {
    id: 1,
    name: "Coastal Development Corp",
    contactPerson: "Robert Johnson",
    email: "contact@coastaldev.com",
    projects: 3,
    status: "Active"
  },
  {
    id: 2,
    name: "Urban Workspaces Inc",
    contactPerson: "Alicia Martinez",
    email: "info@urbanworkspaces.com",
    projects: 1,
    status: "Active"
  },
  {
    id: 3,
    name: "Valley Municipality",
    contactPerson: "David Thompson",
    email: "d.thompson@valleygov.org",
    projects: 2,
    status: "Active"
  },
  {
    id: 4,
    name: "Luxe Hospitality Group",
    contactPerson: "Jennifer Lee",
    email: "j.lee@luxehospitality.com",
    projects: 1,
    status: "Active"
  },
  {
    id: 5,
    name: "FutureTech Industries",
    contactPerson: "Michael Carter",
    email: "m.carter@futuretech.com",
    projects: 2,
    status: "Inactive"
  }
];

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

const UsersPage: FC = () => {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const handleOpenModal = (user: UserData) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = (updatedUser: UserData) => {
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
    handleCloseModal();
    // Add a toast notification here in a real app
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-secondary mb-4 md:mb-0">Users</h1>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8 w-full md:w-[250px]"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="team" className="space-y-4">
          <TabsList>
            <TabsTrigger value="team" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-1">
              <UserCog className="h-4 w-4" />
              Roles & Permissions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="team">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.skills && user.skills.length > 0
                            ? `${user.skills.length} Skills`
                            : user.role !== 'Client' ? 'No skills listed' : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {user.availabilitySummary
                            ? user.availabilitySummary
                            : user.role !== 'Client' ? '-' : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.lastActive}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(user)}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="clients">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <p className="font-medium">{client.name}</p>
                        </TableCell>
                        <TableCell>{client.contactPerson}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.projects}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(client.status as "Active" | "Inactive")}>
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="roles">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-muted-foreground">
                    Roles and permissions management coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <UserProfileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </Layout>
  );
};

export default UsersPage;