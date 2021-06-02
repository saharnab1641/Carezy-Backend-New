export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.NODE_PORT || process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/test",
  JWT_RSA_PRIVATE_KEY: Buffer.from(
    process.env.JWT_RSA_PRIVATE_KEY_BASE64 || "RSAPRIVATEKEYINBASE64",
    "base64"
  ).toString("utf8"),
  JWT_RSA_PUBLIC_KEY: Buffer.from(
    process.env.JWT_RSA_PUBLIC_KEY_BASE64 || "RSAPUBLICKEYINBASE64",
    "base64"
  ).toString("utf8"),
  JWT_AUDIENCE: process.env.JWT_AUDIENCE,
  JWT_ISSUER: process.env.JWT_ISSUER,
  GMAIL_USER: process.env.GMAIL_USER,
  GMAIL_PASS: process.env.GMAIL_PASS,
  RAZORPAY_ID: process.env.RAZORPAY_ID,
  RAZORPAY_SECRET: process.env.RAZORPAY_SECRET || "secret",
  GCP_KEYFILE: process.env.GCP_KEYFILE || "keyfileJSONstring",
  GCP_BUCKET: process.env.GCP_BUCKET || "bucket",
  PATIENT: "patient",
  DOCTOR: "doctor",
  NURSE: "nurse",
  RECEPTION: "reception",
  HOSPITAL: "hospital",
  LABORATORY: "laboratory",
  ADMIN: "admin",
  ALLOWEDIMAGETYPES: ["image/jpeg", "image/jpg", "image/png"],
};
