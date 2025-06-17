import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios, authUser } = useContext(AuthContext);

  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        const validMessages = data.messages.filter((msg) => msg && msg.senderId);
        setMessages(validMessages);

        setUnseenMessages((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const sendMessage = async (messageData) => {
    if (!selectedUser?._id) return;

    try {
      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
      if (data.success) {
        const newMsg = data.newMessage;
        if (newMsg && newMsg.senderId) {
          setMessages((prev) => [...prev, newMsg]);
          socket?.emit("sendMessage", newMsg);
        } else {
          toast.error("Invalid message received from server");
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const subscribeToMessages = () => {
    if (!socket) return;

    socket.off("newMessage");

    socket.on("newMessage", async (newMessage) => {
      if (!newMessage || !newMessage.senderId) return;

      const isCurrentChat = selectedUser && newMessage.senderId === selectedUser._id;

      if (isCurrentChat) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);

        try {
          await axios.put(`/api/messages/mark/${newMessage._id}`);
        } catch (err) {
          console.error("Failed to mark message seen");
        }
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  useEffect(() => {
    subscribeToMessages();
    return () => socket?.off("newMessage");
  }, [socket, selectedUser]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        selectedUser,
        setSelectedUser,
        getUsers,
        getMessages,
        sendMessage,
        unseenMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
