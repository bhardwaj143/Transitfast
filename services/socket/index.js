import mongoose from 'mongoose';
import moment from 'moment';

export const Socket = (io) => {
    let currentUserId = '';
    let connectedTrainers = [];
    io.on('connection', async socket => {
        socket.on('user_connected', async ({ userId, role }, ack) => {
            try {
                currentUserId = userId;
                if (role === 'Trainer') {
                    connectedTrainers.push({ userId, isConnected: false });
                }
                socket.join(userId);
            } catch (error) {
                console.log(error)
            }

        });

        socket.on('disconnect', async () => {
            connectedTrainers = connectedTrainers.filter(item => {
                return item.userId == currentUserId
            });
            socket.leave(currentUserId);
        });

        socket.on('user_disconnected', () => {
            connectedTrainers = connectedTrainers.filter(item => {
                return item.userId != currentUserId
            });
            socket.leave(currentUserId);
        });

        socket.on('send_notification', async (notificationprops) => {
            try {
                let eventProps = {
                    senderId: mongoose.Types.ObjectId(notificationprops.userId),
                    eventDate: moment(Date.now()).format("DD/MM/YYYY"),
                    eventTime: moment(Date.now()).format("hh:mm A")
                };
                if (connectedTrainers.length > 0) {
                    let item = Math.floor((Math.random() * connectedTrainers.length));
                    eventProps.trainerId = [
                        {
                            userId: mongoose.Types.ObjectId(connectedTrainers[item].userId),
                            status: 'Pending'
                        }
                    ];
                    let newEvent = await addEvent(eventProps);
                    notificationprops.eventId = newEvent._id;
                    connectedTrainers[item].isConnected = true;
                    socket.broadcast.to(connectedTrainers[item].userId).emit("receive_notification", notificationprops);
                }
                else {
                    let newEvent = await addEvent(eventProps);
                    notificationprops.eventId = newEvent._id;
                    notificationprops.isTrainerAvailable = false;
                    io.to(notificationprops.userId).emit("receive_notification", notificationprops);
                }

            } catch (error) {
                console.log(error)
            }
        });

        socket.on('request_confirmation_status', async (notificationprops) => {
            try {
                let eventDetail = await findEventDetail({ _id: notificationprops.eventId });
                let eventFilter = eventDetail.trainerId?.length > 0 ? eventDetail.trainerId.findIndex(item => item.userId == notificationprops.currentTrainerId) : '';
                eventDetail.trainerId[eventFilter].status = notificationprops.status;
                let updatedEvent = await updateEvent(eventDetail, { _id: notificationprops.eventId });
                let userDetail = await findUserDetail({ _id: mongoose.Types.ObjectId(notificationprops.currentTrainerId) });
                socket.broadcast.to(eventDetail.senderId.toHexString()).emit("request_status", {
                    ...updatedEvent?._doc,
                    status: notificationprops.status,
                    name: userDetail?.name || ''
                });
            } catch (error) {
                console.log(error)
            }
        });

        socket.on("resend_notification", async (notificationprops) => {
            try {
                let eventDetail = await findEventDetail({ _id: notificationprops.eventId });
                let remainingTrainers = connectedTrainers.filter((item) => item.isConnected === false);
                if (remainingTrainers.length > 0) {
                    let item = Math.floor((Math.random() * remainingTrainers.length));
                    let updateStatus = connectedTrainers.findIndex(function (val) {
                        return val.userId === remainingTrainers[item].userId
                    });
                    eventDetail.trainerId.push({ userId: remainingTrainers[item].userId, status: 'Pending' });
                    let updatedEvent = await updateEvent(eventDetail, { _id: notificationprops.eventId });
                    updatedEvent.eventId = notificationprops.eventId;
                    connectedTrainers[updateStatus].isConnected = true;
                    socket.broadcast.to(remainingTrainers[item].userId).emit("receive_notification", { ...updatedEvent._doc, eventId: notificationprops.eventId });
                }
                else {
                    notificationprops.isTrainerAvailable = false;
                    io.to(eventDetail.senderId.toHexString()).emit("receive_notification", notificationprops);
                }

            } catch (error) {
                console.log(error)

            }

        });

    });
};
