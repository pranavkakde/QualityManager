# PDD Feature Spec: User Authentication & Role-Based Navigation

## 1. Feature Description
Provide a secure login interface that authenticates credentials against the backend services, stores JWT tokens in session state, and renders a sleek, dynamic sidebar navigation that adapts based on the user's role.

---

## 2. Technical Contracts & Mappings

### Backend REST Contract (User Services - Port `7777`)
* **Endpoint:** `POST /api/user/login`
* **Request Payload:**
  ```json
  {
    "username": "demo",
    "password": "demo123"
  }
  ```
* **Response Payload (Success):**
  ```json
  {
    "token": "jwt-token-string",
    "username": "demo",
    "role": "admin"
  }
  ```

---

## 3. Frontend UI Specifications

### Login View (`src/pages/Login.jsx`)
* **Visuals:** Centered form container utilizing premium glassmorphism styles, dark slate backgrounds, and a subtle glowing backdrop.
* **Fields:** Username and password inputs with prefilled demo credentials (`demo` / `demo123`) to streamline local developer onboarding.
* **Behavior:** Submits credentials, saves session attributes (`token`, `username`, `role`) inside `localStorage`, and triggers a state callback to route the user to `/`.

### Sidebar Navigation (`src/components/Sidebar.jsx`)
* **Visuals:** Tall, dark slate left-aligned layout with active state highlight (purple/indigo backgrounds).
* **Role-Based Visibility:**
  * **All Users:** Dashboard, Test Suites, Defects, and Test Runs routes.
  * **Admin Role Only:** Dynamic visibility of the **Users** management view and the **System Logs** Loki viewer.
