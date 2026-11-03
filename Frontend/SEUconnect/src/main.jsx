import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("SEUConnect Global Error Boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2.5rem',
          maxWidth: '800px',
          margin: '3rem auto',
          background: '#ffffff',
          border: '2px solid #ef4444',
          borderRadius: '10px',
          color: '#1e293b',
          fontFamily: 'Inter, system-ui, sans-serif',
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
        }}>
          <h2 style={{ color: '#b91c1c', marginTop: 0 }}>Portal Render Issue Caught</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            An unexpected error occurred while rendering the view:
          </p>
          <pre style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '1rem',
            borderRadius: '6px',
            color: '#991b1b',
            whiteSpace: 'pre-wrap',
            fontSize: '0.85rem'
          }}>
            {this.state.error?.toString()}
          </pre>
          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => { window.location.reload(); }}
              style={{
                padding: '0.6rem 1.2rem',
                background: '#0f2b5c',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
            <button
              type="button"
              onClick={() => { localStorage.clear(); window.location.hash = ''; window.location.reload(); }}
              style={{
                padding: '0.6rem 1.2rem',
                background: '#475569',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset Session & Go to Login
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
