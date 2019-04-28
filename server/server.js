let grpc = require("grpc");
let protoLoader = require("@grpc/proto-loader");

const server = new grpc.Server();
const SERVER_ADDRESS = "0.0.0.0:2019";

// Load protobuf
let proto = grpc.loadPackageDefinition(
    protoLoader.loadSync("../proto/chat.proto", {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    })
);

// create an empty array to store the users.
let users = [];

// Method implementation of RPC join
let join = (call) => {
    users.push(call);
    // Get the data from request.
    call.on('data', (message) =>{
        // send join notification
        sendNotification({ user: message.user, text: message.text });
    })
}

// Send message to all connected clients
 let sendNotification =(message) => {
    // for each user write messages.
    users.forEach(user => {
        user.write(message);
    });
}
// Add the implemented methods to the service.
server.addService(proto.chatGroup.Chat.service, { join: join });

server.bind(SERVER_ADDRESS, grpc.ServerCredentials.createInsecure());

server.start();
