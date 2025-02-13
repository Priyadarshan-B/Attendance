const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const session = require("express-session");
const passport = require("./config/passport");
const hpp = require("hpp");
const helmet = require("helmet")
const xss = require("xss-clean");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { scheduleCronJobs } = require('./Controllers/cronJobs');
const routes = require('./Routes/routes');
const auth_route = require('./Routes/auth/auth_routes');
const resources_route = require('./Routes/auth/res_route');
const authenticateGoogleJWT = require('./middleware/authenticate');
const limiter = require('./middleware/rateLimiter')
const RestrictOrigins = require('./middleware/restrictOrigins')

// morgan
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
scheduleCronJobs();

app.use(RestrictOrigins)
app.use(hpp());
app.use(helmet());
app.use(xss());
app.use("/attendance/api/auth", resources_route);
app.use("/attendance/api/auth", auth_route);
app.use(limiter);
app.use(authenticateGoogleJWT);
app.use("/attendance/api", routes);


// listen port
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
