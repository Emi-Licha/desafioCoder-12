import express from 'express';
const app = express();
import fs from 'fs';
import handlebars from 'express-handlebars';
const puerto = 8080;
const ruta = "./productos.txt";
import Productos from './api/productos.js';
import http from 'http';
import {Server as Socket} from 'socket.io'
const server = http.Server(app)
const io = new Socket(server)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));
const router = express.Router();
app.use('/api', router);
app.engine("hbs", handlebars({
    extname: ".hbs",
    defaultLayout: "index.hbs"
}));

let productos = new Productos;

io.on('connection', async socket => {
    console.log('Nuevo cliente conectado!');
    /* Envio los mensajes al cliente que se conectó */
    socket.emit('productos', productos.listar());

    /* Escucho los mensajes enviado por el cliente y se los propago a todos */
    socket.on('update', data => {
        io.sockets.emit('productos', productos.listar());
    });
});

router.get('/productos/listar', (req, res) => {

    async function read(ruta) {
        try {
            const archivo = await fs.promises.readFile(ruta);
            res.send(JSON.parse(archivo));
        } catch (err) {
            res.send("No se encontraron productos");
        }
    }
    read(ruta);

});

router.get('/productos/vista', (req, res) => {
    let prods = productos.listar();
    res.render('lista', { productos: prods, hayProductos: prods.length });
})

router.post('/productos', (req, res) => {
   
    
    let producto = req.body;
    
    
    let data = JSON.stringify(productos,null,2);
    fs.writeFileSync(ruta, data, 'utf-8')
    
    res.json(productos.guardar(producto))
})

router.get('/productos/listar/:id', (req,res) =>{
    const id = req.params.id
    const producto = productos.find(producto => producto.id == id)
    if (!producto){
        res.json({'error': 'Producto no encontrado'})
    }
    res.json(producto)
})

router.delete('/productos/:id', (req,res)=>{
    let { id } = req.params
    let producto = productos.borrar(id)
    if(!producto){
        res.send('el producto que usted intenta borrar no existe!')
    }
    res.send(`El producto ha sido eliminado con exito!`);
    
})
router.put('/productos/actualizar/:id', (req,res) => {
    let { id } = req.params
    let producto = req.body
    if(!producto){
        res.send('No se ha encontrado ningun producto con ese id!')
    }
    productos.actualizar(producto,id)
    res.json(producto)
})

app.set('views','./views')
app.set('view engine','hbs')

server.listen(puerto, ()=>{
    console.log(`El servidor esta escuchando en puerto ${puerto}`)
})