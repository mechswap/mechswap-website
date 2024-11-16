const express = require('express');
const mysql = require('mysql2');
const fileuploader = require('express-fileupload');
const path = require('path');
const app = express();
const nodemailer = require("nodemailer");

// Database connection setup
require('dotenv').config();


const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: 3306,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    dateStrings: true
};

const dbCon = mysql.createConnection(dbConfig);
dbCon.connect(function (err) {
    if (err) {
        console.error("Error connecting to database:", err);
    } else {
        console.log("Connected to database");
    }
});

// Middleware setup
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(fileuploader());

// Serve HTML file
app.get("/", function (req, resp) {
    resp.sendFile(path.join(process.cwd(), "public", "index.html"));
});

// ====================== Sign Up =====================
app.post("/create-Account", function (req, resp) {
    const email = req.body.someEmail;

    // Check if the email already exists
    dbCon.query("SELECT email FROM mechswap.register WHERE email = ?", [email], function (err, results) {
        if (err) {
            console.error("Error checking email existence:", err);
            return resp.status(500).send("Server error occurred");
        }

        if (results.length > 0) {
            return resp.status(400).send("Email already registered");
        }

        // Insert new user
        dbCon.query(
            "INSERT INTO mechswap.register (email, pwd, name, company_name, company_details, address, country, state, city, isd, number, dos, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE(), 1)",
            [
                email,
                req.body.somePwd,
                req.body.someName,
                req.body.someCompany_name,
                req.body.someCompany_detail,
                req.body.someAddress,
                req.body.someCountry,
                req.body.someState,
                req.body.someCity,
                req.body.someISD,
                req.body.someNumber
            ],
            function (err) {
                if (err) {
                    console.error("Error inserting data:", err);
                    return resp.status(500).send("Error saving record: " + err.message);
                }
                resp.send("Record saved and email sent successfully!");
                // Send the email
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const options = {
                    from: "mechswap09@gmail.com", // sender address
                    to: email, // list of receivers
                    subject: "# Welcome to MechSwap - Your Registration is Complete!", // Subject line
                    text: "You have successfully signed up", // plain text body
                    html: `<h1>Dear ${req.body.someName},</h1><br><br>Thank you for registering with MechSwap, your go-to platform for machinery trading. We're excited to have you on board!
<br><br>Your account has been successfully created with the following details:<br><br>Login ID: ${email}<br>Password: ${req.body.somePwd}<br><br>To get started:<br>
1. Log in to your account <br>
2. Start browsing or listing your industrial machinery<br><br>If you have any questions or need assistance, please don't hesitate to contact our support team at mechswap09@gmail.com.
<br><br>Happy trading!<br><br>Best regards,<br>  
The MechSwap Team.<br><br>---<br><br>*This email was sent to ${email}. If you didn't create an account on MechSwap, please ignore this email or contact us immediately.*
`
                };

                transporter.sendMail(options, function (err, info) {
                    if (err) {
                        console.error("Error sending email:", err);
                        return resp.status(500).send("Error sending email");
                    }

                    console.log("Email sent: " + info.response);

                });
            }
        );
    });
});


//=====================Forgot=====================
app.post("/forgot-Account", function (req, resp) {
    const email = req.body.someEmail; // Use req.body instead of req.query

    // Convert email to lowercase for case-insensitive comparison
    const lowerCaseEmail = email.toLowerCase();

    // Check if the email already exists (case-insensitive)
    dbCon.query("SELECT email, pwd, name FROM mechswap.register WHERE LOWER(email) = ?", [lowerCaseEmail], function (err, results) {
        if (err) {
            console.error("Error checking email existence:", err);
            return resp.status(500).send("Server error occurred");
        }

        // Debugging: Log the query results
        console.log("Query results: ", results);

        // If no results, the email is not registered
        if (results.length === 0) {
            return resp.status(400).send("Email not registered");
        }
        resp.send("Email sent successfully with account details!");

        // Fetch the password from the results
        const userPassword = results[0].pwd;
        const userName = results[0].name;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const options = {
            from: "mechswap09@gmail.com", // sender address
            to: lowerCaseEmail, // list of receivers
            subject: "# MechSwap - Password Reset Request", // Subject line
            text: "Here are your account details", // plain text body
            html: `<h1>Dear ${userName}</h1><br>We received a request to reset the password for your MechSwap account. If you didn't make this request, please ignore this email.<br><br>
<b>Login ID: ${lowerCaseEmail}</b><br><b>Password: ${userPassword}</b><br><br>Best regards, <br>The MechSwap Team<br><br>---<br><br>*This email was sent to ${lowerCaseEmail}. If you didn't request a password reset, please secure your account and contact us immediately.* `
        };

        transporter.sendMail(options, function (err, info) {
            if (err) {
                console.error("Error sending email:", err);
                return resp.status(500).send("Error sending email");
            }

            console.log("Email sent: " + info.response);

        });
    });
});




// ====================== Log In =====================
app.get("/do-login", function (req, resp) {
    dbCon.query(
        "SELECT * FROM mechswap.register WHERE email = ? AND pwd = ?",
        [req.query.someEmail, req.query.somePwd],
        function (err, resultJSONTable) {
            if (err) {
                console.error(err);
                return resp.status(500).send("Server error");
            }

            if (resultJSONTable.length > 0) {
                switch (resultJSONTable[0].status) {
                    case 1:
                        resp.send("OK");
                        break;
                    case 2:
                        resp.send("ADMIN");
                        break;
                    default:
                        resp.send("USER BLOCKED");
                }
            } else {
                resp.send("INVALID EMAIL OR PASSWORD");
            }
        }
    );
});

// ====================== Fetch User Data =====================
app.get("/json-record", function (req, resp) {
    dbCon.query(
        "SELECT * FROM mechswap.register WHERE email = ?",
        [req.query.kuchemail],
        function (err, resultJSONKuch) {
            if (err) {
                return resp.status(500).send(err);
            }
            resp.json(resultJSONKuch);
        }
    );
});

// ====================== Update User =====================
app.post("/update-user", function (req, resp) {
    const { email, companyName, companyDetail, userName, userAddress, userCountry, userState, userCity, userISD, userMobile } = req.body;

    const query = `UPDATE mechswap.register SET company_name = ?, company_details = ?, name = ?, address = ?, country = ?, state = ?, city = ?, isd = ?, number = ? WHERE email = ?`;
    const values = [companyName, companyDetail, userName, userAddress, userCountry, userState, userCity, userISD, userMobile, email];

    dbCon.query(query, values, function (err) {
        if (err) {
            console.error(err);
            return resp.status(500).send("Server error");
        }
        resp.send("User details updated successfully");
    });
});

// ====================== Change Password =====================
app.post("/change-password", function (req, resp) {
    const { currentPassword, newPassword, UserUserEmail } = req.body;

    dbCon.query("SELECT pwd FROM mechswap.register WHERE email = ?", [UserUserEmail], function (err, result) {
        if (err) {
            console.error(err);
            return resp.status(500).send("Server error");
        }

        if (result.length === 0) {
            return resp.status(404).send("User not found");
        }

        if (currentPassword !== result[0].pwd) {
            return resp.status(401).send("Current password is incorrect");
        }

        dbCon.query("UPDATE mechswap.register SET pwd = ? WHERE email = ?", [newPassword, UserUserEmail], function (err) {
            if (err) {
                console.error(err);
                return resp.status(500).send("Server error");
            }
            resp.send("Password updated successfully");
        });
    });
});


// ====================== Add Product =====================
const uploadPath = path.join(__dirname, 'public', 'uploads');

app.post('/add-product', (req, res) => {
    const productId = req.body.some_product_id;
    const email = req.body.some_Email;
    const usageType = req.body.some_usage_type;
    const productName = req.body.some_product_name;
    const modelNo = req.body.some_model_no;
    const countryMfg = req.body.some_country_mfg;
    const capacity = req.body.some_capacity;
    const warranty = req.body.some_warranty;
    const usageYears = req.body.some_usage_years;
    const specification = req.body.some_specification;
    const currency = req.body.some_currency;
    const price = req.body.some_price;
    const quantity = req.body.some_quantity;
    const categoryVal = req.body.some_categoryVal;
    const category = req.body.some_category;
    const sub_category = req.body.some_subcategory;

    // Handle file uploads
    const mainImage = req.files?.some_main_image;
    const image1 = req.files?.some_image1;
    const image2 = req.files?.some_image2;

    const filePromises = [];

    if (mainImage) {
        filePromises.push(new Promise((resolve, reject) => {
            mainImage.mv(path.join(uploadPath, mainImage.name), (err) => {
                if (err) return reject(err);
                resolve(mainImage.name);
            });
        }));
    }
    if (image1) {
        filePromises.push(new Promise((resolve, reject) => {
            image1.mv(path.join(uploadPath, image1.name), (err) => {
                if (err) return reject(err);
                resolve(image1.name);
            });
        }));
    }
    if (image2) {
        filePromises.push(new Promise((resolve, reject) => {
            image2.mv(path.join(uploadPath, image2.name), (err) => {
                if (err) return reject(err);
                resolve(image2.name);
            });
        }));
    }

    Promise.all(filePromises)
        .then(fileNames => {
            const [mainImageName, image1Name, image2Name] = fileNames;

            // Insert data into MySQL database
            const query = `INSERT INTO products (productID, email, usage_type, product_name, product_model, country_mfg, capacity, warranty, usage_years, specification, currency, price, quantity, main_image, image1, image2,category_val,category,sub_category)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?)`;

            dbCon.query(query, [
                productId, email, usageType, productName, modelNo, countryMfg, capacity, warranty, usageYears,
                specification, currency, price, quantity, mainImageName, image1Name, image2Name, categoryVal, category, sub_category
            ], (err, results) => {
                if (err) {
                    console.error('Error inserting product:', err);
                    return res.status(500).send('Fill all the data');
                }
                res.send('Product added successfully');
            });
        })
        .catch(err => {
            console.error('Error handling file uploads:', err);
            res.status(500).send('Error uploading files: ' + err.message);
        });
});

//======================== Start the server ================================
app.listen(2024, function () {
    console.log('Server started on port 2024');
});

//=========================== Manage Product Detail ============================= 
app.get("/get-angular-all-records", function (req, resp) {
    var email = req.query.email;  // Corrected to "email" based on the query parameter from AngularJS
    if (!email) {
        return resp.status(400).send("Email is required.");
    }

    dbCon.query("SELECT * FROM mechswap.products WHERE email = ?", [email], function (err, resultTableJSON) {
        if (err == null) {
            resp.send(resultTableJSON);
        } else {
            resp.status(500).send("Error fetching records: " + err);
        }
    });
});

//======================== Action Remove======================================
app.get("/do-angular-remove", function (req, resp) {
    //saving data in table
    var productID = req.query.productID;


    //fixed                             //same seq. as in table
    dbCon.query("delete from mechswap.products where productID=?", [productID], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("Product Removed Successfully!!");
            else
                resp.send("Inavlid Email id");
        }
        else
            resp.send(err);
    })
})

app.get('/product-status', (req, res) => {
    // Assuming the email is being sent as a query parameter
    const email = req.query.txtEmail1;

    const query = `
        SELECT COUNT(*) AS totalPosted
        FROM mechswap.products
        WHERE email = ?
    `;

    dbCon.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error fetching product status:', err);
            return res.status(500).send('Error fetching product status');
        }

        // Send result as JSON to the client
        res.json(results[0]);
    });
});


app.get("/get-angular-buyer-records", function (req, resp) {
    // Fetch product records grouped by category and sub_category
    dbCon.query(`
      SELECT category, sub_category, COUNT(*) as count 
      FROM mechswap.products 
      GROUP BY category, sub_category;`,
        function (err, resultTableJSON) {
            if (err == null)
                resp.send(resultTableJSON);
            else
                resp.send(err);
        }
    );
});


//================================================================
app.get("/get-angular-variety-records", function (req, resp) {
    // console.log(req.query);
    var sub_category = req.query.sub_category;
    var category = req.query.category;

    var query = "select * from mechswap.products  where sub_category=? and category=?";


    dbCon.query(query, [sub_category, category], function (err, resultTable) {
        // console.log(resultTable+"      "+err);
        if (err == null)
            resp.send(resultTable);
        else
            resp.send(err);
    })
})

//================================================================
app.get("/get-angular-product-records", function (req, resp) {
    // console.log(req.query);
    var productID = req.query.productID;

    var query = "select * from mechswap.products  where productID=? ";


    dbCon.query(query, [productID], function (err, resultTable) {
        // console.log(resultTable+"      "+err);
        if (err == null)
            resp.send(resultTable);
        else
            resp.send(err);
    })
})

//================================================================
app.get("/get-angular-user-records", function (req, resp) {
    // console.log(req.query);
    var email = req.query.email;

    var query = "select * from mechswap.register  where email=? ";


    dbCon.query(query, [email], function (err, resultTable) {
        // console.log(resultTable+"      "+err);
        if (err == null)
            resp.send(resultTable);
        else
            resp.send(err);
    })
})

//================
app.get("/productUser-record", function (req, resp) {
    dbCon.query(
        "SELECT * FROM mechswap.register WHERE email = ?",
        [req.query.someemail],
        function (err, resultJSONKuch) {
            if (err) {
                return resp.status(500).send(err);
            }
            resp.json(resultJSONKuch);
        }
    );
});


app.post("/buyer-Account", function (req, resp) {
    console.log(req.body.somebuyerEmail);
    const email = req.body.somebuyerEmail;
    dbCon.query(
        "INSERT INTO mechswap.buyer (buyer_productID, buyer_email, buyer_name, buyer_address, buyer_country, buyer_state, buyer_city, buyer_ISD, buyer_number, buyer_dos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE())",
        [

            req.body.somebuyerProductID,
            req.body.somebuyerEmail,
            req.body.somebuyerName,
            req.body.somebuyerAddress,
            req.body.somebuyerCountry,
            req.body.somebuyerState,
            req.body.somebuyerCity,
            req.body.somebuyerISD,
            req.body.somebuyerNumber
        ],
        function (err) {
            if (err) {
                console.error("Error inserting data:", err);
                return resp.status(500).send("Error saving record: " + err.message);
            }
            resp.send("Record saved");

            // Send the email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const options = {
                from: "mechswap09@gmail.com", // sender address
                to: "mechswap09@gmail.com", // list of receivers
                subject: "New Buyer", // Subject line
                text: "Here's New Buyer Information", // plain text body
                html: `<h1></h1><br><br>Buyer ID: ${email}<br>Product ID: ${req.body.somebuyerProductID}<br>number: ${req.body.somebuyerNumber}`
            };

            transporter.sendMail(options, function (err, info) {
                if (err) {
                    console.error("Error sending email:", err);
                    return resp.status(500).send("Error sending email");
                }

                console.log("Email sent: " + info.response);

            });
        }
    );
});
