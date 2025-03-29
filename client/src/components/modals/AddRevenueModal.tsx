import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Separator } from "@/components/ui/separator";
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
import { useCurrency } from "@/hooks/useCurrency";
import { revenueCategories } from "@/lib/constants";
import { 
  Plus,
  UserPlus,
  X,
  ArrowUpCircle
} from "lucide-react";

interface AddRevenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  revenue?: any;
  isEditing?: boolean;
}

const AddRevenueModal = ({ isOpen, onClose, revenue, isEditing = false }: AddRevenueModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currency } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newBusinessType, setNewBusinessType] = useState("");
  const [customBusinessTypeMode, setCustomBusinessTypeMode] = useState(false);
  
  // States for adding new categories and accounts on the fly
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);

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
  const { data: financeCategories = [] as FinanceCategory[] } = useQuery<FinanceCategory[]>({
    queryKey: ['/api/finance/categories'],
    enabled: isOpen,
  });

  // Get the list of accounts from API
  const { data: financeAccounts = [] as FinanceAccount[] } = useQuery<FinanceAccount[]>({
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

  // Create a custom schema for revenue form that allows string clientId which will be converted to number
  const customRevenueSchema = z.object({
    description: z.string().min(1, "Description is required"),
    amount: z.string().min(1, "Amount is required"),
    clientId: z.string().min(1, "Client is required"),
    category: z.string().min(1, "Category is required"),
    date: z.string(),
    dueDate: z.string().optional(),
    notes: z.string().optional(),
    currency: z.string(),
    account: z.string(),
    isPaid: z.boolean().default(false),
    // For new client form
    newClient: z.object({
      name: z.string().min(1, "Client name is required"),
      email: z.string().email("Invalid email format"),
      phone: z.string().optional(),
      businessType: z.string().optional(),
    }).optional(),
  });

  type RevenueFormValues = z.infer<typeof customRevenueSchema>;

  // Main form for the revenue
  const revenueForm = useForm<RevenueFormValues>({
    resolver: zodResolver(customRevenueSchema),
    defaultValues: isEditing && revenue
      ? {
          description: revenue.description,
          amount: revenue.amount.toString(),
          clientId: revenue.clientId?.toString() || "",
          category: revenue.category,
          date: revenue.date?.split('T')[0] || new Date().toISOString().split("T")[0],
          dueDate: revenue.dueDate ? revenue.dueDate.split('T')[0] : "",
          currency: revenue.currency || currency,
          account: revenue.account || "default",
          notes: revenue.notes || "",
          isPaid: revenue.isPaid || false,
          newClient: undefined,
        }
      : {
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
          newClient: undefined,
        },
  });

  // Get only revenue categories from the categories list
  const filteredRevenueCategories = financeCategories && Array.isArray(financeCategories)
    ? financeCategories.filter((cat) => cat.type === 'revenue')
    : revenueCategories;

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (data: { name: string, type: string }) => {
      setAddingCategory(true);
      try {
        const res = await apiRequest('POST', '/api/finance/categories', {
          name: data.name,
          type: data.type
        });
        return await res.json();
      } finally {
        setAddingCategory(false);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/categories'] });
      setShowAddCategory(false);
      setNewCategoryName("");
      
      if (data && data.value) {
        revenueForm.setValue('category', data.value);
      }
      
      toast({
        title: "Category added",
        description: "New revenue category has been created",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add category",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  });
  
  // Add account mutation
  const addAccountMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      setAddingAccount(true);
      try {
        const res = await apiRequest('POST', '/api/finance/accounts', {
          name: data.name,
          type: 'default'
        });
        return await res.json();
      } finally {
        setAddingAccount(false);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/accounts'] });
      setShowAddAccount(false);
      setNewAccountName("");
      
      if (data && data.value) {
        revenueForm.setValue('account', data.value);
      }
      
      toast({
        title: "Account added",
        description: "New account has been created",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add account",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  });
  
  // Handle adding new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    addCategoryMutation.mutate({
      name: newCategoryName.trim(),
      type: 'revenue'
    });
  };
  
  // Handle adding new account
  const handleAddAccount = () => {
    if (!newAccountName.trim()) {
      toast({
        title: "Error",
        description: "Account name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    addAccountMutation.mutate({
      name: newAccountName.trim()
    });
  };
  
  // Add/Edit Revenue mutation
  const addRevenueMutation = useMutation({
    mutationFn: async (data: any) => {
      // If creating a new client as part of this submission
      if (showNewClientForm && data.newClient) {
        try {
          const newClient = await createClientMutation.mutateAsync({
            name: data.newClient.name,
            email: data.newClient.email,
            phone: data.newClient.phone || null,
            businessType: data.newClient.businessType || null,
            isActive: true
          });
          
          // Use the new client's ID for the revenue
          data.clientId = newClient.id.toString();
        } catch (error) {
          throw error; // Let the error bubble up
        }
      }
      
      // Remove the newClient data before sending to API
      const { newClient, ...revenueData } = data;
      
      // Convert clientId to number
      revenueData.clientId = Number(revenueData.clientId);
      
      if (isEditing && revenue) {
        return apiRequest("PATCH", `/api/revenues/${revenue.id}`, revenueData);
      } else {
        return apiRequest("POST", "/api/revenues", revenueData);
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/finance/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/finance/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/finance/trends'] });
      queryClient.invalidateQueries({ queryKey: ['/api/revenues'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients/top'] });
      
      toast({
        title: isEditing ? "Revenue updated successfully" : "Revenue added successfully",
        description: isEditing ? "Your revenue has been updated" : "Your revenue has been recorded",
        variant: "default",
      });
      
      // Reset form and close modal
      revenueForm.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: isEditing ? "Failed to update revenue" : "Failed to add revenue",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Create client mutation (will be used by the revenue mutation)
  const createClientMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/clients", data);
      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    }
  });

  // Handle revenue form submission
  const onSubmitRevenue = (data: RevenueFormValues) => {
    setIsSubmitting(true);
    addRevenueMutation.mutate(data);
  };

  // When user selects "Create new client" in the dropdown
  const handleClientChange = (value: string) => {
    if (value === "new") {
      setShowNewClientForm(true);
      revenueForm.setValue("clientId", "");
    } else {
      setShowNewClientForm(false);
      revenueForm.setValue("clientId", value);
    }
  };

  // Cancel creating a new client
  const cancelNewClientForm = () => {
    setShowNewClientForm(false);
    revenueForm.setValue("newClient", undefined);
  };

  // Helper function to render account icons
  function renderAccountIcon(accountType: string): JSX.Element {
    const iconClassName = "h-4 w-4 mr-2";
    
    switch (accountType) {
      case 'bank':
        return <svg className={iconClassName} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>;
      case 'cash':
        return <svg className={iconClassName} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
      case 'card':
        return <svg className={iconClassName} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>;
      default:
        return <svg className={iconClassName} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 17h2.095M4.095 17h3.144M7.239 17h1.557m5.144.273h.515M15.454 17h1.392M16.846 17h.866M17.72 17H22"></path><circle cx="12" cy="12" r="10"></circle><path d="M12 2v20M2 12h20"></path></svg>;
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Revenue" : "Add Revenue"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modify the details of this revenue transaction"
              : "Record a new revenue transaction for your business"
            }
          </DialogDescription>
        </DialogHeader>
        
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
                    <Select
                      onValueChange={(value) => handleClientChange(value)}
                      value={field.value ? field.value.toString() : ""}
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
                        <Separator className="my-1" />
                        {Array.isArray(clients) && clients.map((client) => (
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
              
              {/* New Client Form displayed right below client selection */}
              {showNewClientForm && (
                <div className="col-span-2 mt-2 bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <UserPlus className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="font-medium">New Client Information</h3>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={cancelNewClientForm}
                      className="h-8 px-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={revenueForm.control}
                      name="newClient.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Business or client name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={revenueForm.control}
                      name="newClient.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="client@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={revenueForm.control}
                        name="newClient.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 555 123 4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={revenueForm.control}
                        name="newClient.businessType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Type (Optional)</FormLabel>
                            {customBusinessTypeMode ? (
                              <div className="flex space-x-2">
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Tech Startup"
                                    value={newBusinessType}
                                    onChange={(e) => {
                                      setNewBusinessType(e.target.value);
                                      field.onChange(e.target.value);
                                    }}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="mt-0"
                                  onClick={() => {
                                    setCustomBusinessTypeMode(false);
                                    setNewBusinessType("");
                                    field.onChange("");
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Select
                                onValueChange={(value) => {
                                  if (value === "custom") {
                                    setCustomBusinessTypeMode(true);
                                  } else {
                                    field.onChange(value);
                                  }
                                }}
                                value={field.value || ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="tech">Tech</SelectItem>
                                  <SelectItem value="healthcare">Healthcare</SelectItem>
                                  <SelectItem value="finance">Finance</SelectItem>
                                  <SelectItem value="education">Education</SelectItem>
                                  <SelectItem value="retail">Retail</SelectItem>
                                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                  <SelectItem value="custom" className="text-primary">
                                    <div className="flex items-center">
                                      <Plus className="mr-2 h-3 w-3" />
                                      Custom Type
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              <FormField
                control={revenueForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    {showAddCategory ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Enter new category name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            type="button"
                            size="sm"
                            onClick={handleAddCategory}
                            disabled={addingCategory}
                            className="px-2"
                          >
                            {addingCategory ? "Adding..." : "Save"}
                          </Button>
                          <Button 
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowAddCategory(false)}
                            className="px-2 h-9 w-9"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center">
                          <ArrowUpCircle className="h-4 w-4 mr-2 text-green-500" />
                          <span className="text-xs">This will be added as a Revenue category</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
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
                            {filteredRevenueCategories.length === 0 ? (
                              <div className="px-2 py-4 text-center">
                                <p className="text-sm text-gray-500">No categories found</p>
                              </div>
                            ) : (
                              filteredRevenueCategories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))
                            )}
                            <div className="px-2 py-1.5">
                              <Button
                                type="button"
                                variant="ghost"
                                className="w-full h-8 justify-start text-sm font-normal"
                                onClick={() => {
                                  setShowAddCategory(true);
                                  setNewCategoryName("");
                                }}
                              >
                                <Plus className="h-3.5 w-3.5 mr-2" />
                                Add New Category
                              </Button>
                            </div>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
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
                  {showAddAccount ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Enter new account name"
                          value={newAccountName}
                          onChange={(e) => setNewAccountName(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          type="button"
                          size="sm"
                          onClick={handleAddAccount}
                          disabled={addingAccount}
                          className="px-2"
                        >
                          {addingAccount ? "Adding..." : "Save"}
                        </Button>
                        <Button 
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowAddAccount(false)}
                          className="px-2 h-9 w-9"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
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
                          {financeAccounts.length === 0 ? (
                            <div className="px-2 py-4 text-center">
                              <p className="text-sm text-gray-500">No accounts found</p>
                            </div>
                          ) : (
                            financeAccounts.map((account) => (
                              <SelectItem key={account.value} value={account.value}>
                                <div className="flex items-center">
                                  {renderAccountIcon(account.icon)}
                                  {account.label}
                                </div>
                              </SelectItem>
                            ))
                          )}
                          <div className="px-2 py-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full h-8 justify-start text-sm font-normal"
                              onClick={() => {
                                setShowAddAccount(true);
                                setNewAccountName("");
                              }}
                            >
                              <Plus className="h-3.5 w-3.5 mr-2" />
                              Add New Account
                            </Button>
                          </div>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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

            {/* New client form moved to below client selection dropdown */}

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? (isEditing ? "Updating..." : "Adding...") 
                  : (isEditing ? "Update Revenue" : "Add Revenue")
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRevenueModal;