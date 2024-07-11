require("dotenv").config()

const express = require("express")
const app = express();

var PORT = process.env.PORT || 3000

// =========================== MONGODO STUFF: ===========================
const mongoose = require("mongoose");
var db_username = process.env.MONGODB_USERNAME;
var db_password = process.env.MONGODB_PASSWORD;
var db_address = process.env.MONGODB_SERVER;
var db_name = process.env.MONGODB_DATABASE;
var db_url = `mongodb+srv://${db_username}:${db_password}@${db_address}/${db_name}?retryWrites=true&w=majority`;

mongoose.connect(db_url, {
    useNewUrlParser: true,
    dbName: `${db_name}`,
    useUnifiedTopology: true,
  }
);

var mongodb_db = mongoose.connection;

mongodb_db.on("open", function (ref) {
  console.log("Connected to MongoDB Server: " + db_address);
});

mongodb_db.on("connecting", function (ref) {
  console.log("Connecting to MongoDB Server: " + db_address);
});

mongodb_db.on("disconnecting", function () {
  console.log("Disconnecting from MongoDB Server: " + db_address);
});

mongodb_db.on("disconnect", function () {
  console.log("Disconnected from MongoDB Server: " + db_address);
});

mongodb_db.on("reconnected", function () {
  console.log("Reconnected to MongoDB Server: " + db_address);
});

mongodb_db.on("error", function (err) {
  console.log("Unable to connect to MongoDB Server: " + db_address);
  console.log(err);
});


const wordpressSchema = new mongoose.Schema({
    timestamp: { type: Date, required: true, default: new Date().toLocaleString },
    ip: { type: String, required: true },
    username: { type: String, required: false },
    password: { type: String, required: false },
    body: { type: Object, required: true },
});

var wpLog = mongoose.model('wordpress-logs', wordpressSchema)


// ==========================================================================



app.set("view engine", "ejs");
app.use(express.static('public'));
app.enable("trust proxy");

app.all('*', (req, res, next) => {
  
  var IP = req.headers['cf-connecting-ip'] || req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
  var time = new Date().toLocaleString();
  var host = req.hostname;
  var UserAgent = req.get('User-Agent') || "No User Agent";
  var Path = req.url || "Unknown Path";
  var Method = req.method;
  var Referer = req.get('referer') || "No Referer";

  console.log(`[${time}] ${IP} - ${host} - ${Method} ${Path} - ${UserAgent} - ${Referer}`);
  
  next();
  
});

app.get("/", async (req, res) => {
  var logs = await wpLog.find({});
  return res.status(200).render(__dirname + "/views/index", { logs: logs })
})

app.get("/api/logs", async (req, res) => {
  var logs = await wpLog.find({});
  return res.status(200).json(logs)
})


app.listen(PORT, () => {
  console.log(`Web server is now listening on port ${PORT}`)
})