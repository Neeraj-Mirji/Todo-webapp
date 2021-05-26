const express  =require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require("lodash");




const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static('public'));
app.set('view engine' , 'ejs');

//
mongoose.connect('mongodb+srv://Admin:Admin@cluster0.xejft.mongodb.net/todoDb' , {useNewUrlParser: true, useUnifiedTopology: true});


const itemSchema = new mongoose.Schema({
  name : String
});

const Item = mongoose.model('item' , itemSchema);



const defaultItems  = [];

const listSchema = new mongoose.Schema({
  name : String,
  items : [itemSchema]
});

const List = mongoose.model('List' , listSchema);


app.get('/' , function(req , res)
{
  Item.find(function(err , items)
  {
     res.render('list' , {listTitle : "Today" , Items : items });
  });
});


app.get('/:paramName' , function(req,res)
{
  const requestedRoute = _.capitalize(req.params.paramName);

  List.findOne({name : requestedRoute} , function(err , listItem)
{
  if(!err)
  {
    if(!listItem)
    {

        const list = new List({
          name : requestedRoute,
          items : defaultItems
        });

        list.save();
          res.render('list' , {listTitle : list.name , Items : list.items});
    }
    else
    {
      res.render('list' , {listTitle : listItem.name , Items : listItem.items});
    }
  }
  else{
    console.log(err);
  }
});

});



app.post('/' , function(req , res)
{
  const customListName = req.body.button;
  const todoItem = req.body.newToDO;

  const item = new Item({
      name : todoItem
    });

  if(customListName === "Today")
  {
    item.save();
    res.redirect('/');
  }
  else{
    List.findOne({name : customListName} , function(err , listItem)
  {
    listItem.items.push(item);
    listItem.save();
    res.redirect('/'+customListName);
    });
  }

});

app.post('/delete' , function(req , res)
{
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today")
  {
    Item.findByIdAndRemove({_id : itemId} , function(err)
  {
    if(!err)   res.redirect('/');
  });

  }
  else
  {
    List.findOneAndUpdate({name : listName} , {$pull : {items : {_id : itemId}}} , function(err , listItem)
  {
    if(!err) res.redirect('/' + listName);
  });

  }

});




// app.get('/work' , function(req , res)
// {
//   res.render('list' , {listTitle : "Work" , Items : workItems });
// });
//
app.get('/about' , function(req , res)
{
  res.render('about');
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}



app.listen(3000 , function()
{
  console.log("server running at port 3000");
})
