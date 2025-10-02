import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";

// async thunk
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (chatId) => {
    const q = query(collection(db, "messages", chatId, "chat"), orderBy("timestamp"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
);


const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    selectedUser: null,
    status: "idle",
    error: null
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  }
});

export const { setMessages, addMessage, setSelectedUser } = chatSlice.actions;
export default chatSlice.reducer;
