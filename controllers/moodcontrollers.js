const conn = require('./../utils/dbconn');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'dell.reilly@ethereal.email',
        pass: 'XDEXxbeTc65ka74cKC'
    }
});


// Generate a random token
const generateToken = () => {
    return crypto.randomBytes(20).toString('hex'); // Generates a random token of 20 bytes and converts it to a hexadecimal string
};


// POST method to initiate the password reset process
exports.postForgetPassword = (req, res, next) => {
    const { email } = req.body;

    let message = '';
    let sentResetLink = false; // Initialize the variable

    // Check if the email already exists in the database
    const emailCheckQuery = 'SELECT * FROM user WHERE email_address = ?';
    conn.query(emailCheckQuery, [email], (err, emailResults) => {
        if (err) {
            console.error('Error checking email in MySQL:', err.stack);
            message = 'Internal Server Error';
            return res.status(500).json({ message });
        }

        // If the email exists in the database
        if (emailResults.length > 0) {
            // Generate a password reset token
            const token = generateToken();

            // Store the token in the database or cache for later verification
            
            const updateTokenQuery = 'UPDATE user SET reset_token = ? WHERE email_address = ?';
            conn.query(updateTokenQuery, [token, email], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error('Error updating token in MySQL:', updateErr);
                    message = 'Internal Server Error';
                    return res.status(500).json({ message });
                }

                // Construct the password reset link
                const resetLink = `http://localhost:3002/forgetpassword?token=${token}`;

                // Log the reset link (for demonstration purposes)
                console.log('Password reset link:', resetLink);

                // Here you would typically send the reset link to the user's email
                const mailOptions = {
                    from: 'MoodTrace@gmail.com',
                    to: email,
                    subject: 'Password Reset',
                    text: `Click the following link to reset your password: ${resetLink}`
                };
                // You can use a library like Nodemailer to send emails in Node.js
               
                transporter.sendMail(mailOptions, (sendMailErr, info) => {
                    if (sendMailErr) {
                        console.error('Error sending email:', sendMailErr);
                        message = 'Error sending email';
                        return res.status(500).json({ message });
                    }

                    // Log the reset link (for demonstration purposes)
                    console.log('Password reset link:', resetLink);
                    
                    // Set the variable to indicate that the reset link has been sent
                    sentResetLink = true;

                    // Respond with a success message
                    message = "Password reset link has been sent to your email";
                    return res.status(200).json({ message, sentResetLink });
                });
            });

        } else {
            // If the email doesn't exist in the database
            message = 'Email not found';
            return res.status(404).json({ message });
        }
    });
};



// Handle registration form submission
exports.postRegister = (req, res) => {
    const { firstname, lastname, email, password, confirmpassword } = req.body;

    let registrationMessage = '';

    // Validate form data (you should perform more thorough validation)
    if (!firstname || !lastname || !email || !password || !confirmpassword) {
        registrationMessage = 'Invalid form data. Please check your input.';
        return res.status(400).json({ registrationMessage, messageType: 'error'});
    }

    // Check if the password meets length requirement
    if (password.length < 8) {
        registrationMessage = 'Password must be at least 8 characters long.';
        return res.status(400).json({ registrationMessage, messageType: 'error' });
    }

    // Password special characters validation
    var specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (!specialCharacters.test(password)) {
        registrationMessage = 'Password must contain special characters';
        return res.status(400).json({ registrationMessage, messageType: 'error' });
    }

    // Check if password and confirm password match
    if (password !== confirmpassword) {
        registrationMessage = 'Password and confirm password do not match';
        return res.status(400).json({ registrationMessage, messageType: 'error' });
    }

    // Check if the email already exists in the database
    const emailCheckQuery = 'SELECT * FROM user WHERE email_address = ?';
    conn.query(emailCheckQuery, [email], (err, emailResults) => {
        if (err) {
            console.error('Error checking email in MySQL: ' + err.stack);
            registrationMessage = 'Email is already registered. Please choose another email';
            return res.status(500).json({ registrationMessage, messageType: 'error' });
        }

        if (emailResults.length > 0) {
            registrationMessage = 'Email address is already registered. Please choose another email.';
            return res.status(401).json({ registrationMessage, messageType: 'error' });
        }

        // Hash the password using bcrypt
        bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
            if (hashErr) {
                console.error('Error hashing password: ' + hashErr);
                registrationMessage = 'Internal Server Error';
                return res.status(500).json({ registrationMessage });
            }

            // Insert user data into MySQL with hashed password
            const insertQuery = 'INSERT INTO user (firstname, surname, email_address, password) VALUES (?, ?, ?, ?)';
            conn.query(insertQuery, [firstname, lastname, email, hashedPassword], (insertErr, result) => {
                if (insertErr) {
                    console.error('Error inserting into MySQL: ' + insertErr.stack);
                    registrationMessage = 'Internal Server Error';
                    return res.status(500).json({ error: registrationMessage });
                }

                console.log('User registered with ID: ' + result.insertId);

                // Send a registration success message
                registrationMessage = 'Registration successful. Welcome, ' + firstname + '!';

                // Return a JSON response with the registration message
                res.status(201).json({ registrationMessage, messageType: 'success' });
                
            });
        });
    });
};

  
// Function to fetch contextual triggers from the database
exports.getContextualTriggers = (req, res) => {
    const query = 'SELECT trigger_name FROM contextual_trigger';

    conn.query(query, (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        } else {
            const triggersArray = rows.map(row => row.trigger_name);
            res.status(200).json(triggersArray); // Send the array directly as the response
        }
    });
};

// Function to fetch contextual triggers from the database
function fetchContextualTriggers(callback) {
    const query = 'SELECT trigger_name, trigger_id FROM contextual_trigger';
 
    conn.query(query, (err, rows) => {
        if (err) {
             callback(err, null);
             return;
       }
 
       const triggersArray = rows.map(row => row.trigger_name);
       callback(null, triggersArray);
    });
 };
 

// Assuming you have a route similar to this in your Express application
exports.getSelectedMood = (req, res) => {
    const moodId = req.params.moodId || ''; // Corrected from 'snapshotId' to 'moodId'
    const trigger = req.params.trigger || '';

    const selectSQL = `
        SELECT 
            snapshot.*, 
            user.*, 
            GROUP_CONCAT(contextual_trigger.trigger_name) AS contextual_triggers
        FROM 
            snapshot 
        INNER JOIN 
            user ON snapshot.user_id = user.user_id
        LEFT JOIN 
            snapshot_trigger ON snapshot.snapshot_id = snapshot_trigger.snapshot_id
        LEFT JOIN 
            contextual_trigger ON snapshot_trigger.trigger_id = contextual_trigger.trigger_id
        WHERE 
            snapshot.snapshot_id = ?
        GROUP BY 
            snapshot.snapshot_id, user.user_id;`;

    // Execute the SQL query to fetch selected card information and contextual triggers
    conn.query(selectSQL, [moodId], (err, rows) => {
        if (err) {
            console.error('Error fetching selected card information:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Selected card information not found' });
        }

        // Extract selected card information
        const selectedCardInfo = rows[0];

        // Fetch contextual triggers
        fetchContextualTriggers((err, contextualTriggers) => {
            if (err) {
                console.error('Error fetching contextual triggers:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Combine selected card information and contextual triggers into a single response
            const combinedData = {
                moodId,
                selectedCardInfo,
                contextualTriggers
            };

            res.json(combinedData);
        });
    });
};


 
 exports.updateMood = (req, res) => {
    try {
        const { updatedContextualTriggers } = req.body;
        const moodId = req.params.moodId;

        // Check if moodId is undefined
        if (!moodId) {
            console.error('Mood ID is undefined');
            return res.status(400).json({ error: 'Mood ID is undefined' });
        }

        // Convert updatedContextualTriggers to an array if it's a single value
        const triggersArray = Array.isArray(updatedContextualTriggers)
            ? updatedContextualTriggers
            : [updatedContextualTriggers];

        // Update triggers associated with the given snapshotID
        const updateTriggerSQL = `
            INSERT IGNORE INTO snapshot_trigger (snapshot_id, trigger_id)
            SELECT ?, trigger_id
            FROM contextual_trigger
            WHERE trigger_name IN (?) AND trigger_id NOT IN (
                SELECT trigger_id
                FROM snapshot_trigger
                WHERE snapshot_id = ?
            );
        `;

        // Delete triggers if the checkbox is deselected by the user
        const deleteTriggersSQL = `
            DELETE FROM snapshot_trigger
            WHERE snapshot_id = ? AND trigger_id NOT IN (
                SELECT trigger_id FROM contextual_trigger WHERE trigger_name IN (?)
            );
        `;

        // Begin transaction
        conn.beginTransaction((beginTransactionErr) => {
            if (beginTransactionErr) {
                console.error('Error beginning transaction:', beginTransactionErr);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Execute delete statement for triggers that are not in updatedContextualTriggers
            conn.query(deleteTriggersSQL, [moodId, triggersArray], (deleteErr) => {
                if (deleteErr) {
                    console.error('Error deleting triggers:', deleteErr);
                    conn.rollback(() => {
                        res.status(500).json({ error: 'Internal Server Error' });
                    });
                    return;
                }

                // Execute each update statement for each trigger in parallel using Promise.all
                const updatePromises = triggersArray.map((newTrigger) => {
                    return new Promise((resolve, reject) => {
                        // Execute the update statement
                        conn.query(updateTriggerSQL, [moodId, newTrigger, moodId], (updateErr, updateResult) => {
                            if (updateErr) {
                                // Rollback the transaction if there's an error
                                conn.rollback(() => {
                                    console.error('Error updating snapshot_trigger:', updateErr);
                                    reject(updateErr);
                                });
                            } else {
                                resolve(updateResult);
                            }
                        });
                    });
                });

                // Wait for all updates to complete
                Promise.all(updatePromises)
                    .then(() => {
                        // Commit the transaction if all updates are successful
                        conn.commit((commitErr) => {
                            if (commitErr) {
                                console.error('Error committing transaction:', commitErr);
                                res.status(500).json({ error: 'Internal Server Error' });
                            } else {
                                res.status(200).json({ message: `Mood with ID ${moodId} updated successfully` });
                            }
                        });
                    })
                    .catch((error) => {
                        console.error('Error updating triggers:', error);
                        res.status(500).json({ error: 'Internal Server Error' });
                    });
            });
        });
    } catch (error) {
        console.error('Error updating mood:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




exports.deleteMood = (req, res) => {
    const moodId = req.params.moodId;
    const checkMoodSQL = 'SELECT * FROM snapshot WHERE snapshot_id = ?';
    const selectTriggersSQL = 'SELECT trigger_id FROM snapshot_trigger WHERE snapshot_id = ?';
    const deleteTriggerSQL = 'DELETE FROM snapshot_trigger WHERE trigger_id IN (?)';
    const deleteSnapshotSQL = 'DELETE FROM snapshot WHERE snapshot_id = ?';

    // Check if the snapshot exists
    conn.query(checkMoodSQL, [moodId], (errCheck, moodRows) => {
        if (errCheck) {
            console.error('Error checking mood:', errCheck);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // If snapshot does not exist, return error
        if (moodRows.length === 0) {
            return res.status(404).json({ error: `Snapshot with ID ${moodId} not found `});
        }
    
    // Begin a transaction
    conn.beginTransaction((err) => {
        if (err) {
            console.error('Error beginning transaction:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    
        // Retrieve all associated trigger IDs
        conn.query(selectTriggersSQL, [moodId], (errSelect, triggerRows) => {
            if (errSelect) {
                return rollbackAndSendError(res, conn, 'Error retrieving associated triggers:', errSelect);
            }
    
            const triggerIds = triggerRows.map(row => row.trigger_id);
    
            // If there are associated triggers, delete them first
            if (triggerIds.length > 0) {
                conn.query(deleteTriggerSQL, [triggerIds], (errDelete, resultDelete) => {
                    if (errDelete) {
                        return rollbackAndSendError(res, conn, 'Error deleting associated triggers:', errDelete);
                    }
    
                    // Then delete the snapshot
                    conn.query(deleteSnapshotSQL, [moodId], (errSnapshot, resultSnapshot) => {
                        if (errSnapshot) {
                            return rollbackAndSendError(res, conn, 'Error deleting snapshot:', errSnapshot);
                        }
    
                        // Commit the transaction if all delete queries are successful
                        conn.commit((errCommit) => {
                            if (errCommit) {
                                return rollbackAndSendError(res, conn, 'Error committing transaction:', errCommit);
                            }
    
                            console.log(`Deleted snapshot with ID ${moodId} successfully.`);
                            res.status(200).json({ message: `Snapshot with ID ${moodId} deleted successfully` });
                        });
                    });
                });
            } else {
                // If there are no associated triggers, directly delete the snapshot
                conn.query(deleteSnapshotSQL, [moodId], (errSnapshot, resultSnapshot) => {
                    if (errSnapshot) {
                        return rollbackAndSendError(res, conn, 'Error deleting snapshot:', errSnapshot);
                    }
    
                    // Commit the transaction if the delete query is successful
                    conn.commit((errCommit) => {
                        if (errCommit) {
                            return rollbackAndSendError(res, conn, 'Error committing transaction:', errCommit);
                        }
    
                        console.log(`Deleted snapshot with ID ${moodId} successfully.`);
                        res.status(200).json({ message: `Snapshot with ID ${moodId} deleted successfully` });
                    });
                });
            }
        });
    });
});

};




