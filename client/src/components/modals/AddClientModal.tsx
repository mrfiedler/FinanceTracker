const editClientMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', `/api/clients/${editingClientId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients/top'] });
      form.reset();
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      onClose();
      window.location.reload();
    },
});