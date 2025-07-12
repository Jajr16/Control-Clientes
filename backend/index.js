import app from './app.js';
import { connectDB } from './config/db.js'; 
import { createTableDireccion } from './models/direccionModel.js'
import { createTableDatoRegistral } from './models/datoRegistralModel.js'
import { createTablePropietario } from './models/propietarioModel.js'
import { createTableEmpresa } from './models/empresasModel.js'
import { createTableInmueble } from './models/inmuebleModel.js'
import { createTableProveedor } from './models/proveedorModel.js'
import { createTableSeguro } from './models/seguroModel.js'
import { createTableHipoteca } from './models/hipotecaModel.js'
import { createTableEmpresaInmueble } from './models/empresainmuebleModel.js'
import { createTableInmuebleProveedor } from './models/inmuebleproveedorModel.js'
import { createTableInmuebleSeguro } from './models/inmuebleseguroModel.js'
import { createTableInmuebleHipoteca } from './models/inmueblehipotecaModel.js'
import { createTableAdeudo } from './models/adeudoModel.js';

const PORT = process.env.PORT || 3000;

const iniciarServidor = async () => {
    try {
        // Conectar a la base de datos
        await connectDB();

        // CREAR TABLAS
        await createTableDireccion();
        await createTableDatoRegistral();
        await createTablePropietario();
        await createTableEmpresa();
        await createTableInmueble();
        await createTableProveedor();
        await createTableSeguro();
        await createTableHipoteca();
        await createTableEmpresaInmueble();
        await createTableInmuebleProveedor();
        await createTableInmuebleSeguro();
        await createTableInmuebleHipoteca();
        await createTableAdeudo();

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error al iniciar el servidor:", error);
        process.exit(1); 
    }
};

iniciarServidor();
