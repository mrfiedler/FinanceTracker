import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatCurrency } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/hooks/use-toast";

// Form schema
const convertToRevenueSchema = z.object({
  installments: z.array(
    z.object({
      amount: z.string().min(1, "Amount is required"),
      dueDate: z.date({
        required_error: "Due date is required",
      }),
      description: z.string().optional(),
    })
  ),
});

type ConvertToRevenueForm = z.infer<typeof convertToRevenueSchema>;

interface ConvertToRevenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: any; // Replace with proper type when available
}

const ConvertToRevenueModal = ({ isOpen, onClose, quote }: ConvertToRevenueModalProps) => {
  const [installmentCount, setInstallmentCount] = useState(1);
  const { currency } = useCurrency();
  const { toast } = useToast();

  // Form setup
  const form = useForm<ConvertToRevenueForm>({
    resolver: zodResolver(convertToRevenueSchema),
    defaultValues: {
      installments: [
        {
          amount: quote ? quote.amount : "",
          dueDate: new Date(),
          description: `Payment for ${quote?.jobTitle || "quote"}`,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "installments",
  });

  // Update form values when installment count changes
  useEffect(() => {
    const currentCount = form.getValues().installments.length;
    
    if (installmentCount > currentCount) {
      // Add more installments
      const quoteAmount = parseFloat(quote?.amount || "0");
      const baseAmount = quoteAmount / parseFloat(installmentCount.toString());
      
      // Format to 2 decimal places
      const formattedAmount = baseAmount.toFixed(2);
      
      for (let i = currentCount; i < installmentCount; i++) {
        append({
          amount: formattedAmount,
          dueDate: new Date(new Date().setMonth(new Date().getMonth() + i)),
          description: `Installment ${i + 1} for ${quote?.jobTitle || "quote"}`,
        });
      }
    } else if (installmentCount < currentCount) {
      // Remove excess installments
      for (let i = currentCount - 1; i >= installmentCount; i--) {
        remove(i);
      }
      
      // Readjust remaining installments' amounts to maintain total
      const quoteAmount = parseFloat(quote?.amount || "0");
      const baseAmount = quoteAmount / parseFloat(installmentCount.toString());
      const formattedAmount = baseAmount.toFixed(2);
      
      const updatedInstallments = form.getValues().installments.map((inst, idx) => ({
        ...inst,
        amount: formattedAmount,
      }));
      
      form.reset({ installments: updatedInstallments });
    }
  }, [installmentCount, append, remove, form, quote]);

  // Update form when quote changes
  useEffect(() => {
    if (quote) {
      const updatedInstallments = Array(installmentCount).fill(0).map((_, index) => ({
        amount: (parseFloat(quote.amount) / installmentCount).toFixed(2),
        dueDate: new Date(new Date().setMonth(new Date().getMonth() + index)),
        description: `Installment ${index + 1} for ${quote.jobTitle}`,
      }));
      
      form.reset({ installments: updatedInstallments });
    }
  }, [quote, form, installmentCount]);

  const onSubmit = async (data: ConvertToRevenueForm) => {
    try {
      // Calculate total to ensure it matches original quote
      const totalAmount = data.installments.reduce(
        (sum, item) => sum + parseFloat(item.amount), 
        0
      );
      
      // Format to 2 decimal places for comparison
      const formattedTotal = totalAmount.toFixed(2);
      const formattedQuoteAmount = parseFloat(quote.amount).toFixed(2);
      
      // Verify total matches quote amount
      if (formattedTotal !== formattedQuoteAmount) {
        toast({
          title: "Total mismatch",
          description: `Total installment amount (${formatCurrency(parseFloat(formattedTotal), currency)}) does not match quote amount (${formatCurrency(parseFloat(formattedQuoteAmount), currency)})`,
          variant: "destructive",
        });
        return;
      }
      
      // Submit each installment as a separate revenue entry
      await Promise.all(data.installments.map(async (installment) => {
        await fetch("/api/revenues", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: quote.clientId,
            amount: installment.amount,
            date: format(installment.dueDate, "yyyy-MM-dd"),
            description: installment.description,
            category: "Sales",
            account: null,
            currency: currency,
            dueDate: format(installment.dueDate, "yyyy-MM-dd"),
            isPaid: false,
            quoteId: quote.id,
          }),
        });
      }));
      
      // Update quote status to "Converted" (or similar)
      await fetch(`/api/quotes/${quote.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Converted",
        }),
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/revenues"] });
      
      toast({
        title: "Quote converted to revenue",
        description: `Created ${installmentCount} revenue installment(s) successfully`,
      });
      
      onClose();
    } catch (error) {
      console.error("Error converting quote to revenue:", error);
      toast({
        title: "Conversion failed",
        description: "There was an error converting the quote to revenue. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Convert Quote to Revenue</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <div className="mb-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted p-3">
                <div className="text-xs text-muted-foreground">Client</div>
                <div className="font-medium">{quote?.client?.name || "N/A"}</div>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <div className="text-xs text-muted-foreground">Total Amount</div>
                <div className="font-medium">{quote ? formatCurrency(quote.amount, currency) : "N/A"}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-lg bg-muted p-3">
                <div className="text-xs text-muted-foreground">Job Title</div>
                <div className="font-medium">{quote?.jobTitle || "N/A"}</div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="mb-4">
                <FormLabel>Number of Installments</FormLabel>
                <div className="flex items-center space-x-2 mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => installmentCount > 1 && setInstallmentCount(installmentCount - 1)}
                    disabled={installmentCount <= 1}
                  >
                    -
                  </Button>
                  <span className="w-10 text-center">{installmentCount}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setInstallmentCount(installmentCount + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-5">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Installment {index + 1}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`installments.${index}.amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="0.00" type="number" step="0.01" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`installments.${index}.dueDate`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Due Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name={`installments.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Payment description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 text-right space-x-2">
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Convert to Revenue</Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertToRevenueModal;