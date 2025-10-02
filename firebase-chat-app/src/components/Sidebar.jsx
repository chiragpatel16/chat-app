import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, onSnapshot, query, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuthState } from "../hooks/useAuthState";
import { setUsers } from "../store/slices/usersSlice";
import { setSelectedUser } from "../store/slices/chatSlice";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const dispatch = useDispatch();
  const users = useSelector((s) => s.users.list);
  const sel = useSelector((s) => s.chat.selectedUser);
  const { user } = useAuthState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
      dispatch(setUsers(arr.filter((u) => u.uid !== user.uid)));
    });
    return () => unsub();
  }, [dispatch, user]);

  useEffect(() => {
    if (!user) return;
    const updateLastSeen = async () => {
      await updateDoc(doc(db, "users", user.uid), { lastSeen: serverTimestamp() });
    };
    updateLastSeen();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/auth");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="sidebar" style={{ background: "linear-gradient(190deg, #681E23, #2C0F12 )", height:"auto" }}>
      <h3 style={{color:"#f1afafff", fontFamily:"cursive"}}>Chit-Chat</h3>
      <div className="user-list1">
        {users.map((u) => (
          <div
            key={u.uid}
            className={`user-row ${sel?.uid === u.uid ? "selected" : ""}`}
            onClick={() => dispatch(setSelectedUser(u))}
          >
            <div className="avatar">{u.displayName ? u.displayName[0].toUpperCase() : u.email[0]}</div>
            <div>
              <div className="u-email">{u.displayName}</div>
              <div className="u-last" style={{fontSize:"15px", color:"gray"}}>
                Last seen: {u.lastSeen ? new Date(u.lastSeen.seconds * 1000).toLocaleString() : "—"}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
