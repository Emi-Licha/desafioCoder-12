import express from 'express';
const app = express();
import fs from 'fs';
import pug from 'pug';
const puerto = 8080;
const ruta = "./productos.txt";
import Productos from './api/productos.js';
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));
const router = express.Router();
app.use('/api', router);

let productos = new Productos;


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
    
    res.render('main.ejs', productos);
})

router.post('/productos', (req, res) => {
    let { name, price, thumbnail} = req.body
    let id = productos.length + 1;
    let producto = {
        id,
        name,
        price,
        thumbnail
       
    }
    
    productos.guardar(producto)
    let data = JSON.stringify(productos,null,2);
    fs.writeFileSync(ruta, data, 'utf-8')
    
    res.send(producto)
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

app.set('views','./views/partials')
app.set('view engine','ejs')

app.listen(puerto, ()=>{
    console.log(`El servidor esta escuchando en puerto ${puerto}`)
})