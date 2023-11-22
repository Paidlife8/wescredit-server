const OtpMessageDisplay = (otpCode) => {
  const otpMessage = `
        <html lang="en">
        <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Region Bank</title>
                <link rel="stylesheet" href="href='https://fonts.googleapis.com/css?family=Roboto'">
                <style>
                        .right{
                                text-align: right;
                        }
                        .left{
                                text-align: left;
                        }
                        .link{
                                width: 500px;
                                margin: auto;
                                text-align: center;
                                /* background-color: yellowgreen; */
                                
                        }
                        @media(max-width:700px){
                                .link{
                                        /* background-color: red; */
                                        width: 90%;
                                }
                        } 
                                
                </style>

        </head>
        <body style="font-family: 'Roboto'; text-align: center;">
                <div style="text-align: center;" class="logo">
                        <img src="https://res.cloudinary.com/dkybteijl/image/upload/v1686045291/images__1_-removebg-preview_blions.png" alt="Region Bank">
                </div>
                <h3>Login OTP</h3>
                <div class="otp">
                        <h4>
                                Find attached your login code
                        </h4>
                        <h2 style=" width:fit-content; margin: auto; padding:  10px 20px; border: 1px solid;">
                                ${otpCode}
                        </h2>
                </div>
                <div class="link">
                        <p>
                                For futher enquiries and dispute, please kindly contact our customer support through the following channels:
                        </p>
                        <p>
                                Email: <a href="customerservice@regiononline.com">customerservice@regiononline.com</a>
                        </p>
                        <p style="padding-top: 50px;">
                                click <a href="#">here</a> to unsubscribe
                        </p>
                </div>
        </body>
        </html>
`;
  return otpMessage;
};

const transactionMessageDisplay = ({
  moneySent,
  accountDebited,
  accountCredited,
  accountName,
  description,
  date,
  availableBalance,
  totalBalance,
}) => {
  const transactionMessage = `
        <html lang="en">
        <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Region Bank</title>
                <link rel="stylesheet" href="href='https://fonts.googleapis.com/css?family=Roboto'">
                <style>
                        .right{
                                text-align: right;
                        }
                        .left{
                                text-align: left;
                        }
                        .link{
                                width: 500px;
                                margin: auto;
                                text-align: center;
                                /* background-color: yellowgreen; */
                                
                        }
                        @media(max-width:700px){
                                .link{
                                        /* background-color: red; */
                                        width: 90%;
                                }
                        } 
                                
                </style>
        
        </head>
        <body style="font-family: 'Roboto'; text-align: center;">
                <div style="text-align: center;" class="logo">
                        <img src="https://res.cloudinary.com/dkybteijl/image/upload/v1686045291/images__1_-removebg-preview_blions.png" alt="Region Bank">
                </div>
                <h3>Transaction Details</h3>
                <table align="center">
                        <tr>
                                <td class="left">Money sent</td>
                                <td class="right">$${moneySent}</td>
                        </tr>
                        <tr>
                                <td class="left">Account debited</td>
                                <td class="right">${accountDebited}</td>
                        </tr>
                        <tr>
                                <td class="left">Account Creditted</td>
                                <td class="right">${accountCredited}</td>
                        </tr>
                        <tr>
                                <td class="left">Account Name</td>
                                <td class="right">${accountName}</td>
                        </tr>
                        <tr>
                                <td class="left">Description</td>
                                <td class="right">${description}</td>
        
                        </tr>
                        <tr>
                                <td class="left">Date Of Transaction</td>
                                <td class="right">${date}</td>
                        </tr>
                        <tr>
                                <td class="left">Available Balance</td>
                                <td class="right">$${availableBalance}</td>
                        </tr>
                        <tr>
                                <td class="left">Total Balance</td>
                                <td class="right">$${totalBalance}</td>
                        </tr>
                </table>
                <div class="link">
                        <p>
                                For futher enquiries and dispute, please kindly contact our customer support through the following channels:
                        </p>
                        <p>
                                Email: <a href="regionmailbox@gmail.com">customerservice@regiononline.com</a>
                        </p>
                        <p style="padding-top: 50px;">
                                click <a href="#">here</a> to unsubscribe
                        </p>
                </div>
        </body>
        </html>
    `;

  return transactionMessage;
};

const transactionCreditMessageDisplay = ({
  moneySent,
  accountDebited,
  accountCredited,
  accountName,
  description,
  date,
  availableBalance,
  totalBalance,
}) => {
  const transactionMessage = `
          <html lang="en">
          <head>
                  <meta charset="UTF-8">
                  <meta http-equiv="X-UA-Compatible" content="IE=edge">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Region Bank</title>
                  <link rel="stylesheet" href="href='https://fonts.googleapis.com/css?family=Roboto'">
                  <style>
                          .right{
                                  text-align: right;
                          }
                          .left{
                                  text-align: left;
                          }
                          .link{
                                  width: 500px;
                                  margin: auto;
                                  text-align: center;
                                  /* background-color: yellowgreen; */
                                  
                          }
                          @media(max-width:700px){
                                  .link{
                                          /* background-color: red; */
                                          width: 90%;
                                  }
                          } 
                                  
                  </style>
          
          </head>
          <body style="font-family: 'Roboto'; text-align: center;">
                  <div style="text-align: center;" class="logo">
                          <img src="https://res.cloudinary.com/dkybteijl/image/upload/v1686045291/images__1_-removebg-preview_blions.png" alt="Region Bank">
                  </div>
                  <h3>Transaction Details</h3>
                  <table align="center">
                          <tr>
                                  <td class="left">Money Received</td>
                                  <td class="right">$${moneySent}</td>
                          </tr>
                          <tr>
                                  <td class="left">Account debited</td>
                                  <td class="right">${accountDebited}</td>
                          </tr>
                          <tr>
                                  <td class="left">Account Creditted</td>
                                  <td class="right">${accountCredited}</td>
                          </tr>
                          <tr>
                                  <td class="left">Account Name</td>
                                  <td class="right">${accountName}</td>
                          </tr>
                          <tr>
                                  <td class="left">Description</td>
                                  <td class="right">${description}</td>
          
                          </tr>
                          <tr>
                                  <td class="left">Date Of Transaction</td>
                                  <td class="right">${date}</td>
                          </tr>
                          <tr>
                                  <td class="left">Available Balance</td>
                                  <td class="right">$${availableBalance}</td>
                          </tr>
                          <tr>
                                  <td class="left">Total Balance</td>
                                  <td class="right">$${totalBalance}</td>
                          </tr>
                  </table>
                  <div class="link">
                          <p>
                                  For futher enquiries and dispute, please kindly contact our customer support through the following channels:
                          </p>
                          <p>
                                  Email: <a href="regionmailbox@gmail.com">customerservice@regiononline.com</a>
                          </p>
                          <p style="padding-top: 50px;">
                                  click <a href="#">here</a> to unsubscribe
                          </p>
                  </div>
          </body>
          </html>
      `;

  return transactionMessage;
};

module.exports = {
  OtpMessageDisplay,
  transactionMessageDisplay,
  transactionCreditMessageDisplay,
};
