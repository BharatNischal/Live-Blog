const mongoose=require("mongoose");
const User = require('./user');

var blogSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    content:String,
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:User
    },
        username:String,
        name:String,
        authorURL:String
    },
    imageURL:{
        type:String
    },
    created_date:{
        type:Date,
        default:Date.now()
    },
    isLive:{
        type:Boolean,
        default:false
    },
    genre:{
      type:String,
      default:"other"
    },
    likes:[
      {
        type:String
      }
    ],
    bookmarks:[
      {
        type:String
      }
    ],
    comments:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:'comment'
      }
    ]
});

module.exports=mongoose.model("blog",blogSchema);
