import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditAllocationModal, { AssignmentData } from './EditAllocationModal';
import { UserData, initialUsers } from '@/pages/UsersPage';
import { mockProjectsList, ProjectSelectItem } from '@/pages/ResourceOverviewPage';

const mockUser: UserData = { ...initialUsers[0], id: 100, name: "Modal Test User", currentAssignments: [] };
const mockAssignmentToEdit: AssignmentData = { projectId: 'p-1', projectName: 'Harbor View Residences', allocatedHours: 20 };

const mockOnClose = jest.fn();
const mockOnSaveAssignment = jest.fn();

describe('EditAllocationModal', () => {
  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSaveAssignment.mockClear();
  });

  describe('Add New Assignment Mode', () => {
    test('renders correctly for adding a new assignment', () => {
      render(
        <EditAllocationModal
          isOpen={true}
          onClose={mockOnClose}
          user={mockUser}
          assignmentToEdit={null}
          allProjects={mockProjectsList}
          onSaveAssignment={mockOnSaveAssignment}
        />
      );
      expect(screen.getByText(`Assign Project to ${mockUser.name}`)).toBeInTheDocument();
      expect(screen.getByLabelText('Project')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByLabelText('Allocated Hours')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Assignment' })).toBeInTheDocument();
    });

    test('project dropdown populates and filters out already assigned projects', async () => {
      const userWithExistingAssignment: UserData = {
        ...mockUser,
        currentAssignments: [{ projectId: 'p-1', projectName: 'Harbor View Residences', allocatedHours: 10 }],
      };
      render(
        <EditAllocationModal
          isOpen={true}
          onClose={mockOnClose}
          user={userWithExistingAssignment}
          assignmentToEdit={null}
          allProjects={mockProjectsList}
          onSaveAssignment={mockOnSaveAssignment}
        />
      );

      fireEvent.mouseDown(screen.getByRole('combobox'));
      await waitFor(() => {
        expect(screen.queryByText('Harbor View Residences')).not.toBeInTheDocument();
        expect(screen.getByText('Riverfront Boutique Hotel')).toBeInTheDocument();
      });
    });

    test('calls onSaveAssignment with correct data for new assignment', async () => {
        render(
            <EditAllocationModal
            isOpen={true}
            onClose={mockOnClose}
            user={mockUser} // User with no initial assignments for this test
            assignmentToEdit={null}
            allProjects={mockProjectsList}
            onSaveAssignment={mockOnSaveAssignment}
            />
        );

        fireEvent.mouseDown(screen.getByRole('combobox'));
        const projectToSelect = mockProjectsList.find(p => p.projectId === 'p-2'); // Riverfront Boutique Hotel
        expect(projectToSelect).toBeDefined();
        await waitFor(() => screen.getByText(projectToSelect!.projectName));
        fireEvent.click(screen.getByText(projectToSelect!.projectName));

        fireEvent.change(screen.getByLabelText('Allocated Hours'), { target: { value: '30' } });

        fireEvent.click(screen.getByRole('button', { name: 'Add Assignment' }));

        expect(mockOnSaveAssignment).toHaveBeenCalledWith(
            mockUser.id,
            expect.objectContaining({
            projectId: projectToSelect!.projectId,
            allocatedHours: 30,
            projectName: projectToSelect!.projectName,
            }),
            true
        );
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edit Existing Assignment Mode', () => {
    test('renders correctly for editing an existing assignment', () => {
      render(
        <EditAllocationModal
          isOpen={true}
          onClose={mockOnClose}
          user={mockUser}
          assignmentToEdit={mockAssignmentToEdit}
          allProjects={mockProjectsList}
          onSaveAssignment={mockOnSaveAssignment}
        />
      );
      expect(screen.getByText(`Edit Allocation for ${mockUser.name}`)).toBeInTheDocument();
      expect(screen.getByLabelText('Project')).toBeInTheDocument();
      // For a disabled Select, the value might be within a specific element.
      // Checking if the input field for project name (now readOnly) has the value
-     expect(screen.getByDisplayValue(mockAssignmentToEdit.projectName!)).toBeDisabled();
+     const projectInput = screen.getByDisplayValue(mockAssignmentToEdit.projectName!);
+     expect(projectInput).toHaveAttribute('readOnly');
      expect(screen.getByLabelText('Allocated Hours')).toHaveValue(mockAssignmentToEdit.allocatedHours);
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    });

    test('calls onSaveAssignment with correct data for editing assignment', () => {
        render(
            <EditAllocationModal
            isOpen={true}
            onClose={mockOnClose}
            user={mockUser}
            assignmentToEdit={mockAssignmentToEdit}
            allProjects={mockProjectsList}
            onSaveAssignment={mockOnSaveAssignment}
            />
        );

        fireEvent.change(screen.getByLabelText('Allocated Hours'), { target: { value: '25' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

        expect(mockOnSaveAssignment).toHaveBeenCalledWith(
            mockUser.id,
            expect.objectContaining({
            projectId: mockAssignmentToEdit.projectId,
            allocatedHours: 25,
            projectName: mockAssignmentToEdit.projectName,
            }),
            false
        );
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  test('shows validation error for invalid hours', async () => {
    render(
        <EditAllocationModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        assignmentToEdit={null}
        allProjects={mockProjectsList}
        onSaveAssignment={mockOnSaveAssignment}
        />
    );
    // Select a project first to isolate hour validation
    fireEvent.mouseDown(screen.getByRole('combobox'));
    const projectToSelect = mockProjectsList[0];
    await waitFor(() => screen.getByText(projectToSelect.projectName));
    fireEvent.click(screen.getByText(projectToSelect.projectName));

    fireEvent.change(screen.getByLabelText('Allocated Hours'), { target: { value: '-5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Assignment' }));

    expect(await screen.findByText('Allocated hours must be a positive number.')).toBeInTheDocument();
    expect(mockOnSaveAssignment).not.toHaveBeenCalled();
  });

   test('shows validation error if project not selected in add mode', async () => {
    render(
        <EditAllocationModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        assignmentToEdit={null}
        allProjects={mockProjectsList}
        onSaveAssignment={mockOnSaveAssignment}
        />
    );
    fireEvent.change(screen.getByLabelText('Allocated Hours'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Assignment' }));

    expect(await screen.findByText('Please select a project.')).toBeInTheDocument();
    expect(mockOnSaveAssignment).not.toHaveBeenCalled();
  });

  test('calls onClose when cancel button is clicked', () => {
    render(
      <EditAllocationModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        allProjects={mockProjectsList}
        onSaveAssignment={mockOnSaveAssignment}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
