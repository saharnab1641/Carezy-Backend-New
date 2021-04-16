export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.NODE_PORT || process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/test",
  JWT_SECRET: process.env.JWT_SECRET || "RANDOM_STRING",
  JWT_AUDIENCE: process.env.JWT_AUDIENCE,
  JWT_ISSUER: process.env.JWT_ISSUER,
  PATIENT: "patient",
  DOCTOR: "doctor",
  NURSE: "nurse",
  RECEPTION: "reception",
  HOSPITAL: "hospital",
};
