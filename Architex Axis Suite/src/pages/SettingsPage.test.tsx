import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SettingsPage from './SettingsPage';

// Mock Layout component
jest.mock('@/components/Layout', () => {
  return function LayoutMock({ children }: { children: React.ReactNode }) {
    return <div data-testid="layout-mock">{children}</div>;
  };
});

// Mock hooks
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

describe('SettingsPage - Custom Fields', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <SettingsPage />
      </BrowserRouter>
    );
  });

  it('renders the "Custom Fields" tab', () => {
    expect(screen.getByText('Custom Fields')).toBeInTheDocument();
  });

  it('switches to the custom fields tab and displays the content', () => {
    // Tab is not yet active
    expect(screen.queryByText('Manage Custom Fields')).not.toBeInTheDocument();

    // Click the tab
    fireEvent.click(screen.getByText('Custom Fields'));

    // Now the content should be visible
    expect(screen.getByText('Manage Custom Fields')).toBeInTheDocument();
    expect(screen.getByText('Create and manage custom fields for your projects and tasks.')).toBeInTheDocument();
  });

  it('displays the table of custom fields with correct data when tab is active', () => {
    fireEvent.click(screen.getByText('Custom Fields'));

    // Check for table headers
    expect(screen.getByText('Field Name')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Applies To')).toBeInTheDocument();

    // Check for some mock data from the component
    expect(screen.getByText('Client Contact Number')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();

    expect(screen.getByText('Permit Status')).toBeInTheDocument();
    expect(screen.getByText('Select')).toBeInTheDocument();

    expect(screen.getByText('Site Visit Required')).toBeInTheDocument();
    expect(screen.getByText('Checkbox')).toBeInTheDocument();
  });

  it('has a "Create New Field" button', () => {
    fireEvent.click(screen.getByText('Custom Fields'));
    expect(screen.getByRole('button', { name: /Create New Field/i })).toBeInTheDocument();
  });
});
