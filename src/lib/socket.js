import { io } from "socket.io-client";
import { ENV } from "@/config/env";

const socket = io(ENV.API_URL, {
    autoConnect: false,
});

export default socket;