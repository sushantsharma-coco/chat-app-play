const http = require("http");
const app = require("express")();
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// online users with socket ids
const onlineUsersSockets = {};

// function to get all online users socket ids
function getOnlineSocketIds(id) {
  return onlineUsersSockets[id];
}

// socket emits to itself
// io emits to all

io.on("connect", (socket) => {
  io.emit("all", `${socket.id} connected`);

  const id = socket.handshake.query._id;

  if (onlineUsersSockets[id]) {
    onlineUsersSockets[id].push(socket.id);
  } else {
    onlineUsersSockets[id] = [socket.id];
  }

  io.emit("onlineUsers", Object.keys(onlineUsersSockets));

  socket.on("disconnect", () => {
    io.emit("all", `${socket.id} disconnected`);

    onlineUsersSockets[id] = onlineUsersSockets[id].filter(
      (e) => e !== socket.id
    );

    if (onlineUsersSockets[id].length == 0) {
      delete onlineUsersSockets[id];
    }

    io.emit("onlineUsers", Object.keys(onlineUsersSockets));
  });
});

module.exports = {
  io,
  server,
  app,
  getOnlineSocketIds,
};
