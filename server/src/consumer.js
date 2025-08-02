import amqp from "amqplib";

const receiveMessages = async (queue) => {
  let connection;
  let channel;
  let currentMessage = null; // Track the current message being processed
  const RABBIT_HOST = process.env.RABBIT_HOST || "15.206.174.119";
  const RABBIT_PORT = process.env.RABBIT_PORT || 5672;
  const RABBIT_USER = process.env.RABBIT_USER || "corpvue1";
  const RABBIT_PASS = process.env.RABBIT_PASS || "DbjeM5a35naQXEq";
  const QUEUE_NAME = queue || "corpvue.gstrefresh_botrp";
  const RABBIT_URL = `amqp://${RABBIT_USER}:${RABBIT_PASS}@${RABBIT_HOST}:${RABBIT_PORT}`;

  // Graceful shutdown handler
  const shutdown = async () => {
    console.log("🛑 Starting graceful shutdown...");

    try {
      // Acknowledge the current message if exists
      if (channel && currentMessage) {
        console.log("🔁 Acknowledging current message before shutdown");
        await channel.ack(currentMessage);
        currentMessage = null;
      }

      if (channel) {
        console.log("Closing channel...");
        await channel.close();
      }

      if (connection) {
        console.log("Closing connection...");
        await connection.close();
      }

      console.log("✅ RabbitMQ connection closed gracefully");
      process.exit(0);
    } catch (shutdownError) {
      console.error("❌ Error during shutdown:", shutdownError);
      process.exit(1);
    }
  };

  try {
    // Establish connection
    console.log("🔗 Connecting to RabbitMQ...");
    connection = await amqp.connect(RABBIT_URL);
    console.log("✅ Connected to RabbitMQ");

    // Create channel
    channel = await connection.createChannel();
    console.log("✅ Channel created");

    // Assert queue exists
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log(`✅ Queue ${QUEUE_NAME} asserted (durable: true)`);

    // Limit prefetch to 1 message at a time
    await channel.prefetch(1);
    console.log("⏳ Prefetch set to 1 message");

    // Start consuming messages
    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (!msg) {
          console.warn("⚠️ Received null message");
          return;
        }

        currentMessage = msg; // Track the current message
        console.log(
          `📩 Received message (deliveryTag: ${msg.fields.deliveryTag})`
        );

        try {
          const data = JSON.parse(msg.content.toString());
          console.log("📦 Message content:", JSON.stringify(data, null, 2));
          const { st } = data;
          console.log("ℹ️ Processing message with status:", st);

          // Process your message here
          // Add your business logic

          // Acknowledge successful processing
          channel.ack(msg);
          currentMessage = null; // Clear current message
          console.log("✅ Message processed and acknowledged");
        } catch (err) {
          console.error("❌ Error processing message:", err.message);
          currentMessage = null; // Clear current message

          if (err instanceof SyntaxError) {
            console.error("❌ Invalid JSON message:", msg.content.toString());
            // Reject and don't requeue malformed messages
            channel.nack(msg, false, false);
          } else {
            // For processing errors, requeue the message
            console.error("🔄 Requeuing message due to processing error");
            channel.nack(msg, false, true);
          }
        }
      },
      { noAck: false } // Explicit manual acknowledgements
    );

    // Connection event handlers
    connection.on("error", (err) => {
      console.error("❌ Connection error:", err.message);
    });

    connection.on("close", () => {
      console.log("🔌 Connection closed");
      // Implement reconnection logic here if needed
    });

    // Handle process termination
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    console.log(`👂 Listening for messages on queue: ${QUEUE_NAME}`);
  } catch (error) {
    console.error("❌ Initialization error:", error);

    try {
      if (channel) await channel.close();
      if (connection) await connection.close();
    } catch (cleanupError) {
      console.error("❌ Cleanup error:", cleanupError);
    }

    // Implement retry logic here if needed
    process.exit(1);
  }
};

// Start consuming messages
receiveMessages("corpvue.gstrefresh_botrp").catch((err) => {
  console.error("❌ Fatal error in consumer:", err);
  process.exit(1);
});

 
