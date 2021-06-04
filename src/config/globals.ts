enum GENDER_ENUM {
  male = "male",
  female = "female",
  other = "other",
}

enum ROLE_ENUM {
  patient = "patient",
  nurse = "nurse",
  doctor = "doctor",
  reception = "reception",
  laboratory = "laboratory",
  admin = "admin",
}

enum APPOINTMENT_STATUS {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
  inclinic = "inclinic",
  consulted = "consulted",
}

enum RECEIPT_STATUS {
  created = "created",
  paid = "paid",
  abandoned = "abandoned",
  refunded = "refunded",
}

enum PAYMENT_SOURCE {
  app = "app",
  reception = "reception",
}

enum LAB_REPORT_STATUS {
  pending = "pending",
  approved = "approved",
  scheduled = "scheduled",
  completed = "completed",
}

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
  GCP_KEYFILE: JSON.parse(
    process.env.GCP_KEYFILE || '{"gcpkeyfilestringified":"sample"}'
  ),
  FHIR_BASE: `projects/${process.env.GCP_PROJECT_ID}/locations/${process.env.GCP_FHIR_CLOUD_REGION}/datasets/${process.env.GCP_FHIR_DATASET_ID}/fhirStores/${process.env.GCP_FHIR_STORE_ID}`,
  GCP_BUCKET: process.env.GCP_BUCKET || "bucket",
  HOSPITAL: "hospital",
  ROLE_ENUM,
  ALLOWEDIMAGETYPES: ["image/jpeg", "image/jpg", "image/png"],
  GENDER_ENUM,
  APPOINTMENT_STATUS,
  RECEIPT_STATUS,
  PAYMENT_SOURCE,
  LAB_REPORT_STATUS,
};
