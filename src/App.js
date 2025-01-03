import React from 'react';
import './App.css';
import OutfitGenerator from './components/OutfitGenerator';
import StyleGrid from './components/StyleGrid';

function App() {
  return (
    <div className="App">
      <main>
        <OutfitGenerator />
        <StyleGrid />
      </main>
    </div>
  );
}

export default App;
