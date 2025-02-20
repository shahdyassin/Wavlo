const token = localStorage.getItem("access_token");

if (!token) {
    console.error("No access token found. Please log in first.");
} else {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl("/hubs/chat", {
            accessTokenFactory: () => token
        })
        .withAutomaticReconnect([0, 1000, 5000, null])
        .configureLogging(signalR.LogLevel.Information)
        .build();

    // استقبال إشعار عند اتصال مستخدم
    connection.on("ReceiveUserConnected", function (userId, userName) {
        addMessage(`${userName} has connected.`);
    });

    // استقبال إشعار عند انقطاع اتصال مستخدم
    connection.on("ReceiveUserDisConnected", function (userId, userName) {
        addMessage(`${userName} has disconnected.`);
    });

    // استقبال إشعار عند إضافة غرفة دردشة
    connection.on("ReceiveAddRoomMessage", function (maxRoom, roomId, roomName, userId, userName) {
        addMessage(`${userName} has created room: ${roomName}`);
        fillRoomDropDown();
    });

    // استقبال إشعار عند حذف غرفة دردشة
    connection.on("ReceiveDeleteRoomMessage", function (deleted, selected, roomName, userName) {
        addMessage(`${userName} has deleted room: ${roomName}`);
    });

    // استقبال رسالة عامة
    connection.on("ReceivePublicMessage", function (roomId, userId, userName, message, roomName) {
        addMessage(`[Public - ${roomName}] ${userName}: ${message}`);
    });

    // استقبال رسالة خاصة
    connection.on("ReceivePrivateMessage", function (senderId, senderName, receiverId, message, chatId, receiverName) {
        addMessage(`[Private to ${receiverName}] ${senderName}: ${message}`);
    });

    // إرسال رسالة عامة
    function sendPublicMessage() {
        let inputMsg = document.getElementById('txtPublicMessage');
        let ddlSelRoom = document.getElementById('ddlSelRoom');
        let roomId = ddlSelRoom.value;
        let roomName = ddlSelRoom.options[ddlSelRoom.selectedIndex].text;
        var message = inputMsg.value;
        connection.send("SendPublicMessage", Number(roomId), message, roomName);
        inputMsg.value = '';
    }

    // إرسال رسالة خاصة
    function sendPrivateMessage() {
        let inputMsg = document.getElementById('txtPrivateMessage');
        let ddlSelUser = document.getElementById('ddlSelUser');
        let receiverId = ddlSelUser.value;
        let receiverName = ddlSelUser.options[ddlSelUser.selectedIndex].text;
        var message = inputMsg.value;
        connection.send("SendPrivateMessage", receiverId, message, receiverName);
        inputMsg.value = '';
    }

    // إنشاء غرفة جديدة
    function addNewRoom(maxRoom) {
        let createRoomName = document.getElementById('createRoomName');
        var roomName = createRoomName.value;
        if (!roomName) return;
        $.ajax({
            url: '/ChatRooms/PostChatRoom',
            type: "POST",
            contentType: 'application/json',
            data: JSON.stringify({ id: 0, name: roomName }),
            success: function (json) {
                connection.send("SendAddRoomMessage", maxRoom, json.id, json.name);
                createRoomName.value = '';
            },
            error: function () {
                alert('Error creating room');
            }
        });
    }

    // حذف غرفة
    function deleteRoom() {
        let ddlDelRoom = document.getElementById('ddlDelRoom');
        var roomName = ddlDelRoom.options[ddlDelRoom.selectedIndex].text;
        if (!confirm(`Do you want to delete Chat Room ${roomName}?`)) return;
        let roomId = ddlDelRoom.value;
        $.ajax({
            url: `/ChatRooms/DeleteChatRoom/${roomId}`,
            type: "DELETE",
            contentType: 'application/json',
            success: function (json) {
                connection.send("SendDeleteRoomMessage", json.deleted, json.selected, roomName);
                fillRoomDropDown();
            },
            error: function () {
                alert('Error deleting room');
            }
        });
    }

    // تحميل قائمة المستخدمين المتصلين
    function fillUserDropDown() {
        $.getJSON('/ChatRooms/GetChatUser')
            .done(function (json) {
                let ddlSelUser = document.getElementById("ddlSelUser");
                ddlSelUser.innerHTML = '';
                json.forEach(function (item) {
                    var newOption = document.createElement("option");
                    newOption.text = item.userName;
                    newOption.value = item.id;
                    ddlSelUser.add(newOption);
                });
            })
            .fail(function () {
                console.log("Failed to load users.");
            });
    }

    // تحميل قائمة الغرف
    function fillRoomDropDown() {
        $.getJSON('/ChatRooms/GetChatRoom')
            .done(function (json) {
                let ddlDelRoom = document.getElementById("ddlDelRoom");
                let ddlSelRoom = document.getElementById("ddlSelRoom");
                ddlDelRoom.innerHTML = '';
                ddlSelRoom.innerHTML = '';
                json.forEach(function (item) {
                    var newOption = document.createElement("option");
                    newOption.text = item.name;
                    newOption.value = item.id;
                    ddlDelRoom.add(newOption);
                    var newOption1 = document.createElement("option");
                    newOption1.text = item.name;
                    newOption1.value = item.id;
                    ddlSelRoom.add(newOption1);
                });
            })
            .fail(function () {
                console.log("Failed to load rooms.");
            });
    }

    // إضافة رسالة إلى قائمة الرسائل
    function addMessage(msg) {
        if (!msg) return;
        let ui = document.getElementById('messagesList');
        let li = document.createElement("li");
        li.innerHTML = msg;
        ui.appendChild(li);
    }

    // بدء الاتصال بـ SignalR
    connection.start()
        .then(() => {
            console.log("Connected to chat hub");
            fillRoomDropDown();
            fillUserDropDown();
        })
        .catch(err => console.error("Error connecting to chat hub:", err));
}
