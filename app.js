//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const app = express();
const _=require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-shivam:9971sgt325@cluster0-0wo0b.mongodb.net/toDoListDB",
{useNewUrlParser: true});

const itemsSchema={
  name: String
};

const Item= mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to to do list"
});
const item2=new Item({
  name:"Welcome to to do list2"
});
const item3=new Item({
  name:"Welcome to to do list3"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
}

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,results){
    if(results.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){console.log("error");}
        else{console.log("Succesfully added to collection");}
      });
    }
    res.render("list", {listTitle: "Today", newListItems: results});
  });
});

app.get("/:customRoute",function(req,res){
  const routeName=_.capitalize(req.params.customRoute);
  List.findOne({name:routeName},function(err,foundList){
    if(!err){if(!foundList){
      const defaultList= new List({
      name:routeName,
      items:defaultItems
    });
    defaultList.save();
    res.redirect("/"+routeName);
    }
  else{
    res.render("list", {listTitle:routeName, newListItems: foundList.items});
  }}});
});

app.post("/", function(req, res){
  const itemName=req.body.newItem;
  const listName=req.body.list;
  const itemNew=new Item({
    name:itemName
  });
if(listName==="Today"){
  itemNew.save();
  res.redirect("/");
} else {
  List.findOne({name:listName},function(err,foundList){
      foundList.items.push(itemNew);
      foundList.save();
      res.redirect("/"+listName);
  });
}

});


app.post("/delete",function(req,res){
    const checkedid=req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="Today"){
            Item.findByIdAndRemove(checkedid,function(err){
            if(err){console.log("error");}
            else{console.log("deleted checked item");
          res.redirect("/");}
        });
    } else{
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedid}}},
        function(err,foundList){
          if(!err){
            res.redirect("/"+listName);
          }
      });
    }
});



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port== null|| port== ""){
  port =3000;
}


app.listen(port, function() {
  console.log("Server started");
});
