import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { apiLimiter } from './middleware/rate-limiter';
import authRouter from './modules/auth/auth.routes';
import applicationsRouter from './modules/applications/applications.routes';
import companiesRouter from './modules/companies/companies.routes';
import resumesRouter from './modules/resumes/resumes.routes';
import interviewsRouter from './modules/interviews/interviews.routes';
import dashboardRouter from './modules/dashboard/dashboard.routes';
import { errorHandler } from './middleware/error';

const app = express();
const PORT = env.PORT;

// Enable CORS
app.use(cors({
  origin: (origin, callback) => {
    // Dynamically reflect the request origin to allow credentials: true
    callback(null, true);
  },
  credentials: true,
}));

// Body parser
app.use(express.json());

// Root health check route
app.get('/', (req, res) => {
  res.json({ success: true, message: "Job Application Tracker API is running successfully!" });
});

// Routes
app.use('/api/v1', apiLimiter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/applications', applicationsRouter);
app.use('/api/v1/companies', companiesRouter);
app.use('/api/v1/resumes', resumesRouter);
app.use('/api/v1/interviews', interviewsRouter);
app.use('/api/v1/dashboard', dashboardRouter);

// Global Error Handler
app.use(errorHandler);

// Start server
if (env.NODE_ENV !== 'production' && env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
