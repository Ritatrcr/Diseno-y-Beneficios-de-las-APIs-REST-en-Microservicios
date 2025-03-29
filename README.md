# Pasarela de Pagos - API REST

[Repositorio Front](https://github.com/Ritatrcr/FRONT-Diseno-y-Beneficios-de-las-APIs-REST-en-Microservicios.git)
[Documentación Swagger](https://nodejs-server-server-generated-kappa.vercel.app/docs/#/)
[Informe](https://es.overleaf.com/read/fbjtcyjzzpjp#f2885c)

## 1. Visión General

La API simula el procesamiento de pagos y la gestión de reembolsos, permitiendo a los clientes iniciar pagos, consultar su estado, recibir notificaciones (a través de un endpoint webhook) y solicitar devoluciones. Está diseñada con un enfoque en la separación de responsabilidades, escalabilidad y seguridad.

**Características clave:**

- **Versionado:** La API se versiona mediante la ruta `/api/v1/` para facilitar futuras evoluciones.
- **Autenticación:** Se utiliza autenticación con tokens JWT (JSON Web Token) para proteger el acceso a los endpoints.
- **Documentación:** Se puede documentar mediante Swagger/OpenAPI para que otros desarrolladores conozcan su funcionamiento.
- **Errores y Códigos HTTP:** Respuestas estandarizadas que utilizan códigos de estado HTTP para indicar éxito, errores de validación, autorizaciones y otros.

---

## 2. Endpoints Principales

### 2.1. Autenticación

#### *Registro de Usuario*
- **Método:** `POST`
- **Ruta:** `/api/v1/auth/register`
- **Descripción:** Permite registrar un nuevo usuario.
- **Request Body (JSON):**
  ```json
  {
    "username": "usuario123",
    "email": "usuario@example.com",
    "password": "secreta123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "Usuario registrado exitosamente",
    "userId": 1
  }
  ```

#### *Inicio de Sesión*
- **Método:** `POST`
- **Ruta:** `/api/v1/auth/login`
- **Descripción:** Permite a un usuario autenticarse y obtener un token JWT.
- **Request Body (JSON):**
  ```json
  {
    "email": "usuario@example.com",
    "password": "secreta123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1...",
    "expires_in": 3600
  }
  ```

#### *Verificar Usuario Autenticado*
- **Método:** `GET`
- **Ruta:** `/api/v1/auth/me`
- **Descripción:** Obtiene la información del usuario autenticado mediante su token.
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Response (200 OK):**
  ```json
  {
    "userId": 1,
    "username": "usuario123",
    "email": "usuario@example.com"
  }
  ```

---

### 2.2. Pagos

#### *Crear un Pago*
- **Método:** `POST`
- **Ruta:** `/api/v1/payments`
- **Descripción:** Inicia un proceso de pago. **Requiere autenticación con JWT.**
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Request Body (JSON):**
  ```json
  {
    "amount": 150.00,
    "currency": "USD",
    "payment_method": "credit_card",
    "description": "Compra de producto X",
    "customer_id": "user_12345"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "payment_id": "pay_abcdef123456",
    "amount": 150.00,
    "currency": "USD",
    "payment_method": "credit_card",
    "description": "Compra de producto X",
    "status": "pending",
    "created_at": "2025-03-15T10:00:00Z",
    "links": {
      "self": "/api/v1/payments/pay_abcdef123456",
      "webhook": "/api/v1/payments/webhook"
    }
  }
  ```

#### *Consultar Estado de un Pago*
- **Método:** `GET`
- **Ruta:** `/api/v1/payments/{payment_id}`
- **Descripción:** Recupera el estado y detalles de un pago específico. **Requiere autenticación con JWT.**
- **Response (200 OK):**
  ```json
  {
    "payment_id": "pay_abcdef123456",
    "amount": 150.00,
    "currency": "USD",
    "payment_method": "credit_card",
    "description": "Compra de producto X",
    "status": "completed",
    "created_at": "2025-03-15T10:00:00Z",
    "updated_at": "2025-03-15T10:05:00Z"
  }
  ```

#### *Webhook para Notificaciones de Pago*
- **Método:** `POST`
- **Ruta:** `/api/v1/payments/webhook`
- **Descripción:** Endpoint para recibir notificaciones de eventos de pago.
- **Request Body (JSON):**
  ```json
  {
    "event_id": "evt_987654321",
    "event_type": "payment_status_update",
    "data": {
      "payment_id": "pay_abcdef123456",
      "new_status": "completed",
      "timestamp": "2025-03-15T10:05:00Z"
    }
  }
  ```

---

### 2.3. Reembolsos

#### *Solicitar un Reembolso*
- **Método:** `POST`
- **Ruta:** `/api/v1/refunds`
- **Descripción:** Permite solicitar un reembolso de un pago previamente realizado.
- **Request Body (JSON):**
  ```json
  {
    "payment_id": "pay_abcdef123456",
    "amount": 150.00,
    "reason": "Producto defectuoso"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "refund_id": "ref_xyz789",
    "payment_id": "pay_abcdef123456",
    "amount": 150.00,
    "reason": "Producto defectuoso",
    "status": "pending",
    "requested_at": "2025-03-15T11:00:00Z"
  }
  ```

#### *Consultar Estado de un Reembolso*
- **Método:** `GET`
- **Ruta:** `/api/v1/refunds/{refund_id}`
- **Descripción:** Recupera el estado y detalles de una solicitud de reembolso.
- **Response (200 OK):**
  ```json
  {
    "refund_id": "ref_xyz789",
    "payment_id": "pay_abcdef123456",
    "amount": 150.00,
    "reason": "Producto defectuoso",
    "status": "processed",
    "requested_at": "2025-03-15T11:00:00Z",
    "processed_at": "2025-03-15T11:15:00Z"
  }
  ```

