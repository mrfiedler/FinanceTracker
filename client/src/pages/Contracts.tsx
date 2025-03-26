import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { dateRanges } from "@/lib/constants";
import { Plus, Search, FileText, Download, Eye, Link, Filter, FilterX, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContractSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const Contracts = () => {
  const { currency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("30");
  const [addContractOpen, setAddContractOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contracts, isLoading } = useQuery({
    queryKey: ['/api/contracts', dateRange],
  });

  const { data: quotes } = useQuery({
    queryKey: ['/api/quotes', 'all'],
  });

  const form = useForm({
    resolver: zodResolver(insertContractSchema),
    defaultValues: {
      title: "",
      quoteId: "",
      file: null,
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      // In a real implementation, this would handle file upload
      // For now we'll just simulate it
      return apiRequest("POST", "/api/contracts", {
        title: data.title,
        quoteId: data.quoteId,
        description: data.description,
        fileName: data.file ? data.file.name : "contract.pdf"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      toast({
        title: "Contract uploaded successfully",
        description: "The contract has been linked to the quote",
      });
      form.reset();
      setAddContractOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload contract",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const filteredContracts = contracts
    ? contracts.filter(contract => {
        // Filter by search query
        if (searchQuery && 
            !contract.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !contract.quote.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !contract.quote.client.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }

        return true;
      })
    : [];

  return (
    <main className="w-full h-full overflow-y-auto bg-background p-4 md:p-6 pb-20">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title">Contracts</h1>
          <p className="page-description">Store and manage your client contracts</p>
        </div>
        <Button 
          onClick={() => setAddContractOpen(true)} 
          className="flex items-center shadow-sm bg-primary hover:bg-primary/90 transition-all duration-200 hover:shadow-md"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          <span>Add Contract</span>
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-grow mb-3 md:mb-0 md:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="h-9 w-[140px]">
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="shadow-sm border-border/40 rounded-lg overflow-hidden">
        <CardHeader className="bg-card/70 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle className="text-xl tracking-tight">Contract Database</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            Array(5).fill(0).map((_, index) => (
              <div key={index} className="border-b border-border/40 py-4 px-6">
                <Skeleton className="h-24 w-full" />
              </div>
            ))
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
              <FileText className="h-12 w-12 mb-3 text-muted-foreground/70" />
              <p className="font-medium">No contracts found</p>
              <p className="text-sm mt-1">Upload a new contract to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-3 font-medium">Title</th>
                    <th className="px-6 py-3 font-medium">Client</th>
                    <th className="px-6 py-3 font-medium">Related Quote</th>
                    <th className="px-6 py-3 font-medium">Quote Amount</th>
                    <th className="px-6 py-3 font-medium">Upload Date</th>
                    <th className="px-6 py-3 font-medium">File</th>
                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredContracts.map((contract) => {
                    return (
                      <tr key={contract.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                            <p className="text-sm font-medium text-foreground">{contract.title}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium border border-primary/20">
                              {getInitials(contract.quote.client.name)}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-foreground">{contract.quote.client.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <p className="text-sm text-foreground">{contract.quote.jobTitle}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-foreground">
                            {formatCurrency(contract.quote.amount, currency)}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-muted-foreground">{formatDate(contract.createdAt)}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-muted-foreground">{contract.fileName}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-1">
                            <Button variant="ghost" size="sm" className="h-8 flex items-center text-muted-foreground hover:text-foreground">
                              <Eye className="h-4 w-4 mr-1.5" />
                              View
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 flex items-center text-muted-foreground hover:text-foreground">
                              <Download className="h-4 w-4 mr-1.5" />
                              Download
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addContractOpen} onOpenChange={setAddContractOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Contract</DialogTitle>
            <DialogDescription>
              Upload a contract and link it to an existing quote.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Service Agreement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quoteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link to Quote</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a quote" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {quotes?.map((quote) => (
                          <SelectItem key={quote.id} value={quote.id.toString()}>
                            {quote.jobTitle} - {quote.client.name}
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
                name="file"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Upload Contract (PDF)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          onChange(file);
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief description of the contract"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setAddContractOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Uploading..." : "Upload Contract"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Contracts;