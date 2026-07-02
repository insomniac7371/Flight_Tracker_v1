import React from "react";
import PropTypes from "prop-types";
import styles from "./styles.css";

/**
 * Top-level error boundary — catches render exceptions and shows a recovery UI
 * instead of a blank screen, which is critical for an unattended kiosk.
 */
class ErrorBoundary extends React.Component {
  /** @param {Object} props */
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReload = this.handleReload.bind(this);
  }

  /**
   * @param {Error} error
   * @returns {{ hasError: boolean, error: Error }}
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * @param {Error} error
   * @param {Object} info
   */
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  /** Reload the page to recover from the error state. */
  handleReload() {
    window.location.reload();
  }

  /**
   * @returns {JSX.Element} fallback UI or children
   */
  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className={styles.overlay}>
        <div className={styles.box}>
          <div className={styles.icon}>⚠</div>
          <div className={styles.title}>Something went wrong</div>
          <div className={styles.msg}>
            {this.state.error && this.state.error.message
              ? this.state.error.message
              : "An unexpected error occurred."}
          </div>
          <button className={styles.btn} onClick={this.handleReload}>
            Reload
          </button>
        </div>
      </div>
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
