const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conectar a MongoDB
mongoose.connect('TU_CADENA_DE_CONEXIÓN_A_MONGODB', { useNewUrlParser: true, useUnifiedTopology: true });

// Crear esquema y modelo de usuario
const userSchema = new mongoose.Schema({
    name: String,
    id: String,
    email: String,
    username: { type: String, unique: true },
    password: String,
});

const User = mongoose.model('User', userSchema);

// Registro de usuario
app.post('/register', async (req, res) => {
    const { name, id, email, username, password } = req.body;
    
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({ name, id, email, username, password: hashedPassword });
    
    try {
        await newUser.save();
        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (error) {
        res.status(400).json({ message: 'Error al registrar el usuario.' });
    }
});

// Inicio de sesión
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({ message: 'Usuario o contraseña incorrectos.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Usuario o contraseña incorrectos.' });
    }

    const token = jwt.sign({ id: user._id }, 'TU_SECRETO', { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, name: user.name, username: user.username } });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
