import amqplib from "amqplib";

const sendMessage = async (queue, message) => {
  // RabbitMQ connection details
  const RABBIT_HOST = process.env.RABBIT_HOST || "15.206.174.119";
  const RABBIT_PORT = process.env.RABBIT_PORT || 5672;
  const RABBIT_USER = process.env.RABBIT_USER || "corpvue1";
  const RABBIT_PASS = process.env.RABBIT_PASS || "DbjeM5a35naQXEq";
  const QUEUE_NAME = "corpvue.gstrefresh_bot";

  // RabbitMQ connection URL
  const RABBIT_URL = `amqp://${RABBIT_USER}:${RABBIT_PASS}@${RABBIT_HOST}:${RABBIT_PORT}`;

  const connection = await amqplib.connect(RABBIT_URL);
  const channel = connection.createChannel();

  (await channel).assertQueue(QUEUE_NAME, { durable: true });
  const messageString = JSON.stringify(message);
  (await channel).sendToQueue(queue, Buffer.from(messageString), {
    persistent: true,
  });
  console.log("message sent");
  setTimeout(() => connection.close(), 100);
};

const currentDate = new Date(Date.now());
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const date = {
  year: currentDate.getFullYear(),
  month: currentDate.getMonth() + 1,
  date: currentDate.getDate(),
  day: daysOfWeek[currentDate.getDay()],
  hours: currentDate.getHours(),
  minutes: currentDate.getMinutes(),
  seconds: currentDate.getSeconds(),
};

let count = 0;
sendMessage(
  "corpvue.gstrefresh_bot",

 {
   requestId: '6864e3c74d8cdcde89192b18',
  pan: 'AASFR9593F',
  date
}
);












 
  
 


 

