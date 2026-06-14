# Archive — Platforma galerii fotograficznej

Aplikacja webowa do zarządzania galeriami zdjęć. Umożliwia tworzenie kolekcji, wgrywanie fotografii, przeglądanie cudzych galerii oraz komentowanie zdjęć.

---

## 1. Instalacja i uruchomienie

### Wymagania

- Node.js 18+
- MongoDB uruchomione lokalnie na porcie 27017

### Instalacja

```bash
npm install
npm start
```

Aplikacja działa pod adresem **http://localhost:3000**.  
Dokumentacja API (Swagger UI) dostępna pod **/api-docs**.

---

## 2. Pierwsze uruchomienie — tworzenie administratora

Na świeżej bazie danych pierwszy zarejestrowany użytkownik **musi** mieć nazwę użytkownika `admin`.  
Przejdź do `/users/user_register`, podaj nazwę użytkownika `admin` i hasło (min. 8 znaków). Kolejni użytkownicy mogą mieć dowolną nazwę.

---

## 3. Przykładowe dane — kopia zapasowa i przywracanie

Plik `backup/gallery` to binarne archiwum mongodump bazy danych.  
Do eksportu i importu użyj narzędzi **mongodump/mongorestore** (MongoDB Database Tools).

**Tworzenie kopii (eksport):**
```bash
mongodump --archive="backup/gallery" --db="gallery"
```

**Przywracanie pod tą samą nazwą bazy:**
```bash
mongorestore --archive="backup/gallery"
```

**Przywracanie pod inną nazwą bazy:**
```bash
mongorestore --archive="backup/gallery" --nsFrom="gallery.*" --nsTo="gallery_test.*"
```

Dane logowania po przywróceniu kopii:
- `admin` → hasło: `admin123`
- `mb` → hasło: `12345678`

---

## 4. Technologie

| Warstwa | Technologia |
|---|---|
| Środowisko | Node.js |
| Framework | Express 4 |
| Szablony | Pug |
| Baza danych | MongoDB (via Mongoose 9) |
| Autoryzacja | JWT (jsonwebtoken) + bcrypt + ciasteczko HTTP-only |
| Upload plików | Multer |
| Miniatury | Sharp (zmiana rozmiaru do 300×200 px) |
| UI | Bootstrap 5.3 |
| Dokumentacja API | Swagger UI (swagger-jsdoc + swagger-ui-express) |

---

## 5. Lista pakietów

| Pakiet | Zastosowanie |
|---|---|
| `express` | Serwer HTTP i routing |
| `mongoose` | ODM dla MongoDB — definicja schematów i zapytania |
| `pug` | Szablony HTML po stronie serwera |
| `bcrypt` | Haszowanie haseł |
| `jsonwebtoken` | Tworzenie i weryfikacja tokenów JWT |
| `cookie-parser` | Parsowanie ciasteczek z nagłówków żądań |
| `multer` | Parsowanie multipart/form-data przy uploadzie plików |
| `sharp` | Wydajne skalowanie obrazów (generowanie miniatur) |
| `morgan` | Logowanie żądań HTTP |
| `swagger-jsdoc` | Generowanie specyfikacji OpenAPI z komentarzy JSDoc |
| `swagger-ui-express` | Serwowanie interaktywnego Swagger UI pod /api-docs |
| `http-errors` | Narzędzie do tworzenia obiektów błędów HTTP |

---

## 6. Modele bazy danych

### Kolekcja: `users`

| Pole | Typ | Uwagi |
|---|---|---|
| `username` | String | Wymagane, unikalne |
| `password` | String | Wymagane, hash bcrypt |
| `first_name` | String | Opcjonalne, maks. 100 znaków |
| `last_name` | String | Opcjonalne, maks. 100 znaków |

### Kolekcja: `galleries`

| Pole | Typ | Uwagi |
|---|---|---|
| `name` | String | Wymagane, maks. 200 znaków |
| `description` | String | Opcjonalne, maks. 500 znaków |
| `owner` | ObjectId → users | Wymagane, referencja do właściciela |

### Kolekcja: `images`

| Pole | Typ | Uwagi |
|---|---|---|
| `title` | String | Wymagane, maks. 200 znaków |
| `description` | String | Opcjonalne, maks. 500 znaków |
| `filename` | String | Wymagane, przechowywane w public/uploads/ |
| `gallery` | ObjectId → galleries | Wymagane |
| `owner` | ObjectId → users | Wymagane |
| `uploaded_at` | Date | Domyślnie: teraz |

### Kolekcja: `comments`

| Pole | Typ | Uwagi |
|---|---|---|
| `text` | String | Wymagane, maks. 1000 znaków |
| `image` | ObjectId → images | Wymagane |
| `author` | ObjectId → users | Wymagane |
| `created_at` | Date | Domyślnie: teraz |

---

## 7. Architektura aplikacji

Wzorzec MVC — każdy zasób ma własny model, kontroler i plik tras:

```
app.js               — konfiguracja Express, połączenie z MongoDB, globalny middleware autoryzacji
bin/www              — punkt wejścia serwera HTTP
middleware/
  authenticate.js   — weryfikacja JWT, guard requireAdmin
models/
  user.js / gallery.js / image.js / comment.js
controllers/
  userController.js    — rejestracja, logowanie, wylogowanie, CRUD użytkowników (admin)
  galleryController.js — CRUD galerii
  imageController.js   — CRUD zdjęć, upload przez multer, miniatura przez sharp
  commentController.js — dodawanie i usuwanie komentarzy
routes/
  users.js / galleries.js / images.js / comments.js
views/               — szablony Pug
public/
  uploads/           — oryginalne wgrane zdjęcia
  uploads/thumbnails — automatycznie generowane miniatury 300×200
  stylesheets/       — własne style CSS
backup/              — archiwum mongodump bazy danych (plik: backup/gallery)
```

### Przepływ autoryzacji

Logowanie → weryfikacja bcrypt → JWT podpisany HS256 → zapisany jako ciasteczko HTTP (`mytoken`, ważność 10 min).  
Każde żądanie: middleware aplikacji dekoduje ciasteczko i udostępnia `res.locals.loggedUser`.  
Chronione trasy dodatkowo wywołują middleware `authenticate`, który ustawia `req.user` z id i nazwą użytkownika.  
Trasy tylko dla admina dodatkowo wywołują `requireAdmin`.

---

## 8. Przegląd tras

| Metoda | Ścieżka | Opis | Dostęp |
|---|---|---|---|
| GET | / | Strona główna | Publiczny |
| GET | /users/user_register | Formularz rejestracji | Publiczny |
| POST | /users/user_register | Rejestracja użytkownika | Publiczny |
| GET | /users/user_login | Formularz logowania | Publiczny |
| POST | /users/user_login | Logowanie | Publiczny |
| GET | /users/user_logout | Wylogowanie | Zalogowany |
| GET | /users | Lista użytkowników | Admin |
| GET | /users/user_add | Formularz dodawania użytkownika | Admin |
| POST | /users/user_add | Dodanie użytkownika | Admin |
| POST | /users/:id/delete | Usunięcie użytkownika (kaskadowo) | Admin |
| GET | /galleries | Lista galerii | Zalogowany |
| GET | /galleries/gallery_add | Formularz dodawania galerii | Zalogowany |
| POST | /galleries/gallery_add | Tworzenie galerii | Zalogowany |
| GET | /galleries/:id | Szczegóły galerii | Zalogowany |
| GET/POST | /galleries/:id/edit | Edycja galerii | Właściciel / Admin |
| POST | /galleries/:id/delete | Usunięcie galerii | Właściciel / Admin |
| GET | /galleries/:gId/images | Lista zdjęć w galerii | Zalogowany |
| GET/POST | /galleries/:gId/images/image_add | Dodanie zdjęcia | Właściciel / Admin |
| GET | /galleries/:gId/images/:id | Szczegóły zdjęcia + komentarze | Zalogowany |
| GET/POST | /galleries/:gId/images/:id/edit | Edycja metadanych zdjęcia | Właściciel / Admin |
| POST | /galleries/:gId/images/:id/delete | Usunięcie zdjęcia i plików | Właściciel / Admin |
| POST | /galleries/:gId/images/:iId/comments | Dodanie komentarza | Zalogowany |
| POST | /galleries/:gId/images/:iId/comments/:id/delete | Usunięcie komentarza | Autor / Admin |
| GET | /api-docs | Swagger UI | Publiczny |
| GET | /docs | Dokumentacja | Publiczny |
