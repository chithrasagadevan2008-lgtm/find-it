const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();


// MIDDLEWARE
app.use(cors());
app.use(express.json());


// ROUTES
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);


// TEST ROUTE
app.get('/', (req, res) => {
    res.send('Lost and Found API Running...');
});


// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)

.then(() => {

    console.log('✅ MongoDB Connected Successfully');

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });

})

.catch((error) => {

    console.log('❌ MongoDB Connection Error:', error);

});