const nodemailer= require('nodemailer')


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port:  process.env.SMTP_PORT,
  secure: true, // Use `true` for port 465, `false` for all other ports
//   requireTLS:true, If use Google SMTP then use
  auth: {
    user:  process.env.SMTP_MAIL,
    pass:  process.env.SMTP_PASS,
  },
});


const sendMail = async(email, subject,content)=>{
    try{
        var mailOptions={
            from: process.env.SMTP_MAIL,
            to:email,
            subject:subject,
            html:content
        };

        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.log(error);
                return;
                
            }
            console.log("Mail Sent ! ", info.messageId);
            
        })

    }
    catch(err){
        console.log(err);
        
    }
}


module.exports = {sendMail}
