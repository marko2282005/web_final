const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

// MongoDB connection
const mongoUrl = 'mongodb://localhost:27017/web_final';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  age: Number,
  country: String,
  gender: String,
  phoneNumber: String,
  email: { type: String, required: true }, // Добавьте поле для адреса электронной почты
  verified: {
    type: Boolean,
    default: false
  }
});

const User = mongoose.model('User', userSchema);

// Portfolio Item schema
const portfolioItemSchema = new mongoose.Schema({
  carouselImages: {
    type: [String],
    required: true
  },
  names: [{
    locale: {
      type: String,
      default: 'en'
    },
    name: {
      type: String,
      required: true
    }
  }],
  descriptions: [{
    locale: {
      type: String,
      default: 'en'
    },
    description: {
      type: String,
      required: true
    }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null }
});

const PortfolioItem = mongoose.model('PortfolioItem', portfolioItemSchema);

// Create admin user
const createAdminUser = async () => {
  const adminUsername = 'marko';
  const adminPassword = 'admin123';
  const adminEmail = 'admin@example.com'; // Добавляем email для администратора

  try {
    const existingAdmin = await User.findOne({ username: adminUsername });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = new User({
      username: adminUsername,
      password: hashedPassword,
      email: adminEmail, // Добавляем email
      role: "admin"
    });

    await adminUser.save();
    console.log('Admin user created successfully.');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};


// Fetch random images from Unsplash using dynamic import
const fetchRandomImagesFromUnsplash = async (count = 3) => {
  try {
    const fetch = await import('node-fetch');
    const response = await fetch.default(`https://api.unsplash.com/photos/random/?client_id=8TiXpsDTdLJB8bvWAXHi6astlTrD9G89VW5Ir17_q0Q&count=${count}`);
    const data = await response.json();
    return data.map(photo => photo.urls.regular);
  } catch (error) {
    console.error('Error fetching images from Unsplash:', error);
    throw error;
  }
};

// Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

const accountSid = 'ACa7778f46070fce44c43019c39319a12f';
const authToken = 'f73606a2e2ad82491628ef3541e642ba';
const twilioClient = twilio(accountSid, authToken);

// Обработчик POST запроса на регистрацию пользователя
// Обработчик POST запроса на регистрацию пользователя
// Обработчик POST запроса на регистрацию пользователя
// Обработчик POST запроса на регистрацию пользователя

app.post('/register', async (req, res) => {
  try {
    const confirmationCode = Math.floor(1000 + Math.random() * 9000);
    const message = `Your confirmation code is: ${confirmationCode}`;
    const phoneNumber = req.body.phoneNumber;
    const email = req.body.email;
    const subject = 'Welcome to Our Website';
    const emailMessage = `Hello ${req.body.firstName},\n\nWelcome to our website! We are excited to have you on board.\n\nBest regards,\nThe Team`;

    console.log("Sending message to: ", phoneNumber);
    console.log("Message: ", message);

    await twilioClient.messages.create({
      body: message,
      from: '+17342924592',
      to: phoneNumber
    });

    console.log("Message sent successfully");

    // Хэшируем пароль перед сохранением в базу данных
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Создаем нового пользователя с хэшированным паролем
    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      age: req.body.age,
      country: req.body.country,
      gender: req.body.gender,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      verified: true // Пользователь не подтвержден до ввода кода
    });

    // Сохраняем пользователя в базе данных
    await newUser.save();

    // Отправляем приветственное сообщение на почту
    await sendEmail(email, subject, emailMessage);

    // Перенаправляем на страницу /verify с передачей confirmationCode
    res.render('verify', { confirmationCode });
  } catch (error) {
    console.error("Error processing registration:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const transporter = nodemailer.createTransport({
  service: 'mail.ru',
  auth: {
    user: 'markulanm@inbox.ru', // Ваш адрес электронной почты
    pass: 'pweAXcaP7KkzpSY3rRL7' // Ваш пароль от почты
  }
});

// Функция для отправки письма
const sendEmail = async (to, subject, text) => {
  try {
    // Отправляем письмо
    await transporter.sendMail({
      from: 'markulanm@inbox.ru',
      to: to,
      subject: subject,
      text: text
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};








// Маршрут для ввода кода подтверждения
// Маршрут для ввода кода подтверждения
// Маршрут для ввода кода подтверждения
// Маршрут для ввода кода подтверждения
app.get('/verify', (req, res) => {
  const confirmationCode = req.query.confirmationCode; // Получаем confirmationCode из запроса
  res.render('verify', { confirmationCode });
});


app.post('/verify', async (req, res) => {
  const enteredCode = req.body.code;
  const confirmationCode = req.body.confirmationCode;

  if (enteredCode === confirmationCode) {
    try {
      // Проверяем наличие username и password

      // Создаем нового пользователя

      // Перенаправляем на страницу /login
      res.redirect('/login');
    } catch (error) {
      console.error("Error saving user:", error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(400).json({ error: 'Invalid confirmation code' });
  }
});









app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    if (username === 'admin' && password === 'admin123') {
      const items = []; // Empty array since admin doesn't have portfolio items
      return res.redirect('/admin');
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('Cannot find user');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    
    if (validPassword) {
      if (user.role === 'admin') {
        return res.redirect('/admin');
      } else {
        return res.redirect(`/main?username=${user.username}`);
      }
    } else {
      res.send('Incorrect password');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Error logging in');
  }
});

const fetchNewsByCountry = async (apiKey, country) => {
  try {
    const url = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.articles.slice(0, 5); // Обрезаем до 5 новостей
  } catch (error) {
    console.error('Error fetching news data:', error);
    throw error;
  }
};

app.get('/main', async (req, res) => {
  try {
    let newsData = [];
    const { country } = req.query;

    // Проверяем, был ли введен параметр страны в запросе
    if (country) {
      // Если страна указана, ищем новости для этой страны
      const apiKey = 'ee72350e04984cdc9d30cad2854838a0'; // Замените на ваш API ключ
      const fetch = await import('node-fetch');
      newsData = await fetch.default(`https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => data.articles.slice(0, 5))
        .catch(error => {
          console.error('Error fetching news data:', error);
          throw error;
        });
    } else {
      // Если страна не указана, показываем стандартные новости из "us"
      const apiKey = 'ee72350e04984cdc9d30cad2854838a0'; // Замените на ваш API ключ
      const fetch = await import('node-fetch');
      newsData = await fetch.default(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => data.articles.slice(0, 5))
        .catch(error => {
          console.error('Error fetching news data:', error);
          throw error;
        });
    }

    const items = await PortfolioItem.find({ deletedAt: null }).sort({ createdAt: -1 });
    const { username } = req.query;
    res.render('main', { username, newsData, items });
  } catch (error) {
    console.error('Error fetching data for main page:', error);
    res.status(500).send('Error fetching data for main page');
  }
});

app.get('/admin', async (req, res) => {
  try {
    const items = await PortfolioItem.find({ deletedAt: null }).sort({ createdAt: -1 });
    const username = 'admin'; // Hardcoded for testing
    res.render('admin', { username, items });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error fetching portfolio items');
  }
});

app.get('/admin/add', async (req, res) => {
  try {
    res.render('admin/add');
  } catch (error) {
    console.error('Error rendering add portfolio item page:', error);
    res.status(500).send('Error rendering add portfolio item page');
  }
});

app.post('/admin/add', async (req, res) => {
  try {
    const { image1, image2, image3, name_en, description_en } = req.body;

    if (!image1 || !image2 || !image3 || !name_en || !description_en) {
      return res.status(400).send('Missing required fields');
    }

    const newItem = new PortfolioItem({
      carouselImages: [image1, image2, image3],
      names: [{ locale: 'en', name: name_en }],
      descriptions: [{ locale: 'en', description: description_en }]
    });

    await newItem.save();

    res.redirect('/admin');
  } catch (error) {
    console.error('Error adding portfolio item:', error);
    res.status(500).send('Error adding portfolio item');
  }
});

app.get('/admin/edit/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const item = await PortfolioItem.findById(id);
    if (!item) {
      return res.status(404).send('Portfolio item not found');
    }
    res.render('edit-item', { item });
  } catch (error) {
    console.error('Error fetching portfolio item:', error);
    res.status(500).send('Error fetching portfolio item');
  }
});

// Route to handle updating an existing portfolio item
// Route to handle updating an existing portfolio item with PUT
app.put('/admin/edit/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { carouselImages, name_en, description_en } = req.body;
    
    const updatedItem = await PortfolioItem.findByIdAndUpdate(id, {
      carouselImages: carouselImages,
      names: [{ locale: 'en', name: name_en }],
      descriptions: [{ locale: 'en', description: description_en }],
      updatedAt: new Date()
    });

    if (!updatedItem) {
      return res.status(404).send('Portfolio item not found');
    }

    console.log("Item updated:", updatedItem);
    res.redirect('/admin');
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    res.status(500).send('Error updating portfolio item');
  }
});

// Delete portfolio item
app.delete('/admin/delete/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const deletedItem = await PortfolioItem.findByIdAndDelete(itemId);
    
    if (!deletedItem) {
      console.log("Item not found:", itemId);
      return res.status(404).send('Item not found');
    }

    console.log("Item deleted:", deletedItem);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    res.status(500).json({ error: 'Error deleting portfolio item' });
  }
});

// Fetch Unsplash images for admin
app.get('/admin/unsplash', async (req, res) => {
  try {
    const images = await fetchRandomImagesFromUnsplash();
    res.json(images);
  } catch (error) {
    console.error('Error fetching Unsplash images:', error);
    res.status(500).send('Error fetching Unsplash images');
  }
});

app.listen(3000, async () => {
  console.log('Server is running on http://localhost:3000');

  // Create admin user if not exists
  await createAdminUser();
});
