import { z } from "zod";

export const submissionSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100),
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(200),
  companyLocation: z
    .string()
    .min(1, "Company location is required"),
  residentialArea: z
    .string()
    .min(1, "Residential area is required"),
  yearsOfExperience: z
    .number()
    .int("Must be a whole number")
    .min(0)
    .max(50),
  monthlyGrossSalary: z
    .number()
    .positive("Salary must be positive")
    .max(100_000_000),
});

export type SubmissionFormData = z.infer<typeof submissionSchema>;
