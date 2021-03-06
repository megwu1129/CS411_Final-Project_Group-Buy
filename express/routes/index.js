var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var cors = require('cors')
var app = express()
var mysql = require('mysql2');

const conn = mysql.createConnection({
  host: '34.123.145.94',
  user: 'ken',
  password: '123',
  database: 'db1'
});

conn.connect();

app.use(cors());
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

/* GET home page. */
app.get('/', (req, res) => {
  res.send("Demo Website for GroupBuy Application");
});

app.listen(3001, () => {
  console.log('Server started on port 3001...');
});

app.post('/post/insert', (req, res) => {

  const userId = req.body.userId
  const expirationDate = req.body.expirationDate
  const groupLimit = req.body.groupLimit
  const paymentMethod = req.body.paymentMethod
  const categoryId = req.body.categoryId
  const productName = req.body.productName
  const storeName = req.body.storeName
  const price = req.body.price
  const link = req.body.link

  let sqlInsert = 'INSERT INTO Post (userId, expirationDate, groupLimit, paymentMethod, categoryId) VALUE(?,?,?,?,?);';
  conn.query(sqlInsert, [userId, expirationDate, groupLimit, paymentMethod, categoryId], (err, result) => {
    console.log(err);
  })

  let sqlGetPostId = 'SELECT postId FROM Post WHERE userId = ' + userId + ' ORDER BY postId DESC LIMIT 1;';
  conn.query(sqlGetPostId, (err, result) => {
    let postIdRes = result;
    // console.log('----------------------------')
    // console.log(postIdRes);
    let sqlInsertProduct = "INSERT INTO Product (productName, storeName, price, link, postId) VALUE(?,?,?,?," + postIdRes[0].postId + ");";
    conn.query(sqlInsertProduct, [productName, storeName, price, link], (err, result) => {
      console.log(err);
    })
  })
});

app.post('/post/update', (req, res) => {
  const postId = req.body.postId
  const expirationDate = req.body.expirationDate
  const groupLimit = req.body.groupLimit
  const paymentMethod = req.body.paymentMethod
  const userId = req.body.userId

  let sqlUpdatePost = 'UPDATE Post SET expirationDate = ?, groupLimit = ?, paymentMethod = ? WHERE postId = ? AND userId = ?';
  conn.query(sqlUpdatePost, [expirationDate, groupLimit, paymentMethod, postId, userId], (err, result) => {
    console.log(err);
  })
});


app.get('/post/read', (req, res) => {
  let sqlquery = 'SELECT * FROM Post NATURAL JOIN Product LIMIT 10';
  conn.query(sqlquery, (err, result) => {
    res.send(result);
  })
});

app.post('/post/search', (req, res) => {
  const productName = req.body.productName
  let pn = '%' + productName + '%'
  let sqlSearch = "SELECT * FROM Post NATURAL JOIN Product WHERE productName LIKE '" + pn + "' order by productName LIMIT 10";
  conn.query(sqlSearch, (err, result) => {
    console.log('result:', result)
    res.send(result);
  })
});

app.post('/post/search-user', (req, res) => {
  const userName = req.body.userName
  let pn = '%' + userName + '%'
  let sqlSearch = "SELECT * FROM User JOIN Post USING (userId) JOIN Product USING (postId) WHERE userName LIKE '" + pn + "' ORDER BY postId";
  conn.query(sqlSearch, (err, result) => {
    console.log('result:', result)
    res.send(result);
  })
});

// adv query
app.post('/post/advsearch1', (req, res) => {
  console.log('adv search')
  let sqlSearch = "SELECT userId, userName, COUNT(postId) as numOfPost\
                   FROM User JOIN Post USING (userId)\
                   WHERE expirationDate < ('2022-01-01') AND userName LIKE '%en%'\
                   GROUP BY userId order by numOfPost desc LIMIT 15;";
  conn.query(sqlSearch, (err, result) => {
    // console.log(result)
    res.send(result);
  })
});

app.post('/post/advsearch2', (req, res) => {
  console.log('adv search')
  let sqlSearch = "(SELECT c.categoryId, c.categoryName, COUNT(postId) as NumberOfPost\
                    FROM Post p NATURAL JOIN Category c\
                    WHERE p.userId > 800 and c.categoryName='Meat'\
                    GROUP BY c.categoryId)\
                    UNION\
                    (SELECT c.categoryId, c.categoryName, COUNT(postId) as NumberOfPost\
                    FROM Post p NATURAL JOIN Category c\
                    WHERE p.userId < 200 AND  c.categoryName='Bakery'\
                    GROUP BY c.categoryId );";
  conn.query(sqlSearch, (err, result) => {
    // console.log(result)
    res.send(result);
  })

});

app.delete('/post/delete/:id', (req, res) => {
  const deleteId = req.params.id
  let sqlDeletePost = "DELETE FROM Post WHERE postId = ?";
  let sqlDeleteProduct = "DELETE FROM Product WHERE postId = ?";
  conn.query(sqlDeletePost, deleteId, (err, result) => {
    if (err) console.log(err)
  })
  conn.query(sqlDeleteProduct, deleteId, (err, result) => {
    if (err) console.log(err)
  })
});

module.exports = router;
