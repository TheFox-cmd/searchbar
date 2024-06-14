import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { act } from 'react';
import SearchBar from './searchbar';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          items: [
            { volumeInfo: { title: 'Book 1' } },
            { volumeInfo: { title: 'Book 2' } },
          ],
        }),
    })
  ) as jest.Mock;
});

describe('SearchBar', () => {
  test('renders search input', () => {
    render(<SearchBar />);
    const inputElement = screen.getByPlaceholderText(/Search for books.../i);
    expect(inputElement).toBeInTheDocument();
  });

  test('fetches and displays suggestions as user types', async () => {
    render(<SearchBar />);
    const inputElement = screen.getByPlaceholderText(/Search for books.../i);

    act(() => {
      fireEvent.change(inputElement, { target: { value: 'Book' } });
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Book 1')).toBeInTheDocument();
      expect(screen.getByText('Book 2')).toBeInTheDocument();
    });
  });

  test('highlights suggestion on hover', async () => {
    render(<SearchBar />);
    const inputElement = screen.getByPlaceholderText(/Search for books.../i);

    act(() => {
      fireEvent.change(inputElement, { target: { value: 'Book' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Book 1')).toBeInTheDocument();
    });

    const suggestion = screen.getByText('Book 1');
    act(() => {
      fireEvent.mouseEnter(suggestion);
    });

    expect(suggestion).toHaveStyle('background-color: #ddd');
  });

  test('selects suggestion on click', async () => {
    render(<SearchBar />);
    const inputElement = screen.getByPlaceholderText(/Search for books.../i);

    act(() => {
      fireEvent.change(inputElement, { target: { value: 'Book' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Book 1')).toBeInTheDocument();
    });

    const suggestion = screen.getByText('Book 1');
    act(() => {
      fireEvent.click(suggestion);
    });

    expect(screen.getByText('Selected Book')).toBeInTheDocument();
    expect(screen.getByText('Book 1')).toBeInTheDocument();
  });

  test('handles keyboard navigation (ArrowDown and ArrowUp)', async () => {
    render(<SearchBar />);
    const inputElement = screen.getByPlaceholderText(/Search for books.../i);

    act(() => {
      fireEvent.change(inputElement, { target: { value: 'Book' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Book 1')).toBeInTheDocument();
    });

    act(() => {
      fireEvent.keyDown(inputElement, { key: 'ArrowDown', code: 'ArrowDown' });
    });
    expect(screen.getByText('Book 1')).toHaveStyle('background-color: #ddd');

    act(() => {
      fireEvent.keyDown(inputElement, { key: 'ArrowDown', code: 'ArrowDown' });
    });
    expect(screen.getByText('Book 2')).toHaveStyle('background-color: #ddd');

    act(() => {
      fireEvent.keyDown(inputElement, { key: 'ArrowUp', code: 'ArrowUp' });
    });
    expect(screen.getByText('Book 1')).toHaveStyle('background-color: #ddd');
  });
});
