# Control-Clientes
Sistema para llevar a cabo tanto la gestión de clientes como un registro detallado de todas las transacciones que la empresa *Finatech* realiza a nombre de sus clientes.
El sistema constará de diferentes módulos, los cuales son:
1. **Catálogo de clientes:** Los clientes que lleguen a *Finatech* para buscar un inmueble deben de ser registrados.
2. **Catálogo de inmuebles:** Cada cliente quiere un inmueble, por lo cual se deben de regsitrar los inmuebles que quieran los clientes.
3. **Proveedores:** Cada inmueble tiene varios proveedores de diferentes servicios (luz, agua, etc.), por lo que se debe de registrar esto.
4. **Checklist de facturas descargadas:** Cada que se descargue una factura de un inmueble, se debe de regsitrar y marcar como registrada.
5. **Flujo de tesorería:** Reporte de todo lo que el cliente ha pagado hasta el momento, esto involucra dos opciones:
  - **Reporte presente:** El reporte de lo que ha pagado hasta ahora el cliente.
  - **Reporte a futuro:** Proyección a futuro de lo que el cliente va a gastar a futuro. Se hace con la finalidad de ver si el cliente debe de mandar más dinero o no.
6. **Checklist/Registro de obligaciones fiscales y mercantiles:** Se debe de llevar un control de los impuestos y/u obligaciones mercantiles que *Finatech* ha pagado hasta el momento.
7. **Cobranzas/adeudos:** Cada que *Finatech* paga alguna cosa con su dinero, se deben de hacer un registro de dicho gasto.
8. **Checklist del estatus de cada cobro:** Aparte de hacer un CRUD de los cobros, se debe de llevar un control de en qué paso se encuentra cada cobro. El estatus puede tener 4 diferentes valores:
    - Emitir factura.
    - Transferencia realizada.
    - Transferencia autorizada.
    - Factura disponible para contabilización.
9. **Perfíl crediticio:** Se debe de realizar el perfil crediticio del cliente, esto en caso de que solicite algún prestamo. Cada que se compre un inmueble se debe de guardar la información del cliente.
