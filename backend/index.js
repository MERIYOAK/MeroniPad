// index.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { config as configDotenv } from "dotenv";
import bcrypt from 'bcrypt';


configDotenv();

const app = express();
const port = process.env.PORT;

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("Error connecting to MongoDB:", err);
});

const mongoStore = new MongoStore({
    mongoUrl: process.env.MONGODB_URL,
    collection: 'sessions',
    ttl: process.env.SESSION_TTL,
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore,
    cookie: {
        maxAge: process.env.SESSION_TTL * 1000,
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
    },
}));

const userSchema = new mongoose.Schema({
    firstName: String,
    middleName: String,
    lastName: String,
    username: String,
    email: String,
    password: String,
});

const User = new mongoose.model("User", userSchema);

const noteSchema = new mongoose.Schema({
    title: String,
    content: String,
    userId: String,
    createdAt: Date
});

const Note = new mongoose.model("Note", noteSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: 'GET,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
}));

const authenticate = async (req, res, next) => {
    try {
        const sessionId = req.headers.sessionid;

        mongoStore.get(sessionId, async (err, session) => {
            if (err) {
                console.error('Error fetching session from database:', err);
                return res.status(500).send('Internal Server Error');
            }

            if (session && session.isAuthenticated) {
                console.log('Authenticated');
                next();
            } else {
                console.log('Not authenticated');
                res.redirect('/');
            }
        });
    } catch (error) {
        console.error('Error checking authentication:', error);
        res.status(500).send('Internal Server Error');
    }
};

app.post('/sign_up', async (req, res) => {
    try {
        const { firstName, middleName, lastName, username, password } = req.body;
        const userEmail = `${username.toLowerCase()}@meroni.com`;

        const userExists = await User.findOne({ email: userEmail });

        if (userExists) {
            res.json({ error: true, message: 'User already exists' });
            console.log('User Name already exists');
        }

        const hash = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));

        const newUser = new User({
            firstName,
            middleName,
            lastName,
            username,
            password: hash,
            email: userEmail
        });

        await newUser.save();

        //Set session values
        req.session.isAuthenticated = true;
        req.session.userId = newUser._id.toString();

        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    reject(err);
                    console.error('Error saving session:', err);
                } else {
                    resolve();
                    console.log('Session saved successfully');
                }
            });
        });

        res.json({
            success: true,
            message: 'User created successfully',
            sessionId: req.sessionID,
            isAuthenticated: req.session.isAuthenticated,
            id: req.session.userId,
            firstName: newUser.firstName,
            middleName: newUser.middleName,
            lastName: newUser.lastName,
            username: newUser.username,
            email: newUser.email
        });
        console.log('User created successfully');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user',
        });
    }
});

app.post('/login', async (req, res) => {
    try {
        const emailOrUsername = req.body.emailOrUsername;
        const password = req.body.password;

        const user = await User.findOne(
            { $or: [{ email: emailOrUsername }, { username: emailOrUsername }] }
        );

        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {

                //Set session values
                req.session.isAuthenticated = true;
                req.session.userId = user._id.toString();

                // Save the session
                await new Promise((resolve, reject) => {
                    req.session.save((err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });

                res.json({
                    success: true,
                    message: 'User logged in successfully',
                    sessionId: req.sessionID,
                    isAuthenticated: req.session.isAuthenticated,
                    id: req.session.userId,
                    firstName: user.firstName,
                    middleName: user.middleName,
                    lastName: user.lastName,
                    email: user.email,
                    username: user.username
                });

                console.log('User logged in successfully');
            } else {
                res.json({ error: true, message: 'Incorrect password' });
            }
        } else {
            res.json({ error: true, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in user',
        });
    }
})

// To destroy a session (log out)
app.post('/logout', authenticate, async (req, res) => {
    try {
        const sessionId = req.headers.sessionid;
        // Destroy the session
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                throw new Error('Error logging out user');
            }

            // Remove the session from the MongoDB store
            mongoStore.destroy(sessionId, (destroyError) => {
                if (destroyError) {
                    console.error('Error destroying session in MongoDB:', destroyError);
                    throw new Error('Error logging out user');
                }

                res.json({ success: true, message: 'User logged out successfully' });
                console.log('User logged out successfully');
            });
        });
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging out user',
        });
    }
});

app.post('/add-note', authenticate, async (req, res) => {
    try {
        const { title, content, userId } = req.body;
        const newNote = new Note({ title, content, userId, createdAt: new Date() });

        await newNote.save();
        res.json({ success: true, message: 'Note added successfully' });
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding note',
        });
    }
});

app.get('/notes', authenticate, async (req, res) => {
    try {
        const userId = req.query.userId;
        const notes = await Note.find({ userId }).sort({ createdAt: -1 });

        res.json({ success: true, notes });
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notes',
        });
    }
});

app.delete('/delete-note/:id', authenticate, async (req, res) => {
    try {
        const id = req.params.id;
        await Note.findByIdAndDelete(id);

        res.json({ success: true, message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting note',
        });
    }
});

app.listen(port, () => {
    console.log('Server is running at port', port);
});
