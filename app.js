const express=require("express");
const bodyparse=require("body-parser");
const mysql=require("mysql");
const multer=require("multer");
const app=express();
const encoded=bodyparse.urlencoded();
const nodemailer= require('nodemailer');
const cookieParser = require("cookie-parser");
const session = require('express-session');
const Auth = require(__dirname+"/middleware/auth.js");
var verificationcode;
var login_name;
var login_pass;
var login_email;
app.use(cookieParser());

app.use(
    session({
        secret: "Web ki assignment",
        resave: false,
        saveUninitialized: true,
        cookie: { path: "/", httpOnly: true, secure: false, maxAge: 1 * 60 * 60 * 1000 },//session will expire after 1 hour
    })
);
var  transporter= nodemailer.createTransport({
    host:'smtp.gmail.com',
    port:587,
    secure:false,
    requireTLS:true,
    auth:{
        user:"alishafa0376@gmail.com",
        pass:"ttugjrkymvtfygqp"
    }
});
const upload=multer({


storage:multer.diskStorage({
    destination:function(req,file,cb)
    {
        cb(null,"uploads");
    },
    filename:function(req,file,cb)
    {
    cb(null,file.originalname)
    }
})
})

let name="";

app.use(bodyparse.json());
app.use(bodyparse.urlencoded({ extended: false }));
console.log(generateCode());


////////////////Forget Password/////////////////////////////

app.get("/forgetpassword",(req,res)=>{
    res.sendFile(__dirname+"/forgetpassword.html");

})

app.post("/forgetpassword",(req,res)=>{
    let name=req.body.username;
    let email=req.body.email;
    
    // console.log(name);
    // console.log(pass);
    
    let query="select * from userdata where name = '"+name+"' and email = '"+email+"';"
    console.log(query);
        con.query(query,function(error,result,fields){
            if(error){
    console.log("Error");
            }
            
            else{
            if(result.length>0){




                var mailOption={
                    from:"alishafa0376@gmail.com",
                    to:email,
                    subject:"Verification Code",
                    html:"Your Username is:"+name+"\nYour Code is:"+result[0].pass
                }
                
                transporter.sendMail(mailOption,function(error,info){
                    if(error){ throw error;}
                    else{ 
                        console.log("I am in verification");
                }
                })

    res.redirect("/");
            }
            else{
                console.log("Login Not Found");
                res.redirect("/registration");
            }
    
        }
        })
})












///////////////////////////////////////////////////////////

//////////////////////USER VERIFICATION/////////////////////
function generateCode() {
    var minm = 100000;
    var maxm = 999999;
    return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
  }

function verify(email){
    verificationcode=generateCode();
    var mailOption={
        from:"alishafa0376@gmail.com",
        to:email,
        subject:"Verification Code",
        html:"Hello Please Enter this Code to Verify Your Code:"+verificationcode
    }
    
    transporter.sendMail(mailOption,function(error,info){
        if(error){ throw error;}
        else{ 
            console.log("I am in verification");
    }
})
return true;

}

app.get("/verify",(req,res)=>{
    res.sendFile(__dirname+"/verify.html");
    //res.sendFile(__dirname+"/adminadminmenu.html");
 })

app.post("/verify",(req,res)=>{


let code =req.body.code;
if(code==verificationcode){
console.log("code is correct");
res.redirect("/");
}

else{
    res.redirect("/verify");
}
})


///////////////////////////////////////////////////////
app.post("/generate_report",(req,res)=>{


    let id =req.body.id;
    let query="select * from books where id= '"+id+"';"
    console.log(login_email);
    con.query(query,(error,result)=>{
        if(error){
            console.log("Error");
           res.redirect("/welcome");
        }
        else{
            console.log(result);
            var mailOption={
                from:"alishafa0376@gmail.com",
                to:login_email,
                subject:"Report",
                html:"ID:"+result[0].id+"\nTitle:"+result[0].title+"\nAuthor:"+result[0].author+"\nRelease Date:"+result[0].release_date+"Subject:"+result[0].subject 
            }
            //"ID:"+result[0].id+"\nTitle:"+result[0].title+"\nAuthor:"+result[0].author+"\nRelease Date:"+result[0].release_date+"Subject:"+result[0].subject
            transporter.sendMail(mailOption,function(error,info){
                if(error){ throw error;}
                else{ 
                    console.log("I am in verification");
            }
        })
        res.redirect("/usermenu");
        }
    }) 
    })




////////////////////////////////////////////////////
app.post("/registration",encoded,(req,res)=>{
    //res.sendFile(__dirname+"/Registration.html");
    let username=req.body.username;
     let email=req.body.email;
    let password=req.body.password;
    console.log(username);
    console.log(email);
    //[username,email,password],
   // verify(email);
    let query="INSERT INTO userdata(name,email,pass) VALUES('"+username+"','"+email+"','"+password+"');"
    console.log(query);
    con.query('INSERT INTO userdata(name,email,pass) VALUES(?,?,?)',[username,email,password],(error,result)=>{
        if(error){
            console.log("Error");
           res.redirect("/welcome");
        }
        else{
            console.log("Data inserted");
            verify(email)
            res.redirect("/verify");
        }
    }) 
    })
    
app.set("view engine","ejs");
const con=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'fakedatabase'
}
)
con.connect((error)=>{
    if(error){
        console.log("Error");
    }
    else{
        console.log("Database has been connected");
    }
})

//res.sendFile(__dirname+"/adminadminmenu.html");
// app.get("/",(req,res)=>{
// //res.sendFile(__dirname+"/login.html");
// res.sendFile(__dirname+"/registration.html");
// })




app.get("/",(req,res)=>{
   res.sendFile(__dirname+"/start.html");
   //res.sendFile(__dirname+"/verify.html");
   //res.sendFile(__dirname+"/adminadminmenu.html");
})
app.get("/adminmenu",Auth,(req,res)=>{
    //res.sendFile(__dirname+"/login.html");
    res.sendFile(__dirname+"/adminmenu.html");
 })

app.get("/registration",(req,res)=>{
    res.sendFile(__dirname+"/Registration.html");
})

/////////////////Admin Login//////////////////////////
app.get("/adminlogin",(req,res)=>{
    res.sendFile(__dirname+"/adminlogin.html");
    //res.sendFile(__dirname+"/adminadminmenu.html");
 })




 /////////////////////////////////////////////////////
 app.get("/books",encoded, (req, res) => {
    const dataCountQuery = "SELECT COUNT(*) FROM books";
    con.query(dataCountQuery, function(err,result){
        if(err) throw err;

        let dataCount = result[0]["COUNT(*)"];
        let pageNo = req.query.page ? req.query.page : 1;
        let dataPerPages = req.query.data ? req.query.data : 3;
        let startLimit = (pageNo - 1) * dataPerPages;
        let totalPages = Math.ceil(dataCount/dataPerPages);

        // console.log(dataCount, "\n", pageNo, "\n",dataPerPages, "\n",startLimit, "\n",totalPages, "\n");

        const Query = `SELECT * FROM books LIMIT ${startLimit}, ${dataPerPages}`;
        con.query(Query, function(err,result){

// if(!err){
//     res.status(201.json)
// }

            if(err) throw err;
            // res.send(result);
            res.render( "books", 
                 {
                    dataa: result,
                    pages: totalPages,
                    CurrentPage: pageNo,
                    lastPage: totalPages
                 }
            );
        })
    });
}
);
///////////////////////////////////////////////////////



app.post("/updatestudent",encoded,(req,res)=>{
    //res.sendFile(__dirname+"/Registration.html");
    let name_=req.body.name_;
    let username=req.body.username;
    let email=req.body.email;
    let password=req.body.password;
    let phone=req.body.phone;
    let age=req.body.age;
    let qualification=req.body.qualification;

let query="update students set name = '"+name_+"',username ='"+username+"',email='"+email+"',password='"+password+"',phonenumber='"+phone+"',age='"+age+"',qualification='"+qualification +"' where name ='"+name+"'";
    //[username,email,password],
console.log(query);

    con.query(query,(error,result)=>{
        if(error){
            console.log("Error");
           res.redirect("/welcome");
        }
        else{
            console.log("Data Updateed");
            res.redirect("/adminmenu");
        }
    }) 
    })

    app.get("/delete",Auth,(req,res)=>{
        res.sendFile(__dirname+"/delete.html");
    })
    

    app.post("/delete_record",encoded,(req,res)=>{
        //res.sendFile(__dirname+"/Registration.html");
        let name_=req.body.name;

    let query="Delete from students where name ='"+name_+"';";
        //[username,email,password],
    
    
        con.query(query,(error,result)=>{
            if(error){
                console.log("Error");
               res.redirect("/welcome");
            }
            else{
                console.log("Data Deleted Succesfully");
                res.redirect("/adminmenu");
            }
        }) 
        })


        app.post("/read",encoded, (req, res) => {
            let name=req.body.name;
  let query="select  * from students where name ='"+name+"';";
            con.query(query, (error, dataa) => {
                if (error) {
                    throw error;
                }
                else {
                    res.render('searchresult', { dataa: dataa})
                }
            })
        })

        app.get("/search",(req,res)=>{
            res.sendFile(__dirname+"/search.html");
        })


   ///////////////////////////////////////////////////////////////////////////////////

        app.get("/all",encoded, (req, res) => {
            const dataCountQuery = "SELECT COUNT(*) FROM students";
            con.query(dataCountQuery, function(err,result){
                if(err) throw err;
        
                let dataCount = result[0]["COUNT(*)"];
                let pageNo = req.query.page ? req.query.page : 1;
                let dataPerPages = req.query.data ? req.query.data : 3;
                let startLimit = (pageNo - 1) * dataPerPages;
                let totalPages = Math.ceil(dataCount/dataPerPages);
        
                // console.log(dataCount, "\n", pageNo, "\n",dataPerPages, "\n",startLimit, "\n",totalPages, "\n");
        
                const Query = `SELECT * FROM students LIMIT ${startLimit}, ${dataPerPages}`;
                con.query(Query, function(err,result){

// if(!err){
//     res.status(201.json)
// }

                    if(err) throw err;
                    // res.send(result);
                    res.render( "read", 
                         {
                            dataa: result,
                            pages: totalPages,
                            CurrentPage: pageNo,
                            lastPage: totalPages
                         }
                    );
                })
            });
        }
        );
/////////////////////////////////////////////////////////////////////////////////////////
        app.get("/search",(req,res)=>{
            res.sendFile(__dirname+"/search.html");
        })


app.post("/update",encoded,(req,res)=>{
    //res.sendFile(__dirname+"/Registration.html");
    console.log("i am in post update");
     name=req.body.name;
    let query="select * from students where name = '"+name+"'";
    console.log(name);
    con.query(query,[name],(error,data)=>{
        if(error){
            console.log("Error");
          res.redirect("/welcome");
        }
        else{
            if(data.length>0){
                console.log("i am here");
                 console.log(data);

                res.render("update1",{data: data[0]});
            }
            else{
            console.log("No results found");
            res.redirect("/");
            }
        }
    })
    })


app.get("/add",Auth,(req,res)=>{
    res.sendFile(__dirname+"/add.html");
})

app.get("/update",Auth,(req,res)=>{
    console.log("i am in get update");
    res.sendFile(__dirname+"/update.html");
})

// app.post()

app.post("/add",encoded,upload.single("imageFile"),(req,res)=>{
    if(!req.file){
        console.log("File Not Found");
    }
    //res.sendFile(__dirname+"/Registration.html");
    let name_=req.body.name_;
    let username=req.body.username;
    let email=req.body.email;
    let password=req.body.password;
    let phone=req.body.phone;
    let age=req.body.age;
    let qualification=req.body.qualification;
let file_name=req.file.originalname;
    console.log(email);

    //[username,email,password],
    con.query('INSERT INTO students(name,username,email,phonenumber,password,qualification,age) VALUES(?,?,?,?,?,?,?)',[name_,username,email,phone,password,qualification,age],(error,result)=>{
        if(error){
            console.log("Error");
           res.redirect("/welcome");
        }
        else{
            console.log("Data inserted");
            res.redirect("/adminmenu");
        }
    }) 
    })
    
// app.get("/adminmenu",()=>{
//     console.log("i am in");
//    res.sendFile(__dirname+"/adminadminmenu.html");
// })




app.post("/adminlogin",encoded,(req,res)=>{

login_name=req.body.username;
 login_pass=req.body.password;

// console.log(name);
// console.log(pass);

let query="select * from userdata where name = '"+login_name+"' and pass = '"+login_pass+"';"
console.log(query);
    con.query(query,function(error,result,fields){
        if(error){
console.log("Error");
        }
        
        else{
        if(result.length>0){
            login_email=result.email
            const admin = { username: login_name, password: login_pass };
                req.session.admin = admin;
                res.cookie("CurrentRole", "Admin");
res.redirect("/adminmenu");
        }
        else{
            console.log("Login Not Found");
            res.redirect("/registration");
        }

    }
    })

})



app.get("/read/Sorting/:sorting/:page", (req, res) => {

    const dataCountQuery = "SELECT COUNT(*) FROM students";
    con.query(dataCountQuery, function (err, result) {
        if (err) throw err;

        let sorting = req.params.sorting;
        let dataCount = result[0]["COUNT(*)"];
        let pageNo = req.params.page ? req.params.page : 1;
        let dataPerPages = req.query.data ? req.query.data : 3;
        let startLimit = (pageNo - 1) * dataPerPages;
        let totalPages = Math.ceil(dataCount / dataPerPages);

        const Query = `SELECT * FROM students ORDER BY name ${sorting} LIMIT ${startLimit}, ${dataPerPages} `;
        con.query(Query, function (err, result) {
            if (err) throw err;
            res.render("read", {
                dataa: result,
                pages: totalPages,
                CurrentPage: pageNo,
                lastPage: totalPages
            });
        })
    });
});

app.get("/PDF", (req, res) => {

    const dataCountQuery = "SELECT COUNT(*) FROM students";
    con.query(dataCountQuery, function (err, result) {
        if (err) throw err;

        let sorting = "ASC";
        let dataCount = result[0]["COUNT(*)"];
        let pageNo = req.params.page ? req.params.page : 1;
        let dataPerPages = req.query.data ? req.query.data : 3;
        let startLimit = (pageNo - 1) * dataPerPages;
        let totalPages = Math.ceil(dataCount / dataPerPages);

        const Query = `SELECT * FROM students ORDER BY name ${sorting} LIMIT ${startLimit}, ${dataPerPages} `;
        con.query(Query, function (err, result) {
            if (err) {
                console.log("QUERY ERROR");
                throw err
            }
else{
            res.render("readpdf", {
                dataa: result,
                pages: totalPages,
                CurrentPage: pageNo,
                lastPage: totalPages
            });
        }
        })
    });
});


app.get("/welcome",(req,res)=>{
    res.sendFile(__dirname+"/welcome.html");
})



//////////////////////////User Interface//////////////////////////////
app.get("/userlogin",(req,res)=>{
    res.sendFile(__dirname+"/userlogin.html");
    //res.sendFile(__dirname+"/adminadminmenu.html");
 })

 app.get("/user_registration",(req,res)=>{
    res.sendFile(__dirname+"/user_Registration.html");
})


 app.post("/userlogin",encoded,(req,res)=>{

     login_name=req.body.username;
     login_pass=req.body.password;
    
    // console.log(name);
    // console.log(pass);
    
    let query="select * from students where name = '"+login_name+"' and password = '"+login_pass+"';"
    console.log(query);
        con.query(query,function(error,result,fields){
            if(error){
    console.log("Error");
            }
            
            else{
            if(result.length>0){

                login_email=result[0].email
                
    res.redirect("/usermenu");
            }
            else{
                console.log("Login Not Found");
                res.redirect("/user_registration");
            }
    
        }
        })
    
    })

    app.get("/adduser",(req,res)=>{
        res.sendFile(__dirname+"/adduser.html");
    })

    app.post("/adduser",encoded,upload.single("imageFile"),(req,res)=>{
        if(!req.file){
            console.log("File Not Found");
        }
        //res.sendFile(__dirname+"/Registration.html");
        let name_=req.body.name_;
        let username=req.body.username;
        let email=req.body.email;
        let password=req.body.password;
        let phone=req.body.phone;
        let age=req.body.age;
        let qualification=req.body.qualification;
    let file_name=req.file.originalname;
        console.log(email);
    
        //[username,email,password],
        con.query('INSERT INTO students(name,username,email,phonenumber,password,qualification,age) VALUES(?,?,?,?,?,?,?)',[name_,username,email,phone,password,qualification,age],(error,result)=>{
            if(error){
                console.log("Error");
               res.redirect("/welcome");
            }
            else{
                console.log("Data inserted");
                res.redirect("/usermenu");
            }
        }) 
        })

        app.post("/user_registration",encoded,upload.single("imageFile"),(req,res)=>{
            if(!req.file){
                console.log("File Not Found");
            }
            //res.sendFile(__dirname+"/Registration.html");
            let name_=req.body.name_;
            let username=req.body.username;
            let email=req.body.email;
            let password=req.body.password;
            let phone=req.body.phone;
            let age=req.body.age;
            let qualification=req.body.qualification;
        let file_name=req.file.originalname;
            console.log(email);
        
            //[username,email,password],
            con.query('INSERT INTO students(name,username,email,phonenumber,password,qualification,age) VALUES(?,?,?,?,?,?,?)',[name_,username,email,phone,password,qualification,age],(error,result)=>{
                if(error){
                    console.log("Error");
                   res.redirect("/welcome");
                }
                else{
                    console.log("Data inserted");
                    res.redirect("/userlogin");
                }
            }) 
            })

            app.get("/usermenu",(req,res)=>{
                //res.sendFile(__dirname+"/login.html");
                res.sendFile(__dirname+"/usermenu.html");
             })


app.listen(4001,()=>{
    console.log("listening at port 4000");
})