// import axios from "axios";
// import { Search, X } from "lucide-react";
// import React, { useEffect, useRef, useState } from "react";
// import io from "socket.io-client";
// import { API_BASE_URL } from "../../config";
// import { useAuth } from "../components/authentication/AuthContext";

// const socket = io(API_BASE_URL, {
//   withCredentials: true,
//   extraHeaders: {
//     Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//   },
// });

// // Custom debounce hook
// function useDebounce(value, delay) {
//   const [debouncedValue, setDebouncedValue] = useState(value);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// }

// const YQMSChat = ({ onClose }) => {
//   const { user } = useAuth();
//   const [users, setUsers] = useState([]);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const debouncedSearchQuery = useDebounce(searchQuery, 300);
//   const messagesEndRef = useRef(null);

//   // Fetch users based on search query
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await axios.get(`${API_BASE_URL}/api/search-users`, {
//           params: { q: debouncedSearchQuery },
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//           },
//         });
//         setUsers(response.data.filter((u) => u.emp_id !== user.emp_id));
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       }
//     };
//     if (user) fetchUsers();
//   }, [user, debouncedSearchQuery]);

//   // Socket.io setup
//   useEffect(() => {
//     if (user) {
//       socket.emit("join", user.emp_id);

//       socket.on("onlineUsers", (onlineUserIds) => {
//         setOnlineUsers(onlineUserIds);
//       });

//       socket.on("receiveMessage", (message) => {
//         if (
//           (message.senderId === selectedUser?.emp_id &&
//             message.recipientId === user.emp_id) ||
//           (message.senderId === user.emp_id &&
//             message.recipientId === selectedUser?.emp_id)
//         ) {
//           setMessages((prev) => [...prev, message]);
//         }
//       });

//       socket.on("messageSent", (message) => {
//         if (
//           message.senderId === user.emp_id &&
//           message.recipientId === selectedUser?.emp_id
//         ) {
//           setMessages((prev) => [...prev, message]);
//         }
//       });

//       socket.on("error", (error) => {
//         console.error("Socket error:", error);
//       });

//       return () => {
//         socket.off("onlineUsers");
//         socket.off("receiveMessage");
//         socket.off("messageSent");
//         socket.off("error");
//       };
//     }
//   }, [user, selectedUser]);

//   // Fetch chat history when selecting a user
//   useEffect(() => {
//     const fetchChatHistory = async () => {
//       if (selectedUser && user) {
//         try {
//           const response = await axios.get(
//             `${API_BASE_URL}/api/chats/${user.emp_id}/${selectedUser.emp_id}`,
//             {
//               headers: {
//                 Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//               },
//             }
//           );
//           setMessages(response.data);
//         } catch (error) {
//           console.error("Error fetching chat history:", error);
//         }
//       }
//     };
//     fetchChatHistory();
//   }, [selectedUser, user]);

//   // Scroll to bottom of messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSendMessage = (e) => {
//     e.preventDefault();
//     if (newMessage.trim() && selectedUser && user) {
//       socket.emit("sendMessage", {
//         senderId: user.emp_id,
//         recipientId: selectedUser.emp_id,
//         message: newMessage,
//       });
//       setNewMessage("");
//     }
//   };

//   return (
//     <div className="flex h-full bg-gray-100 relative">
//       {/* Close Button */}
//       <button
//         onClick={onClose}
//         className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
//       >
//         <X className="h-6 w-6" />
//       </button>

//       {/* Sidebar: User List */}
//       <div className="w-1/3 md:w-1/4 bg-white border-r border-gray-200 overflow-y-auto">
//         <div className="p-4 border-b border-gray-200">
//           <h2 className="text-lg font-semibold">Users</h2>
//           <div className="relative mt-2">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder="Search by name or ID..."
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//             />
//           </div>
//         </div>
//         {users.length > 0 ? (
//           users.map((u) => (
//             <div
//               key={u.emp_id}
//               onClick={() => setSelectedUser(u)}
//               className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 ${
//                 selectedUser?.emp_id === u.emp_id ? "bg-gray-200" : ""
//               }`}
//             >
//               <div className="relative">
//                 <img
//                   src={u.face_photo || "/IMG/default-profile.png"}
//                   alt={u.eng_name}
//                   className="w-10 h-10 rounded-full object-cover"
//                 />
//                 {onlineUsers.includes(u.emp_id) && (
//                   <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
//                 )}
//               </div>
//               <div className="ml-3">
//                 <p className="text-sm font-medium">{u.eng_name}</p>
//                 <p className="text-xs text-gray-500">{u.job_title}</p>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="p-4 text-gray-500 text-sm">No users found</div>
//         )}
//       </div>

//       {/* Chat Area */}
//       <div className="flex-1 flex flex-col">
//         {selectedUser ? (
//           <>
//             {/* Chat Header */}
//             <div className="bg-white p-4 border-b border-gray-200 flex items-center">
//               <img
//                 src={selectedUser.face_photo || "/IMG/default-profile.png"}
//                 alt={selectedUser.eng_name}
//                 className="w-10 h-10 rounded-full object-cover"
//               />
//               <div className="ml-3">
//                 <p className="text-lg font-semibold">{selectedUser.eng_name}</p>
//                 <p className="text-sm text-gray-500">
//                   {onlineUsers.includes(selectedUser.emp_id)
//                     ? "Online"
//                     : "Offline"}
//                 </p>
//               </div>
//             </div>

//             {/* Messages */}
//             <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
//               {messages.map((msg, index) => (
//                 <div
//                   key={index}
//                   className={`flex mb-4 ${
//                     msg.senderId === user.emp_id
//                       ? "justify-end"
//                       : "justify-start"
//                   }`}
//                 >
//                   <div
//                     className={`max-w-xs p-3 rounded-lg ${
//                       msg.senderId === user.emp_id
//                         ? "bg-blue-500 text-white"
//                         : "bg-white border border-gray-200"
//                     }`}
//                   >
//                     <p>{msg.message}</p>
//                     <p className="text-xs mt-1 opacity-75">
//                       {new Date(msg.timestamp).toLocaleTimeString()}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Message Input */}
//             <div className="bg-white p-4 border-t border-gray-200">
//               <form onSubmit={handleSendMessage} className="flex">
//                 <input
//                   type="text"
//                   value={newMessage}
//                   onChange={(e) => setNewMessage(e.target.value)}
//                   placeholder="Type a message..."
//                   className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <button
//                   type="submit"
//                   className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
//                 >
//                   Send
//                 </button>
//               </form>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center">
//             <p className="text-gray-500">Select a user to start chatting</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default YQMSChat;

import axios from "axios";
import { Search, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { API_BASE_URL } from "../../config";
import { useAuth } from "../components/authentication/AuthContext";

const socket = io(API_BASE_URL, {
  withCredentials: true,
  extraHeaders: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

// Custom debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const YQMSChat = ({ onClose }) => {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const messagesEndRef = useRef(null);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users`);
        const users = response.data.filter((u) => u.emp_id !== user.emp_id);
        console.log("Fetched users:", users); // Debug log
        setAllUsers(users);
        setFilteredUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        setAllUsers([]);
        setFilteredUsers([]);
      }
    };
    if (user) fetchUsers();
  }, [user]);

  // Filter users based on search query
  useEffect(() => {
    const query = debouncedSearchQuery.toLowerCase();
    if (query === "") {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter((u) => {
        const engName = u.eng_name ? u.eng_name.toLowerCase() : "";
        const empId = u.emp_id ? u.emp_id.toLowerCase() : "";
        return engName.startsWith(query) || empId.startsWith(query);
      });
      setFilteredUsers(filtered);
    }
  }, [debouncedSearchQuery, allUsers]);

  // Fetch unread message counts
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/unread-messages/${user.emp_id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        const counts = response.data.reduce((acc, { _id, count }) => {
          acc[_id] = count;
          return acc;
        }, {});
        setUnreadCounts(counts);
      } catch (error) {
        console.error("Error fetching unread counts:", error);
      }
    };
    if (user) fetchUnreadCounts();
  }, [user, messages]);

  // Socket.io setup
  useEffect(() => {
    if (user) {
      socket.emit("join", user.emp_id);

      socket.on("onlineUsers", (onlineUserIds) => {
        setOnlineUsers(onlineUserIds);
      });

      socket.on("receiveMessage", (message) => {
        console.log("Received message:", message); // Debug log
        if (
          (message.senderId === selectedUser?.emp_id &&
            message.recipientId === user.emp_id) ||
          (message.senderId === user.emp_id &&
            message.recipientId === selectedUser?.emp_id)
        ) {
          setMessages((prev) => [...prev, message]);
        }
        // Update unread counts
        setUnreadCounts((prev) => ({
          ...prev,
          [message.senderId]: (prev[message.senderId] || 0) + 1,
        }));
      });

      socket.on("messageSent", (message) => {
        console.log("Message sent:", message); // Debug log
        if (
          message.senderId === user.emp_id &&
          message.recipientId === selectedUser?.emp_id
        ) {
          setMessages((prev) => [...prev, message]);
        }
      });

      socket.on("pendingMessages", (pendingMessages) => {
        console.log("Pending messages:", pendingMessages); // Debug log
        if (selectedUser) {
          const relevantMessages = pendingMessages.filter(
            (msg) =>
              (msg.senderId === selectedUser.emp_id &&
                msg.recipientId === user.emp_id) ||
              (msg.senderId === user.emp_id &&
                msg.recipientId === selectedUser.emp_id)
          );
          setMessages((prev) => [...prev, ...relevantMessages]);
        }
        // Update unread counts for pending messages
        const newCounts = pendingMessages.reduce((acc, msg) => {
          if (msg.recipientId === user.emp_id && !msg.isRead) {
            acc[msg.senderId] = (acc[msg.senderId] || 0) + 1;
          }
          return acc;
        }, {});
        setUnreadCounts((prev) => ({ ...prev, ...newCounts }));
      });

      socket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      return () => {
        socket.off("onlineUsers");
        socket.off("receiveMessage");
        socket.off("messageSent");
        socket.off("pendingMessages");
        socket.off("error");
      };
    }
  }, [user, selectedUser]);

  // Fetch chat history and mark messages as read
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (selectedUser && user) {
        try {
          console.log("Fetching chat history for:", selectedUser.emp_id); // Debug log
          // Clear messages to avoid stale data
          setMessages([]);
          // Fetch chat history
          const response = await axios.get(
            `${API_BASE_URL}/api/chats/${user.emp_id}/${selectedUser.emp_id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
          console.log("Chat history response:", response.data); // Debug log
          setMessages(response.data);

          // Mark messages as read
          await axios.post(
            `${API_BASE_URL}/api/mark-messages-read/${user.emp_id}/${selectedUser.emp_id}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
          setUnreadCounts((prev) => {
            const newCounts = { ...prev };
            delete newCounts[selectedUser.emp_id];
            return newCounts;
          });
        } catch (error) {
          console.error("Error fetching chat history:", error);
          setMessages([]); // Clear messages on error
        }
      }
    };
    fetchChatHistory();
  }, [selectedUser, user]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedUser && user) {
      socket.emit("sendMessage", {
        senderId: user.emp_id,
        recipientId: selectedUser.emp_id,
        message: newMessage,
      });
      setNewMessage("");
    }
  };

  // Handle user selection
  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setMessages([]); // Clear messages before fetching new history
  };

  // Sort users: prioritize those with unread messages, then by name
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aUnread = unreadCounts[a.emp_id] || 0;
    const bUnread = unreadCounts[b.emp_id] || 0;
    if (aUnread > 0 && bUnread > 0) return bUnread - aUnread;
    if (aUnread > 0) return -1;
    if (bUnread > 0) return 1;
    // Fallback to name or empty string if eng_name is undefined
    const aName = a.eng_name || a.name || "";
    const bName = b.eng_name || b.name || "";
    return aName.localeCompare(bName);
  });

  return (
    <div className="flex h-full bg-gray-100 relative">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Sidebar: User List */}
      <div className="w-1/3 md:w-1/4 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Users</h2>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-shadow"
            />
          </div>
        </div>
        {sortedUsers.length > 0 ? (
          sortedUsers.map((u) => (
            <div
              key={u.emp_id}
              onClick={() => handleSelectUser(u)}
              className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedUser?.emp_id === u.emp_id ? "bg-gray-100" : ""
              }`}
            >
              <div className="relative">
                <img
                  src={u.face_photo || "/IMG/default-profile.png"}
                  alt={u.eng_name || u.name || "User"}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                {onlineUsers.includes(u.emp_id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">
                    {u.eng_name || u.name || "Unknown User"}
                  </p>
                  {unreadCounts[u.emp_id] > 0 && (
                    <span className="bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-1">
                      {unreadCounts[u.emp_id]}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {u.job_title || "No title"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-gray-500 text-sm">No users found</div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 border-b border-gray-200 flex items-center">
              <img
                src={selectedUser.face_photo || "/IMG/default-profile.png"}
                alt={selectedUser.eng_name || selectedUser.name || "User"}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <div className="ml-3">
                <p className="text-lg font-semibold text-gray-800">
                  {selectedUser.eng_name || selectedUser.name || "Unknown User"}
                </p>
                <p className="text-sm text-gray-500">
                  {onlineUsers.includes(selectedUser.emp_id)
                    ? "Online"
                    : "Offline"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex mb-4 ${
                      msg.senderId === user.emp_id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-lg shadow-sm ${
                        msg.senderId === user.emp_id
                          ? "bg-blue-500 text-white"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm text-center">
                  No messages yet
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default YQMSChat;
