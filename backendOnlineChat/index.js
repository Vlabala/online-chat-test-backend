const express = require("express");
const app = express();
const socket = require("socket.io");

app.use(express());

const port = 8000;


var server = app.listen(
    port
);

const io = socket(server);

//Пользователи
const users = [];
//Добавляет пользователя
function addUser(id, name, room) {
    const curUser = { id, name, room };

    users.push(curUser);
    console.log(users, "users");

    return curUser;
}
//Получает пользователя по id
function getCurrentUser(id) {
    return users.find((curUser) => curUser.id === id);
}
//Отключает пользователя по id
function disconnectUser(id) {
    const index = users.findIndex((curUser) => curUser.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}
//Получает всех пользователей в комнате
function getAllRoomUsers(room){
    return users.filter(element => element.room === room).map(element => element.name);
}



io.on("connection", (socket) => {
    //При входе пользователя в комнату
    socket.on("joinRoom", ({ name, room }) => {
        const curUser = addUser(socket.id, name, room);
        socket.join(curUser.room);
        io.to(curUser.room).emit("thisRoomUsers", getAllRoomUsers(curUser.room));
    });

    //При отправке сообщения пользователем
    socket.on("chat", (text) => {
        const curUser = getCurrentUser(socket.id);

        io.to(curUser.room).emit("message", {
            userId: curUser.id,
            name: curUser.name,
            text: text,
            time: Date.now()
        });
    });

    //При отключении пользователя
    socket.on("disconnect", () => {
        const curUser = disconnectUser(socket.id);
        io.to(curUser.room).emit("thisRoomUsers", getAllRoomUsers(curUser.room));
    });
});
