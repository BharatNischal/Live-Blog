const          express = require('express'),
              passport = require("passport"),
         localStrategy = require("passport-local"),
 passportLocalMongoose = require("passport-local-mongoose"),
            BlogRoutes = require("./routes/blog.js"),
                    db = require("./models/index"),
              session = require("express-session"),
            bodyParser = require("body-parser"),
                  cors = require("cors"),
                socket = require('socket.io'),
                   app = express(),
                 async = require("async"),
                crypto = require("crypto"),
                multer = require("multer"),
          mailFunction = require("./mail"),
                path   = require("path");


//Express session
app.use(session({
  secret:"Dogs are cute",
  resave:false,
  saveUninitialized:false
}));

//passport Auth setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(db.User.authenticate()));
passport.serializeUser(db.User.serializeUser());
passport.deserializeUser(db.User.deserializeUser());

//To remove the Access-Control-Allow-Origin error

// app.use((req,res,next)=>{
//   res.header("Access-Control-Allow-Origin","*");
//   res.header("Access-Control-Allow-Headers","Origin,X-Requested-With,Content-Type,Accept");
//   next();
// });


app.use(cors({
  origin:['http://localhost:3000'],
  methods:['GET','POST','PUT','DELETE'],
  credentials: true // enable set cookie
}));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//middleware to log curUser
app.use((req,res,next)=>{
  console.log(req.user);
  next();
});


app.use("/blog-api/",BlogRoutes);
app.get("/api/curUser",(req,res)=>{
  res.json(req.user);
});

//Muler upload

const storage = multer.diskStorage({
   filename: function(req, file, cb){
      cb(null,"IMAGE-" + Date.now() + path.extname(file.originalname));
   }
});
const upload = multer({
   storage: storage,
   limits:{fileSize: 10000000000}
}).single("image");

//auth routes

var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'bharatnischal',
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});


app.post("/api/register",upload,(req,res)=>{
  console.log("file recieved",req.file,"body",req.body);
  if(req.file){
    cloudinary.uploader.upload(req.file.path, (result)=> {
      db.User.register(new db.User({username:req.body.username,name:req.body.name,authorURL:result.secure_url}),req.body.password,(err,user)=>{
          if(err){
              console.log(err);
              res.json({err:err.message,success:"false"});
          }
          passport.authenticate("local")(req,res,()=>{
              res.json({
                  success:"true",
                  user:req.user,
              });
          });
      });
    });
  }else{
    db.User.register(new db.User({username:req.body.username,name:req.body.name}),req.body.password,(err,user)=>{
      if(err){
          console.log(err);
          res.json({err:err.message,success:"false"});
      }
      passport.authenticate("local")(req,res,()=>{
          res.json({
              success:"true",
              user:req.user,
          });
      });
    });

  }
  
});

app.get("/api/logout",(req,res)=>{
  req.logout();
  res.json({msg:"You log out successfully!!!"});
});

app.post("/api/login",passport.authenticate("local",{
      failureRedirect:"/api/err"
  }),(req,res)=>{
      res.json({
        success:"true",
        msg:"You logged in successfully with username "+req.user.username,
        user:req.user
      });
});

// forgot password
app.post('/api/forget', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      db.User.findOne({ username: req.body.username }, function(err, user) {
        if (!user) {
          res.json({msg:"No account with that email address exists."});
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var fullUrl = req.protocol + '://' + req.get('host') ;
      const msg = {
        from: '"Live Blog " <manjotsingh16july@gmail.com>', // sender address (who sends)
        to: user.username, // list of receivers (who receives)
        subject: 'Live_Blog Password Reset', // Subject line
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                Please click on the following link, or paste this into your browser to complete the process:\n\n ${fullUrl}/reset/${token} \n\n
                If you did not request this, please ignore this email and your password will remain unchanged.\n`     
      };
      
      mailFunction(msg,(err,info)=>{
        done(err,'done');
      });
      
    }
  ], function(err) {
    if (err)     res.json({msg:err.message});
    res.json({msg:""});
  });
});

app.post('/api/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      db.User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          return res.json({msg:'Password reset token is invalid or has expired.'});
        }
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
      });
    },
    function(user, done) {
      const msg = {
        from: '"Live Blog " <manjotsingh16july@gmail.com>', // sender address (who sends)
        to: user.username, // list of receivers (who receives)
        subject: 'Your password has been changed', // Subject line
        text: `This is a confirmation that the password for your account ${user.username} has just been changed. `     
      };
      mailFunction(msg,(err,info)=>{
        done(err,'done');
      });
      
    }
  ], function(err) {
    if(err){return res.json({msg:err});}
    res.json({msg:`Success! Your password for username has been changed.`});
  });
});




app.get("/api/err",(req,res)=>{
  res.json({success:"false"});
});

if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(__dirname+'/../client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..' , 'client', 'build', 'index.html'));
  });
}


const port=process.env.PORT || 5000;
var server=app.listen( port,()=>{
    console.log("app running on: " + port);
});

function sendMailToFollowers(authorID,blogID){
  db.User.findById(authorID)
  .populate('followers')
  .then(foundAuthor=>{
    const followerArr=foundAuthor.followers.map(follower=>follower.username);
    console.log(followerArr);
    if(followerArr.length!==0){

      const mailOptions = {
        from: '"Live Blog " <manjotsingh16july@gmail.com>', // sender address (who sends)
        to: followerArr.join(", "), // list of receivers (who receives)
        subject: `${foundAuthor.name} came Live Right Now!!!!`, // Subject line
        text: `${foundAuthor.name} is writing his/her blog live to read his live blog open https://blooming-peak-39402.herokuapp.com/blog/${blogID} `     
      };
      mailFunction(mailOptions);
    }
  })
}

var io = socket(server);
io.on('connection', (socket) => {


    console.log('made socket connection', socket.request.headers.referer);

    var chkurl=socket.request.headers.referer.split("/");
    chkurl.splice(chkurl.length-2,1);
    chkurl=chkurl.join("/");
    console.log(chkurl);

    if(chkurl==="http://localhost:5000/blog/edit" || chkurl==="https://blooming-peak-39402.herokuapp.com/blog/edit"){
      console.log("here!!!");
      const url=socket.request.headers.referer.split("/");
      const blogId=url[url.length-2];
      db.Blog.findByIdAndUpdate(blogId,{isLive:true},{new:true})
      .then((updatedBlog)=>{
        sendMailToFollowers(updatedBlog.author.id,blogId);
        console.log("socket Update: ",updatedBlog);
      })
      .catch((err)=>{
        console.log(err);
      });
    }
    // Handle chat event
    socket.on('update_blog', function(data){
        console.log('socket data',data);
        // db.Blog.findById(data.blogId)
        //   .then(blog=>{
        //     blog.content = data.content;
        //     blog.save();
            socket.broadcast.emit('updateContent', data);
          // })
    });

    socket.on('disconnect',function(){
      if(chkurl==="http://localhost:5000/blog/edit" || chkurl==="https://blooming-peak-39402.herokuapp.com/blog/edit"){
      console.log("here!!!");
      const url=socket.request.headers.referer.split("/");
      const blogId=url[url.length-2];
      db.Blog.findByIdAndUpdate(blogId,{isLive:false},{new:true})
      .then((updatedBlog)=>{
        console.log("socket Update: ",updatedBlog);
      })
      .catch((err)=>{
        console.log(err);
      });
    }
      console.log("user disconnecting..");
    })
});
