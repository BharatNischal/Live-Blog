const mongoose=require("mongoose");
mongoose.set("debug",true);
mongoose.Promise=Promise;
console.log(process.env.DATABASEURL);
const databaseURL=process.env.DATABASEURL||"mongodb://localhost/liveBlog";
console.log(databaseURL);
mongoose.connect(databaseURL,{
    useNewUrlParser:true
})
.then(() => console.log(`Database connected`))
.catch(err => console.log(`Database connection error: ${err.message}`));


module.exports.Blog=require("./blog.js");
module.exports.User=require("./user");
module.exports.Comment=require("./comment");
