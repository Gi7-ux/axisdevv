import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResourceOverviewPage from './ResourceOverviewPage';

// Mock the UserWorkloadCard to simplify page testing and avoid deep rendering
jest.mock('@/components/user/UserWorkloadCard', () => ({
  __esModule: true,
  default: jest.fn(({ user }) => <div data-testid={`user-workload-card-${user.id}`}>{user.name}</div>),
}));

// Mock UsersPage's initialUsers for controlled testing environment
const mockUsersPayload = [
  {
    id: 1, name: 'Alex Turner', role: 'Admin', weeklyCapacity: 40,
    currentAssignments: [{ projectId: 'p1', projectName: 'Project Alpha', allocatedHours: 20 }]
  },
  {
    id: 2, name: 'Maya Patel', role: 'Architect', weeklyCapacity: 40,
    currentAssignments: [{ projectId: 'p2', projectName: 'Project Beta', allocatedHours: 30 }]
  },
  { id: 3, name: 'Robert Johnson', role: 'Client', weeklyCapacity: 40 }, // Should be filtered out
  { id: 4, name: 'No Cap User', role: 'Designer', weeklyCapacity: 0 }, // Should be filtered out
  { id: 5, name: 'No WeeklyCap Key', role: 'Designer' }, // Should be filtered out
];

jest.mock('./UsersPage', () => ({
  initialUsers: mockUsersPayload
}));


describe('ResourceOverviewPage', () => {
  beforeEach(() => {
    // Clear mock call counts before each test if UserWorkloadCard mock is called multiple times
    const UserWorkloadCardMock = require('@/components/user/UserWorkloadCard').default;
    UserWorkloadCardMock.mockClear();
  });

  test('renders the page title', () => {
    render(<ResourceOverviewPage />);
    expect(screen.getByText('Team Resource Overview')).toBeInTheDocument();
  });

  test('renders UserWorkloadCard for each relevant team member', async () => {
    render(<ResourceOverviewPage />);

    await waitFor(() => {
      expect(screen.getByTestId('user-workload-card-1')).toHaveTextContent('Alex Turner');
      expect(screen.getByTestId('user-workload-card-2')).toHaveTextContent('Maya Patel');

      // Verify UserWorkloadCard was called for the relevant users
      const UserWorkloadCardMock = require('@/components/user/UserWorkloadCard').default;
      expect(UserWorkloadCardMock).toHaveBeenCalledTimes(2);
      expect(UserWorkloadCardMock).toHaveBeenCalledWith(expect.objectContaining({ user: expect.objectContaining({ id: 1 }) }), {});
      expect(UserWorkloadCardMock).toHaveBeenCalledWith(expect.objectContaining({ user: expect.objectContaining({ id: 2 }) }), {});
    });
  });

  test('filters out clients and users with no or zero capacity', async () => {
    render(<ResourceOverviewPage />);

    await waitFor(() => {
      expect(screen.queryByTestId('user-workload-card-3')).not.toBeInTheDocument(); // Robert Johnson (Client)
      expect(screen.queryByTestId('user-workload-card-4')).not.toBeInTheDocument(); // No Cap User (0 capacity)
      expect(screen.queryByTestId('user-workload-card-5')).not.toBeInTheDocument(); // No WeeklyCap Key
    });
  });

  test('displays empty state message if no relevant members are found', async () => {
    // Temporarily override the mock for initialUsers for this specific test
    const UsersPageModule = require('./UsersPage');
    const originalInitialUsers = UsersPageModule.initialUsers;
    UsersPageModule.initialUsers = [
        { id: 3, name: 'Robert Johnson', role: 'Client', weeklyCapacity: 40 },
        { id: 4, name: 'No Cap User', role: 'Designer', weeklyCapacity: 0 },
    ];

    render(<ResourceOverviewPage />);

    await waitFor(() => {
      expect(screen.getByText(/No team members with capacity found/i)).toBeInTheDocument();
    });

    UsersPageModule.initialUsers = originalInitialUsers; // Restore original mock
    jest.restoreAllMocks(); // Ensure all mocks are restored if jest.spyOn was used.
  });
});

// Mock EditAllocationModal for testing interactions on ResourceOverviewPage
jest.mock('@/components/allocation/EditAllocationModal', () => ({
  __esModule: true,
  default: jest.fn(({ isOpen, onClose, user, assignmentToEdit, onSaveAssignment, allProjects }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="edit-allocation-modal">
        <p>User: {user?.name}</p>
        {assignmentToEdit && <p>Editing Project: {assignmentToEdit.projectName}</p>}
        {!assignmentToEdit && <p>Adding new assignment</p>}
        <button data-testid="mock-save-button" onClick={() => {
          const projectToSave = assignmentToEdit ? assignmentToEdit.projectId : allProjects[0].projectId; // pick first for new
          const hoursToSave = assignmentToEdit ? assignmentToEdit.allocatedHours + 5 : 10; // Adjust hours for test
          onSaveAssignment(user.id, { projectId: projectToSave, allocatedHours: hoursToSave, projectName: allProjects.find(p=>p.projectId === projectToSave)?.projectName }, !assignmentToEdit);
        }}>
          Mock Save
        </button>
        <button onClick={onClose}>Mock Cancel</button>
      </div>
    );
  }),
}));


// Mock UserWorkloadCard to control its props and simulate clicks on its internal buttons
// This requires UserWorkloadCard's onEditAssignmentClick and onAddAssignmentClick to be part of its props.
const mockOnEditAssignmentClick = jest.fn();
const mockOnAddAssignmentClick = jest.fn();

jest.mock('@/components/user/UserWorkloadCard', () => ({
    __esModule: true,
    // Make sure UserAssignment is also available if UserWorkloadCard exports it or uses it internally in a way that affects tests
    // default: jest.fn(({ user, onEditAssignmentClick, onAddAssignmentClick }) => ( // Original mock
    default: jest.fn((props) => { // Modified mock to use the passed jest.fn
        const { user } = props;
        // Store the passed functions to be able to call them
        mockOnEditAssignmentClick.mockImplementation(props.onEditAssignmentClick);
        mockOnAddAssignmentClick.mockImplementation(props.onAddAssignmentClick);

        return (
            <div data-testid={`user-workload-card-${user.id}`}>
                <span>{user.name}</span>
                {/* Simulate internal buttons that would trigger these callbacks */}
                {user.currentAssignments?.map((assign: any) => (
                    <button key={assign.projectId} data-testid={`edit-assign-${user.id}-${assign.projectId}`} onClick={() => mockOnEditAssignmentClick(user, assign)}>
                        Edit {assign.projectName}
                    </button>
                ))}
                <button data-testid={`add-assign-${user.id}`} onClick={() => mockOnAddAssignmentClick(user)}>
                    Add Assignment for {user.name}
                </button>
            </div>
        );
    }),
}));


describe('ResourceOverviewPage - Allocation Editing', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Re-mock initialUsers for each test to ensure a fresh state
    // This is a bit heavy-handed; better state management or DI for tests would be ideal.
    // Mock is already established globally - individual test variations should be handled differently
  });

  test('opens EditAllocationModal in "add new" mode when "Add Assignment" is clicked on a UserWorkloadCard', async () => {
    const { UsersPage } = require('./UsersPage'); // require fresh module with mock
    render(<ResourceOverviewPage />);

    const userToAddForId = UsersPage.initialUsers[0].id; // Alex Turner
    const addAssignmentButton = await screen.findByTestId(`add-assign-${userToAddForId}`);
    fireEvent.click(addAssignmentButton);

    await waitFor(() => {
      expect(screen.getByTestId('edit-allocation-modal')).toBeInTheDocument();
      expect(screen.getByText(`User: ${UsersPage.initialUsers[0].name}`)).toBeInTheDocument();
      expect(screen.getByText('Adding new assignment')).toBeInTheDocument();
    });
  });

  test('opens EditAllocationModal in "edit existing" mode when an "Edit Assignment" button is clicked', async () => {
    const { UsersPage } = require('./UsersPage');
    render(<ResourceOverviewPage />);

    const userToEditId = UsersPage.initialUsers[0].id; // Alex Turner
    const assignmentToEdit = UsersPage.initialUsers[0].currentAssignments[0];

    const editButton = await screen.findByTestId(`edit-assign-${userToEditId}-${assignmentToEdit.projectId}`);
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByTestId('edit-allocation-modal')).toBeInTheDocument();
      expect(screen.getByText(`User: ${UsersPage.initialUsers[0].name}`)).toBeInTheDocument();
      expect(screen.getByText(`Editing Project: ${assignmentToEdit.projectName}`)).toBeInTheDocument();
    });
  });

  test('saving a new assignment updates the user data and closes the modal', async () => {
    const { initialUsers: usersBeforeSave } = require('./UsersPage');
    const userToUpdate = usersBeforeSave.find((u:any) => u.id === 1); // Alex Turner

    render(<ResourceOverviewPage />);

    const addAssignmentButton = await screen.findByTestId(`add-assign-${userToUpdate.id}`);
    fireEvent.click(addAssignmentButton);

    const modalSaveButton = await screen.findByTestId('mock-save-button');
    fireEvent.click(modalSaveButton);

    await waitFor(() => {
      expect(screen.queryByTestId('edit-allocation-modal')).not.toBeInTheDocument();
    });

    // At this point, ResourceOverviewPage's state `usersData` should have been updated.
    // We need to verify that the UserWorkloadCard for Alex Turner would receive updated props.
    // The mock for UserWorkloadCard is called on each render. We check its last call for user 1.
    const UserWorkloadCardMock = require('@/components/user/UserWorkloadCard').default;
    const calls = UserWorkloadCardMock.mock.calls;
    const lastAlexCall = calls.slice().reverse().find((call: any) => call[0].user.id === userToUpdate.id);

// Add alongside the other imports at the top of ResourceOverviewPage.test.tsx
import { mockProjectsList } from './ResourceOverviewPage';
  });

   test('editing an assignment updates the user data and closes the modal', async () => {
    const { UsersPage, initialUsers: usersBeforeSave } = require('./UsersPage');
    const userToUpdate = usersBeforeSave.find((u:any) => u.id === 1); // Alex Turner
    const originalAssignment = userToUpdate.currentAssignments[0];

    render(<ResourceOverviewPage />);

    const editAssignmentButton = await screen.findByTestId(`edit-assign-${userToUpdate.id}-${originalAssignment.projectId}`);
    fireEvent.click(editAssignmentButton);

    const modalSaveButton = await screen.findByTestId('mock-save-button');
    fireEvent.click(modalSaveButton);

    await waitFor(() => {
      expect(screen.queryByTestId('edit-allocation-modal')).not.toBeInTheDocument();
    });

    const UserWorkloadCardMock = require('@/components/user/UserWorkloadCard').default;
    const calls = UserWorkloadCardMock.mock.calls;
    const lastAlexCall = calls.slice().reverse().find((call: any) => call[0].user.id === userToUpdate.id);

    const updatedAssignment = lastAlexCall[0].user.currentAssignments.find((a:any) => a.projectId === originalAssignment.projectId);
    expect(updatedAssignment.allocatedHours).toBe(originalAssignment.allocatedHours + 5); // As per mock save logic
  });


});
