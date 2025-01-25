# DataXpert

DataXpert is an open-source SaaS application designed to empower users with advanced data analysis and visualization tools. Whether you're managing data, generating insights, or collaborating with your team, DataXpert provides a seamless and intuitive experience.

## Features

- **Data Upload & Management**: Easily upload, store, and organize your data.
- **Interactive Dashboards**: Generate and customize interactive charts and visualizations.
- **AI-Powered Assistance**: An AI assistant, to guide you through the app and perform tasks like generating charts or answering questions.
- **Team Collaboration**: Share insights and collaborate with team members in real-time.
- **Secure Storage**: Built with PostgreSQL to ensure your data is stored securely.

## Installation

To set up DataXpert locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/ultroxium/Data-Xpert.git
   cd Data-Xpert
   ```

2. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Navigate to the frontend directory and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

4. Set up the environment variables for the backend by creating a `.env` file in the `backend` directory:
   ```plaintext
   DATABASE_URL=<your_postgresql_connection_string>
   ```

5. Start the backend server:
   ```bash
   cd backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

6. Start the frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

7. Open your browser and visit `http://localhost:3000` for the frontend and `http://127.0.0.1:8000` for the backend API.

## Deployment

DataXpert is hosted at [dataxpert.vercel.app](https://dataxpert.vercel.app). You can deploy your forked version to a platform like Vercel or AWS using their deployment guides.

## Usage

1. Log in or sign up for an account.
2. Upload your datasets and organize them into projects.
3. Use AI, to:
   - Generate visualizations.
   - Answer questions about your data.
4. Collaborate with your team by sharing dashboards.

## Contributing

We welcome contributions! Here's how you can get involved:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature or fix description"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request on GitHub.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Built using **FastAPI** and **PostgreSQL**.
- Deployed with **Vercel**.
- Special thanks to all contributors and the open-source community.

---

For more information, please visit the [official website](https://dataxpert.vercel.app) or contact us at [ultroxium@gmail.com].

