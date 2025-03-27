import { useState, useEffect } from "react";
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertCircle
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
import { expenseCategories, revenueCategories, bankAccounts } from "@/lib/constants";
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
  icon: string;
}

interface FinanceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FinanceSettingsModal = ({ isOpen, onClose }: FinanceSettingsModalProps) => {
  const [mainTab, setMainTab] = useState("categories");
  const [categoryTab, setCategoryTab] = useState("expense");
  const [searchQuery, setSearchQuery] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("expense");
  const [editingCategory, setEditingCategory] = useState<null | Category>(null);
  const [editingAccount, setEditingAccount] = useState<null | Account>(null);

  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState("other");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Alert dialog state for deletion confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number, type: string, name: string } | null>(null);

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
      const res = await apiRequest('POST', '/api/finance/categories', categoryData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/categories'] });
      setNewCategoryName("");
      showSuccessToast();
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
      const res = await apiRequest('PUT', `/api/finance/categories/${categoryData.id}`, {
        name: categoryData.name,
        type: categoryData.type
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/categories'] });
      setEditingCategory(null);
      setNewCategoryName("");
      setNewCategoryType("expense");
      showSuccessToast();
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
      const res = await apiRequest('DELETE', `/api/finance/categories/${categoryId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/categories'] });
      showSuccessToast();
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
      const res = await apiRequest('POST', '/api/finance/accounts', accountData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/accounts'] });
      setNewAccountName("");
      setNewAccountType("other");
      showSuccessToast();
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
      const res = await apiRequest('PUT', `/api/finance/accounts/${accountData.id}`, {
        name: accountData.name,
        type: accountData.type
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/accounts'] });
      setEditingAccount(null);
      setNewAccountName("");
      setNewAccountType("other");
      showSuccessToast();
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
      const res = await apiRequest('DELETE', `/api/finance/accounts/${accountId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finance/accounts'] });
      showSuccessToast();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete account: ${error.message}`,
        variant: "destructive"
      });
    }
  });

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
      type: newCategoryType 
    });
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.label);
    setNewCategoryType(category.type);
  };

  const handleSaveEdit = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        name: newCategoryName.trim(),
        type: newCategoryType
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setNewCategoryName("");
    setNewCategoryType("expense");
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setNewAccountName(account.label);
    setNewAccountType(account.icon);
  };

  const handleSaveAccountEdit = () => {
    if (!newAccountName.trim()) {
      toast({
        title: "Error",
        description: "Account name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (editingAccount) {
      updateAccountMutation.mutate({
        id: editingAccount.id,
        name: newAccountName.trim(),
        type: newAccountType
      });
    }
  };

  const handleCancelAccountEdit = () => {
    setEditingAccount(null);
    setNewAccountName("");
    setNewAccountType("other");
  };

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
      name: newAccountName.trim(),
      type: newAccountType
    });
  };

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

  // Filter categories and accounts based on search
  const filteredExpenseCategories = categories
    .filter(cat => cat.type === 'expense')
    .filter(cat => cat.label.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredRevenueCategories = categories
    .filter(cat => cat.type === 'revenue')
    .filter(cat => cat.label.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredAccounts = accounts.filter(acc => 
    acc.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Success animation state
  const [showSuccess, setShowSuccess] = useState(false);

  const showSuccessToast = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-auto">
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
            <Settings className="h-4.5 w-4.5 mr-2 text-primary" />
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
            className="pl-8 h-8 text-sm bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="categories" value={mainTab} onValueChange={setMainTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-3 h-9">
            <TabsTrigger value="categories" className="flex items-center text-sm">
              <DollarSign className="h-3.5 w-3.5 mr-1.5 text-gray-600 dark:text-gray-400" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center text-sm">
              <Wallet className="h-3.5 w-3.5 mr-1.5 text-gray-600 dark:text-gray-400" />
              Accounts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-3">
            <Tabs defaultValue="expense" value={categoryTab} onValueChange={setCategoryTab}>
              <TabsList className="mb-3 w-full flex h-8">
                <TabsTrigger value="expense" className="flex-1 flex items-center justify-center text-xs">
                  <ArrowDownCircle className="h-3.5 w-3.5 mr-1 text-red-500 dark:text-red-600" />
                  Expense
                </TabsTrigger>
                <TabsTrigger value="revenue" className="flex-1 flex items-center justify-center text-xs">
                  <ArrowUpCircle className="h-3.5 w-3.5 mr-1 text-green-500 dark:text-green-600" />
                  Revenue
                </TabsTrigger>
              </TabsList>

              {/* Expense Categories */}
              <TabsContent value="expense">
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
                  className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[250px] overflow-y-auto pr-1"
                >
                  {filteredExpenseCategories.map((category) => (
                    <motion.div key={category.value} variants={cardVariants}>
                      <Card className="flex items-center p-2 transition-all hover:shadow-md border border-gray-200 dark:border-gray-700">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm mr-2" style={{ backgroundColor: 'rgba(198, 144, 154, 0.2)' }}>
                          <ArrowDownCircle className="h-4 w-4 text-red-500 dark:text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-gray-800 dark:text-gray-200">{category.label}</p>
                        </div>
                        <div className="flex space-x-1 shrink-0">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              {/* Revenue Categories */}
              <TabsContent value="revenue">
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
                  className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[250px] overflow-y-auto pr-1"
                >
                  {filteredRevenueCategories.map((category) => (
                    <motion.div key={category.value} variants={cardVariants}>
                      <Card className="flex items-center p-2 transition-all hover:shadow-md border border-gray-200 dark:border-gray-700">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm mr-2" style={{ backgroundColor: 'rgba(163, 230, 53, 0.2)' }}>
                          <ArrowUpCircle className="h-4 w-4 text-green-500 dark:text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-gray-800 dark:text-gray-200">{category.label}</p>
                        </div>
                        <div className="flex space-x-1 shrink-0">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
            </Tabs>

            {/* Category Edit / Add Form */}
            <Card className="mt-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-base flex items-center text-gray-800 dark:text-gray-200">
                  {editingCategory ? (
                    <><Edit className="h-4 w-4 mr-1.5 text-gray-600 dark:text-gray-400" /> Edit Category</>
                  ) : (
                    <><Plus className="h-4 w-4 mr-1.5 text-gray-600 dark:text-gray-400" /> Add New Category</>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label htmlFor="categoryName" className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                    Name
                  </Label>
                  <Input 
                    id="categoryName" 
                    placeholder="Enter category name" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="h-9 border border-gray-200 dark:border-zinc-700"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block text-gray-700 dark:text-gray-300">
                    Type
                  </Label>
                  <RadioGroup value={newCategoryType} onValueChange={setNewCategoryType} className="flex space-x-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="expense" 
                        id="expense" 
                        className="h-4 w-4 border-2 border-gray-300 dark:border-gray-700 text-red-500 dark:text-red-600 focus:ring-red-500" 
                      />
                      <Label htmlFor="expense" className="text-sm font-medium cursor-pointer" style={{ color: newCategoryType === 'expense' ? '#FF5E5E' : undefined }}>
                        Expense
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="revenue" 
                        id="revenue" 
                        className="h-4 w-4 border-2 border-gray-300 dark:border-gray-700 text-green-500 dark:text-green-600 focus:ring-green-500"
                      />
                      <Label htmlFor="revenue" className="text-sm font-medium cursor-pointer" style={{ color: newCategoryType === 'revenue' ? '#A3E635' : undefined }}>
                        Revenue
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 p-3 border-t border-gray-200 dark:border-gray-700">
                {editingCategory ? (
                  <div className="flex space-x-2 w-full">
                    <Button 
                      variant="outline"
                      className="flex-1 font-medium" 
                      onClick={handleCancelEdit}
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      Cancel
                    </Button>
                    <Button 
                      variant="default"
                      className="flex-1 font-medium" 
                      onClick={handleSaveEdit}
                    >
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="default"
                    className="w-full h-9 text-sm font-medium" 
                    onClick={handleAddCategory}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Category
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
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
              className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[250px] overflow-y-auto pr-1"
            >
              {filteredAccounts.map((account) => (
                <motion.div key={account.value} variants={cardVariants}>
                  <Card className="flex items-center p-2 transition-all hover:shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm mr-2">
                      {renderAccountIcon(account.value)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-gray-800 dark:text-gray-200">{account.label}</p>
                    </div>
                    <div className="flex space-x-1 shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Edit className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <Card className="mt-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-base flex items-center text-gray-800 dark:text-gray-200">
                  <Plus className="h-4 w-4 mr-1.5 text-gray-600 dark:text-gray-400" />
                  Add New Account
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label htmlFor="accountName" className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Account Name</Label>
                  <Input 
                    id="accountName" 
                    placeholder="Enter account name" 
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    className="h-9 border border-gray-200 dark:border-zinc-700"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Account Type</Label>
                  <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                    {bankAccounts.slice(0, 8).map((account) => (
                      <Button
                        key={account.value}
                        type="button"
                        variant={newAccountType === account.value ? "default" : "outline"}
                        className="flex flex-col items-center justify-center py-1 h-14 px-1 transition-all border border-gray-200 dark:border-gray-700"
                        onClick={() => setNewAccountType(account.value)}
                      >
                        <div className="flex items-center justify-center h-6">
                          {renderAccountIcon(account.value)}
                        </div>
                        <span className="text-[10px] mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center text-gray-800 dark:text-gray-200">
                          {account.label}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end p-3 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  variant="default"
                  className="w-full h-9 text-sm font-medium" 
                  onClick={handleAddAccount}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Account
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FinanceSettingsModal;