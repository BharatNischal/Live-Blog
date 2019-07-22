var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var userSchema=new mongoose.Schema({
    username:String,
    password:String,
    authorURL:{
      type:String,
      default: 'https://c8.alamy.com/comp/HBFR2F/male-profile-avatar-with-brown-hair-over-white-background-vector-illustration-HBFR2F.jpg'
    },
    name:String,
    following:[
      {type: String}
    ],
    followers:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
      }
    ],
    bookmarks:[
      {type:String}
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date
});
userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",userSchema);
