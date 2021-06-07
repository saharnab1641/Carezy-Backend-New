import { google } from "googleapis";
import { env } from "../config/globals";
import { R4 } from "@ahryman40k/ts-fhir-types";
import { IPatient } from "../api/components/patient/model";
import { IPractitioner } from "../api/components/practitioner/model";

export class FHIRService {
  private healthcare;
  private auth: any;

  public constructor() {
    this.healthcare = google.healthcare("v1");
  }

  public initializeAuthClient = (): Promise<String> =>
    new Promise(async (resolve, reject) => {
      try {
        this.auth = await google.auth.getClient({
          credentials: env.GCP_KEYFILE,
          scopes: ["https://www.googleapis.com/auth/cloud-platform"],
        });
        resolve("Resolved");
      } catch (err) {
        reject(err);
      }
    });

  public createResource = (resourceBody: any): Promise<any> =>
    new Promise(async (resolve, reject) => {
      try {
        await this.initializeAuthClient();
        const auth = this.auth;
        google.options({
          auth,
          headers: { "Content-Type": "application/fhir+json" },
        });
        const resource: any =
          await this.healthcare.projects.locations.datasets.fhirStores.fhir.create(
            {
              parent: env.FHIR_BASE.toString(),
              type: resourceBody.resourceType.toString(),
              requestBody: resourceBody,
            }
          );
        resolve(resource.data);
      } catch (err) {
        reject(err);
      }
    });

  public patchResource = (
    resourceType: String,
    resourceId: String,
    patchOptions: any
  ): Promise<String> =>
    new Promise(async (resolve, reject) => {
      try {
        await this.initializeAuthClient();
        const auth = this.auth;
        google.options({
          auth,
          headers: { "Content-Type": "application/json-patch+json" },
        });
        const name = `${env.FHIR_BASE}/fhir/${resourceType}/${resourceId}`;
        await this.healthcare.projects.locations.datasets.fhirStores.fhir.patch(
          {
            name,
            requestBody: patchOptions,
          }
        );
        resolve("Patched");
      } catch (err) {
        reject(err);
      }
    });

  public getTelecomFHIR = (
    contact?: String,
    email?: String,
    contactAlternate?: String
  ): R4.IContactPoint[] => {
    const telecom: R4.IContactPoint[] = [];
    if (contact) {
      telecom.push({
        use: R4.ContactPointUseKind._home,
        value: contact.toString(),
        system: R4.ContactPointSystemKind._phone,
      });
    }
    if (email) {
      telecom.push({
        use: R4.ContactPointUseKind._home,
        value: email.toString(),
        system: R4.ContactPointSystemKind._email,
      });
    }
    if (contactAlternate) {
      telecom.push({
        use: R4.ContactPointUseKind._home,
        value: contactAlternate.toString(),
        system: R4.ContactPointSystemKind._phone,
      });
    }
    return telecom;
  };

  public getNameFHIR = (firstName: String, lastName: String): R4.IHumanName => {
    return {
      use: R4.HumanNameUseKind._official,
      family: lastName.toString(),
      given: [firstName.toString()],
    };
  };

  public getAddressFHIR = (
    city: String,
    state: String,
    pincode: String,
    addressLine?: String
  ): R4.IAddress => {
    const address: R4.IAddress = {
      use: R4.AddressUseKind._home,
      type: R4.AddressTypeKind._physical,
      city: city.toString(),
      state: state.toString(),
      postalCode: pincode.toString(),
    };
    if (addressLine) address.text = addressLine.toString();
    return address;
  };

  public getAttachmentFHIR = (
    file: Express.Multer.File,
    url: String,
    title: String,
    date: Date
  ): R4.IAttachment => {
    return {
      contentType: file.mimetype,
      url: url.toString(),
      size: file.size,
      title: title.toString(),
      creation: date.toISOString().split("T")[0],
    };
  };

  public getPatientFHIR = (patient: IPatient): R4.IPatient => {
    try {
      const fhirObj: R4.IPatient = {
        resourceType: "Patient",
        active: true,
        deceasedBoolean: false,
        name: [this.getNameFHIR(patient.firstName, patient.lastName)],
        telecom: this.getTelecomFHIR(
          patient.contact,
          patient.email,
          patient.contactAlternate
        ),
        birthDate: patient.dateOfBirth.toISOString().split("T")[0],
        address: [
          this.getAddressFHIR(patient.city, patient.state, patient.pincode),
        ],
        maritalStatus: {
          text: patient.maritalStatusBoolean ? "married" : "unmarried",
        },
      };

      if (patient.gender === env.GENDER_ENUM.male)
        fhirObj.gender = R4.PatientGenderKind._male;
      else if (patient.gender === env.GENDER_ENUM.female)
        fhirObj.gender = R4.PatientGenderKind._female;
      else fhirObj.gender = R4.PatientGenderKind._other;

      if (patient.guardian) {
        fhirObj.contact = [
          {
            name: this.getNameFHIR(
              patient.guardian.firstName,
              patient.guardian.lastName
            ),
            telecom: this.getTelecomFHIR(
              patient.guardian.contact,
              undefined,
              patient.guardian.contactAlternate
            ),
          },
        ];

        if (patient.guardian.gender === env.GENDER_ENUM.male)
          fhirObj.contact[0].gender = R4.Patient_ContactGenderKind._male;
        else if (patient.guardian.gender === env.GENDER_ENUM.female)
          fhirObj.contact[0].gender = R4.Patient_ContactGenderKind._female;
        else fhirObj.contact[0].gender = R4.Patient_ContactGenderKind._other;
      }

      return fhirObj;
    } catch (err) {
      return err;
    }
  };

  public getPractitionerFHIR = (
    practitioner: IPractitioner
  ): R4.IPractitioner => {
    try {
      const fhirObj: R4.IPractitioner = {
        resourceType: "Practitioner",
        name: [this.getNameFHIR(practitioner.firstName, practitioner.lastName)],
        active: true,
        telecom: this.getTelecomFHIR(
          practitioner.contact,
          practitioner.email,
          practitioner.contactAlternate
        ),
        address: [
          this.getAddressFHIR(
            practitioner.city,
            practitioner.state,
            practitioner.pincode,
            practitioner.address
          ),
        ],
        birthDate: practitioner.dateOfBirth.toISOString().split("T")[0],
        qualification: [
          { code: { text: practitioner.specializationName.toString() } },
        ],
      };

      if (practitioner.gender === env.GENDER_ENUM.male)
        fhirObj.gender = R4.PractitionerGenderKind._male;
      else if (practitioner.gender === env.GENDER_ENUM.female)
        fhirObj.gender = R4.PractitionerGenderKind._female;
      else fhirObj.gender = R4.PractitionerGenderKind._other;

      return fhirObj;
    } catch (err) {
      return err;
    }
  };
}
