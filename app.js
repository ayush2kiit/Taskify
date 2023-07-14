///jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));
var day;
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const itemsSchema = {
    name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "welcoe "
});

const item2 = new Item({
    name: "fk "
});


const item3 = new Item({
    name: "you "
});


const defaultItems = [item1, item2, item3];



const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);




app.get("/", function (req, res) {
    Item.find({}).then(function (foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems)
                .then(function () {
                    console.log("Successfully saved defult items to DB");
                })
                .catch(function (err) {
                    console.log(err);
                });


            //res.render("list",{listTitle:"Today",newListItem:foundItems});
            res.redirect("/");

        }

        else {
            res.render("list", { listTitle: "Today", newListItem: foundItems });
        }
    })





});


app.post("/", async (req, res) => {
    try {
        const itemName = req.body.newItem;
        const listName = req.body.list;
        const item = new Item({
            name: itemName
        });

        if (listName === "Today") {
            await item.save();
            res.redirect("/");
        } else {
            const foundList = await List.findOne({ name: listName });
            foundList.items.push(item);
            await foundList.save();
            res.redirect("/" + listName);
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(500); // Sending an error status code (e.g., 500) if an error occurs
    }
});


app.post("/delete", async function (req, res) {

    try {
        const checkedItemId = req.body.checkbox;
        const listName = req.body.listName;

        if (listName === "Today") {

            await Item.findByIdAndRemove(checkedItemId);
            console.log(checkedItemId);
            res.redirect("/");

        }

        else {

            // List.findOneAndUpdate({ name: listName }, { $pull: { item: { _id: checkedItemId } } }, function (err, foundList) {
            //     if (!err) {
            //         res.redirect("/" + listName);
            //     }
            // });



            try {
                const foundList = await List.findOneAndUpdate(
                    { name: listName },
                    { $pull: { items: { _id: checkedItemId } } }
                );
                if (foundList) {
                    res.redirect("/" + listName);
                } else {
                    // Handle case where the list is not found
                    res.sendStatus(404);
                }
            } catch (error) {
                console.error(error);
                res.sendStatus(500); // Sending an error status code (e.g., 500) if an error occurs
            }









        }


    }

    catch (err) {
        console.log(err);
        res.sendStatus(500);
    }


});







app.get("/:customListName", async (req, res) => {
    try {
        const customListName = req.params.customListName;

        const foundList = await List.findOne({ name: customListName });

        if (!foundList) {
            const list = new List({
                name: customListName,
                items: defaultItems
            });

            await list.save();
            res.redirect("/" + customListName);
        } else {
            res.render("list", { listTitle: foundList.name, newListItem: foundList.items });
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(500); // Sending an error status code (e.g., 500) if an error occurs
    }
});






app.listen(3000, function () {
    console.log("server started in port 3000");
});