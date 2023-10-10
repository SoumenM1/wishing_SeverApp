const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const mongoose= require('./db/mongodb')
const schedule = require('node-schedule');
const UserInformation = require("./model/model");
const path=require('path')
const app = express();
const port = 3000;
app.use(express.json())
app.set('view engine', 'ejs');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, path.join(__dirname, "public", "uploads"));
    },
    filename: function (req, file, callback) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      callback(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  });
  
const upload = multer({ storage: storage });
  
app.get('/family-wish', (req, res) => {
    res.render('family-wish');
});

// app.post('/submit', upload.single('image'), (req, res) => {
//     const name = req.body.name;
//     const dob = new Date(req.body.dob);
//     const image = req.file; // Uploaded image, if provided

//     // Calculate the next birthday
//     const today = new Date();
//     const nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    
//     if (nextBirthday < today) {
//         // If the next birthday has already passed this year, add 1 year to it
//         nextBirthday.setFullYear(today.getFullYear() + 1);
//     }

//     // Calculate the number of days until the next birthday
//     const daysUntilNextBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));

//     // Render the EJS template with the result
//     res.render('family-wish-result', { name, dob,nextBirthday, daysUntilNextBirthday });
// });

app.post('/submit',upload.single('image'),async(req,res)=>{
    try {
        const { name, email } = req.body;
        const dob = new Date(req.body.dob);
        const image = req.file ? `/uploads/${req.file.filename}` : null; // Save the image path
    
        const userInformation = new UserInformation({
          name,
          email,
          dob,
          image,
        });
    
        await userInformation.save();
        const today = new Date();
            const nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
            
            if (nextBirthday < today) {
                // If the next birthday has already passed this year, add 1 year to it
                nextBirthday.setFullYear(today.getFullYear() + 1);
            }
        
            // Calculate the number of days until the next birthday
            const daysUntilNextBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
        
        res.render('family-wish-result', { name, dob,nextBirthday, daysUntilNextBirthday }); // Redirect to a success page or do something else
      } catch (error) {
        console.error(error);
        res.redirect("/error"); // Redirect to an error page or do something else
      }
})

const autoMailSend = async (email,name) =>{
let mailTransporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'wishtofamily@gmail.com',
		pass: 'mewq qqnd mxtv jqew'
	}
});

const mailDetails = {
    from: 'wishtofamily@gmail.com',
    to: email,
    subject: 'Birthday Wishes',
    html: `
    <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #333;
    }
    p {
      color: #666;
      line-height: 1.6;
    }
    strong {
      font-weight: bold;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 20px 0;
      border: 1px solid #ddd; 
      border-radius: 10px;
    }
    em {
      font-style: italic; 
    }
    
  </style>
  <div class="container">
    <h1><i>Happy Birthday, ${name}!<i/></h1>
    <p>Dear ${name},</p>
    <p>Wishing you a fantastic birthday filled with joy, laughter, and wonderful moments.</p>
    <p><strong>Here's a special <em>birthday wish</em> just for you:</strong></p>
    <img src="https://firebasestorage.googleapis.com/v0/b/hello-app-ebcf1.appspot.com/o/wishig_img%2F1.jpg?alt=media&token=d2b750fd-6824-4f51-8c66-e6210d50ea1b&_gl=1*1ajauoe*_ga*MTYxNjQwMDEwNi4xNjkyMTU3NzIw*_ga_CW55HF8NVT*MTY5NjY3NzQxNy40Mi4xLjE2OTY2Nzc0NzcuNjAuMC4w" alt="Birthday Image" width="200">
    <p>Enjoy your day to the fullest!</p>
    <p>Best regards,<br>Your Name</p>
  </div>

    `,
  };
  

  mailTransporter.sendMail(mailDetails,async function(err, data) {
	if(err) {
		console.log('Error Occurs',err);
	} else {
		console.log('Email sent successfully');
        
	}
   });

// });
}
// autoMailSend()
 async function getAndCheckBirthdays() {
    try {
      // Get all user information documents from the collection
      const users = await UserInformation.find({});
      
      // Get today's date
      const today = new Date();
      
      // Iterate through the users
      users.forEach((user) => {
        // Get the user's date of birth
        const userDob = new Date(user.dob);
        
        // Check if today is the user's birthday
        if (userDob.getMonth() === today.getMonth() && userDob.getDate() === today.getDate()) {
          console.log(`Today is ${user.name}'s birthday!`);
          console.log(`Today is ${user.email}'s birthday!`);

          
          // Call the email sending function
        //   sendEmail(user.email, 'Happy Birthday!', 'Wishing you a fantastic day!');
        autoMailSend(user.email,user.name)
        }
      });
    } catch (error) {
      console.error('Error:', error);
      // Handle errors here
    }
  }
  schedule.scheduleJob('0 0 * * *', () => {
    getAndCheckBirthdays()
  })

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});