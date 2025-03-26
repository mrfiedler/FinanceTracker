import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTransactionSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { z } from "zod";

const schema = insertTransactionSchema.extend({
  amount: z.coerce.number().positive("Amount must be a positive number")
});

type FormValues = z.infer<typeof schema>;

export default function TransactionForm() {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: "",
      amount: 0,
      type: "expense",
      category: "advertising",
      date: new Date().toISOString().split('T')[0],
    }
  });

  const addTransaction = useMutation({
    mutationFn: async (transaction: FormValues) => {
      const response = await apiRequest('POST', '/api/transactions', transaction);
      return response.json();
    },
    onSuccess: () => {
      // Reset the form
      form.reset({
        description: "",
        amount: 0,
        type: "expense",
        category: "advertising",
        date: new Date().toISOString().split('T')[0],
      });
      
      // Show success toast
      toast({
        variant: "default",
        title: "Success",
        description: "Transaction added successfully!",
        className: "bg-green-600 text-white border-green-700",
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/summary"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add transaction. Please try again.",
      });
    }
  });

  const onSubmit = (data: FormValues) => {
    addTransaction.mutate(data);
  };

  return (
    <div className="bg-[#1E1E1E] p-6 rounded-lg border border-[#333333]">
      <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-400">Description</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter description" 
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-400">Amount ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-400">Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 border border-gray-700 text-white">
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-400">Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 border border-gray-700 text-white">
                    <SelectItem value="advertising">Advertising</SelectItem>
                    <SelectItem value="content">Content Creation</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-400">Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <Button 
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            disabled={addTransaction.isPending}
          >
            {addTransaction.isPending ? "Adding..." : "Add Transaction"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
