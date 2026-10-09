<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>



This contains everything you need to run your app locally, now upgraded to a full-stack architecture with Express, TypeScript, and MongoDB.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Configure environment:
   Create a `.env` file and set:
   ```
   MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/decision_intel?retryWrites=true&w=majority"
   ```
   *(Note: If `MONGODB_URI` is not provided, the backend will automatically spin up an in-memory MongoDB instance for local testing.)*
3. Start the backend server:
   `npm run server`
4. Start the frontend (in a separate terminal):
   `npm run dev`

### API & Database
- The backend is located in the `server/` directory and exposes REST APIs at `http://localhost:8080/api`.
- It uses Mongoose models for `Products`, `Suppliers`, `Workflows`, and `Activities`.
- The AI Analytics calculations have been successfully migrated to the backend endpoints (`/api/analysis/*`).
