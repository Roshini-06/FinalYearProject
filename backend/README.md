# AI Complaint Classification Backend

Next-generation FastAPI backend for automated classification and management of water and electricity complaints.

## 🚀 Key Features
- **FastAPI Core**: Highly performant, asynchronous API development.
- **AI-Powered Classification**: Automated categorization of citizen reports using NLP.
- **Scalable Architecture**: Decoupled services, repositories, and controllers.
- **MongoDB Integration**: Efficiently store large amounts of unstructured report data.
- **Swagger Documentation**: Interactive documentation available at `/docs`.

## 🛠️ Tech Stack
- **API**: FastAPI, Pydantic, Motor
- **Database**: MongoDB
- **AI/ML**: NLP models (Logistic Regression + BERT placeholders)
- **Deployment**: Uvicorn, Docker-ready

## 📦 Getting Started

### Prerequisites
- Python 3.9+
- MongoDB instance (Local or Atlas)

### Setup
1. **CD into backend**: `cd backend`
2. **Install dependencies**: `pip install -r requirements.txt`
3. **Environment**: Create a `.env` file from the settings in `app/core/config.py`.
4. **Run Application**:
   ```bash
   uvicorn app.main:app --reload
   ```

## 📂 Project Structure
Refer to the `app/` directory for the following:
- `api/`: Route handlers and controllers.
- `core/`: Application-wide settings and security.
- `services/`: Core logic for AI classification and business workflows.
- `models/`: Pre-trained ML models and loaders.
- `db/`: Database drivers and CRUD utilities.
- `schemas/`: Pydantic models for data validation.
- `utils/`: Reusable helper functions.
