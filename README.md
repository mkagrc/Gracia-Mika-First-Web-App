# UserHub

UserHub is a student full-stack lab app for registration, sign-in, role-specific dashboards, profile editing, JPEG/PNG profile pictures, and an administrator user directory. The backend uses Spring Boot 4.x, Java 21, Spring Data JPA and an H2 in-memory database; the frontend uses React, Vite, Axios and React Router.

> **Classroom-project security note:** SHA-256 and in-memory bearer tokens are implemented to match the assignment. SHA-256 is not a suitable password-storage function for production. A real application should use Argon2id or BCrypt, persistent/revocable session storage, HTTPS, and additional security protections.

## Features

- Register and log in with safe password-free responses.
- UUID bearer-token authentication, server-side logout from the protected-page navbar, and USER/ADMIN access control.
- USER dashboard with welcome, profile picture/avatar, role badge, and an Account Summary showing email, member-since date/time, and total users.
- ADMIN dashboard with account overview and an ADMIN-only user directory.
- Detailed read-only profile at `/profile` with name, email, address, phone, role, member-since date/time, and picture/avatar; edit full name, address, phone, and picture at `/profile/edit`. Email remains read-only.
- Upload a JPEG or PNG profile picture (maximum 1 MB); the server validates file type/data and size.

## Technologies

- Java 21, Spring Boot 4.x, Maven Wrapper 3.3.2 pinned to Maven 3.9.9.
- Spring Web MVC, Spring Data JPA, Validation, H2, and H2 Console.
- React, Vite, Axios, React Router, and Git.

## Prerequisites

- JDK 21 or newer (`java -version`, `javac -version`).
- Node.js LTS with npm (`node --version`, `npm --version`).
- Git; VS Code with the Extension Pack for Java is recommended.

No Docker, MySQL, PostgreSQL, or XAMPP is required. H2 is embedded and in memory.

## Run the backend

Open a VS Code terminal at the project root.

**Windows PowerShell:**

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

**macOS/Linux:**

```bash
cd backend
chmod +x mvnw
./mvnw spring-boot:run
```

The API is at `http://localhost:8080`.

## Run the frontend

Open a second terminal at the project root:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## H2 Console and data lifecycle

With the backend running, open `http://localhost:8080/h2-console`:

- JDBC URL: `jdbc:h2:mem:userhubdb`
- User name: `sa`
- Password: leave blank

All users, profile fields and Base64 picture data are stored in the in-memory H2 database and are lost when the backend stops or restarts. Profile images are stored in the database, not as uploaded files in the repository.

## Default administrator

- Email: `admin@userhub.com`
- Password: `admin12345`

The `CommandLineRunner` seeds the account if missing and stores a SHA-256 hash. These are classroom demo credentials only.

## API endpoints

Base URL: `http://localhost:8080/api`.

| Method | Endpoint | Access | Result |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Creates account (201); duplicate email returns 409. |
| `POST` | `/auth/login` | Public | Returns UUID token and safe user data; no picture or password. |
| `POST` | `/auth/logout` | Bearer token | Revokes the server-side session. |
| `GET` | `/dashboard` | Bearer token | Returns own name, email, role, address, phone, picture, member-since timestamp and total user count. |
| `GET` | `/dashboard/users` | ADMIN only | Lists ID, name, email, role and creation timestamp; pictures/passwords omitted; USER gets 403. |
| `PUT` | `/users/me` | Bearer token | Updates fullName, address, phone and profilePicture; email is not accepted. |

Profile update JSON fields: `fullName` (required), `address` (optional, max 255 chars), `phone` (optional, max 20 chars; digits, `+`, hyphen, spaces), and `profilePicture` (optional JPEG/PNG Base64 data URL, maximum decoded image size 1 MB). Validation errors return HTTP 400 with `{"error":"..."}`. The frontend reads the image using FileReader and sends the data URL in the profile update request. The API validates the data URL and image signature/size before saving it. The dashboard then fetches the current profile from `GET /dashboard`; the picture is not put in localStorage.

## Manual test plan

1. Start the backend and frontend in separate terminals.
2. Register with a full name, valid email and password of at least eight characters; verify successful registration proceeds to login.
3. Attempt registration using the same email and verify HTTP 409 is shown. Try invalid registration fields and verify HTTP 400.
4. Log in as a USER. Verify the dashboard has “Welcome, {fullName}!”, profile avatar or initials, role badge, and an Account Summary containing only email, member-since date/time, and total users; verify address and phone are not shown there.
5. Open `/profile` from the navbar and verify the detailed read-only avatar, full name, email, address, phone (or “Not set”), role and member-since details. Click Edit Profile to open `/profile/edit`; edit the USER name, address and phone, upload a JPEG or PNG no larger than 1 MB, and save. Verify return to `/profile` shows freshly loaded details and picture. Use Cancel to return without saving; test unsupported/oversized images, invalid phone and server validation errors.
6. Verify email is read-only and that the picture is not stored in localStorage.
7. As a USER, open `/admin/users`; verify the frontend redirects to `/dashboard`, and a direct API call returns 403.
8. Use the navbar “Logout” button and try a protected route; verify login is required. To confirm server-side revocation, retry a dashboard API request with the old token and expect HTTP 401.
9. Log in as `admin@userhub.com`. Verify the ADMIN welcome, ADMIN badge, profile picture/avatar, and Account Summary containing only email, member-since date/time, and total users, plus the “View all users” button. Verify the table shows ID, full name, email, role and member-since time, but no password or image data.
10. As ADMIN, use `/profile` and the Edit Profile button to open `/profile/edit`, confirm the same view/edit/save behavior, and verify H2 data resets after a backend restart (expected for the in-memory database).

## Troubleshooting

- **CORS error:** Keep Vite at `http://localhost:5173` and the API at `http://localhost:8080`; controllers allow the Vite origin.
- **Port 8080 is in use:** Identify and stop the other application; the frontend is configured for port 8080.
- **401 after backend restart:** Sessions and database contents are in memory; log in again and re-register non-seed accounts.
- **H2 console is 404:** Confirm the backend started and use `/h2-console` with JDBC URL `jdbc:h2:mem:userhubdb`.
- **Image upload rejected:** Use a real JPEG or PNG image no larger than 1 MB.
- **Maven cannot start:** Confirm JDK 21 is installed; wrapper downloads Maven 3.9.9 on first use.

## Screenshots

Keep submitted screenshots in `docs/screenshots/`: registration, login, USER dashboard, profile update and picture preview, ADMIN dashboard/user list, and validation/access-denied feedback. `.gitkeep` preserves the folder until screenshots are added.
