import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CalendarPage from './CalendarPage';

// Mock FullCalendar to prevent rendering issues in tests if not needed for basic checks
// Or ensure JSDOM environment can handle it. For this basic test, checking presence is enough.
jest.mock('@fullcalendar/react', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function FullCalendarMock(props: any) {
    return (
      <div data-testid="fullcalendar-mock">
        {props.events.map((event: { title: string; date: string; id?: string }) => (
          <div key={event.id || event.date}>{event.title}</div>
        ))}
      </div>
    );
  };
});

// Mock Layout component as it's not the focus of this test
jest.mock('@/components/Layout', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function LayoutMock({ children }: { children: React.ReactNode }) {
    return <div data-testid="layout-mock">{children}</div>;
  };
});


describe('CalendarPage', () => {
  const renderCalendarPage = () => {
    render(
      <BrowserRouter>
        <CalendarPage />
      </BrowserRouter>
    );
  };

  it('renders the Calendar page title', () => {
    renderCalendarPage();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
  });

  it('renders the FullCalendar mock component', () => {
    renderCalendarPage();
    expect(screen.getByTestId('fullcalendar-mock')).toBeInTheDocument();
  });

  it('displays mock event titles', () => {
    renderCalendarPage();
    // Check for a few mock event titles
    expect(screen.getByText('Meeting with Client A')).toBeInTheDocument();
    expect(screen.getByText('Project Alpha Deadline')).toBeInTheDocument();
    expect(screen.getByText('Conference Day 1')).toBeInTheDocument();
  });

  // We can't easily test dateClick and eventClick handlers with this level of mocking.
  // Those would require more complex interaction tests, possibly with a less heavily mocked FullCalendar.
  // For "basic tests" this should suffice.
});
