import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    if (window.confirm('Reset local database to recover? Your memories can be restored from a backup file if you have one.')) {
      indexedDB.deleteDatabase('MemoryJarDB');
      localStorage.clear();
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          backgroundColor: '#FFFDF9',
          fontFamily: "'Outfit', -apple-system, sans-serif",
          color: '#4A3528',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌸</span>
          <h1 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem', fontFamily: "'Playfair Display', Georgia, serif" }}>
            Something interrupted Memory Jar
          </h1>
          <p style={{ maxWidth: '480px', color: '#7A6658', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            A rendering or component error occurred. Don't worry, your saved memories are safe in local storage.
          </p>

          <div style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: '#FAF5EE',
            border: '1px solid #EFE4D8',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'left',
            overflowX: 'auto',
          }}>
            <strong style={{ color: '#C74E64', fontSize: '0.9rem' }}>
              {this.state.error?.toString() || 'Unknown Error'}
            </strong>
            {this.state.error?.stack && (
              <pre style={{
                fontSize: '0.75rem',
                color: '#665448',
                marginTop: '0.5rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
              </pre>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: '#E26D82',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.65rem 1.5rem',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🔄 Reload Page
            </button>
            <button
              onClick={this.handleResetStorage}
              style={{
                backgroundColor: 'transparent',
                color: '#8C7A6B',
                border: '1px solid #D8C8BB',
                padding: '0.65rem 1.25rem',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              🧹 Reset Storage
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
