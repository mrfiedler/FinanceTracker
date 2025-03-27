import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Phone, Mail, Calendar, DollarSign, UserPlus, Users, Filter, CircleCheck, CircleX, Edit, MoreHorizontal } from "lucide-react";
import cn from 'classnames';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Clients = () => {
  const { currency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all"); // all, active, inactive
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [editClientOpen, setEditClientOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients, isLoading, refetch } = useQuery({
    queryKey: ['/api/clients'],
  });

  const form = useForm({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      businessType: "",
      notes: "",
    },
  });

  const editForm = useForm({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      businessType: "",
      notes: "",
    },
  });

  // Handler to open edit modal for a client
  const handleEditClient = (client) => {
    setCurrentClient(client);
    
    // Reset form and set form values
    editForm.reset({
      name: client.name,
      email: client.email,
      phone: client.phone || "",
      businessType: client.businessType,
      notes: client.notes || "",
    });
    
    setEditClientOpen(true);
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      return apiRequest("POST", "/api/clients", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Client added successfully",
        description: "The new client has been added to your database",
        variant: "default",
      });
      form.reset();
      setAddClientOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to add client",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return apiRequest("PATCH", `/api/clients/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Client updated successfully",
        description: "The client details have been updated",
        variant: "default",
      });
      setEditClientOpen(false);
      setCurrentClient(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update client",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };
  
  const onEditSubmit = (data) => {
    if (currentClient) {
      updateClientMutation.mutate({ id: currentClient.id, data });
    }
  };

  const filteredClients = clients
    ? clients.filter(client => {
        // Filter by search query
        const matchesSearch = (
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.businessType.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Filter by active status
        const matchesActiveFilter = 
          activeStatus === "all" ? true : 
          activeStatus === "active" ? client.isActive : 
          !client.isActive;

        return matchesSearch && matchesActiveFilter;
      })
    : [];

  return (
    <main className="w-full h-full overflow-y-auto bg-background p-4 md:p-6 pb-20">
      <div className="page-header flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-description">
            Manage your client database
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => setAddClientOpen(true)} className="flex items-center">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      <div className="filter-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm" 
              onClick={() => setActiveStatus('all')}
              className={cn(
                "h-9 px-4 shadow-sm hover:shadow transition-all duration-200",
                activeStatus === 'all' && "filter-btn-all"
              )}
            >
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              All
            </Button>
            <Button 
              variant={activeStatus === 'active' ? "secondary" : "outline"} 
              size="sm" 
              onClick={() => setActiveStatus('active')}
              className={cn(
                "h-8 shadow-sm hover:shadow transition-all duration-200",
                activeStatus === 'active' && "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:text-green-800 dark:bg-green-800/40 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-800/60"
              )}
            >
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-1.5" />
              Active
            </Button>
            <Button 
              variant={activeStatus === 'inactive' ? "secondary" : "outline"} 
              size="sm" 
              onClick={() => setActiveStatus('inactive')}
              className={cn(
                "h-8 shadow-sm hover:shadow transition-all duration-200",
                activeStatus === 'inactive' && "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:text-gray-800 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800/60"
              )}
            >
              <div className="h-2.5 w-2.5 rounded-full bg-gray-400 mr-1.5" />
              Inactive
            </Button>
          </div>
          <div className="relative grow w-full sm:w-auto ml-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients..."
              className="pl-9 w-full bg-background/70 border-border/60 focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center justify-between">
              <CardTitle>Client Database</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-800 pb-4">
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No clients found</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-6">
                Start building your client database by adding your business contacts and partners.
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setAddClientOpen(true)}
                className="shadow-sm hover:shadow transition-all duration-200"
              >
                <UserPlus className="h-4 w-4 mr-1.5" />
                Add Your First Client
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => {
                const initials = getInitials(client.name);
                const randomColorIndex = client.id % 5;
                // Use consistent theming with our updated UI
                const bgColors = [
                  "bg-accent/50 text-foreground font-medium",
                  "bg-primary/10 text-primary font-medium",
                  "bg-accent/60 text-foreground font-medium",
                  "bg-primary/20 text-primary font-medium",
                  "bg-accent/40 text-foreground font-medium"
                ];

                return (
                  <Card 
                    key={client.id} 
                    className="overflow-hidden hover:shadow-md transition-all duration-300 border-border/60 hover:border-primary/20 group"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center font-medium text-lg ${bgColors[randomColorIndex]} group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-200">
                              {client.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                className={cn(
                                  "cursor-pointer select-none shadow-sm hover:shadow transition-all duration-200",
                                  client.isActive 
                                    ? "bg-green-100 text-green-700 hover:bg-[#7D6BA7] hover:text-white dark:bg-green-800/40 dark:text-green-300 dark:hover:bg-[#7D6BA7] dark:hover:text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-[#7D6BA7] hover:text-white dark:bg-gray-800/40 dark:text-gray-300 dark:hover:bg-[#7D6BA7] dark:hover:text-white"
                                )}
                                onClick={async () => {
                                  try {
                                    await fetch(`/api/clients/${client.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ isActive: !client.isActive })
                                    });
                                    refetch(); //Refetch data after successful update.
                                    toast({
                                      title: "Client status updated successfully",
                                      description: `Client ${client.name} status changed to ${!client.isActive ? "Active" : "Inactive"}`,
                                      variant: "default",
                                    });
                                  } catch (error) {
                                    toast({
                                      title: "Failed to update client status",
                                      description: error.message || "Please try again later",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                {client.isActive ? "Active" : "Inactive"}
                              </Badge>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0 focus-visible:ring-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditClient(client)} className="cursor-pointer">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{client.businessType}</p>

                          <div className="mt-3 space-y-2.5">
                            <div className="flex items-center text-sm text-foreground group-hover:text-primary/90 transition-colors duration-200">
                              <div className="bg-muted/60 p-1 rounded-md mr-2.5 w-6 h-6 flex items-center justify-center">
                                <Mail className="h-3.5 w-3.5 text-primary/70 group-hover:text-primary transition-colors duration-200" />
                              </div>
                              <span className="truncate">{client.email}</span>
                            </div>
                            {client.phone && (
                              <div className="flex items-center text-sm text-foreground group-hover:text-primary/90 transition-colors duration-200">
                                <div className="bg-muted/60 p-1 rounded-md mr-2.5 w-6 h-6 flex items-center justify-center">
                                  <Phone className="h-3.5 w-3.5 text-primary/70 group-hover:text-primary transition-colors duration-200" />
                                </div>
                                <span>{client.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center text-sm text-foreground group-hover:text-primary/90 transition-colors duration-200">
                              <div className="bg-muted/60 p-1 rounded-md mr-2.5 w-6 h-6 flex items-center justify-center">
                                <Calendar className="h-3.5 w-3.5 text-primary/70 group-hover:text-primary transition-colors duration-200" />
                              </div>
                              <span>Since {formatDate(client.createdAt)}</span>
                            </div>
                            {client.totalRevenue > 0 && (
                              <div className="flex items-center text-sm text-foreground group-hover:text-primary/90 transition-colors duration-200">
                                <div className="bg-muted/60 p-1 rounded-md mr-2.5 w-6 h-6 flex items-center justify-center">
                                  <DollarSign className="h-3.5 w-3.5 text-primary/70 group-hover:text-primary transition-colors duration-200" />
                                </div>
                                <span className="font-medium">{formatCurrency(client.totalRevenue, currency)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addClientOpen} onOpenChange={setAddClientOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Add a new client to your database. Fill out the details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="name"
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
                name="email"
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

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
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

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about this client"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setAddClientOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Adding..." : "Add Client"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={editClientOpen} onOpenChange={setEditClientOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client information. Make changes to the fields below.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 pt-4">
              <FormField
                control={editForm.control}
                name="name"
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
                control={editForm.control}
                name="email"
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

              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
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

              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about this client"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setEditClientOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateClientMutation.isPending}>
                  {updateClientMutation.isPending ? "Updating..." : "Update Client"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Clients;