import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfileModal, { UserData } from './UserProfileModal';

const mockUser: UserData = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'Architect',
  status: 'Active',
  lastActive: 'Today',
  skills: ['CAD', 'Sketching'],
  weeklyCapacity: 40,
  availabilityNotes: 'Generally available',
  availabilitySummary: 'High',
};

const mockOnClose = jest.fn();
const mockOnSave = jest.fn();

describe('UserProfileModal', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  test('renders user data correctly when open', () => {
    render(
      <UserProfileModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('User Profile')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Architect')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Active')).toBeInTheDocument();

    // Check skills
    expect(screen.getByText('CAD')).toBeInTheDocument();
    expect(screen.getByText('Sketching')).toBeInTheDocument();

    // Check availability
    expect(screen.getByLabelText('Weekly Capacity (hours)')).toHaveValue(40);
    expect(screen.getByLabelText('Availability Notes')).toHaveValue('Generally available');
    expect(screen.getByLabelText('Availability Summary (Display Only)')).toHaveValue('High');
  });

  test('does not render when isOpen is false', () => {
    const { container } = render(
      <UserProfileModal
        isOpen={false}
        onClose={mockOnClose}
        user={mockUser}
        onSave={mockOnSave}
      />
    );
    // Check if the dialog content is not present
    expect(screen.queryByText('User Profile')).not.toBeInTheDocument();
    // A more robust check might be for a specific dialog content selector if available
    expect(container.firstChild).toBeNull(); // Or check if it's empty or specific placeholder
  });

  test('calls onClose when cancel button is clicked', () => {
    render(
      <UserProfileModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onSave={mockOnSave}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('allows adding a new skill', async () => {
    render(
      <UserProfileModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onSave={mockOnSave}
      />
    );

    const skillInput = screen.getByPlaceholderText('Add a skill');
    const addButton = screen.getByRole('button', { name: /add skill/i }); // Using a more accessible selector

    fireEvent.change(skillInput, { target: { value: '3D Modeling' } });
    fireEvent.click(addButton);

    // Wait for the DOM to update if necessary (though with local state it might be synchronous)
    // For RTL, often better to check for the result directly
    expect(await screen.findByText('3D Modeling')).toBeInTheDocument();

    // Check if it's passed correctly on save
    fireEvent.click(screen.getByText('Save Changes'));
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        skills: expect.arrayContaining(['CAD', 'Sketching', '3D Modeling']),
      })
    );
  });

  test('allows removing a skill', async () => {
    render(
      <UserProfileModal
        isOpen={true}
        onClose={mockOnClose}
        user={{ ...mockUser, skills: ['CAD', 'Sketching', 'Project Management'] }}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('CAD')).toBeInTheDocument();

    // Find and click the remove button for CAD skill
    const skillToRemove = 'CAD';
    const skillBadgeElement = screen.getByText(skillToRemove).closest('span');
    const removeButton = skillBadgeElement?.querySelector('button');

    if (removeButton) {
      fireEvent.click(removeButton);
    } else {
      throw new Error(`Could not find remove button for skill: ${skillToRemove}`);
    }

    await waitFor(() => {
      expect(screen.queryByText('CAD')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Sketching')).toBeInTheDocument();
    expect(screen.getByText('Project Management')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Save Changes'));
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        skills: expect.arrayContaining(['Sketching', 'Project Management']),
      })
    );
  });

  test('updates weekly capacity', () => {
    render(
      <UserProfileModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onSave={mockOnSave}
      />
    );

    const capacityInput = screen.getByLabelText('Weekly Capacity (hours)');
    fireEvent.change(capacityInput, { target: { value: '35' } });

    expect(capacityInput).toHaveValue(35);

    fireEvent.click(screen.getByText('Save Changes'));
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        weeklyCapacity: 35,
      })
    );
  });

  test('updates availability notes', () => {
    render(
      <UserProfileModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onSave={mockOnSave}
      />
    );

    const notesInput = screen.getByLabelText('Availability Notes');
    fireEvent.change(notesInput, { target: { value: 'Away next Monday' } });

    expect(notesInput).toHaveValue('Away next Monday');

    fireEvent.click(screen.getByText('Save Changes'));
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        availabilityNotes: 'Away next Monday',
      })
    );
  });

  test('Save button calls onSave with current data', () => {
    render(
      <UserProfileModal
        isOpen={true}
        onClose={mockOnClose}
        user={mockUser}
        onSave={mockOnSave}
      />
    );

    // No changes made, should save initial data (or a deep copy of it)
    fireEvent.click(screen.getByText('Save Changes'));
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    // Check if the object passed to onSave has the expected structure and values
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining(mockUser));
  });

});

// Helper to make X button more accessible for skill removal test
// This would ideally be part of the component itself.
// For testing, we can try to find it by its visual content if no better selector exists.
// This is a common challenge in testing icon-only buttons.
// In UserProfileModal.tsx, the remove skill button is:
// <Button variant="ghost" size="xs" ... onClick={() => handleSkillRemove(skill)}> <X className="h-3 w-3" /> </Button>
// One way to make it more testable is to add an aria-label:
// e.g. aria-label={`Remove skill ${skill}`}
// Then in test: screen.getByRole('button', { name: `Remove skill ${skill}`})
// The current test for removing skill is a bit complex due to this.
// The updated test for removing a skill tries a more robust approach.
