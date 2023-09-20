const express = require('express');
const http = require('http');
const app = express();

const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const Contenedor = require('./contenedor')

const server = http.createServer(app);
const io = new Server(server);

const contenedor = new Contenedor("productos.json");

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

app.set('views', './src/views');
app.set('view engine', 'hbs');

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main.hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials'
}))

io.on('connection', async(socket) => {
    console.log('🟢 Usuario conectado')
    
    const productos = await contenedor.getAll();
    socket.emit('bienvenidoLista', productos );
    
    socket.on('productoAgregado', async(data) => {
        console.log('Alguien presionó el click')
        await contenedor.save(data);
        
        const productos = await contenedor.getAll();
        io.sockets.emit('listaActualizada', productos);
    })
    
    socket.on('disconnect', () => {
        console.log('🔴 Usuario desconectado')
    })
})

app.get('/productos', async(req, res) => {
    const productos = await contenedor.getAll();
    res.render('pages/list', {productos})
})

app.post('/productos', async(req,res) => {
    const {body} = req;
    await contenedor.save(body);
    res.redirect('/');
})

app.get('/', (req,res) => {
    res.render('pages/form', {})
})

app.get('/realtimeproducts', (req, res) => {
    res.render('pages/realTimeProducts');
  ;

  res.render('pages/realTimeProducts', { productos });
});


const PORT = 3000;
server.listen(PORT, () => {
    console.log(` >>>>> 🚀 Server started at http://localhost:${PORT}`)
})

server.on('error', (err) => console.log(err))
