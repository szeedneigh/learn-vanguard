import React from 'react';
import { render, screen } from '@testing-library/react';
import { ActivityDetailModal } from '../src/components/modal/ActivityDetailModal';

// Mock date-fns format function
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === "PPP 'at' p") {
      return 'January 15, 2024 at 11:59 PM';
    }
    if (formatStr === 'MMM d, yyyy') {
      return 'Jan 15, 2024';
    }
    return date.toString();
  }),
}));

describe('ActivityDetailModal', () => {
  const mockActivity = {
    _id: 'activity-1',
    title: 'Test Assignment',
    description: 'This is a test assignment description',
    type: 'assignment',
    dueDate: '2024-01-15T23:59:59Z',
    fileUrls: [
      'https://example.com/file1.pdf',
      'https://example.com/file2.docx'
    ],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-02T10:00:00Z'
  };

  const mockTopic = {
    name: 'Test Topic',
    id: 'topic-1'
  };

  const mockSubject = {
    name: 'Test Subject',
    id: 'subject-1'
  };

  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    activity: mockActivity,
    topic: mockTopic,
    subject: mockSubject
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders activity title and type', () => {
    render(<ActivityDetailModal {...mockProps} />);
    
    expect(screen.getByText('Test Assignment')).toBeInTheDocument();
    expect(screen.getByText('Assignment')).toBeInTheDocument();
  });

  test('displays file URLs when present', () => {
    render(<ActivityDetailModal {...mockProps} />);
    
    expect(screen.getByText('Attached Files')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/file1.pdf')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/file2.docx')).toBeInTheDocument();
  });

  test('shows no files message when fileUrls is empty', () => {
    const activityWithoutFiles = {
      ...mockActivity,
      fileUrls: []
    };
    
    render(<ActivityDetailModal {...mockProps} activity={activityWithoutFiles} />);
    
    expect(screen.getByText('Attached Files')).toBeInTheDocument();
    expect(screen.getByText('No files attached to this activity')).toBeInTheDocument();
  });

  test('shows no files message when fileUrls is undefined', () => {
    const activityWithoutFiles = {
      ...mockActivity,
      fileUrls: undefined
    };
    
    render(<ActivityDetailModal {...mockProps} activity={activityWithoutFiles} />);
    
    expect(screen.getByText('No files attached to this activity')).toBeInTheDocument();
  });

  test('displays description when present', () => {
    render(<ActivityDetailModal {...mockProps} />);
    
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('This is a test assignment description')).toBeInTheDocument();
  });

  test('displays due date when present', () => {
    render(<ActivityDetailModal {...mockProps} />);
    
    expect(screen.getByText('Due Date')).toBeInTheDocument();
    expect(screen.getByText('January 15, 2024 at 11:59 PM')).toBeInTheDocument();
  });

  test('displays creation and update timestamps', () => {
    render(<ActivityDetailModal {...mockProps} />);
    
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Last Updated')).toBeInTheDocument();
  });

  test('has only one close button (no duplicate)', () => {
    render(<ActivityDetailModal {...mockProps} />);
    
    // Should only have the X button in the header, not a separate Close button
    const closeButtons = screen.queryAllByRole('button');
    const closeButtonsWithCloseText = closeButtons.filter(button => 
      button.textContent === 'Close'
    );
    
    expect(closeButtonsWithCloseText).toHaveLength(0);
  });

  test('does not render when activity is null', () => {
    render(<ActivityDetailModal {...mockProps} activity={null} />);
    
    expect(screen.queryByText('Test Assignment')).not.toBeInTheDocument();
  });
});
