import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from './Home';

describe('Home component', () => {
  beforeEach(() => {
    // Mock the fetch function globally
    global.fetch = jest.fn();
  });

  afterEach(() => {
    // Clear all mocks after each test
    jest.resetAllMocks();
  });

  test('renders the component', () => {
    render(<Home />);
    const headerElement = screen.getByText('Patron Tally');
    expect(headerElement).toBeInTheDocument();
  });

  test('fetches and displays patrons', async () => {
    const mockPatrons = [
      { id: 1, name: 'John Doe', body_mass: 80, alcohol_saturation_level: 0.5 },
      { id: 2, name: 'Jane Smith', body_mass: 65, alcohol_saturation_level: 0.2 },
    ];

    // Mock the fetch function to return the mock patrons
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPatrons,
    });

    render(<Home />);

    // Wait for the patrons to be fetched and displayed
    await waitFor(() => {
      const patronNames = screen.getAllByText(/John Doe|Jane Smith/);
      expect(patronNames.length).toBe(2);
    });

    // Check if the fetch function was called with the correct URL
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/api/patrons');
  });

  test('adds a patron and displays success message', async () => {
    const newPatronName = 'John Doe';
    const newPatronBodyMass = '80';

    // Mock the fetch function to return the newly added patron
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: newPatronName,
        body_mass: Number(newPatronBodyMass),
        alcohol_saturation_level: 0.0,
      }),
    });

    render(<Home />);

    // Fill out the form and submit
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: newPatronName } });
    fireEvent.change(screen.getByLabelText('Body Mass'), { target: { value: newPatronBodyMass } });
    fireEvent.click(screen.getByText('Add'));

    // Wait for the patron to be added and success message to be displayed
    await waitFor(() => {
      const successMessage = screen.getByText('Patron added successfully');
      expect(successMessage).toBeInTheDocument();
    });

    // Check if the fetch function was called with the correct URL and request body
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/api/patrons/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newPatronName,
        body_mass: Number(newPatronBodyMass),
        alcohol_saturation_level: 0.0,
      }),
    });
  });

  test('deletes a patron and displays success message', async () => {
    const mockPatrons = [
      { id: 1, name: 'John Doe', body_mass: 80, alcohol_saturation_level: 0.5 },
      { id: 2, name: 'Jane Smith', body_mass: 65, alcohol_saturation_level: 0.2 },
    ];

    // Mock the fetch function to return the initial patrons and the success response for deletion
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPatrons,
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    render(<Home />);

    // Wait for the patrons to be fetched and displayed
    await waitFor(() => {
      const patronNames = screen.getAllByText(/John Doe|Jane Smith/);
      expect(patronNames.length).toBe(2);
    });

    // Click the delete button for the first patron
    fireEvent.click(screen.getAllByText('Delete')[0]);

    // Wait for the patron to be deleted and success message to be displayed
    await waitFor(() => {
      const successMessage = screen.getByText('Patron 1 deleted successfully');
      expect(successMessage).toBeInTheDocument();
    });

    // Check if the fetch function was called with the correct URL and method
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/api/patrons/1/', {
      method: 'DELETE',
    });
  });

  // Add more test cases for other functionality as needed
});
