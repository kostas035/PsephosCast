import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Crash Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#222', color: '#ff4444', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2>💥 The Swingometer Crashed!</h2>
          <p>Check the red text below to see exactly where the math or render failed:</p>
          <pre style={{ background: '#111', padding: '20px', overflowX: 'auto' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}>
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}