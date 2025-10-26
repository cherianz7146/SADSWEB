## Python ML client (Elephant/Tiger only)

A minimal Python client for training and webcam inference is provided under `ml/`:

- `ml/train.py` – trains a lightweight classifier for elephant vs tiger using your dataset
- `ml/webcam_client.py` – runs webcam inference and posts detections to the backend `/api/detections` with `propertyId`

Configure environment variables:

```
ML_BACKEND_URL=http://localhost:5000
ML_AUTH_TOKEN=<JWT from login>
ML_PROPERTY_ID=<ObjectId of the property>
```

Install deps: `pip install -r ml/requirements.txt`

# SADS

Smart Animal Deterrent System - A comprehensive solution for wildlife management.

## Project Structure

- `backend/` - Node.js Express backend API
- `frontend/` - React TypeScript frontend
- `selenium-tests/` - End-to-end tests using Selenium WebDriver

## Setup

Follow the instructions in [ENV_SETUP.md](ENV_SETUP.md) to set up the development environment.

## Running the Application

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Testing

### Backend Unit Tests
```bash
cd backend
npm test
```

### Frontend Unit Tests
```bash
cd frontend
npm run test
```

### End-to-End Tests (Selenium)
```bash
cd selenium-tests
npm install
npm test
```

See [selenium-tests/README.md](selenium-tests/README.md) for detailed instructions on running Selenium tests.