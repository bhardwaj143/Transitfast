import express from "express";
import { createServer } from "http";
import { privateKey } from "../../config/privateKeys.js";
import morgan from "morgan";
import { Server } from "socket.io";
import cors from "cors";
import { Socket } from "../../services/index.js";

const PORT = Number(privateKey.PORT) || 4000;

const appLoader = async (app, router) =>
  new Promise((resolve) => {
    const server = createServer(app);
    app.use(express.json());
    app.use("/uploads/", express.static("uploads/"));
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan("dev"));
    app.use(cors());
    app.use("/api/v1/", router);
    server.listen(PORT, () => {
      console.log(`App is running on port: ${PORT}`);
    });
    const io = new Server(server, {
      cors: {
        origin: "*",
      },
    });
    Socket(io);
    resolve();
  });

export { appLoader };
