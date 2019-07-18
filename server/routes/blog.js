const express= require('express');
const mongoose = require("mongoose");
const router=express.Router();
const db=require("../models/index");

router.get("/",(req,res)=>{
    // code to display all blogs
    db.Blog.find()
    .then((blogs)=>{

        res.json(blogs.reverse());
    })
    .catch((err)=>{
        console.log(err);
        res.json(err);
    })

    // res.json({msg:"here will be all list of blogs!!!"});
});

router.get("/mystories",(req,res)=>{
  if(!req.user){
    res.json({msg:"sign in required"});
  }
  db.Blog.find({"author.username":req.user.username})
    .then(blogs=>{
      res.send(blogs.reverse());
    })
    .catch(err=>{
      console.log(err);
      res.json({err:err.message});
    });
});

router.get("/following",(req,res)=>{
  if(!req.user){
    res.json({msg:"sign in required"});
  }
  console.log("following",req.user.following);
  db.Blog.find({"author.id": {$in: req.user.following}})
    .then(blogs=>{
      res.json(blogs.reverse())
    })
    .catch(err=>{
      console.log(err.message);
      res.json({msg:"err.message"})
    })
})

router.get("/bookmarks",(req,res)=>{
  if(!req.user){
    res.json({msg:"sign in required"});
  }
  var obj_ids = req.user.bookmarks.map(function(id) { return mongoose.Types.ObjectId(id); });
  db.Blog.find({_id: {$in: obj_ids}})
    .then(blogs=>{
      res.json(blogs.reverse())
    })
    .catch(err=>{
      console.log(err.message);
      res.json({msg:"err.message"})
    });
});

router.post('/search',(req,res)=>{
  var title = req.body.titleSearch;
  const regex = new RegExp(escapeRegex(title), 'gi');
        db.Blog.find({title: regex})
           .then(blogs=>{
             console.log(blogs);
             res.json(blogs.reverse());
           })
           .catch((err)=>{
               console.log(err);
               res.json(err);
           });
});

router.post('/search/genre',(req,res)=>{
  var genre = req.body.genre;
        db.Blog.find({genre})
           .then(blogs=>{
             console.log(blogs);
             res.json(blogs.reverse());
           })
           .catch((err)=>{
               console.log(err);
               res.json(err);
           });
});

router.post("/",(req,res)=>{
    // code to add new blog
   var formData = req.body;
   console.log("data reached is ",formData.data);
   var author = {
       id:req.user._id,
       username:req.user.username,
       name:req.user.name,
       authorURL:req.user.authorURL
   };
   console.log(author);
   formData.data.author = author;
    db.Blog.create(formData.data)
    .then((createdBlog)=>{
        res.json(createdBlog);
    }).catch((err)=>{
        console.log(err);
        res.json(err);
    });

});

router.get("/:id",(req,res)=>{
    // code to show one blog
    let a={};

    db.Blog.findById(req.params.id)
    .populate({
      path : 'comments',
      populate : {
        path : 'author'
      }
    })
    .then((foundBlog)=>{
        a=JSON.parse(JSON.stringify(foundBlog));
        a.curUser=req.user;
        console.log(foundBlog);

        res.json(a);
    }).catch((err)=>{
        console.log(err);
        res.status(404).json(err);
    });

});

router.put("/:id",(req,res)=>{
    //logic to update blog
    console.log("updating blog");
    db.Blog.findByIdAndUpdate(req.params.id,req.body,{new:true})
    .then((updatedBlog)=>{
        res.json(updatedBlog);
    }).catch((err)=>{
        console.log(err);
        res.status(404).json(err);
    });

});

router.delete("/:id",(req,res)=>{
    //logic to delete blog
    db.Blog.findByIdAndRemove(req.params.id)
    .then(()=>{
        res.json({msg:"deleted Successfully"});
    }).catch((err)=>{
        console.log(err);
        res.json(err);
    });

});

router.post("/:id/likes",(req,res)=>{
  if(!req.user){
    res.json({msg:"please sign in"});
  }
  db.Blog.findById(req.params.id)
  .then(blog=>{
    if(req.body.add){
      if(blog.likes.includes(req.user._id)){
        res.json({msg:"already liked"});
      }else{
        blog.likes.push(req.user._id);
        blog.save();
        console.log("no of likes:",blog.likes);
        res.json({msg:"liked"});
      }
    }else{
      var x = blog.likes.indexOf(req.user._id);
      if(x>-1){
        blog.likes.splice(x, 1);
        blog.save();
        res.json({msg:"removed from likes"});
      }else{
        res.json({msg:"you have not liked it"});
      }
    }
  })
  .catch(err=>{
    console.log(err);
    res.json(err);
  })
});

router.post("/:id/bookmark",(req,res)=>{
  if(!req.user){
    res.json({msg:"log in please"});
  }
  db.Blog.findById(req.params.id)
    .then(blog=>{
      if(req.body.add){
        if(blog.bookmarks.includes(req.user._id)){
          res.json({msg:"already liked"});
        }else{
          blog.bookmarks.push(req.user._id);
          blog.save();
          req.user.bookmarks.push(req.params.id);
          req.user.save();
          console.log("no of bookmarks:",blog.bookmarks);
          res.json({msg:"bookmarked"});
        }
      }else{
        var x = blog.bookmarks.indexOf(req.user._id);
        if(x>-1){
          blog.bookmarks.splice(x, 1);
          blog.save();
          req.user.bookmarks.splice(req.user.bookmarks.indexOf(req.params.id),1);
          req.user.save();
          res.json({msg:"removed from likes"});
        }else{
          res.json({msg:"you have not liked it"});
        }
      }
    })
});
router.post("/:id/comments",(req,res)=>{
  db.Blog.findById(req.params.id)
  .then(blog=>{

    db.Comment.create(req.body.data)
    .then(comm=>{
      comm.author=req.user._id;
      comm.save();
      blog.comments.push(comm);
      blog.save();
      comm.populate('author',(err,comment)=>{
        res.json(comment);
      })

    })
    .catch(err=>{
      console.log(err);
    })
  })
  .catch(err=>{
    console.log(err);
  })
})

router.post("/:userId/follow",(req,res)=>{
  if(!req.user){
    res.json({msg:"please sign in"});
  }
  if(req.body.add){
    req.user.following.push(req.params.userId);
    req.user.save();
    res.json({msg:"started following "+req.params.userId});
  }else{
    console.log("unfollow");
    req.user.following.splice(req.user.following.indexOf(req.params.userId),1);
    req.user.save();
    res.json({msg:"unfollowed"});
  }
})


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
module.exports=router;
