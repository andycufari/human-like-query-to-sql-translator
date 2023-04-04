import React, { useState } from 'react';
import './App.css';

function App() {
  const [humanQuery, setHumanQuery] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('/api/generate-sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ humanQuery }),
    });
    const data = await response.text();
    setSqlQuery(data);
  };

  return (
    <div className="App">
      <h1>ChatGPT SQL Generator</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="human-query">Enter human-like query:</label>
        <input
          id="human-query"
          type="text"
          value={humanQuery}
          onChange={(event) => setHumanQuery(event.target.value)}
        />
        <button type="submit">Generate SQL</button>
      </form>
      {sqlQuery && (
        <div>
          <h2>Generated SQL query:</h2>
          <pre>{sqlQuery}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
