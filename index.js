const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

// Middleware para permitir la lectura del JSON
app.use(express.json());

// Función para leer el archivo JSON
const readData = () => {
  const data = fs.readFileSync("BD.json", "utf-8");
  return JSON.parse(data);
};

// Rutas GET

// 1. Obtener todos los clientes
app.get("/clientes", (req, res) => {
  const data = readData();
  res.json(data.clientes);
});

// 2. Obtener todos los productos
app.get("/productos", (req, res) => {
  const data = readData();
  res.json(data.productos);
});

// 3. Obtener un pedido específico por ID
app.get("/pedidos/:id", (req, res) => {
  const data = readData();
  const pedido = data.pedidos.find(p => p.ID_pedido === parseInt(req.params.id));
  if (pedido) {
    res.json(pedido);
  } else {
    res.status(404).json({ message: "Pedido no encontrado" });
  }
});

// 4. Obtener todos los pagos realizados
app.get("/pagos", (req, res) => {
  const data = readData();
  res.json(data.pagos);
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
