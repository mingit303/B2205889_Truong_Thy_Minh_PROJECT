import { ref } from "vue";
import { io } from "socket.io-client";

// Global singleton socket instance
let socketInstance = null;
const isConnected = ref(false);

export const useSocket = () => {
  const connect = () => {
    if (!socketInstance) {
      try {
        socketInstance = io("http://localhost:3000", {
          transports: ["websocket"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 5000,
        });

        socketInstance.on("connect", () => {
          console.log("✅ Socket connected:", socketInstance.id);
          isConnected.value = true;
        });

        socketInstance.on("disconnect", () => {
          console.log("❌ Socket disconnected");
          isConnected.value = false;
        });

        socketInstance.on("connect_error", (error) => {
          console.warn("Socket connection error (backend chưa chạy?):", error.message);
          isConnected.value = false;
        });
      } catch (error) {
        console.warn("Failed to create socket connection:", error);
      }
    }
    return socketInstance;
  };

  const disconnect = () => {
    // Don't disconnect on component unmount - keep connection alive
    // Only disconnect when explicitly needed (e.g., logout)
  };

  const forceDisconnect = () => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      isConnected.value = false;
    }
  };

  const on = (event, callback) => {
    if (socketInstance) {
      socketInstance.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socketInstance) {
      if (callback) {
        socketInstance.off(event, callback);
      } else {
        socketInstance.off(event);
      }
    }
  };

  const emit = (event, data) => {
    if (socketInstance && isConnected.value) {
      socketInstance.emit(event, data);
    }
  };

  return {
    socket: socketInstance,
    isConnected,
    connect,
    disconnect,
    forceDisconnect,
    on,
    off,
    emit,
  };
};

// Socket Events Constants
export const SOCKET_EVENTS = {
  // Books
  BOOK_ADDED: "book:added",
  BOOK_UPDATED: "book:updated",
  BOOK_DELETED: "book:deleted",

  // Authors
  AUTHOR_ADDED: "author:added",
  AUTHOR_UPDATED: "author:updated",
  AUTHOR_DELETED: "author:deleted",

  // Publishers
  PUBLISHER_ADDED: "publisher:added",
  PUBLISHER_UPDATED: "publisher:updated",
  PUBLISHER_DELETED: "publisher:deleted",

  // Readers
  READER_ADDED: "reader:added",
  READER_UPDATED: "reader:updated",
  READER_DELETED: "reader:deleted",

  // Borrow Records
  BORROW_ADDED: "borrow:added",
  BORROW_UPDATED: "borrow:updated",
  BORROW_DELETED: "borrow:deleted",

  // Requests
  REQUEST_CREATED: "request:created",
  REQUEST_ADDED: "request:added",
  REQUEST_UPDATED: "request:updated",
  REQUEST_DELETED: "request:deleted",
};
