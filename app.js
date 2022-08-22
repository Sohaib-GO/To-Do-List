const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));


main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/todolist");
}

// MOONGOOSE!!!!
const listsSchema = new mongoose.Schema({
  name: String,
});

// First Schema
const list0 = mongoose.model("list", listsSchema);

const firstList = new list0({ name: " welcome to the List!" });
const defultItems = [firstList];

// Second Schema

const listSchema = {
  name: String,
  items: [listsSchema],
};
const items = mongoose.model("List", listSchema);

// Get current date 

let today = new Date();
let currentDay = today.getDay();
let options = { weekday: "long", month: "long", day: "numeric" };
let day = today.toLocaleDateString("en-US", options);

// root route get

app.get("/", function (req, res) {

  
  list0.find({}, function (err, foundItems) {
   
  
  
    if (foundItems.length === 0) {

      list0.insertMany(defultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully saved defaults items to DB.");
        }
      });

      res.redirect("/");
    } else {
      res.render("list", { DayofTheWeek: day,
         newListItems: foundItems,
         });
    }
  });
});

// route parameters
app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  items.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new items({ name: customListName,
           items: defultItems,

          });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          DayofTheWeek: foundList.name,
          newListItems: foundList.items,

        });
      }
    }
  });
});

// root route post
app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new list0({ name: itemName });
  if (listName === day) {
    item.save();

    res.redirect("/");
  } else {
    items.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

// delete route

app.post("/delete", function (req, res) {
  const listName = (req.body.ListNameCust);
  const deleteCheckedId = (req.body.checkedItem);

  if (listName === day) {
    list0.findByIdAndRemove(deleteCheckedId, function (err) {
      console.log("item Deleted");
    });

    res.redirect("/");
  } else {
    items.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: deleteCheckedId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

// new list route
app.post("/newList", (req, res) => {
  const newListName = req.body.newListName;
  res.redirect("/" + newListName);
});




app.listen(3000, function () {
  console.log("server started on port 3000");
});
