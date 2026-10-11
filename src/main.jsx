import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';

class AppBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <main style={{ padding: 32, color: '#273c32', fontFamily: 'sans-serif' }}><h1>Smart Engineer AI is having trouble loading.</h1><p>{this.state.error.message}</p></main>;
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(<React.StrictMode><AppBoundary><BrowserRouter><App /></BrowserRouter></AppBoundary></React.StrictMode>);
