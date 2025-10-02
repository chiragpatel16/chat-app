import React from "react";

export default function ProfilePanel({ user }) {
  if (!user) return <div className="profile-panel">Select a user</div>;

  return (
    <div className="profile-panel">
      <h3>{user.displayName || user.email}</h3>
      <p>Email: {user.email}</p>
      <p>Last seen: {user.lastSeen ? new Date(user.lastSeen.seconds * 1000).toLocaleString() : "—"}</p>
    </div>
  );
}
