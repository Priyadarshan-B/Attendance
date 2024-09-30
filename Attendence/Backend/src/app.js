const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const passport = require("passport");
const session = require("express-session");
const passportConfig = require("./config/passport");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { scheduleCronJobs } = require('./Controllers/cronJobs');
//routes
const routes = require('./Routes/routes');
const auth_route = require('./Routes/auth/auth_routes');
const resources_route = require('./Routes/auth/res_route');
// middleware
const authenticateGoogleJWT = require('./middleware/authenticate');
const limiter = require('./middleware/rateLimiter')
const RestrictOrigins = require('./middleware/restrictOrigins')

const morgan_config = morgan(
  ":method :url :status :res[content-length] - :response-time ms"
);

const app = express();
const port = process.env.PORT;

// session
app.use(
  session({
    secret: "this is my secrect code",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// cors
app.use(express.json());
const cors_config = {
    origin: "*",
};
app.use(cors(cors_config));
app.use(morgan_config);

// routes
app.use(RestrictOrigins)
app.use("/attendance/api/auth", resources_route);
app.use("/attendance/api/auth", auth_route);
app.use(limiter)
app.use(authenticateGoogleJWT)
app.use("/attendance/api", routes);

//cron jobs
scheduleCronJobs();

// listen port
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
