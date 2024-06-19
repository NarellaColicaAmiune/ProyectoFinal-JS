let productos = [];

fetch('productos.json')
    .then(response => response.json())
    .then(data => {
        productos = data;
        mostrarProductos();
    })
    .catch(err => console.error(err));

function mostrarProductos() {
    const productosDiv = document.getElementById('productos');
    if (!productosDiv) return;
    productosDiv.innerHTML = '';
    productos.forEach(({ img, nombre, descripcion, precio }, index) => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('product');
        productoDiv.innerHTML = `
            <img src="${img}" alt="${nombre}">
            <h2 class="product-nombre">${nombre}</h2>
            <p>${descripcion}</p>
            <p><strong>$${precio}</strong></p>
            <input type="number" id="cantidad${index}" placeholder="Cantidad" min="1">
            <button onclick="agregarCarrito(${index})">Agregar al Carrito</button>
        `;
        productosDiv.appendChild(productoDiv);
    });
}

// Filtrar por precio
function filtrarPrecio(orden) {
    productos.sort((a, b) => {
        if (orden === 'ascendente') {
            return a.precio - b.precio;
        } else if (orden === 'descendente') {
            return b.precio - a.precio;
        }
    });
    mostrarProductos();
}

// Recuperar el carrito desde localStorage y convertirlo a un array
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Recuperar el total de la compra desde localStorage y convertirlo a un número decimal
let totalCompra = parseFloat(localStorage.getItem('totalCompra')) || 0;

function mostrarCarrito() {
    const carritoDiv = document.getElementById('carrito');
    if (!carritoDiv) return;
    carritoDiv.innerHTML = '';
    carrito.forEach(({ nombre, precio, cantidad, subTotal }, index) => {
        const carritoItemDiv = document.createElement('div');
        carritoItemDiv.classList.add('cart-item');
        carritoItemDiv.innerHTML = `
            <p>Producto: ${nombre}</p>
            <p>Precio: $${precio}</p>
            <p>Cantidad: ${cantidad}</p>
            <p>Subtotal: $${subTotal}</p>
            <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
        `;
        carritoDiv.appendChild(carritoItemDiv);
    });

    const totalDiv = document.getElementById('total');
    if (totalDiv) {
        totalDiv.innerText = `Total: $${totalCompra}`;
    }
}


function agregarCarrito(index) {
    const cantidadInput = document.getElementById(`cantidad${index}`);
    if (!cantidadInput) return;
    const cantidad = parseInt(cantidadInput.value);
    if (isNaN(cantidad) || cantidad <= 0) {
        return;
    }
    
    const { nombre, precio } = productos[index];
    const subTotal = precio * cantidad;

    const productoExistente = carrito.find(item => item.nombre === nombre);
    carrito = productoExistente 
        ? carrito.map(item => item.nombre === nombre 
            ? { ...item, cantidad: item.cantidad + cantidad, subTotal: item.subTotal + subTotal } 
            : item) 
        : [...carrito, { nombre, precio, cantidad, subTotal }];
    
    totalCompra += subTotal;

    // Guardar en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
    localStorage.setItem('totalCompra', totalCompra.toString());

    mostrarCarrito();

    Toastify({
        text: `${nombre} agregado al carrito`,
        className: "info",
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        }
    }).showToast();
}


function eliminarDelCarrito(index) {
    totalCompra -= carrito[index].subTotal;

    carrito = [...carrito.slice(0, index), ...carrito.slice(index + 1)];

    // Guardar en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
    localStorage.setItem('totalCompra', totalCompra.toString());

    mostrarCarrito();
}

function finalizarCompra() {
    if (carrito.length === 0) {
        return;
    }

    // Mensaje de WhatsApp con los detalles del carrito y el total
    let mensaje = 'Hola, me gustaría realizar la siguiente compra:\n\n';
    carrito.forEach(({ nombre, cantidad, subTotal }) => {
        mensaje += `Producto: ${nombre}\nCantidad: ${cantidad}\nSubtotal: $${subTotal}\n\n`;
    });
    mensaje += `Total: $${totalCompra}\n\n`;
    
    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);

    // Redirigir a WhatsApp
    const numeroTelefono = '+543835402508';
    const url = `https://wa.me/${numeroTelefono}?text=${mensajeCodificado}`;
    window.location.href = url;

    // Vaciar carrito y total
    vaciarCarrito();
}

function vaciarCarrito() {
    carrito = [];
    totalCompra = 0;
    localStorage.removeItem('carrito');
    localStorage.removeItem('totalCompra');
    mostrarCarrito();

    Toastify({
        text: "Se ha vaciado el carrito",
        className: "info",
        style: {
            background: "linear-gradient(to right, #c41212, #c9833d)",
        }
    }).showToast();
}

document.getElementById('filtrarAscendente').addEventListener('click', () => filtrarPrecio('ascendente'));
document.getElementById('filtrarDescendente').addEventListener('click', () => filtrarPrecio('descendente'));
document.getElementById('finalizarCompra').addEventListener('click', finalizarCompra);
document.getElementById('vaciarCarrito').addEventListener('click', vaciarCarrito);

// Inicializar
mostrarProductos();
mostrarCarrito();