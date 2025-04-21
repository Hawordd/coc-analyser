import type React from 'react';
import './App.css';
import ImageUploader from './components/ImageUploader';

const App: React.FC = () => (
  <div className="container">
    <h1>Clash of Clans Analyzer</h1>
    <div className="card">
      <ImageUploader />
    </div>
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} - Clash of Clans Analyzer</p>
    </footer>
  </div>
);

export default App;