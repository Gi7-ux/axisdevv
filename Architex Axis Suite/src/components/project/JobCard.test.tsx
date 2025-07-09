import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobCard, { Task, TeamMember } from './JobCard';
import { format } from 'date-fns';

// Mock minimal props needed for JobCard
const mockJobCardId = "job-1";
const mockTitle = "Test Job Card";
const mockDescription = "Description for test job card";
const mockDueDate = new Date(2025, 0, 15); // Jan 15, 2025
const mockAssignedTo: TeamMember[] = [
  { id: "u1", name: "User One", role: "Architect", avatar: "avatar1.png" }
];
const mockTeamMembers: TeamMember[] = [...mockAssignedTo];

describe('JobCard - Task Dependencies Display', () => {
  const tasksWithDependencies: Task[] = [
    { id: 'task-A', title: 'Task A', completed: false },
    { id: 'task-B', title: 'Task B', completed: false, dependsOn: ['task-A'] },
    { id: 'task-C', title: 'Task C', completed: false, dependsOn: ['task-A', 'task-B'] },
    { id: 'task-D', title: 'Task D', completed: false, dependsOn: ['task-X'] }, // task-X not in this job card
  ];

  test('renders tasks without dependencies normally', () => {
    render(
      <JobCard
        id={mockJobCardId}
        title={mockTitle}
        description={mockDescription}
        dueDate={mockDueDate}
        assignedTo={mockAssignedTo}
        tasks={[tasksWithDependencies[0]]}
        teamMembers={mockTeamMembers}
      />
    );
    const taskALabel = screen.getByText('Task A');
    expect(taskALabel).toBeInTheDocument();
    expect(screen.queryByText(/Depends on:/i)).not.toBeInTheDocument();
  });

  test('displays single dependency with task title if found in the same job card', () => {
    render(
      <JobCard
        id={mockJobCardId}
        title={mockTitle}
        description={mockDescription}
        dueDate={mockDueDate}
        assignedTo={mockAssignedTo}
        tasks={tasksWithDependencies.slice(0, 2)}
        teamMembers={mockTeamMembers}
      />
    );
    const taskBLabel = screen.getByText('Task B');
    const dependencyTextForB = taskBLabel.closest('div')?.parentElement?.querySelector('div.pl-6');
    expect(dependencyTextForB).toHaveTextContent('Depends on: Task A');
    expect(dependencyTextForB?.querySelector('svg')).toBeInTheDocument(); // Check for GitMerge icon
  });

  test('displays multiple dependencies with task titles if found', () => {
    render(
      <JobCard
        id={mockJobCardId}
        title={mockTitle}
        description={mockDescription}
        dueDate={mockDueDate}
        assignedTo={mockAssignedTo}
        tasks={tasksWithDependencies.slice(0, 3)}
        teamMembers={mockTeamMembers}
      />
    );
    const taskCLabel = screen.getByText('Task C');
    const dependencyTextForC = taskCLabel.closest('div')?.parentElement?.querySelector('div.pl-6');
    expect(dependencyTextForC).toHaveTextContent('Depends on: Task A, Task B');
  });

  test('displays dependency with task ID if dependent task is not in the same job card', () => {
    render(
      <JobCard
        id={mockJobCardId}
        title={mockTitle}
        description={mockDescription}
        dueDate={mockDueDate}
        assignedTo={mockAssignedTo}
        tasks={[tasksWithDependencies[3]]}
        teamMembers={mockTeamMembers}
      />
    );
    const taskDLabel = screen.getByText('Task D');
    expect(screen.getByText('Depends on: Task ID: task-X')).toBeInTheDocument();
  });

  test('checkbox ID is unique using job card ID and task ID', () => {
    render(
      <JobCard
        id={mockJobCardId}
        title={mockTitle}
        description={mockDescription}
        dueDate={mockDueDate}
        assignedTo={mockAssignedTo}
        tasks={[tasksWithDependencies[0]]}
        teamMembers={mockTeamMembers}
      />
    );
    const checkbox = screen.getByRole('checkbox');
    // Checkbox id is `${jobCardId}-${taskId}`
    // Label htmlFor is also `${jobCardId}-${taskId}`
    expect(checkbox).toHaveAttribute('id', `${mockJobCardId}-${tasksWithDependencies[0].id}`);
    const label = screen.getByText(tasksWithDependencies[0].title);
    expect(label).toHaveAttribute('for', `${mockJobCardId}-${tasksWithDependencies[0].id}`);
  });

});
