import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NewProjectPage from './NewProjectPage';
import { useToast } from '@/hooks/use-toast';

// Mock Layout component
jest.mock('@/components/Layout', () => {
  return function LayoutMock({ children }: { children: React.ReactNode }) {
    return <div data-testid="layout-mock">{children}</div>;
  };
});

// Mock useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

// Mock window.location
const originalLocation = window.location;
beforeAll(() => {
  delete window.location;
  window.location = { ...originalLocation, href: '' };
});
afterAll(() => {
  window.location = originalLocation;
});


describe('NewProjectPage - Custom Fields Integration', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (useToast as jest.Mock).mockClear();
    render(
      <BrowserRouter>
        <NewProjectPage />
      </BrowserRouter>
    );
  });

  it('renders the custom fields section and its inputs', () => {
    expect(screen.getByText('Custom Fields')).toBeInTheDocument();

    // Check for a few labels from our mock custom fields
    expect(screen.getByLabelText(/Client Contact Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Permit Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Next Follow-up Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Project Notes/i)).toBeInTheDocument();
  });

  it('shows a validation error if a required text custom field is not filled', async () => {
    // Fill out all standard required fields
    fireEvent.change(screen.getByLabelText(/Project Name/i), { target: { value: 'Test Project' } });

    // Select client
    fireEvent.mouseDown(screen.getAllByRole('combobox')[0]); // Assuming client is the first select
    await waitFor(() => fireEvent.click(screen.getByText('Coastal Development Corp')));

    // Select project type
    fireEvent.mouseDown(screen.getAllByRole('combobox')[1]); // Assuming project type is the second
    await waitFor(() => fireEvent.click(screen.getByText('Commercial')));

    // Select dates
    fireEvent.click(screen.getAllByText('Pick a date')[0]); // Start Date
    await waitFor(() => fireEvent.click(screen.getByText('15')));

    fireEvent.click(screen.getAllByText('Pick a date')[0]); // Deadline (since the first one is now filled)
    await waitFor(() => fireEvent.click(screen.getByText('25')));

    fireEvent.change(screen.getByLabelText(/Budget/i), { target: { value: '100000' } });
    fireEvent.change(screen.getByLabelText(/Project Description/i), { target: { value: 'A detailed project description.' } });

    // Do NOT fill out the required "Client Contact Number" custom field.
    // Fill out the other required custom fields
    fireEvent.mouseDown(screen.getAllByRole('combobox')[2]); // Permit Status
    await waitFor(() => fireEvent.click(screen.getByText('Submitted')));

    fireEvent.click(screen.getAllByText('Pick a date')[0]); // Next Follow-up Date
    await waitFor(() => fireEvent.click(screen.getByText('28')));

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Check for the validation message for the custom field
    await waitFor(() => {
      expect(screen.getByText('Client Contact Number is required.')).toBeInTheDocument();
    });
  });

  it('submits successfully when all required custom fields are filled', async () => {
    // Fill out all standard required fields
    fireEvent.change(screen.getByLabelText(/Project Name/i), { target: { value: 'Test Project' } });
    fireEvent.mouseDown(screen.getAllByRole('combobox')[0]);
    await waitFor(() => fireEvent.click(screen.getByText('Coastal Development Corp')));
    fireEvent.mouseDown(screen.getAllByRole('combobox')[1]);
    await waitFor(() => fireEvent.click(screen.getByText('Commercial')));
    fireEvent.click(screen.getAllByText('Pick a date')[0]);
    await waitFor(() => fireEvent.click(screen.getByText('15')));
    fireEvent.click(screen.getAllByText('Pick a date')[0]);
    await waitFor(() => fireEvent.click(screen.getByText('25')));
    fireEvent.change(screen.getByLabelText(/Budget/i), { target: { value: '100000' } });
    fireEvent.change(screen.getByLabelText(/Project Description/i), { target: { value: 'A detailed project description.' } });

    // Fill out all required custom fields
    fireEvent.change(screen.getByLabelText(/Client Contact Number/i), { target: { value: '123-456-7890' } });
    fireEvent.mouseDown(screen.getAllByRole('combobox')[2]);
    await waitFor(() => fireEvent.click(screen.getByText('Submitted')));
    fireEvent.click(screen.getAllByText('Pick a date')[0]);
    await waitFor(() => fireEvent.click(screen.getByText('28')));

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Check that there is NO validation error for the custom field
    await waitFor(() => {
      expect(screen.queryByText('Client Contact Number is required.')).not.toBeInTheDocument();
    });

    // Check if it moved to the next step (Team Assignment)
    expect(screen.getByText('Team Assignment')).toBeInTheDocument();
  });
});
