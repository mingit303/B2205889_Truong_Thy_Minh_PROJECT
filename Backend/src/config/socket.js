// Socket.IO Event Names
const SOCKET_EVENTS = {
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

// Helper function to emit events
const emitSocketEvent = (event, data) => {
  if (global.io) {
    global.io.emit(event, data);
    // console.log(`Socket event emitted: ${event}`, data);
  }
};

module.exports = {
  SOCKET_EVENTS,
  emitSocketEvent,
};
