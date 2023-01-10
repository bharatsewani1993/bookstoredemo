const express = require("express");
let cors = require('cors');
const ENV = require('./env/index').envSettings();
const app = express();
const port = ENV.PORT;

console.log("ENV",ENV.STAGE);
//to allow cors access
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, X-Access-Token, XKey, Authorization, factory-id, authorization");
    next();
}); 

//importing database connection 
const database = require('./utils/database') 
 
//initiate body parser
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}

app.use(cors(corsOptions));

//import the routes
const userRoutes = require('./routers/userRouter');
const storeRoutes = require('./routers/storeRouter');


//using routes
app.use('/api/v1/user',userRoutes);
app.use('/api/v1/store',storeRoutes);

//automatic sync models to database.
database.sync(ENV.DB_ALTER).then(() => {      
    app.listen(port, () =>
    console.log(`Server started on port ${port}`)
);
}).catch(error => {
      console.log("I am in error part",error)
})