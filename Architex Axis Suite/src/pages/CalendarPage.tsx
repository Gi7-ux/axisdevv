import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import Layout from '@/components/Layout'; // Assuming you have a Layout component

const CalendarPage: React.FC = () => {
  const handleDateClick = (arg: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    // In a real app, you might open a modal to create a new event
    console.log('Date clicked:', arg.dateStr);
    alert(`Date clicked: ${arg.dateStr}`);
  };

  const handleEventClick = (arg: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    // In a real app, you might open a modal to view/edit event details
    console.log('Event clicked:', arg.event.title);
    alert(`Event clicked: ${arg.event.title}\nID: ${arg.event.id}`);
  };

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Calendar</h1>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          }}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          events={[
            { id: '1', title: 'Meeting with Client A', date: '2024-03-10T10:30:00', allDay: false },
            { id: '2', title: 'Project Alpha Deadline', date: '2024-03-15', backgroundColor: 'red', borderColor: 'red' },
            { id: '3', title: 'Team Sync - Project Beta', date: '2024-03-12T14:00:00', allDay: false },
            { id: '4', title: 'Site Visit', start: '2024-03-20T09:00:00', end: '2024-03-20T12:00:00', allDay: false },
            { id: '5', title: 'Conference Day 1', date: '2024-03-25' },
            { id: '6', title: 'Conference Day 2', date: '2024-03-26' },
          ]}
        />
      </div>
    </Layout>
  );
};

export default CalendarPage;
