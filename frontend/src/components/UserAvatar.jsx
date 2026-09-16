import { useEffect, useState } from "react";
import { userAvatarUrl } from "../api/user";
import "./UserAvatar.css";

function usernameInitial(username) {
    const letter = (username ?? "").trim().charAt(0);
    return letter ? letter.toUpperCase() : "?";
}

function UserAvatar({
    userId,
    username,
    hasAvatar = false,
    version,
    className = "",
}) {
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setFailed(false);
    }, [userId, version, hasAvatar]);

    const showImage = Boolean(userId && hasAvatar && !failed);

    return (
        <div className={`user-avatar ${className}`.trim()}>
            {showImage ? (
                <img
                    src={userAvatarUrl(userId, version)}
                    alt=""
                    onError={() => setFailed(true)}
                />
            ) : (
                <span>{usernameInitial(username)}</span>
            )}
        </div>
    );
}

export default UserAvatar;
