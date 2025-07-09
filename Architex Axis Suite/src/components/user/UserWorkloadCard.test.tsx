import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserWorkloadCard, { UserWorkloadData } from './UserWorkloadCard';

const mockUserFull: UserWorkloadData = {
  id: 1,
  name: 'Dev Eloper',
  avatar: 'https://example.com/avatar.png',
  role: 'Architect',
  weeklyCapacity: 40,
  currentAssignments: [
    { projectId: 'p1', projectName: 'Skyscraper Heights', allocatedHours: 20, projectDeadline: new Date(2025, 11, 31) },
    { projectId: 'p2', projectName: 'Parkside Pavilion', allocatedHours: 10, projectDeadline: new Date(2026, 5, 30) },
  ],
};

const mockUserOverAllocated: UserWorkloadData = {
  ...mockUserFull,
  id: 2,
  name: 'Max Overload',
const mockUserOverAllocated: UserWorkloadData = {
  ...mockUserFull,
  id: 2,
  name: 'Max Overload',
  currentAssignments: [
    { projectId: 'p1', projectName: 'Skyscraper Heights', allocatedHours: 30, projectDeadline: new Date(2025, 11, 31) },
    { projectId: 'p2', projectName: 'Parkside Pavilion', allocatedHours: 20, projectDeadline: new Date(2026, 5, 30) }, // Total 50h > 40h capacity
  ],
};
    { projectId: 'p1', projectName: 'Skyscraper Heights', allocatedHours: 30, projectDeadline: new Date(2025, 11, 31) },
    { projectId: 'p2', projectName: 'Parkside Pavilion', allocatedHours: 20, projectDeadline: new Date(2026, 5, 30) }, // Total 50h > 40h capacity
  ],
};

const mockUserNoCapacity: UserWorkloadData = {
  id: 3,
  name: 'No Cap Given',
  role: 'Designer',
  weeklyCapacity: 0,
  currentAssignments: [{ projectId: 'p3', projectName: 'Logo Design', allocatedHours: 5 }],
};

const mockUserNoAssignments: UserWorkloadData = {
  id: 4,
  name: 'Free Bird',
  role: 'Project Manager',
  weeklyCapacity: 40,
  currentAssignments: [],
};

describe('UserWorkloadCard', () => {
  test('renders user information correctly', () => {
    render(<UserWorkloadCard user={mockUserFull} />);
    expect(screen.getByText('Dev Eloper')).toBeInTheDocument();
    expect(screen.getByText('Architect')).toBeInTheDocument(); // Role Badge
    // Check avatar if possible, or fallback text
  });

  test('calculates and displays total allocated hours and workload percentage correctly', () => {
    render(<UserWorkloadCard user={mockUserFull} />);
    // Total allocated = 20 + 10 = 30
    // Capacity = 40
    // Workload = 30h / 40h
    expect(screen.getByText('30h / 40h')).toBeInTheDocument();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '75'); // (30/40)*100
     // Check for green color (implementation specific, might need to check class or style)
    expect(progressBar).toHaveClass(/bg-yellow-200/); // 75% is yellow (71-90)
  });

  test('displays over-allocation message and styles progress bar red', () => {
    render(<UserWorkloadCard user={mockUserOverAllocated} />);
    // Total allocated = 30 + 20 = 50
    // Capacity = 40
    expect(screen.getByText('50h / 40h')).toBeInTheDocument();
    expect(screen.getByText(/Over allocated by 10h/)).toBeInTheDocument();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100'); // Capped at 100 for display
    expect(progressBar).toHaveClass(/bg-red-200/); // Check for red color
  });

  test('handles users with no weekly capacity set', () => {
    render(<UserWorkloadCard user={mockUserNoCapacity} />);
    expect(screen.getByText('5h / N/A')).toBeInTheDocument();
    expect(screen.getByText('Weekly capacity not set.')).toBeInTheDocument();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });

  test('lists current assignments with project name, allocated hours, and deadline', () => {
    render(<UserWorkloadCard user={mockUserFull} />);
    expect(screen.getByText('Skyscraper Heights')).toBeInTheDocument();
    // This will find the "20h" badge within the Skyscraper Heights assignment
    const skyscraperAssignment = screen.getByText('Skyscraper Heights').closest('div');
    expect(skyscraperAssignment).toHaveTextContent('20h');
    expect(screen.getByText(`Deadline: ${new Date(2025, 11, 31).toLocaleDateString()}`)).toBeInTheDocument();

    expect(screen.getByText('Parkside Pavilion')).toBeInTheDocument();
    const parksideAssignment = screen.getByText('Parkside Pavilion').closest('div');
    expect(parksideAssignment).toHaveTextContent('10h');
    expect(screen.getByText(`Deadline: ${new Date(2026, 5, 30).toLocaleDateString()}`)).toBeInTheDocument();
  });

  test('displays "No current assignments." when assignments array is empty or undefined', () => {
    render(<UserWorkloadCard user={mockUserNoAssignments} />);
    expect(screen.getByText('No current assignments.')).toBeInTheDocument();
  });
});
