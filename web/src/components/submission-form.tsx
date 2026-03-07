import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  submissionSchema,
  type SubmissionFormData,
} from "@kazibudget/shared/schemas/submission";
import { NAIROBI_AREA_OPTIONS } from "@kazibudget/shared/constants/nairobi-areas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SubmissionForm() {
  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      name: "",
      companyName: "",
      companyLocation: "",
      residentialArea: "",
      yearsOfExperience: 0,
      monthlyGrossSalary: 0,
    },
  });

  const createSubmission = useMutation(api.submissions.create);

  async function onSubmit(data: SubmissionFormData) {
    try {
      const result = await createSubmission({
        name: data.name,
        company_name: data.companyName,
        company_location: data.companyLocation,
        residential_area: data.residentialArea,
        years_of_experience: data.yearsOfExperience,
        monthly_gross_salary: data.monthlyGrossSalary,
      });
      console.log("Submission created:", result);
    } catch (error) {
      console.error("Failed to create submission:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name and Company Name - full width stacked */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="e.g., Jane Wanjiku"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="e.g., Safaricom"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location pair - two columns on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="companyLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Location</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select company area" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {NAIROBI_AREA_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="residentialArea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Residential Area</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select where you live" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {NAIROBI_AREA_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Numeric pair - two columns on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="yearsOfExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of Experience</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 3"
                    min={0}
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthlyGrossSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Gross Salary</FormLabel>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground shrink-0">
                    KES
                  </span>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 80000"
                      min={0}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" size="lg" className="w-full">
          Calculate My Take-Home Salary
        </Button>
      </form>
    </Form>
  );
}
