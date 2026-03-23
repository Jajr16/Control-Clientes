import clienteRouter from './modules/cliente/cliente.routes.js';
import adeudoRoutes from './modules/adeudo/adeudo.routes.js';
import homeRoutes from './modules/home/home.routes.js';
import inmuebleRoutes from './modules/inmueble/inmueble.routes.js'
import swaggerRouter from './config/swagger.js';
// import empresasRoutes from './empresasRoutes.js';
// import direccionRoutes from './direccionRoutes.js';
// import propietarioRoutes from './propietarioRoutes.js';
// import datoRegistralRoutes from './datoRegistralRoutes.js';
// import inmuebleRoutes from './InmuebleRoutes.js';
// import liquidacionRoutes from './LiquidacionRoutes.js';

export default function registerRoutes(app) {
    app.use('/api/cliente', clienteRouter);
    app.use('/api/adeudos', adeudoRoutes);
    app.use('/api-docs', swaggerRouter);
    app.use('/api/home', homeRoutes);
    app.use('/api/inmueble', inmuebleRoutes);
    // app.use('/api/empresas', empresasRoutes);
    // app.use('/api/direcciones', direccionRoutes);
    // app.use('/api/propietario', propietarioRoutes);
    // app.use('/api/datoRegistral', datoRegistralRoutes);
    // app.use('/api/liquidaciones', liquidacionRoutes);
}