require('dotenv').config();

const config = require('./config.json');
const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { authenticateToken } = require('./utilities');
const upload = require('./multer');
const uploadVideo = require('./multerVideo');
const path = require('path');
const fs = require('fs');

// Keep the API process alive even if Atlas is temporarily unreachable.
let isDatabaseReady = false;

const mongoUri = process.env.MONGODB_URI || config.ConnectionString;

mongoose.connection.on('connected', () => {
    isDatabaseReady = true;
    console.log('Connected to MongoDB');
});

mongoose.connection.on('disconnected', () => {
    isDatabaseReady = false;
    console.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    isDatabaseReady = false;
    console.error('MongoDB connection error:', err.message || err);
});

mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
})
    .catch((err) => {
        isDatabaseReady = false;
        console.error('Failed to connect to MongoDB:', err.message || err);
    });

const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const TravelStory = require('./models/travelStory.model');
const User = require('./models/user.model');

const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(googleClientId);

const app = express();
app.use(express.json());
app.use(cors({origin:'*'}));

app.use((req, res, next) => {
    if (req.path === '/') {
        return next();
    }

    if (!isDatabaseReady) {
        return res.status(503).json({
            error: true,
            message: 'Database is temporarily unavailable. Please try again in a moment.',
        });
    }

    return next();
});

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '');

/** Case-insensitive email match (existing users may have mixed-case emails in DB). */
const emailMatchQuery = (emailNorm) =>
    User.findOne({ email: emailNorm }).collation({ locale: 'en', strength: 2 });

//create account Api
app.post('/create-account',async (req,res)=>{
    try {
    const {username,email,password}=req.body;
    if(!username || !email || !password){
        return res.status(400).json({error:true,message:"All fields are required"});
    }
    const emailNorm = normalizeEmail(email);
    if (!emailNorm) {
        return res.status(400).json({ error: true, message: 'Valid email is required' });
    }
    if (!process.env.ACCESS_TOKEN_SECRET) {
        console.error('ACCESS_TOKEN_SECRET is missing — set it in backend .env');
        return res.status(500).json({ error: true, message: 'Server configuration error' });
    }
    const isUser=await emailMatchQuery(emailNorm);
    if(isUser){
        return res.status(400).json({error:true,message:"User already exists"});
    }
    const hashedPassword=await bcrypt.hash(password,10);

    const user=new User({
        username,
        email: emailNorm,
        password:hashedPassword
    });
    await user.save();

    const accessToken=jwt.sign({userId:user._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'7d'});

    return res.status(201).json({error:false,user:{username:user.username,email:user.email},message:"Registration successfully",accessToken});
    } catch (err) {
        console.error('create-account error:', err);
        return res.status(500).json({ error: true, message: err.message || 'Registration failed' });
    }
});

//login Api
app.post('/api/login',async (req,res)=>{
    try {
    const {email,password}=req.body;    
    if(!email || !password){
        return res.status(400).json({error:true,message:"All fields are required"});
    }
    if (!process.env.ACCESS_TOKEN_SECRET) {
        console.error('ACCESS_TOKEN_SECRET is missing — set it in backend .env');
        return res.status(500).json({ error: true, message: 'Server configuration error' });
    }
    const emailNorm = normalizeEmail(email);
    const passwordTrimmed = typeof password === 'string' ? password : '';
    const user=await emailMatchQuery(emailNorm);
    if(!user){
        return res.status(400).json({error:true,message:"User not found"});
    }   
    const isPasswordValid=await bcrypt.compare(passwordTrimmed,user.password);
    if(!isPasswordValid){
        return res.status(400).json({error:true,message:"Invalid credentials"});
    }
    const accessToken=jwt.sign({userId:user._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'7d'});
    return res.status(200).json({error:false,user:{username:user.username,email:user.email},message:"Login successfully",accessToken});
    } catch (err) {
        console.error('login error:', err);
        return res.status(500).json({ error: true, message: err.message || 'Login failed' });
    }
});

app.post('/google-auth', async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
        return res.status(400).json({ error: true, message: 'Google ID token is required' });
    }

    try {
        console.log('Verifying Google ID token...');
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: googleClientId || undefined,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            console.error('Invalid token payload');
            return res.status(400).json({ error: true, message: 'Invalid Google token payload' });
        }

        if (payload.email_verified === false) {
            console.warn('Email not verified by Google');
            return res.status(400).json({ error: true, message: 'Google email must be verified' });
        }

        const email = normalizeEmail(payload.email);
        if (!email) {
            return res.status(400).json({ error: true, message: 'Invalid Google account email' });
        }
        const username = payload.name || email.split('@')[0];
        console.log(`Looking up user: ${email}`);
        let user = await emailMatchQuery(email);

        if (!user) {
            console.log(`Creating new user: ${email}`);
            const randomPassword = `${email}-${Date.now()}`;
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            user = new User({ username, email, password: hashedPassword });
            await user.save();
        }

        const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
        return res.status(200).json({ error: false, user: { username: user.username, email: user.email }, message: 'Google login successful', accessToken });
    } catch (err) {
        console.error('Google auth error:', err.message);
        return res.status(400).json({ error: true, message: 'Invalid Google token: ' + err.message });
    }
});

//get user
app.get('/get-user',authenticateToken,async (req,res)=>{
    try {
        const {userId}=req.user;
        const isUser=await User.findOne({_id:userId}).select('-password');
        if(!isUser){
            return res.status(401).json({error:true,message:"User not found"});
        }
        return res.json({error:false,user:isUser,message:"User fetched successfully"});
    } catch(err) {
        return res.status(500).json({error:true,message:err.message});
    }
}); 

//Delete an image from uploads folder
app.delete('/delete-image',async (req,res)=>{
    const {imageUrl}=req.body;
    if(!imageUrl){
        return res.status(400).json({error:true,message:"Image URL is required"});
    }

    try {
    // Extract the filename from the imageUrl
    const filename = path.basename(imageUrl);

    // Define the file path
    const filePath = path.join(__dirname, 'uploads', filename);

    // Check if the file exists
    if (fs.existsSync(filePath)) {
    // Delete the file from the uploads folder
    fs.unlinkSync(filePath);
    res.status(200).json({ message: "Image deleted successfully" }) ;
    } else {
    res.status(200).json({ error: true, message: "Image not found" }) ;
    }
    }catch (error){
    res.status(500).json({ error: true, message: error.message }) ;
    }
});

//Serve static files from uploads directory
app.use('/uploads',express.static(path.join(__dirname,'uploads')));
app.use('/assets',express.static(path.join(__dirname,'assets')));

app.post("/add-travel-story",authenticateToken,async (req,res)=>{
    const {title,story,visitedLocation,isFavorite,imageUrl,videoUrl,visitedDate,entryType,planDetails,planBudget}=req.body;
    const {userId}=req.user;
    if(!title || !story || !imageUrl || !visitedDate){
        return res.status(400).json({error:true,message:"Required fields are missing"});
    }

    const normalizedType = entryType === 'plan' ? 'plan' : 'story';
    const normalizedPlanDetails = normalizedType === 'plan' && planDetails ? planDetails : {};
    const normalizedPlanBudget = normalizedType === 'plan' ? Number(planBudget || 0) : 0;

    //convert visitedDate to Date object
    const visitedDateObj=new Date(visitedDate);
    try{
        const travelStory=new TravelStory({
            title,
            story,
            visitedLocation,
            entryType: normalizedType,
            planDetails: normalizedPlanDetails,
            planBudget: normalizedPlanBudget,
            isFavorite,
            userId,
            imageUrl,
            videoUrl: videoUrl||null,
            visitedDate:visitedDateObj
        });
        await travelStory.save();
        return res.status(201).json({error:false,travelStory,message:"Travel story added successfully"});
    }
    catch(err){
        return res.status(500).json({error:true,message:err.message});
    }
}); 

//get-travel-stories
app.get('/get-all-stories',authenticateToken,async (req,res)=>{
    const {userId}=req.user;
    try{
        const travelStories=await TravelStory.find({userId}).sort({isFavorite:-1});
        return res.status(200).json({error:false,travelStories,message:"Travel stories fetched successfully"});
    }   
    catch(err){
        return res.status(500).json({error:true,message:err.message});
    }   
}); 

//Route image upload
app.post('/image-upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: true, message: 'No image uploaded' });
        }

        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.status(201).json({ imageUrl });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});

//Route video upload
app.post('/video-upload', uploadVideo.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: true, message: 'No video uploaded' });
        }

        const videoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.status(201).json({ videoUrl });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});

//Edit travel story
app.post('/edit-story/:id',authenticateToken,async (req,res)=>{
    const {id}=req.params;
    const {title,story,visitedLocation,isFavorite,imageUrl,videoUrl,visitedDate,entryType,planDetails,planBudget}=req.body;
    const {userId}=req.user;
    if(!title || !story || !imageUrl || !visitedDate){
        return res.status(400).json({error:true,message:"Required fields are missing"});
    }
    try{
        const travelStory=await TravelStory.findOne({_id:id,userId});

        if(!travelStory){
            return res.status(404).json({error:true,message:"Travel story not found"});
        }
        travelStory.title=title;
        travelStory.story=story;
        travelStory.visitedLocation=visitedLocation;
        travelStory.isFavorite=isFavorite;
        travelStory.imageUrl=imageUrl;
        travelStory.videoUrl=videoUrl||null;
        travelStory.visitedDate=new Date(visitedDate);
        if (entryType === 'plan' || entryType === 'story') {
            travelStory.entryType = entryType;
        }
        travelStory.planDetails = entryType === 'plan' && planDetails ? planDetails : {};
        travelStory.planBudget = entryType === 'plan' ? Number(planBudget || 0) : 0;

        const placeholderImageUrl="http://localhost:3000/assets/placeholder-image.png";

        await travelStory.save();
        return res.status(200).json({error:false,travelStory,message:"Travel story updated successfully"});
    }
    catch(err){
        return res.status(500).json({error:true,message:err.message});
    }
});

//Delete travel story
app.delete('/delete-story/:id',authenticateToken,async (req,res)=>{
    const {id}=req.params;
    const {userId}=req.user;
    try{
        const travelStory=await TravelStory.findOneAndDelete({_id:id,userId});
        if(!travelStory){
            return res.status(404).json({error:true,message:"Travel story not found"});
        }

        await travelStory.deleteOne({_id:id,userId});

        const imageUrl=travelStory.imageUrl;
        const filename = path.basename(imageUrl);

        const filePath = path.join(__dirname, 'uploads', filename);

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting image file:', err);
            }
        });
        return res.status(200).json({error:false,message:"Travel story deleted successfully"});
    }
    catch(err){
        return res.status(500).json({error:true,message:err.message});
    }
});

//update isFavorite
app.put('/update-is-favorite/:id',authenticateToken,async (req,res)=>{
    const {id}=req.params;
    const {isFavorite}=req.body;
    const {userId}=req.user;

    try{
        const travelStory=await TravelStory.findOne({_id:id,userId});       
        if(!travelStory){
            return res.status(404).json({error:true,message:"Travel story not found"});
        }
        travelStory.isFavorite=isFavorite;
        await travelStory.save();
        return res.status(200).json({error:false,travelStory,message:"Favorite status updated successfully"});
    }
    catch(err){
        return res.status(500).json({error:true,message:err.message});
    }
});

//update isShared
app.put('/update-is-shared/:id',authenticateToken,async (req,res)=>{
    const {id}=req.params;
    const {isShared}=req.body;
    const {userId}=req.user;

    try{
        const travelStory=await TravelStory.findOne({_id:id,userId});       
        if(!travelStory){
            return res.status(404).json({error:true,message:"Travel story not found"});
        }
        travelStory.isShared=isShared;
        await travelStory.save();
        return res.status(200).json({error:false,travelStory,message:"Share status updated successfully"});
    }
    catch(err){
        return res.status(500).json({error:true,message:err.message});
    }
});

//get-shared-stories (all shared stories from all users)
app.get('/get-shared-stories',authenticateToken,async (req,res)=>{
    try{
        const sharedStories=await TravelStory.find({isShared:true}).sort({isFavorite:-1});
        return res.status(200).json({error:false,sharedStories,message:"Shared stories fetched successfully"});
    }   
    catch(err){
        return res.status(500).json({error:true,message:err.message});
    }   
});

//search travel stories
app.get('/search',authenticateToken,async (req,res)=>{
    const {query}=req.query;
    const {userId}=req.user;

    if(!query || !query.trim()){ 
        return res.status(400).json({error:true,message:"Search query is required"});
    }
    try{
        const searchQuery = query.trim();
        const searchResults=await TravelStory.find({
            userId,
            $or:[
                {title:{$regex:searchQuery,$options:'i'}},
                {story:{$regex:searchQuery,$options:'i'}},
                {visitedLocation:{$elemMatch:{$regex:searchQuery,$options:'i'}}}
            ]
        }).sort({isFavorite:-1});
        return res.status(200).json({error:false,searchResults,message:"Search completed successfully"});
    }
    catch(err){
        return res.status(500).json({error:true,message:err.message});
    }
});

//Filter travel stories by date range
app.get('/filter-by-date',authenticateToken,async (req,res)=>{
    const {startDate,endDate}=req.query;
    const {userId}=req.user;
    try{
        const start=new Date(startDate);
        const end=new Date(endDate);
        const filteredStories=await TravelStory.find({
            userId,
            visitedDate:{$gte:start,$lte:end}
        }).sort({isFavorite:-1});
        return res.status(200).json({error:false,filteredStories,message:"Filter completed successfully"});
    }
    catch(err){
        return res.status(500).json({error:true,message:err.message});
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports=app;

// Global error handlers to provide clearer logs when nodemon restarts
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
    // let the process crash after logging — nodemon will restart
    process.exit(1);
});