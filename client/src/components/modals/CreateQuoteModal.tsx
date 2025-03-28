import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertQuoteSchema, insertClientSchema } from "@shared/schema";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/context/CurrencyContext";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, UserPlus } from "lucide-react";
import { quoteStatusOptions } from "@/lib/constants";
import { z } from "zod";

interface CreateQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateQuoteModal = ({ isOpen, onClose }: CreateQuoteModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currency } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);

  // Get clients for the dropdown
  interface Client {
    id: number;
    name: string;
    email: string;
    phone?: string;
    businessType: string;
  }
  
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // Create a merged zod schema for both quote and new client
  const newClientSchema = z.object({
    name: z.string().min(1, "Business name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    businessType: z.string().min(1, "Business type is required"),
  });

  // Define the type for the form data explicitly, allowing clientId to be either a number or "new"
  type FormData = Omit<z.infer<typeof insertQuoteSchema>, 'clientId'> & {
    clientId: number | "new";
    status?: string;
    newClient?: {
      name: string;
      email: string;
      phone?: string;
      businessType: string;
    };
  };
  
  // Form schema with nested fields for new client
  // Use z.object with the shape of the schema instead of extending a transformed schema
  const formSchema = z.object({
    jobTitle: z.string().min(1, "Job title is required"),
    jobDescription: z.string().min(1, "Job description is required"),
    amount: z.string().min(1, "Amount is required"),
    // Allow either number or the string "new"
    clientId: z.union([z.number(), z.literal("new")]),
    // Add optional status field
    status: z.string().optional(),
    // Make sure validUntil and notes can never be null, only undefined or string
    validUntil: z.string().optional(),
    notes: z.string().optional(),
    currency: z.string().default("USD"),
    // For when creating a new client
    newClient: newClientSchema.optional(),
  });
  
  // Create the form with proper type safety
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: "",
      jobDescription: "",
      amount: "",
      clientId: 0, // Initialize with 0 instead of empty string
      status: "Pending",
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
      currency: currency,
      notes: "",
      newClient: undefined,
    },
  });

  const mutation = useMutation<any, Error, FormData>({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/quotes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quotes/conversion'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Quote created successfully",
        description: "Your quote has been created successfully",
        variant: "default",
      });
      form.reset();
      setShowNewClientForm(false);
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to create quote",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    
    // Handle form submission with the correct typing
    const submissionData = {...data};
    
    // If creating a new client, set the clientId to "new" string
    // The backend API expects "new" as a string for this special case
    if (showNewClientForm) {
      submissionData.clientId = "new";
    }
    
    mutation.mutate(submissionData);
  };

  // Watch the clientId to toggle the new client form
  const watchedClientId = form.watch("clientId");
  
  // When user selects "Create new client" in the dropdown
  const handleClientChange = (value: string) => {
    if (value === "new") {
      setShowNewClientForm(true);
      form.setValue("clientId", "new");
    } else {
      setShowNewClientForm(false);
      // Convert string to number for non-"new" client IDs
      form.setValue("clientId", parseInt(value, 10));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create Quote</DialogTitle>
          <DialogDescription>
            Create a new quote for a client. You can also create a new client if needed.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Website Redesign Project" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select
                    onValueChange={handleClientChange}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new" className="font-medium text-primary">
                        <div className="flex items-center">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Create New Client
                        </div>
                      </SelectItem>
                      <div className="px-2 py-1.5">
                        <Separator className="my-1" />
                      </div>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Client Form (conditionally rendered) */}
            {showNewClientForm && (
              <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/40">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <PlusCircle className="h-4 w-4 mr-1.5 text-primary" />
                  New Client Details
                </h3>
                
                <FormField
                  control={form.control}
                  name="newClient.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="newClient.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@acme.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="newClient.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+1 (555) 123-4567" 
                            {...field} 
                            value={field.value || ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="newClient.businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Marketing Agency">Marketing Agency</SelectItem>
                            <SelectItem value="Design Studio">Design Studio</SelectItem>
                            <SelectItem value="Software House">Software House</SelectItem>
                            <SelectItem value="Architecture Firm">Architecture Firm</SelectItem>
                            <SelectItem value="Media Company">Media Company</SelectItem>
                            <SelectItem value="Small Business">Small Business</SelectItem>
                            <SelectItem value="Freelancer">Freelancer</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="BRL">BRL</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {quoteStatusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of the job scope, deliverables, and timeline"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Terms and conditions, payment schedule, etc."
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Quote"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuoteModal;
