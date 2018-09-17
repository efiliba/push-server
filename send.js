const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://credit-savvy-push.firebaseio.com"
});

const tokensDbTable = admin.database().ref("/tokens");
const messaging = admin.messaging();

const message = token => ({
  token,
  data: {
    hello: "world 5"
  },
  notification: {
    title: "Notification title",
    body: "Notification body"
  },
  android: {
    ttl: 1000 * 60 * 60 * 1,                                        // 1 hour
    priority: "normal",
    notification: {
      title: "Android specific title",
      body: "Android specific heading",
      icon: "some_icon",
      color: "#f45342"
    }
  },
});

const sendMessage = token =>
  messaging.send(message(token));

// Sends messages when app open
const sendNotifications = async () => {
  try {
    const data = await tokensDbTable.once("value");

    const messagePromises = Object.entries(data.val())
      .map(([, value]) => sendMessage(value.token));

    const responses = await Promise.all(messagePromises);
    console.log('Successfully sent messages:', responses);
    process.exit(0);
  } catch(error) {
    console.log('Error:', error);
    process.exit(1);
  };
};

sendNotifications();
