# Project Name

## Description

A web application built using **Node.js, Express.js, EJS, PostgreSQL, CSS, and Boostrap**. <br> This project includes authentication, secret submissions, and a structured backend to handle user data securely.

## Features

- **User Authentication:** Secure login and signup with hashed passwords.
- **Social Authentication:** Login with Google using Passport.js.
- **Secrets Submission:** Users can submit secrets anonymously.
- **Database Integration:** PostgreSQL for storing user data.
- **EJS Templating:** Dynamic content rendering.
- **CSS & Boostrap:** Modern styling for a responsive UI.

## Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set up environment variables:**
   Create a `.env` file and add:
   ```sh
   PORT=3000
   DATABASE_URL=your_postgresql_database_url
   SESSION_SECRET=your_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

## Running the Project

```sh
npm start
```

The server will start on `http://localhost:3000`.

## Deployment

### Deploying to Render

1. Push your code to GitHub.
2. Create a **new Web Service** on [Render](https://render.com/).
3. Connect your GitHub repository.
4. Set the build command: `npm install && npm run build` (if applicable).
5. Set the start command: `npm start`.
6. Add environment variables under **Settings > Environment**.
7. Deploy!

## Technologies Used

- **Backend:** Node.js, Express.js, PostgreSQL
- **Authentication:** Passport.js, Google OAuth
- **Deployment:** Render, GitHub

## License

This project is licensed under the **MIT License**.

For any questions, feel free to reach out:

- **GitHub:** (https://github.com/Kamogelo-7)
- **Email:** kamomogasoa17@gmail.com
