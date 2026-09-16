import './LinkWarningModal.css';

function LinkWarningModal({url, onConfirm, onCancel}) {
    if (!url) {
        return null;
    }

    return (
        <div className="link-warning-overlay" onClick={onCancel}>
            <div
                className="link-warning-modal"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="link-warning-title"
            >
                <h2 id="link-warning-title">Open this link?</h2>
                <p className="link-warning-text">
                    This opens a website outside Chatty. Make sure you trust it before continuing.
                </p>
                <p className="link-warning-url">{url}</p>
                <div className="link-warning-actions">
                    <button type="button" className="link-warning-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="button" className="link-warning-confirm" onClick={onConfirm}>
                        Open
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LinkWarningModal;
