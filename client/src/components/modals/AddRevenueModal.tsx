import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRevenueSchema, insertClientSchema } from "@shared/schema";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/context/CurrencyContext";
import { revenueCategories, bankAccounts, businessTypes } from "@/lib/constants";
import { 
  Wallet, 
  CreditCard, 
  Building, 
  Landmark, 
  BanknoteIcon,
  Plus,
  ChevronLeft,
  Save,
  UserPlus
} from "lucide-react";
import { 
  SiChase, 
  SiBankofamerica, 
  SiWellsfargo,
  SiPaypal,
  SiStripe,
  SiSquare, 
  SiVenmo
} from "react-icons/si";
import { useQuery as useFinanceQuery } from "@tanstack/react-query";

interface AddRevenueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddRevenueModal = ({ isOpen, onClose }: AddRevenueModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currency } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [activeTab, setActiveTab] = useState("revenue");
  const [newBusinessType, setNewBusinessType] = useState("");
  const [customBusinessTypeMode, setCustomBusinessTypeMode] = useState(false);

  // Define types for the data we're fetching
  interface FinanceCategory {
    id: number;
    value: string;
    label: string;
    type: string;
  }

  interface FinanceAccount {
    id: number;
    value: string;
    label: string;
    icon: string;
  }

  interface Client {
    id: number;
    name: string;
    email: string;
    phone?: string;
    businessType?: string;
  }

  // Get the list of finance categories from API
  const { data: financeCategories = [] as FinanceCategory[] } = useFinanceQuery<FinanceCategory[]>({
    queryKey: ['/api/finance/categories'],
    enabled: isOpen,
  });

  // Get the list of accounts from API
  const { data: financeAccounts = [] as FinanceAccount[] } = useFinanceQuery<FinanceAccount[]>({
    queryKey: ['/api/finance/accounts'],
    enabled: isOpen,
  });
  
  // Get clients for the dropdown
  const { data: clients = [] as Client[], refetch: refetchClients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    enabled: isOpen,
  });

  // Form for adding a new client
  const clientForm = useForm({
    resolver: zodResolver(insertClientSchema.extend({
      businessType: insertClientSchema.shape.businessType
    })),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      businessType: "",
      notes: "",
    },
  });

  // Main form for the revenue
  const revenueForm = useForm({
    resolver: zodResolver(insertRevenueSchema),
    defaultValues: {
      description: "",
      amount: "",
      clientId: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      dueDate: "",
      currency: currency,
      account: "default",
      notes: "",
      isPaid: false,
    },
  });

  // Get only revenue categories from the categories list
  const filteredRevenueCategories = financeCategories && Array.isArray(financeCategories)
    ? financeCategories.filter((cat) => cat.type === 'revenue')
    : revenueCategories;

  // Add Client mutation
  const addClientMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/clients", data);
    },
    onSuccess: (response) => {
      // Parse the response JSON
      response.json().then((newClient) => {
        // Add the new client to the clients list and update the clientId field
        if (newClient && newClient.id) {
          // Invalidate clients query to refresh the data
          queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
          
          // Update the clientId in the revenue form
          revenueForm.setValue('clientId', newClient.id.toString());
          
          // Show success toast
          toast({
            title: "Client added successfully",
            description: `${newClient.name} has been added to your clients`,
            variant: "default",
          });
          
          // Reset the client form and switch back to revenue tab
          clientForm.reset();
          setShowNewClientForm(false);
          setActiveTab("revenue");
        }
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add client",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Add Revenue mutation
  const addRevenueMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/revenues", data);
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/finance/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/finance/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/finance/trends'] });
      queryClient.invalidateQueries({ queryKey: ['/api/revenues'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients/top'] });
      
      toast({
        title: "Revenue added successfully",
        description: "Your revenue has been recorded",
        variant: "default",
      });
      
      // Reset form and close modal
      revenueForm.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to add revenue",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Handle client form submission
  const onSubmitClient = (data: any) => {
    addClientMutation.mutate(data);
  };

  // Handle revenue form submission
  const onSubmitRevenue = (data: any) => {
    setIsSubmitting(true);
    
    // Create a copy of the data to avoid mutating the form values
    const submissionData = {
      ...data,
      // Ensure clientId is a number - use Number() which is more reliable than parseInt
      clientId: data.clientId ? Number(data.clientId) : undefined
    };
    
    console.log("Submitting revenue with data:", submissionData);
    addRevenueMutation.mutate(submissionData);
  };

  // Toggle new client form
  const toggleNewClientForm = () => {
    setShowNewClientForm(!showNewClientForm);
    setActiveTab(showNewClientForm ? "revenue" : "client");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {showNewClientForm && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mr-2 p-0 h-7 w-7"
                onClick={toggleNewClientForm}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {showNewClientForm ? "Add New Client" : "Add Revenue"}
          </DialogTitle>
          <DialogDescription>
            {showNewClientForm 
              ? "Create a new client for your revenue transaction" 
              : "Record a new revenue transaction for your business"
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full grid-cols-2 mb-4 ${showNewClientForm ? 'hidden' : ''}`}>
            <TabsTrigger value="revenue">Revenue Details</TabsTrigger>
            <TabsTrigger value="client">New Client</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <Form {...revenueForm}>
              <form onSubmit={revenueForm.handleSubmit(onSubmitRevenue)} className="space-y-4">
                <FormField
                  control={revenueForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Input placeholder="Website design project" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={revenueForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount *</FormLabel>
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
                    control={revenueForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                    control={revenueForm.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client *</FormLabel>
                        <div className="space-y-2">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select client" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(clients) && clients.map((client) => (
                                <SelectItem key={client.id} value={client.id.toString()}>
                                  {client.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs h-7"
                            onClick={() => setActiveTab("client")}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Add New Client
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={revenueForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(filteredRevenueCategories) && filteredRevenueCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={revenueForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Creation Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={revenueForm.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={revenueForm.control}
                  name="account"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(financeAccounts) && financeAccounts.length > 0 ? (
                            financeAccounts.map((account) => (
                              <SelectItem key={account.value} value={account.value}>
                                <div className="flex items-center">
                                  {renderAccountIcon(account.icon)}
                                  {account.label}
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            bankAccounts.map((account) => (
                              <SelectItem key={account.value} value={account.value}>
                                <div className="flex items-center">
                                  {renderAccountIcon(account.value)}
                                  {account.label}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={revenueForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional details about this revenue"
                          className="resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="isPaid"
                    {...revenueForm.register("isPaid")}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="isPaid" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Mark as Received
                  </label>
                </div>

                <DialogFooter>
                  <Button variant="outline" type="button" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Revenue"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="client">
            <Form {...clientForm}>
              <form onSubmit={clientForm.handleSubmit(onSubmitClient)} className="space-y-4">
                <FormField
                  control={clientForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corporation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={clientForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="client@example.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={clientForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="(555) 123-4567" 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={clientForm.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type *</FormLabel>
                        {!customBusinessTypeMode ? (
                          <>
                            <div className="flex flex-col space-y-2">
                              <Select
                                onValueChange={(value) => {
                                  if (value === "custom") {
                                    setCustomBusinessTypeMode(true);
                                  } else {
                                    field.onChange(value);
                                  }
                                }}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {businessTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="custom">
                                    <div className="flex items-center">
                                      <Plus className="mr-2 h-3.5 w-3.5" />
                                      Add Custom Type
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <FormControl>
                                <Input
                                  placeholder="Enter custom business type"
                                  value={newBusinessType}
                                  onChange={(e) => setNewBusinessType(e.target.value)}
                                />
                              </FormControl>
                              <Button 
                                type="button" 
                                size="sm"
                                onClick={() => {
                                  if (newBusinessType.trim()) {
                                    // Set the form field value
                                    field.onChange(newBusinessType);
                                    // Reset the custom mode
                                    setCustomBusinessTypeMode(false);
                                  }
                                }}
                              >
                                Add
                              </Button>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => {
                                setCustomBusinessTypeMode(false);
                                setNewBusinessType("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={clientForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional details about this client"
                          className="resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setActiveTab("revenue")}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addClientMutation.isPending}
                  >
                    {addClientMutation.isPending ? "Adding..." : "Add Client"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to render account icons
function renderAccountIcon(accountType: string) {
  switch (accountType) {
    case "default":
      return <Wallet className="mr-2 h-4 w-4" />;
    case "chase":
      return <SiChase className="mr-2 h-4 w-4" />;
    case "bankofamerica":
      return <SiBankofamerica className="mr-2 h-4 w-4" />;
    case "wells_fargo":
      return <SiWellsfargo className="mr-2 h-4 w-4" />;
    case "paypal":
      return <SiPaypal className="mr-2 h-4 w-4" />;
    case "stripe":
      return <SiStripe className="mr-2 h-4 w-4" />;
    case "square":
      return <SiSquare className="mr-2 h-4 w-4" />;
    case "venmo":
      return <SiVenmo className="mr-2 h-4 w-4" />;
    case "cash":
      return <BanknoteIcon className="mr-2 h-4 w-4" />;
    case "other":
      return <Landmark className="mr-2 h-4 w-4" />;
    default:
      return <Wallet className="mr-2 h-4 w-4" />;
  }
}

export default AddRevenueModal;