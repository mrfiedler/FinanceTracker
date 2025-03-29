import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card,
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Settings, 
  Edit, 
  Trash2, 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Define interfaces for categories and accounts
interface Category {
  id: number;
  value: string;
  label: string;
  type: string;
}

interface Account {
  id: number;
  value: string;
  label: string;
}

interface FinanceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FinanceSettingsModal = ({ isOpen, onClose }: FinanceSettingsModalProps) => {
  const [activeTab, setActiveTab] = useState("categories");

  // Category state
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState<"expense" | "revenue">("expense");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  // Account state
  const [accountName, setAccountName] = useState("");
  const [editingAccountId, setEditingAccountId] = useState<number | null>(null);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number, type: "category" | "account", name: string } | null>(null);

  // Processing state to prevent premature modal closing
  const [isProcessing, setIsProcessing] = useState(false);

  // Success animation state
  const [showSuccess, setShowSuccess] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories and accounts from API
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/finance/categories'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/finance/categories');
        return await res.json();
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        return [];
      }
    }
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ['/api/finance/accounts'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/finance/accounts');
        return await res.json();
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
        return [];
      }
    }
  });

  // Organize categories by type
  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const revenueCategories = categories.filter(cat => cat.type === 'revenue');

  // Mutations for categories
  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string, type: string }) => {
      setIsProcessing(true);
      try {
        const res = await apiRequest('POST', '/api/finance/categories', {
          name: data.name,
          type: data.type
        });
        return await res.json();
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/categories'] });
      resetCategoryForm();
      showSuccessNotification("Category added successfully");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add category: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: { id: number, name: string, type: string }) => {
      setIsProcessing(true);
      try {
        const res = await apiRequest('PUT', `/api/finance/categories/${data.id}`, {
          name: data.name,
          type: data.type
        });
        return await res.json();
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/categories'] });
      resetCategoryForm();
      showSuccessNotification("Category updated successfully");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update category: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      setIsProcessing(true);
      try {
        await apiRequest('DELETE', `/api/finance/categories/${id}`);
        return { success: true };
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/categories'] });
      showSuccessNotification("Category deleted successfully");
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete category: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Mutations for accounts
  const createAccountMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      setIsProcessing(true);
      try {
        const res = await apiRequest('POST', '/api/finance/accounts', {
          name: data.name,
          type: 'default'
        });
        return await res.json();
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/accounts'] });
      resetAccountForm();
      showSuccessNotification("Account added successfully");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add account: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateAccountMutation = useMutation({
    mutationFn: async (data: { id: number, name: string }) => {
      setIsProcessing(true);
      try {
        const res = await apiRequest('PUT', `/api/finance/accounts/${data.id}`, {
          name: data.name,
          type: 'default'
        });
        return await res.json();
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/accounts'] });
      resetAccountForm();
      showSuccessNotification("Account updated successfully");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update account: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      setIsProcessing(true);
      try {
        await apiRequest('DELETE', `/api/finance/accounts/${id}`);
        return { success: true };
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/accounts'] });
      showSuccessNotification("Account deleted successfully");
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete account: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete all accounts mutation
  const deleteAllAccountsMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      try {
        // Delete each account one by one
        for (const account of accounts) {
          await apiRequest('DELETE', `/api/finance/accounts/${account.id}`);
        }
        return { success: true };
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/finance/transactions'] });
      showSuccessNotification("All accounts have been deleted");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete all accounts: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Form handling
  const handleSaveCategory = () => {
    if (!categoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (editingCategoryId !== null) {
      // Update existing category
      updateCategoryMutation.mutate({
        id: editingCategoryId,
        name: categoryName.trim(),
        type: categoryType
      });
    } else {
      // Create new category
      createCategoryMutation.mutate({
        name: categoryName.trim(),
        type: categoryType
      });
    }
  };

  const handleSaveAccount = () => {
    if (!accountName.trim()) {
      toast({
        title: "Error",
        description: "Account name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (editingAccountId !== null) {
      // Update existing account
      updateAccountMutation.mutate({
        id: editingAccountId,
        name: accountName.trim()
      }, {
        onSuccess: () => {
          setAccountName('');
          setEditingAccountId(null);
        }
      });
    } else {
      // Create new account
      createAccountMutation.mutate({
        name: accountName.trim()
      }, {
        onSuccess: () => {
          setAccountName('');
        }
      });
    }
  };

  // Edit handlers
  const handleEditCategory = (category: Category) => {
    setCategoryName(category.label);
    setCategoryType(category.type as "expense" | "revenue");
    setEditingCategoryId(category.id);
  };

  const handleEditAccount = (account: Account) => {
    setAccountName(account.label);
    setEditingAccountId(account.id);
  };

  // Delete handlers
  const handleDeleteRequest = (id: number, type: "category" | "account", name: string) => {
    setItemToDelete({ id, type, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;

    setIsProcessing(true);

    try {
      if (itemToDelete.type === 'category') {
        deleteCategoryMutation.mutate(itemToDelete.id);
      } else {
        deleteAccountMutation.mutate(itemToDelete.id);
      }
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // Delete all accounts handler
  const handleDeleteAllAccounts = () => {
    if (accounts.length === 0) {
      toast({
        title: "Info",
        description: "There are no accounts to delete",
      });
      return;
    }

    if (confirm("Are you sure you want to delete all accounts? This action cannot be undone.")) {
      deleteAllAccountsMutation.mutate();
    }
  };

  // Reset form functions
  const resetCategoryForm = () => {
    setCategoryName("");
    setCategoryType("expense");
    setEditingCategoryId(null);
  };

  const resetAccountForm = () => {
    setAccountName("");
    setEditingAccountId(null);
  };

  // Success notification
  const showSuccessNotification = (message: string) => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);

    toast({
      title: "Success",
      description: message,
      variant: "default",
      className: "bg-green-50 text-green-900 border-green-200 dark:bg-green-900/30 dark:text-green-200"
    });
  };

  // Prevent closing modal during operations
  const handleOpenChange = (open: boolean) => {
    if (!open && isProcessing) {
      toast({
        title: "Operation in progress",
        description: "Please wait until the current operation completes",
        variant: "destructive"
      });
      return;
    }

    // Reset forms when closing
    if (!open) {
      resetCategoryForm();
      resetAccountForm();
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {/* Success animation overlay */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/40"
              >
                <motion.div 
                  className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-full p-6"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle size={50} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg flex items-center font-semibold">
              <Settings className="h-5 w-5 mr-2 text-primary" />
              Finance Settings
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Manage your categories and accounts for better financial tracking
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="categories" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 h-10">
              <TabsTrigger value="categories" className="flex items-center justify-center text-sm">
                <DollarSign className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="accounts" className="flex items-center justify-center text-sm">
                <Wallet className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                Accounts
              </TabsTrigger>
            </TabsList>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-4">
              {/* Add/Edit Category Form */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-md">
                    {editingCategoryId !== null ? "Edit Category" : "Add New Category"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryName">Category Name</Label>
                      <Input
                        id="categoryName"
                        placeholder="Enter category name"
                        value={categoryName}
                        onChange={e => setCategoryName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category Type</Label>
                      <RadioGroup
                        value={categoryType}
                        onValueChange={(value) => setCategoryType(value as "expense" | "revenue")}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="expense" id="expense" />
                          <Label htmlFor="expense" className="flex items-center">
                            <ArrowDownCircle className="h-4 w-4 mr-1 text-red-500" />
                            Expense
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="revenue" id="revenue" />
                          <Label htmlFor="revenue" className="flex items-center">
                            <ArrowUpCircle className="h-4 w-4 mr-1 text-green-500" />
                            Revenue
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  {editingCategoryId !== null && (
                    <Button variant="outline" onClick={resetCategoryForm}>
                      Cancel
                    </Button>
                  )}
                  <Button className="ml-auto" onClick={handleSaveCategory}>
                    {editingCategoryId !== null ? "Update" : "Add"} Category
                  </Button>
                </CardFooter>
              </Card>

              {/* Categories Lists */}
              <div className="grid grid-cols-1 gap-4">
                {/* Expense Categories */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <ArrowDownCircle className="h-4 w-4 mr-1 text-red-500" />
                      Expense Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    {categoriesLoading ? (
                      <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
                    ) : expenseCategories.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No expense categories created yet
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {expenseCategories.map(category => (
                          <motion.div
                            key={category.id}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <span className="text-sm">{category.label}</span>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleEditCategory(category)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                                onClick={() => handleDeleteRequest(category.id, "category", category.label)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Revenue Categories */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <ArrowUpCircle className="h-4 w-4 mr-1 text-green-500" />
                      Revenue Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    {categoriesLoading ? (
                      <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
                    ) : revenueCategories.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No revenue categories created yet
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {revenueCategories.map(category => (
                          <motion.div
                            key={category.id}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <span className="text-sm">{category.label}</span>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleEditCategory(category)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                                onClick={() => handleDeleteRequest(category.id, "category", category.label)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Accounts Tab */}
            <TabsContent value="accounts" className="space-y-4">
              {/* Add/Edit Account Form */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-md">
                    {editingAccountId !== null ? "Edit Account" : "Add New Account"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Bank Account Name</Label>
                    <Input
                      id="accountName"
                      placeholder="Enter bank account name"
                      value={accountName}
                      onChange={e => setAccountName(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  {editingAccountId !== null ? (
                    <Button variant="outline" onClick={resetAccountForm}>
                      Cancel
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={handleDeleteAllAccounts}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete All Accounts
                    </Button>
                  )}
                  <Button className="ml-auto" onClick={handleSaveAccount}>
                    {editingAccountId !== null ? "Update" : "Add"} Account
                  </Button>
                </CardFooter>
              </Card>

              {/* Accounts List */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Wallet className="h-4 w-4 mr-1 text-primary" />
                    Your Bank Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {accountsLoading ? (
                    <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
                  ) : accounts.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No bank accounts created yet
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {accounts.map(account => (
                        <motion.div
                          key={account.id}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center">
                            <Wallet className="h-4 w-4 mr-2 text-primary" />
                            <span className="text-sm">{account.label}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEditAccount(account)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                              onClick={() => handleDeleteRequest(account.id, "account", account.label)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {itemToDelete?.type} "{itemToDelete?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FinanceSettingsModal;