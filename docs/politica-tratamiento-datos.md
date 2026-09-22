# Política de Tratamiento de Datos Personales — Plantopolis

**Versión:** 1.0  
**Fecha de publicación:** [POR DEFINIR]  
**Responsable del tratamiento:** [RAZÓN SOCIAL / RESPONSABLE POR DEFINIR]  
**Canal para consultas y solicitudes:** [CORREO / CANAL POR DEFINIR]

## 1. Alcance

Esta política aplica al tratamiento de datos personales realizado por Plantopolis a través de su plataforma de comercio electrónico y de sus módulos internos de administración y operación.

La política se redacta de acuerdo con las funcionalidades y estructuras actualmente identificadas en los repositorios de Plantopolis. No incluye finalidades o categorías de datos que no estén soportadas por la implementación revisada.

## 2. Datos personales tratados

Plantopolis puede tratar, según el uso que haga cada persona de la plataforma, los siguientes datos:

### Clientes y usuarios registrados
- Nombre completo.
- Correo electrónico.
- Teléfono, cuando sea proporcionado.
- Dirección, incluida la dirección utilizada para el envío de pedidos.
- Credenciales de acceso, en particular la contraseña, que se almacena en forma de hash y no como contraseña en texto plano.
- Información asociada a la cuenta, como rol, estado de activación y fechas de registro y actualización.
- Información relacionada con pedidos: número de pedido, productos adquiridos, cantidades, valores, impuestos, total, estado del pedido, fecha del pedido y dirección de envío.
- Información relacionada con pagos: método de pago, estado del pago, monto, identificador de transacción de la pasarela cuando exista y referencia de factura cuando corresponda.

### Trabajadores y administradores
La plataforma contempla cuentas con roles de **ADMINISTRADOR**, **TRABAJADOR** y **CLIENTE**. Para los usuarios que realizan funciones internas pueden tratarse, según las operaciones realizadas:
- Nombre completo.
- Correo electrónico.
- Teléfono y dirección, si fueron registrados.
- Rol y estado de la cuenta.
- Información de tareas asignadas.
- Registros de cambios de estado o reasignación de tareas.
- Comentarios asociados a tareas.
- Registros de actividad vinculados a operaciones sobre lotes, tareas y mermas.

## 3. Finalidades del tratamiento

Los datos se tratan para las finalidades que corresponden a las funciones implementadas en Plantopolis, entre ellas:

1. Crear y administrar cuentas de usuario.
2. Permitir la autenticación y el acceso según el rol asignado.
3. Gestionar el carrito de compras y los pedidos.
4. Procesar y registrar información necesaria para los pagos y sus estados.
5. Gestionar las direcciones de envío de los pedidos.
6. Consultar el historial y estado de los pedidos.
7. Enviar comunicaciones relacionadas con los pedidos y, cuando corresponda, notificaciones operativas asociadas a tareas.
8. Administrar usuarios y sus permisos dentro de los módulos internos.
9. Gestionar tareas, asignaciones, comentarios y sus historiales.
10. Registrar la trazabilidad de determinadas operaciones sobre lotes, tareas y mermas.
11. Mantener la seguridad, integridad y funcionamiento de la plataforma.

Plantopolis no declara mediante esta política finalidades de publicidad, perfilamiento, geolocalización o comercialización de datos, porque dichas finalidades no se encuentran sustentadas por la implementación revisada.

## 4. Tratamiento de contraseñas

Las contraseñas de las cuentas no deben tratarse como texto plano. La estructura de datos de Plantopolis contempla un campo destinado al **hash de la contraseña**.

El acceso a la información se encuentra organizado mediante roles, de modo que las funciones administrativas y operativas se separan de las funciones disponibles para clientes.

## 5. Información de pagos

Plantopolis registra información necesaria para asociar un pago con un pedido, incluyendo método, estado, monto y, cuando exista, el identificador de transacción de la pasarela.

Esta política no afirma que Plantopolis almacene números completos de tarjetas, códigos de seguridad u otras credenciales bancarias, porque esos datos no aparecen como campos en el esquema de base de datos revisado.

## 6. Acceso interno a los datos

El sistema contempla tres roles principales:

- **CLIENTE:** acceso a las funcionalidades relacionadas con su cuenta, carrito y pedidos.
- **TRABAJADOR:** acceso a las funcionalidades operativas que correspondan a su rol, como tareas, lotes y mermas.
- **ADMINISTRADOR:** acceso a funciones administrativas, incluida la gestión de usuarios, pedidos y productos.

El acceso debe limitarse a la información necesaria para cada función y mantenerse protegido mediante los mecanismos de autenticación y autorización implementados por la plataforma.

## 7. Historial y trazabilidad

Plantopolis mantiene registros asociados a determinadas operaciones internas. El modelo de datos contempla, entre otros:

- cambios de estado de lotes, identificando al usuario que realizó el cambio;
- cambios de estado y reasignaciones de tareas, identificando al usuario que realizó la operación;
- comentarios de tareas y su autor;
- registro del usuario que reporta una merma.

Estos registros tienen como finalidad permitir la trazabilidad de las operaciones internas de la plataforma.

## 8. Conservación de la información

Los datos se conservarán durante el tiempo necesario para cumplir las finalidades para las cuales fueron recopilados y mientras resulte necesario mantener la cuenta, gestionar pedidos, pagos, obligaciones asociadas o registros de trazabilidad.

Los plazos concretos de conservación deberán ser definidos por el responsable del tratamiento de acuerdo con sus obligaciones legales, contractuales y operativas. La implementación revisada no establece por sí sola un plazo general de eliminación para cada categoría de datos.

## 9. Derechos de los titulares

El titular de los datos podrá solicitar, según corresponda y de acuerdo con la legislación aplicable:

- conocer los datos personales tratados;
- solicitar la actualización o corrección de información inexacta;
- solicitar la eliminación de datos cuando sea procedente;
- consultar información sobre el tratamiento de sus datos;
- presentar consultas o solicitudes relacionadas con sus datos personales.

Las solicitudes deberán presentarse a través del canal de contacto que defina el responsable del tratamiento.

## 10. Seguridad

Plantopolis aplica controles de acceso basados en roles y contempla el almacenamiento de contraseñas mediante hash. La infraestructura de la aplicación también está diseñada para separar los componentes de frontend y backend y utilizar mecanismos de comunicación configurables.

Las medidas técnicas, administrativas y organizativas de seguridad deberán mantenerse y actualizarse de acuerdo con los riesgos y con la evolución de la plataforma.

## 11. Terceros y servicios externos

La aplicación contempla integración con una pasarela de pagos. En consecuencia, para completar determinadas operaciones de pago puede ser necesario intercambiar con el proveedor correspondiente la información requerida para procesar y confirmar la transacción.

Los datos concretos que se envían al proveedor, su ubicación, sus condiciones de tratamiento y los períodos de conservación deben documentarse de acuerdo con el proveedor efectivamente utilizado por Plantopolis.

## 12. Comunicaciones

La plataforma contempla comunicaciones relacionadas con la operación del servicio, incluyendo confirmaciones asociadas a compras y notificaciones de tareas vencidas.

Esta política no considera esas comunicaciones como publicidad o marketing.

## 13. Actualizaciones de esta política

Plantopolis podrá actualizar esta política cuando cambien las funcionalidades de la plataforma, los tipos de datos tratados, las finalidades del tratamiento, los proveedores involucrados o las obligaciones aplicables.

La versión y fecha de actualización deberán mantenerse identificables para los usuarios.

## 14. Responsable y canal de atención

Los datos definitivos del responsable del tratamiento y del canal para ejercer derechos deberán completarse antes de publicar esta política:

- **Responsable:** [POR DEFINIR]
- **Identificación / NIT:** [POR DEFINIR]
- **Dirección:** [POR DEFINIR]
- **Correo para solicitudes de datos personales:** [POR DEFINIR]
- **Fecha de entrada en vigencia:** [POR DEFINIR]

> **Nota de implementación:** esta política describe lo que actualmente se observa en el código y esquema revisados. Antes de considerarla un documento legal definitivo, deben completarse los datos del responsable, el canal de atención, los períodos de conservación y las demás obligaciones que correspondan según la jurisdicción aplicable.
