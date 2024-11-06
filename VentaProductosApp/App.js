
import React, { useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import api from './api';

export default function App() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [vistaActual, setVistaActual] = useState('inicio');
  const [metodosPago] = useState([
    { id: 1, nombre: 'Tarjeta de Crédito' },
    { id: 2, nombre: 'Transferencia Bancaria' },
    { id: 3, nombre: 'Pago en Efectivo' },
  ]);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState('');
  const [datosCliente, setDatosCliente] = useState({ nombre: '', direccion: '', telefono: '', mail: '' });

  const obtenerProductos = async () => {
    try {
      const response = await api.get('/productos');
      setProductos(response.data);
      setVistaActual('productos');
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };

  const agregarAlCarrito = (producto) => {
    const productoEnCarrito = carrito.find((item) => item.ID_producto === producto.ID_producto);
    if (productoEnCarrito) {
      setCarrito(
        carrito.map((item) =>
          item.ID_producto === producto.ID_producto
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const quitarDelCarrito = (productoId) => {
    setCarrito((prevCarrito) =>
      prevCarrito
        .map((item) =>
          item.ID_producto === productoId
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
  };

  const handlePagar = () => {
    if (!datosCliente.nombre || !datosCliente.direccion || !datosCliente.telefono) {
      Alert.alert('Error', 'Por favor completa todos los campos de información del cliente.');
      return;
    }
    setVistaActual('factura');
  };

  const renderProducto = ({ item }) => (
    <View style={styles.productoContainer}>
      <Image source={{ uri: item.imagen }} style={styles.productoImagen} />
      <Text style={styles.nombre}>{item.nombre}</Text>
      <Text style={styles.descripcion}>{item.descripcion}</Text>
      <Text style={styles.precio}>Precio: ${item.precio}</Text>
      <Text style={styles.stock}>Stock: {item.stock}</Text>
      <Text style={styles.categoria}>Categoría: {item.categoria}</Text>
      <TouchableOpacity
        style={styles.botonAgregar}
        onPress={() => agregarAlCarrito(item)}
      >
        <Text style={styles.botonTexto}>Agregar al Carrito</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCarritoItem = ({ item }) => (
    <View style={styles.carritoContainer}>
      <Image source={{ uri: item.imagen }} style={styles.productoImagen} />
      <Text style={styles.nombre}>{item.nombre}</Text>
      <Text>Cantidad: {item.cantidad}</Text>
      <Text>Subtotal: ${item.precio * item.cantidad}</Text>
      <TouchableOpacity
        style={styles.botonQuitar}
        onPress={() => quitarDelCarrito(item.ID_producto)}
      >
        <Text style={styles.botonTexto}>Quitar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMetodoPago = ({ item }) => (
    <TouchableOpacity
      style={styles.metodoPagoContainer}
      onPress={() => {
        setMetodoSeleccionado(item.nombre);
        setVistaActual('datosCliente');
      }}
    >
      <Text style={styles.metodoPagoTexto}>{item.nombre}</Text>
    </TouchableOpacity>
  );

  const renderFacturaItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.nombre}</Text>
      <Text style={styles.tableCell}>{item.cantidad}</Text>
      <Text style={styles.tableCell}>${item.precio.toFixed(2)}</Text>
      <Text style={styles.tableCell}>${(item.precio * item.cantidad).toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {vistaActual === 'inicio' ? (
        <View style={styles.bienvenidaContainer}>
          <Text style={styles.title}>¡Bienvenido a TecnoLife!</Text>
          <Button title="Ver Productos" onPress={obtenerProductos} />
        </View>
      ) : vistaActual === 'productos' ? (
        <>
          <FlatList
            data={productos}
            renderItem={renderProducto}
            keyExtractor={(item) => item.ID_producto.toString()}
            contentContainerStyle={styles.listaProductos}
          />
          <View style={styles.carritoResumen}>
            <Text style={styles.carritoTotal}>Total: ${calcularTotal()}</Text>
            <Button title="Ver Carrito" onPress={() => setVistaActual('carrito')} />
          </View>
        </>
      ) : vistaActual === 'carrito' ? (
        <>
          <Text style={styles.title}>Carrito de Compras</Text>
          <FlatList
            data={carrito}
            renderItem={renderCarritoItem}
            keyExtractor={(item) => item.ID_producto.toString()}
            contentContainerStyle={styles.listaProductos}
          />
          <Text style={styles.carritoTotal}>Total: ${calcularTotal()}</Text>
          <View style={styles.botonesCarrito}>
            <TouchableOpacity style={styles.botonVolver} onPress={() => setVistaActual('productos')}>
              <Text style={styles.botonTexto}>Volver a Productos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botonPagar} onPress={() => setVistaActual('pago')}>
              <Text style={styles.botonTexto}>Pagar</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : vistaActual === 'pago' ? (
        <View style={styles.pagoContainer}>
          <Text style={styles.title}>Selecciona un Método de Pago</Text>
          <FlatList
            data={metodosPago}
            renderItem={renderMetodoPago}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listaProductos}
          />
        </View>
      ) : vistaActual === 'datosCliente' ? (
        <View style={styles.pagoContainer}>
          <Text style={styles.title}>Ingresa tus Datos</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre Completo"
            value={datosCliente.nombre}
            onChangeText={(text) => setDatosCliente({ ...datosCliente, nombre: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Dirección"
            value={datosCliente.direccion}
            onChangeText={(text) => setDatosCliente({ ...datosCliente, direccion: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            keyboardType="phone-pad"
            value={datosCliente.telefono}
            onChangeText={(text) => setDatosCliente({ ...datosCliente, telefono: text })}
          />
          <TouchableOpacity style={styles.botonPagar} onPress={handlePagar}>
            <Text style={styles.botonTexto}>Generar Factura</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Factura de Compra</Text>
          <View style={styles.headerContainer}>
            <View style={styles.clienteContainer}>
              <Text style={styles.label}>Enviar A:</Text>
              <Text>{datosCliente.nombre}</Text>
              <Text>{datosCliente.direccion}</Text>
              <Text>{datosCliente.telefono}</Text>
              <Text>{datosCliente.mail}</Text>
            </View>
            <View style={styles.facturaInfoContainer}>
              <Text style={styles.label}>Método de Pago:</Text>
              <Text>{metodoSeleccionado}</Text>
              <Text>Fecha Emisión: {new Date().toLocaleDateString()}</Text>
              <Text>Fecha Vencimiento: {new Date().toLocaleDateString()}</Text>
              <Text>Número de Factura: A0001</Text>
            </View>
          </View>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellHeader}>Descripción</Text>
            <Text style={styles.tableCellHeader}>Cantidad</Text>
            <Text style={styles.tableCellHeader}>Precio Unitario</Text>
            <Text style={styles.tableCellHeader}>Total</Text>
          </View>
          <FlatList
            data={carrito}
            renderItem={renderFacturaItem}
            keyExtractor={(item) => item.ID_producto.toString()}
            ListFooterComponent={() => {
              const total = calcularTotal();
              return (
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryRowTotal}>
                    <Text style={styles.summaryTextTotal}>TOTAL A PAGAR:</Text>
                    <Text style={styles.summaryValueTotal}>${total.toFixed(2)}</Text>
                  </View>
                </View>
              );
            }}
          />
          <TouchableOpacity style={styles.botonVolverComercio} onPress={() => {
            setVistaActual('inicio');
            setCarrito([]);
            setDatosCliente({ nombre: '', direccion: '', telefono: '', mail: '' });
          }}>
            <Text style={styles.botonTexto}>Volver al Comercio</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 16,
  },
  clienteContainer: {
    width: '50%',
  },
  facturaInfoContainer: {
    width: '50%',
    alignItems: 'flex-end',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 8,
    marginBottom: 8,
    width: '100%',
    justifyContent: 'space-around',
  },
  tableCellHeader: {
    fontWeight: 'bold',
    width: '25%',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    justifyContent: 'space-around',
  },
  tableCell: {
    width: '25%',
    textAlign: 'center',
  },
  summaryContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#000',
    width: '90%',
  },
  summaryTextTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  botonVolverComercio: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    marginVertical: 20,
    width: '60%',
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  bienvenidaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  listaProductos: {
    paddingHorizontal: 16,
  },
  productoContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  pagoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metodoPagoContainer: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 5,
    marginVertical: 8,
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  metodoPagoTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 5,
    borderColor: '#ccc',
  },
  // Resto de los estilos aquí

  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  bienvenidaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagoContainer: {
    flex: 1,
    justifyContent: 'center', // Centra la selección de métodos de pago verticalmente
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  listaProductos: {
    paddingHorizontal: 16,
  },
  productoContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  productoImagen: {
    width: '100%',
    height: 150,
    borderRadius: 5,
    marginBottom: 10,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  descripcion: {
    fontSize: 14,
    color: '#555',
  },
  precio: {
    fontSize: 16,
    color: '#333',
  },
  stock: {
    fontSize: 14,
    color: '#888',
  },
  categoria: {
    fontSize: 14,
    color: '#888',
  },
  botonAgregar: {
    marginTop: 10,
    backgroundColor: '#4CAF50', // Verde atractivo para el botón
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  botonQuitar: {
    marginTop: 10,
    backgroundColor: '#F44336', // Rojo atractivo para el botón
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  carritoResumen: {
    padding: 20,
    alignItems: 'center',
  },
  carritoTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  botonesCarrito: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  botonPagar: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '45%',
  },
  botonVolver: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '45%',
  },
  metodoPagoContainer: {
    backgroundColor: '#3F51B5',
    padding: 15,
    borderRadius: 5,
    marginVertical: 8,
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  metodoPagoTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 5,
    borderColor: '#ccc',
  },
  listaFactura: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  facturaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  facturaCantidad: {
    width: '15%',
    textAlign: 'center',
  },
  facturaDescripcion: {
    width: '45%',
  },
  facturaPrecio: {
    width: '20%',
    textAlign: 'center',
  },
  facturaTotal: {
    width: '20%',
    textAlign: 'center',
  },
  facturaTotalTexto: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  botonVolverComercio: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    marginVertical: 20,
    width: '60%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  carritoContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
  },
});
