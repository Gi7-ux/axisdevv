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
  });
});
