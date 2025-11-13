const express= require('express')
const app= express()
const {Client}= require('pg')
const jwt= require('jsonwebtoken')
const cookieParser = require('cookie-parser');
const client= new Client({
    host:"localhost",
    user:"postgres",
    port:5432,
    password:"chetan",
    database:"moviesystem"
})
client.connect().then(console.log('connected'))


app.use(express.json())
app.use(cookieParser());
app.get("/",(req,res)=>{
    res.send("hello ")
})


app.post("/signup", async (req,res)=>{
   const data= req.body
   let username= data.username
   let password= data.password
   try{
      const query = "INSERT INTO users (username, password) VALUES ($1, $2)";
      await client.query(query, [username, password]);
      res.send("User registered successfully!");
   }
   catch(err){
    res.send(err)
   }
})


app.get('/signin', async(req,res)=>{
    let username= req.body.username
    let password= req.body.password

    if(!username || !password) res.send('please enter valid credentials')
    
    const query= "SELECT * FROM users WHERE username = $1"
    try{
        const result= await client.query(query,[username])
        if(result.rows[0].password==password){
            const token= jwt.sign({username:username},"chetan5734v")
            res.cookie("token",token)
            res.send('login sucessfull')
        }
        else{
           res.status(401).send("wrong password")
        }
    }
    catch(err){
        res.send(err)
    }
})

function verifytoken(req,res,next){
   const token= req.cookies.token;
   if(!token){
    res.send('access Denied')
   }
   try{
    console.log('came here')
   const data= jwt.verify(req.cookies.token,"chetan5734v")
   req.user=data
   next()
   }
   catch(err){
    res.send(err)
   }
   
}


app.post('/createshow',      async (req,res)=>{
  const   {movie_name, show_price,total_seats,showid} = req.body
  const query= 'insert into shows values ($1,$2,$3,$4)'
  await client.query(query,[movie_name,show_price,total_seats,showid])
  res.send("successfully created a show")
})
app.post('/bookshow',  verifytoken,    async (req,res)=>{
  const   {username,seats,showid} = req.body
 
  const query1= 'select total_seats from shows where showid=$1'
  const data= await client.query(query1,[showid])
  console.log(data.rows)
  if(parseInt(data.rows.total_seats) < parseInt(seats)){
    res.send('please try considering less seats for booking')
  }
  else{
    console.log("got in else")
    const query= 'insert into reservations values ($1,$2,$3)'
  await client.query(query,[showid,seats,username])
  console.log("reached1")
  const query2='update shows set total_seats= total_seats- $1 where showid=$2'
  await client.query(query2,[seats,showid])
  res.send("reserved a show")
  }

app.get('/getmyshows',(req,res)=>{
    
})
  

  
})

app.listen(8000,(req,res)=>{
    console.log("server running on port 8000")
})