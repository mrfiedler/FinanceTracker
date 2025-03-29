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
import { Badge } from "@/components/ui/badge";
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
  Plus, 
  Wallet, 
  BanknoteIcon, 
  Landmark, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  DollarSign,
  SearchIcon,
  Save,
  X,
  CheckCircle,
  AlertCircle,
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
import { bankAccounts } from "@/lib/constants";

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
  icon: string;
}

interface FinanceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FinanceSettingsModal = ({ isOpen, onClose }: FinanceSettingsModalProps) => {
  const [activeTab, setActiveTab] = useState("categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("expense");
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState("other");
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number, type: string, name: string } | null>(null);
  
  // Prevent modal from closing when running operations
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Success animation state
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch user's categories and accounts from API
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

  // Create mutations for CRUD operations
  const addCategoryMutation = useMutation({
    mutationFn: async (categoryData: { name: string; type: string }) => {
      setIsProcessing(true);
      try {
        const res = await apiRequest('POST', '/api/finance/categories', categoryData);
        return await res.json();
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/categories'] });
      setNewCategoryName("");
      showSuccessAnimation();
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
    mutationFn: async (categoryData: { id: number; name: string; type: string }) => {
      setIsProcessing(true);
      try {
        const res = await apiRequest('PUT', `/api/finance/categories/${categoryData.id}`, {
          name: categoryData.name,
          type: categoryData.type
        });
        return await res.json();
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/categories'] });
      resetCategoryForm();
      showSuccessAnimation();
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
    mutationFn: async (categoryId: number) => {
      setIsProcessing(true);
      try {
        const res = await apiRequest('DELETE', `/api/finance/categories/${categoryId}`);
        return await res.json();
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/categories'] });
      showSuccessAnimation();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete category: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const addAccountMutation = useMutation({
    mutationFn: async (accountData: { name: string; type: string }) => {
      setIsProcessing(true);
      try {
        const res = await apiRequest('POST', '/api/finance/accounts', accountData);
        return await res.json();
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/accounts'] });
      resetAccountForm();
      showSuccessAnimation();
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
    mutationFn: async (accountData: { id: number; name: string; type: string }) => {
      setIsProcessing(true);
      try {
        const res = await apiRequest('PUT', `/api/finance/accounts/${accountData.id}`, {
          name: accountData.name,
          type: accountData.type
        });
        return await res.json();
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/accounts'] });
      resetAccountForm();
      showSuccessAnimation();
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
    mutationFn: async (accountId: number) => {
      setIsProcessing(true);
      try {
        const res = await apiRequest('DELETE', `/api/finance/accounts/${accountId}`);
        return await res.json();
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/accounts'] });
      showSuccessAnimation();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete account: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Filter data based on search query
  const filteredCategories = categories.filter(
    (category) => category.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAccounts = accounts.filter(
    (account) => account.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const expenseCategories = filteredCategories.filter(cat => cat.type === 'expense');
  const revenueCategories = filteredCategories.filter(cat => cat.type === 'revenue');

  // Category operations
  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setNewCategoryName(category.label);
    setNewCategoryType(category.type);
    setIsEditingCategory(true);
  };

  const handleSaveCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (isEditingCategory && currentCategory) {
      updateCategoryMutation.mutate({
        id: currentCategory.id,
        name: newCategoryName.trim(),
        type: newCategoryType
      });
    } else {
      addCategoryMutation.mutate({
        name: newCategoryName.trim(),
        type: newCategoryType
      });
    }
  };

  const resetCategoryForm = () => {
    setCurrentCategory(null);
    setNewCategoryName("");
    setNewCategoryType("expense");
    setIsEditingCategory(false);
  };

  // Account operations
  const handleEditAccount = (account: Account) => {
    setCurrentAccount(account);
    setNewAccountName(account.label);
    setNewAccountType(account.icon);
    setIsEditingAccount(true);
  };

  const handleSaveAccount = () => {
    if (!newAccountName.trim()) {
      toast({
        title: "Error",
        description: "Account name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (isEditingAccount && currentAccount) {
      updateAccountMutation.mutate({
        id: currentAccount.id,
        name: newAccountName.trim(),
        type: newAccountType
      });
    } else {
      addAccountMutation.mutate({
        name: newAccountName.trim(),
        type: newAccountType
      });
    }
  };

  const resetAccountForm = () => {
    setCurrentAccount(null);
    setNewAccountName("");
    setNewAccountType("other");
    setIsEditingAccount(false);
  };

  // Delete operations
  const handleDeleteRequest = (id: number, type: string, name: string) => {
    setItemToDelete({ id, type, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'category') {
      deleteCategoryMutation.mutate(itemToDelete.id);
    } else if (itemToDelete.type === 'account') {
      deleteAccountMutation.mutate(itemToDelete.id);
    }
    
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Success animation
  const showSuccessAnimation = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
  };

  // Account icon renderer
  const renderAccountIcon = (accountType: string) => {
    switch (accountType) {
      case "default":
        return <Wallet className="h-5 w-5" />;
      case "chase":
        return <SiChase className="h-5 w-5" />;
      case "bankofamerica":
        return <SiBankofamerica className="h-5 w-5" />;
      case "wells_fargo":
        return <SiWellsfargo className="h-5 w-5" />;
      case "paypal":
        return <SiPaypal className="h-5 w-5" />;
      case "stripe":
        return <SiStripe className="h-5 w-5" />;
      case "square":
        return <SiSquare className="h-5 w-5" />;
      case "venmo":
        return <SiVenmo className="h-5 w-5" />;
      case "cash":
        return <BanknoteIcon className="h-5 w-5" />;
      case "other":
        return <Landmark className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 } 
    }
  };

  // Prevent closing modal when processing
  const handleOpenChange = (open: boolean) => {
    if (!open && isProcessing) {
      // Prevent closing while processing
      toast({
        title: "Operation in progress",
        description: "Please wait until the current operation completes",
        variant: "destructive"
      });
      return;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
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

        {/* Search bar */}
        <div className="relative mb-3">
          <SearchIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
          <Input
            placeholder="Search categories or accounts..."
            className="pl-8 h-9 text-sm bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category List */}
              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-base flex items-center justify-between text-gray-800 dark:text-gray-200">
                    <div className="flex items-center">
                      <ArrowDownCircle className="h-4 w-4 mr-2 text-red-500 dark:text-red-600" />
                      Expense Categories
                    </div>
                    <Badge className="ml-2 bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300">
                      {expenseCategories.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.05
                        }
                      }
                    }}
                    className="space-y-2 max-h-[180px] overflow-y-auto pr-1"
                  >
                    {categoriesLoading ? (
                      <div className="text-center py-4 text-sm text-gray-500">Loading categories...</div>
                    ) : expenseCategories.length === 0 ? (
                      <div className="text-center py-4 text-sm text-gray-500">No expense categories found</div>
                    ) : (
                      expenseCategories.map((category) => (
                        <motion.div key={category.id} variants={cardVariants}>
                          <div className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm mr-2" 
                                   style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
                                <ArrowDownCircle className="h-4 w-4 text-red-500 dark:text-red-600" />
                              </div>
                              <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                                {category.label}
                              </span>
                            </div>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 hover:bg-gray-200 dark:hover:bg-gray-700"
                                onClick={() => handleEditCategory(category)}
                              >
                                <Edit className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 hover:bg-gray-200 dark:hover:bg-gray-700"
                                onClick={() => handleDeleteRequest(category.id, 'category', category.label)}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-base flex items-center justify-between text-gray-800 dark:text-gray-200">
                    <div className="flex items-center">
                      <ArrowUpCircle className="h-4 w-4 mr-2 text-green-500 dark:text-green-600" />
                      Revenue Categories
                    </div>
                    <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300">
                      {revenueCategories.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.05
                        }
                      }
                    }}
                    className="space-y-2 max-h-[180px] overflow-y-auto pr-1"
                  >
                    {categoriesLoading ? (
                      <div className="text-center py-4 text-sm text-gray-500">Loading categories...</div>
                    ) : revenueCategories.length === 0 ? (
                      <div className="text-center py-4 text-sm text-gray-500">No revenue categories found</div>
                    ) : (
                      revenueCategories.map((category) => (
                        <motion.div key={category.id} variants={cardVariants}>
                          <div className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm mr-2" 
                                   style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}>
                                <ArrowUpCircle className="h-4 w-4 text-green-500 dark:text-green-600" />
                              </div>
                              <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                                {category.label}
                              </span>
                            </div>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 hover:bg-gray-200 dark:hover:bg-gray-700"
                                onClick={() => handleEditCategory(category)}
                              >
                                <Edit className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 hover:bg-gray-200 dark:hover:bg-gray-700"
                                onClick={() => handleDeleteRequest(category.id, 'category', category.label)}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                </CardContent>
              </Card>
            </div>

            {/* Category Form */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-base flex items-center text-gray-800 dark:text-gray-200">
                  {isEditingCategory ? (
                    <><Edit className="h-4 w-4 mr-2 text-primary" /> Edit Category</>
                  ) : (
                    <><Plus className="h-4 w-4 mr-2 text-primary" /> Add New Category</>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label htmlFor="categoryName" className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                    Category Name
                  </Label>
                  <Input 
                    id="categoryName" 
                    placeholder="Enter category name" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="h-10 border border-gray-200 dark:border-zinc-700"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block text-gray-700 dark:text-gray-300">
                    Category Type
                  </Label>
                  <RadioGroup value={newCategoryType} onValueChange={setNewCategoryType} className="flex space-x-8">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="expense" 
                        id="expense" 
                        className="h-4 w-4 border-2 text-red-500" 
                      />
                      <Label htmlFor="expense" className="text-sm font-medium cursor-pointer flex items-center" style={{ color: newCategoryType === 'expense' ? '#ef4444' : undefined }}>
                        <ArrowDownCircle className="h-4 w-4 mr-1.5 text-red-500" />
                        Expense
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="revenue" 
                        id="revenue" 
                        className="h-4 w-4 border-2 text-green-500"
                      />
                      <Label htmlFor="revenue" className="text-sm font-medium cursor-pointer flex items-center" style={{ color: newCategoryType === 'revenue' ? '#22c55e' : undefined }}>
                        <ArrowUpCircle className="h-4 w-4 mr-1.5 text-green-500" />
                        Revenue
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
                {isEditingCategory ? (
                  <div className="flex space-x-2 w-full">
                    <Button 
                      variant="outline"
                      className="flex-1 font-medium" 
                      onClick={resetCategoryForm}
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      Cancel
                    </Button>
                    <Button 
                      variant="default"
                      className="flex-1 font-medium" 
                      onClick={handleSaveCategory}
                      disabled={addCategoryMutation.isPending || updateCategoryMutation.isPending}
                    >
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="default"
                    className="w-full h-10 text-sm font-medium" 
                    onClick={handleSaveCategory}
                    disabled={addCategoryMutation.isPending}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Category
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-4">
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-base flex items-center justify-between text-gray-800 dark:text-gray-200">
                  <div className="flex items-center">
                    <Wallet className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                    Your Accounts
                  </div>
                  <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
                    {accounts.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.05
                      }
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1"
                >
                  {accountsLoading ? (
                    <div className="text-center py-4 text-sm text-gray-500 col-span-2">Loading accounts...</div>
                  ) : filteredAccounts.length === 0 ? (
                    <div className="text-center py-4 text-sm text-gray-500 col-span-2">No accounts found</div>
                  ) : (
                    filteredAccounts.map((account) => (
                      <motion.div key={account.id} variants={cardVariants}>
                        <div className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-sm mr-2 text-blue-600 dark:text-blue-400">
                              {renderAccountIcon(account.icon)}
                            </div>
                            <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                              {account.label}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 hover:bg-gray-200 dark:hover:bg-gray-700"
                              onClick={() => handleEditAccount(account)}
                            >
                              <Edit className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 hover:bg-gray-200 dark:hover:bg-gray-700"
                              onClick={() => handleDeleteRequest(account.id, 'account', account.label)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </CardContent>
            </Card>

            {/* Account Form */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-base flex items-center text-gray-800 dark:text-gray-200">
                  {isEditingAccount ? (
                    <><Edit className="h-4 w-4 mr-2 text-primary" /> Edit Account</>
                  ) : (
                    <><Plus className="h-4 w-4 mr-2 text-primary" /> Add New Account</>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label htmlFor="accountName" className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                    Account Name
                  </Label>
                  <Input 
                    id="accountName" 
                    placeholder="Enter account name" 
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    className="h-10 border border-gray-200 dark:border-zinc-700"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                    Account Type
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {bankAccounts.slice(0, 8).map((account) => (
                      <Button
                        key={account.value}
                        type="button"
                        variant={newAccountType === account.value ? "default" : "outline"}
                        className="flex flex-col items-center justify-center py-2 h-16 px-2 transition-all border border-gray-200 dark:border-gray-700"
                        onClick={() => setNewAccountType(account.value)}
                      >
                        <div className="flex items-center justify-center h-6">
                          {renderAccountIcon(account.value)}
                        </div>
                        <span className="text-[10px] mt-1 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                          {account.label}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
                {isEditingAccount ? (
                  <div className="flex space-x-2 w-full">
                    <Button 
                      variant="outline"
                      className="flex-1 font-medium" 
                      onClick={resetAccountForm}
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      Cancel
                    </Button>
                    <Button 
                      variant="default"
                      className="flex-1 font-medium" 
                      onClick={handleSaveAccount}
                      disabled={addAccountMutation.isPending || updateAccountMutation.isPending}
                    >
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="default"
                    className="w-full h-10 text-sm font-medium" 
                    onClick={handleSaveAccount}
                    disabled={addAccountMutation.isPending}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Account
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Confirmation Dialog for Delete Operations */}
      <AlertDialog 
        open={deleteDialogOpen} 
        onOpenChange={(open) => {
          if (!open && isProcessing) {
            toast({
              title: "Operation in progress",
              description: "Please wait until the delete operation completes",
              variant: "destructive"
            });
            return;
          }
          setDeleteDialogOpen(open);
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete && `Are you sure you want to delete "${itemToDelete.name}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default FinanceSettingsModal;