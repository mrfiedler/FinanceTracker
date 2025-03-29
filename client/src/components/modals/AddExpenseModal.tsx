import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExpenseSchema } from "@shared/schema";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCurrency } from "@/context/CurrencyContext";
import { 
  Wallet, 
  CreditCard, 
  Building, 
  Landmark, 
  BanknoteIcon,
  Plus,
  CheckCircle,
  ArrowDownCircle,
  X
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
  icon?: string;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: any;
  isEditing?: boolean;
}

const AddExpenseModal = ({ isOpen, onClose, expense, isEditing = false }: AddExpenseModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currency } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);
  
  // Get the list of finance categories from API
  const { data: financeCategories = [] } = useQuery<FinanceCategory[]>({
    queryKey: ['/api/finance/categories'],
    enabled: isOpen,
  });
  
  // Get the list of accounts from API
  const { data: financeAccounts = [] } = useQuery<FinanceAccount[]>({
    queryKey: ['/api/finance/accounts'],
    enabled: isOpen,
  });
  
  // Filter expense categories
  const expenseCategories = financeCategories.filter(cat => cat.type === 'expense');
  
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
        form.setValue('category', data.value);
      }
      
      toast({
        title: "Category added",
        description: "New expense category has been created",
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
        form.setValue('account', data.value);
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
      type: 'expense'
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
  
  // Helper function to render account icons
  const renderAccountIcon = (iconType: string) => {
    switch (iconType) {
      case 'default':
      case 'wallet':
        return <Wallet className="mr-2 h-4 w-4" />;
      case 'chase':
        return <SiChase className="mr-2 h-4 w-4" />;
      case 'bankofamerica':
        return <SiBankofamerica className="mr-2 h-4 w-4" />;
      case 'wells_fargo':
        return <SiWellsfargo className="mr-2 h-4 w-4" />;
      case 'paypal':
        return <SiPaypal className="mr-2 h-4 w-4" />;
      case 'stripe':
        return <SiStripe className="mr-2 h-4 w-4" />;
      case 'square':
        return <SiSquare className="mr-2 h-4 w-4" />;
      case 'venmo':
        return <SiVenmo className="mr-2 h-4 w-4" />;
      case 'cash':
      case 'banknote':
        return <BanknoteIcon className="mr-2 h-4 w-4" />;
      case 'other':
      case 'landmark':
        return <Landmark className="mr-2 h-4 w-4" />;
      default:
        return <Wallet className="mr-2 h-4 w-4" />;
    }
  };

  const form = useForm({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: isEditing && expense
      ? {
          description: expense.description,
          amount: expense.amount.toString(),
          category: expense.category,
          date: expense.date.split('T')[0],
          dueDate: expense.dueDate ? expense.dueDate.split('T')[0] : "",
          currency: expense.currency || currency,
          account: expense.account || "default",
          notes: expense.notes || "",
          isPaid: expense.isPaid || false,
        }
      : {
          description: "",
          amount: "",
          category: "",
          date: new Date().toISOString().split("T")[0],
          dueDate: "",
          currency: currency,
          account: "default",
          notes: "",
          isPaid: false,
        },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing && expense) {
        return apiRequest("PATCH", `/api/expenses/${expense.id}`, data);
      } else {
        return apiRequest("POST", "/api/expenses", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/finance/trends'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/finance/transactions'] });
      
      toast({
        title: isEditing ? "Expense updated successfully" : "Expense added successfully",
        description: isEditing ? "Your expense has been updated" : "Your expense has been recorded",
        variant: "default",
      });
      
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: isEditing ? "Failed to update expense" : "Failed to add expense",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: any) => {
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Expense" : "Add Expense"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update expense details" : "Record a new expense for your business"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Office supplies" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
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
                          <ArrowDownCircle className="h-4 w-4 mr-2 text-red-500" />
                          <span className="text-xs">This will be added as an Expense category</span>
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
                            {expenseCategories.length === 0 ? (
                              <div className="px-2 py-4 text-center">
                                <p className="text-sm text-gray-500">No categories found</p>
                              </div>
                            ) : (
                              expenseCategories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))
                            )}
                            <SelectSeparator />
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

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Creation Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
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

              <FormField
                control={form.control}
                name="account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account</FormLabel>
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
                        <div className="flex items-center">
                          <Wallet className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-xs">This will be added as a payment account</span>
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
                                    {renderAccountIcon(account.icon || account.value)}
                                    {account.label}
                                  </div>
                                </SelectItem>
                              ))
                            )}
                            <SelectSeparator />
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
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="isPaid"
                {...form.register("isPaid")}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="isPaid" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Mark as Paid
              </label>
            </div>


            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about this expense"
                      className="resize-none"
                      {...field}
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
                {isSubmitting 
                  ? (isEditing ? "Updating..." : "Adding...") 
                  : (isEditing ? "Update Expense" : "Add Expense")
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;