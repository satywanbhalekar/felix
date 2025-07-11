// import express from "express";
// import cors from 'cors';
// import helmet from "helmet";
// import ruleRoutes from './routes/rule.routes';
// import realmRoutes from './routes/realm.routes';
// import executionRoutes from './routes/execution.routes';
// import userRoutes from './routes/user.routes';
// import copilotAdapterRoutes from './routes/copilotAdapter';
// //import { verifyTokenLocal } from "./middlewares/keycloak-verifyToken";

// //import { authenticateToken } from './middlewares/authenticateToken';

// const app = express();
// const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
 
// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// }));

// // Apply Helmet middleware
// try {
//   app.use(
//     helmet({
//       contentSecurityPolicy: {
//         useDefaults: true,
//         directives: {
//           defaultSrc: ["'self'"],
//           scriptSrc: ["'self'", "https://js.stripe.com"],
//           styleSrc: ["'self'", "https://fonts.googleapis.com"],
//           fontSrc: ["'self'", "https://fonts.gstatic.com"],
//         }
//       },
//       frameguard: { action: "deny" },
//       xssFilter: true,
//       noSniff: true,
//       hidePoweredBy: true,
//       referrerPolicy: { policy: "no-referrer" },
//       hsts: {
//         maxAge: 63072000,
//         includeSubDomains: true,
//         preload: true,
//       },
//       crossOriginEmbedderPolicy: true,
//       crossOriginOpenerPolicy: true,
//       crossOriginResourcePolicy: { policy: "same-origin" },
//     }));

//   //console.log(' Helmet applied successfully');
// } catch (err) {
//   console.error('Error applying Helmet:', err);
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   app.use((req, res, next) => {
//     res.status(500).json({ error: 'Failed to apply security headers' });
//   });
// }

// // Handle preflight requests for all routes
// app.options("*", cors({
//   origin: allowedOrigins,
//   credentials: true,
// }));
// app.use(express.json());
// // Simple logging middleware to log requests and responses data

// // app.use('/api/copilot-backend-adapter',verifyTokenLocal(),copilotAdapterRoutes);
// app.use('/api/copilot-backend-adapter',copilotAdapterRoutes);
// app.use('/api/v1/realms', realmRoutes);
// app.use('/api/v1/rules', ruleRoutes);
// app.use('/api/v1/', executionRoutes);
// app.use('/api/v1/users', userRoutes);


// export default app;


import express from "express";
import cors from 'cors';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import helmet from "helmet";

import realmRoutes from './routes/realm.routes';

import userRoutes from './routes/user.routes';

//import { verifyTokenLocal } from "./middlewares/keycloak-verifyToken";

import tenantTemplateRoutes from "./routes/tenantTemplate.routes";
import stellarRoutes from "./routes/stellar.routes";
import entityRoutes from "./routes/entity.routes";
import serviceRoutes from "./routes/service.routes";

//import { keycloakEnforcer } from "./middlewares/keycloak-enforcer";
const app = express();

// ✅ Allow all origins and all headers
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  // No `allowedHeaders` specified → allows all
}));

// ✅ Allow all headers manually in OPTIONS handler
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "*"); // ✅ Allow all headers
  res.sendStatus(200);
});
app.use(express.json());
app.use('/api/stellar', stellarRoutes);
app.use('/api/v1/realms', realmRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tenant-templates', tenantTemplateRoutes);
app.use('/api/v1/entities', entityRoutes);
app.use('/api/v1/services', serviceRoutes);
export default app;