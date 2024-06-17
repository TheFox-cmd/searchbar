import React, { useState, useEffect, useCallback } from 'react';

interface Book {
  title: string;
}

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Book[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const fetchSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery) {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&startIndex=0&maxResults=20`);
        const data = await response.json();
        if (data.items) {
          const bookTitles = data.items.map((item: any) => ({
            title: item.volumeInfo.title,
          }));
          setSuggestions(bookTitles);
        } else {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    }, 300), []
  );

  useEffect(() => {
    fetchSuggestions(query);
  }, [query, fetchSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
    setActiveSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSelectedBook(suggestions[activeSuggestionIndex]);
      setShowSuggestions(false);
    } else if (e.key === 'ArrowDown') {
      if (activeSuggestionIndex < suggestions.length - 1) {
        setActiveSuggestionIndex(prevIndex => prevIndex + 1);
      }
    } else if (e.key === 'ArrowUp') {
      if (activeSuggestionIndex > 0) {
        setActiveSuggestionIndex(prevIndex => prevIndex - 1);
      }
    }
  };

  const handleSuggestionClick = (index: number) => {
    setSelectedBook(suggestions[index]);
    setShowSuggestions(false);
  };

  const handleMouseEnter = (index: number) => {
    setActiveSuggestionIndex(index);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search for books..."
        style={{ width: '300px', padding: '10px', fontSize: '16px' }}
      />
      {showSuggestions && query && (
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, border: '1px solid #ccc', maxHeight: '150px', overflowY: 'auto' }}>
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              style={{
                padding: '10px',
                backgroundColor: index === activeSuggestionIndex ? '#ddd' : '#fff',
                cursor: 'pointer',
              }}
            >
              {suggestion.title}
            </li>
          ))}
        </ul>
      )}
      {selectedBook && (
        <div style={{ marginTop: '20px' }}>
          <h2>Selected Book</h2>
          <p>{selectedBook.title}</p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
