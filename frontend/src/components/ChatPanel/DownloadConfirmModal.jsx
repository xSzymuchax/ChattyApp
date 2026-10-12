import './LinkWarningModal.css';

function DownloadConfirmModal({ fileName, onConfirm, onCancel }) {
    if (!fileName) {
        return null;
    }

    return (
        <div className="link-warning-overlay" onClick={onCancel}>
            <div
                className="link-warning-modal"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="download-warning-title"
            >
                <h2 id="download-warning-title">Download this file?</h2>
                <p className="link-warning-text">
                    Make sure you trust this attachment before saving it to your device.
                </p>
                <p className="link-warning-url">{fileName}</p>
                <div className="link-warning-actions">
                    <button type="button" className="link-warning-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="button" className="link-warning-confirm" onClick={onConfirm}>
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DownloadConfirmModal
