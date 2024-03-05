const conn = require('./../utils/dbconn');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const { generateApiKey } = require('./../middleware/apiKeyGenerator'); 

exports.getAPIkey = (req, res) => {
    const apiKey = generateApiKey();
    res.json({ apiKey });
};



exports.getRecord = (req, res) => {
    const { userid } = req.params;

    if (userid) {
        const getuserSQL = `SELECT user.firstname, user.email_address FROM user WHERE user.user_id = '${userid}'`;

        conn.query(getuserSQL, (err, rows) => {
            if (err) {
                console.error('Error fetching user information:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const { firstname, email_address } = rows[0];

            // Return user info
            const userinfo = { firstname, email_address };
            res.status(200).json(userinfo);
        });
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

exports.postLogin = (req, res) => {
    console.log('Request Body:', req.body);
    const { email, password } = req.body;
    const checkuserSQL = 'SELECT user_id, password FROM user WHERE email_address = ?';
    const vals = [email];

    error = '';

    conn.query(checkuserSQL, vals, (err, rows) => {
        if (err) {
            console.error('Error checking user:', err);
            errMessage = 'Internal Server Error';
            return res.status(500).json({ success: false, errMessage});
        }

        if (rows.length === 0) {
            console.log('No user found with email:', email);
            // Return an error message indicating invalid email or password
            errMessage = 'Invalid email or password';
            return res.status(401).json({ success: false, errMessage });
        }

        const hashedPassword = String(rows[0].password); // Convert to string

        bcrypt.compare(String(password), hashedPassword, (compareErr, result) => {
            if (compareErr) {
                console.error('Error comparing passwords:', compareErr);
                errMessage = 'Internal Server Error';
                return res.status(500).json({ success: false, errMessage });
            }

            if (result) {
                // Passwords match, return user ID as response
                const userid = rows[0].user_id;
                return res.status(200).json({ success: true, message: 'User successfully logged in', userid });
            } else {
                console.log('Incorrect password for user:', email);
                // Return an error message indicating invalid email or password
                errMessage = 'Invalid email or password. Please try again';
                return res.status(401).json({ success: false, errMessage });
            }
        });
    });
};



exports.postNewSnapshot = (req, res) => {
    console.log('Request body:', req.body); // Log the request body
    const {
        enjoymentLevel,
        sadnessLevel,
        angerLevel,
        contemptLevel,
        disgustLevel,
        fearLevel,
        surpriseLevel,
        datetimePicker,
        selectedContextualTriggers,
    } = req.body;

    const { userid } = req.params;

    const insertSnapshotSQL = 'INSERT INTO snapshot (enjoyment_level, sadness_level, anger_level, contempt_level, disgust_level, fear_level, surprise_level, date_time, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const insertSnapshotTriggerSQL = 'INSERT INTO snapshot_trigger (snapshot_id, trigger_id) VALUES (?, ?)';

    const snapshotValues = [enjoymentLevel, sadnessLevel, angerLevel, contemptLevel, disgustLevel, fearLevel, surpriseLevel, datetimePicker, userid];

    conn.query(insertSnapshotSQL, snapshotValues, (err, result) => {
        if (err) {
            console.error('Error inserting snapshot:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const snapshotId = result.insertId;

        if (!selectedContextualTriggers || selectedContextualTriggers.length === 0) {
            // No triggers selected, proceed without inserting triggers
            return res.status(200).json({ status: 'success', message: 'Snapshot added successfully' });
        }

        // Convert to an array if not already
        const triggersToInsert = Array.isArray(selectedContextualTriggers) ? selectedContextualTriggers : [selectedContextualTriggers];

        // Insert triggers association with the snapshot
        const insertTriggers = (triggers, callback) => {
            if (triggers.length === 0) {
                callback(); // Call the callback when all triggers are processed
            } else {
                const triggerName = triggers.shift();

                // Retrieve the trigger id from the contextual_trigger table
                const getTriggerIdSQL = 'SELECT trigger_id FROM contextual_trigger WHERE trigger_name = ?';

                conn.query(getTriggerIdSQL, [triggerName], (err, rows) => {
                    if (err) {
                        console.error('Error getting trigger id:', err);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }

                    if (rows.length === 0) {
                        console.error('Trigger not found:', triggerName);
                        // Continue without failing the insertion
                        insertTriggers(triggers, callback);
                    } else {
                        const triggerId = rows[0].trigger_id;
                        conn.query(insertSnapshotTriggerSQL, [snapshotId, triggerId], (err) => {
                            if (err) {
                                console.error('Error inserting snapshot trigger:', err);
                                return res.status(500).json({ error: 'Internal Server Error' });
                            }
                            insertTriggers(triggers, callback); // Continue processing triggers
                        });
                    }
                });
            }
        };

        insertTriggers(triggersToInsert, () => {
            // No need to wait for triggers processing completion to respond
            res.status(200).json({ status: 'success', message: 'Snapshot added successfully' });
        });
    });
};




exports.getHistory = (req, res) => {
    const { userid } = req.params;
    
    if (!userid) {
        return res.status(400).json({ error: 'User ID is required' });
    }

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
            user.user_id = ?
        GROUP BY 
            snapshot.snapshot_id
        ORDER BY 
            snapshot.date_time DESC`;

    conn.query(selectSQL, [userid], (err, rows) => {
        if (err) {
            res.status(500).json({
                status: 'failure',
                message: err
            });
        } else {
            res.status(200).json({
                status: 'success',
                message: `${rows.length} records retrieved`,
                result: rows
            });
        }
    });
};

exports.getDashboard = (req, res) => {
    const { userid } = req.params;
    console.log(`User ID from request params: ${userid}`);

    if (userid) {
        const getuserSQL = `SELECT user.firstname FROM user WHERE user.user_id = '${userid}'`;

        conn.query(getuserSQL, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log(rows);
                if (rows.length > 0) {
                    const username = rows[0].firstname;
                    const userinfo = { firstname: username };

                    // Return user information as JSON
                    res.status(200).json({ firstname: userinfo.firstname });
                } else {
                    res.status(404).json({ error: 'User not found.' });
                }
            }
        });
    } else {
        // Return error response if the user ID is missing
        res.status(400).json({ error: 'User ID is missing in the request parameters.' });
    }
};


//Getting emotional values for emotions chart
exports.getemotionalValues = (req, res) => {
    const { userid } = req.params;
    console.log(`User data from session:  ${userid}`);


    
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
        snapshot.user_id = ?
    GROUP BY 
        snapshot.snapshot_id
    ORDER BY 
        snapshot.date_time DESC`;


    conn.query(selectSQL, [userid], (err, rows) => {
        if (err) {
            console.error('Error fetching emotional values:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const data = rows.map(row => {
            const emotions = ['enjoyment', 'sadness', 'anger', 'contempt', 'disgust', 'fear', 'surprise'];
        
            const emotionData = emotions.reduce((acc, emotion) => {
                acc[emotion] = row[`${emotion}_level`];
                return acc;
            }, {});
        
            return {
                date_time: row.date_time, // Include the date_time property
                ...emotionData,
                contextual_triggers: row.contextual_triggers || null,
            };
        });
        
        
        res.json(data);
    }); 
};

