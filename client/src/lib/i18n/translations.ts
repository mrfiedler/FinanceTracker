// Define the available languages
export type Language = "en" | "pt-BR";

// Define the translation map type
export type TranslationMap = {
  [key: string]: {
    [lang in Language]: string;
  };
};

// Translation dictionary
export const translations: TranslationMap = {
  // General UI
  "app.title": {
    "en": "Finance Tracker",
    "pt-BR": "Rastreador Financeiro"
  },
  "loading": {
    "en": "Loading...",
    "pt-BR": "Carregando..."
  },
  "save": {
    "en": "Save",
    "pt-BR": "Salvar"
  },
  "cancel": {
    "en": "Cancel",
    "pt-BR": "Cancelar"
  },
  "delete": {
    "en": "Delete",
    "pt-BR": "Excluir"
  },
  "edit": {
    "en": "Edit",
    "pt-BR": "Editar"
  },
  "create": {
    "en": "Create",
    "pt-BR": "Criar"
  },
  "success": {
    "en": "Success",
    "pt-BR": "Sucesso"
  },
  "error": {
    "en": "Error",
    "pt-BR": "Erro"
  },
  "confirm": {
    "en": "Confirm",
    "pt-BR": "Confirmar"
  },
  "new": {
    "en": "New",
    "pt-BR": "Novo"
  },
  "submit": {
    "en": "Submit",
    "pt-BR": "Enviar"
  },
  "search": {
    "en": "Search",
    "pt-BR": "Pesquisar"
  },
  "reset": {
    "en": "Reset",
    "pt-BR": "Redefinir"
  },
  "close": {
    "en": "Close",
    "pt-BR": "Fechar"
  },
  "back": {
    "en": "Back",
    "pt-BR": "Voltar"
  },
  "next": {
    "en": "Next",
    "pt-BR": "Próximo"
  },
  "language": {
    "en": "Language",
    "pt-BR": "Idioma"
  },
  "english": {
    "en": "English",
    "pt-BR": "Inglês"
  },
  "portuguese": {
    "en": "Portuguese",
    "pt-BR": "Português"
  },
  
  // Navigation
  "nav.dashboard": {
    "en": "Dashboard",
    "pt-BR": "Painel"
  },
  "nav.clients": {
    "en": "Clients",
    "pt-BR": "Clientes"
  },
  "nav.quotes": {
    "en": "Quotes",
    "pt-BR": "Orçamentos"
  },
  "nav.contracts": {
    "en": "Contracts",
    "pt-BR": "Contratos"
  },
  "nav.finance": {
    "en": "Finance",
    "pt-BR": "Finanças"
  },
  "nav.subscriptions": {
    "en": "Subscriptions",
    "pt-BR": "Assinaturas"
  },
  "nav.achievements": {
    "en": "Achievements",
    "pt-BR": "Conquistas"
  },
  "nav.settings": {
    "en": "Settings",
    "pt-BR": "Configurações"
  },
  "nav.logout": {
    "en": "Logout",
    "pt-BR": "Sair"
  },
  
  // Dashboard
  "dashboard.title": {
    "en": "Dashboard",
    "pt-BR": "Painel"
  },
  "dashboard.summary": {
    "en": "Financial Summary",
    "pt-BR": "Resumo Financeiro"
  },
  "dashboard.revenue": {
    "en": "Revenue",
    "pt-BR": "Receita"
  },
  "dashboard.expenses": {
    "en": "Expenses",
    "pt-BR": "Despesas"
  },
  "dashboard.profit": {
    "en": "Profit",
    "pt-BR": "Lucro"
  },
  "dashboard.recentTransactions": {
    "en": "Recent Transactions",
    "pt-BR": "Transações Recentes"
  },
  "dashboard.recentQuotes": {
    "en": "Recent Quotes",
    "pt-BR": "Orçamentos Recentes"
  },
  "dashboard.topClients": {
    "en": "Top Clients",
    "pt-BR": "Principais Clientes"
  },
  "dashboard.financialTrends": {
    "en": "Financial Trends",
    "pt-BR": "Tendências Financeiras"
  },
  "dashboard.add": {
    "en": "Add",
    "pt-BR": "Adicionar"
  },
  "dashboard.addExpense": {
    "en": "Add Expense",
    "pt-BR": "Adicionar Despesa"
  },
  "dashboard.addRevenue": {
    "en": "Add Revenue",
    "pt-BR": "Adicionar Receita"
  },
  "dashboard.addSubscription": {
    "en": "Add Subscription",
    "pt-BR": "Adicionar Assinatura"
  },
  "dashboard.addQuote": {
    "en": "Add Quote",
    "pt-BR": "Adicionar Orçamento"
  },
  "dashboard.addClient": {
    "en": "Add Client",
    "pt-BR": "Adicionar Cliente"
  },
  "dashboard.viewAll": {
    "en": "View All",
    "pt-BR": "Ver Tudo"
  },
  
  // Finance
  "finance.title": {
    "en": "Finance",
    "pt-BR": "Finanças"
  },
  "finance.transactions": {
    "en": "Transactions",
    "pt-BR": "Transações"
  },
  "finance.categories": {
    "en": "Categories",
    "pt-BR": "Categorias"
  },
  "finance.accounts": {
    "en": "Accounts",
    "pt-BR": "Contas"
  },
  "finance.reports": {
    "en": "Reports",
    "pt-BR": "Relatórios"
  },
  "finance.expenseCategories": {
    "en": "Expense Categories",
    "pt-BR": "Categorias de Despesa"
  },
  "finance.revenueCategories": {
    "en": "Revenue Categories",
    "pt-BR": "Categorias de Receita"
  },
  "finance.date": {
    "en": "Date",
    "pt-BR": "Data"
  },
  "finance.amount": {
    "en": "Amount",
    "pt-BR": "Valor"
  },
  "finance.category": {
    "en": "Category",
    "pt-BR": "Categoria"
  },
  "finance.account": {
    "en": "Account",
    "pt-BR": "Conta"
  },
  "finance.description": {
    "en": "Description",
    "pt-BR": "Descrição"
  },
  "finance.type": {
    "en": "Type",
    "pt-BR": "Tipo"
  },
  "finance.expense": {
    "en": "Expense",
    "pt-BR": "Despesa"
  },
  "finance.revenue": {
    "en": "Revenue",
    "pt-BR": "Receita"
  },
  "finance.client": {
    "en": "Client",
    "pt-BR": "Cliente"
  },
  "finance.addCategory": {
    "en": "Add Category",
    "pt-BR": "Adicionar Categoria"
  },
  "finance.addAccount": {
    "en": "Add Account",
    "pt-BR": "Adicionar Conta"
  },
  "finance.categoryName": {
    "en": "Category Name",
    "pt-BR": "Nome da Categoria"
  },
  "finance.accountName": {
    "en": "Account Name",
    "pt-BR": "Nome da Conta"
  },
  "finance.settings": {
    "en": "Finance Settings",
    "pt-BR": "Configurações Financeiras"
  },
  "finance.selectClient": {
    "en": "Select Client",
    "pt-BR": "Selecionar Cliente"
  },
  "finance.selectCategory": {
    "en": "Select Category",
    "pt-BR": "Selecionar Categoria"
  },
  "finance.selectAccount": {
    "en": "Select Account",
    "pt-BR": "Selecionar Conta"
  },
  "finance.createNewClient": {
    "en": "Create New Client",
    "pt-BR": "Criar Novo Cliente"
  },
  "finance.createNewCategory": {
    "en": "Create New Category",
    "pt-BR": "Criar Nova Categoria"
  },
  "finance.createNewAccount": {
    "en": "Create New Account",
    "pt-BR": "Criar Nova Conta"
  },
  "finance.newClientName": {
    "en": "New Client Name",
    "pt-BR": "Nome do Novo Cliente"
  },
  "finance.newCategoryName": {
    "en": "New Category Name",
    "pt-BR": "Nome da Nova Categoria"
  },
  "finance.newAccountName": {
    "en": "New Account Name",
    "pt-BR": "Nome da Nova Conta"
  },
  
  // Clients
  "clients.title": {
    "en": "Clients",
    "pt-BR": "Clientes"
  },
  "clients.addClient": {
    "en": "Add Client",
    "pt-BR": "Adicionar Cliente"
  },
  "clients.name": {
    "en": "Name",
    "pt-BR": "Nome"
  },
  "clients.email": {
    "en": "Email",
    "pt-BR": "Email"
  },
  "clients.phone": {
    "en": "Phone",
    "pt-BR": "Telefone"
  },
  "clients.location": {
    "en": "Location",
    "pt-BR": "Localização"
  },
  "clients.details": {
    "en": "Client Details",
    "pt-BR": "Detalhes do Cliente"
  },
  
  // Quotes
  "quotes.title": {
    "en": "Quotes",
    "pt-BR": "Orçamentos"
  },
  "quotes.addQuote": {
    "en": "Add Quote",
    "pt-BR": "Adicionar Orçamento"
  },
  "quotes.quoteTitle": {
    "en": "Quote Title",
    "pt-BR": "Título do Orçamento"
  },
  "quotes.quoteDescription": {
    "en": "Quote Description",
    "pt-BR": "Descrição do Orçamento"
  },
  "quotes.status": {
    "en": "Status",
    "pt-BR": "Status"
  },
  "quotes.pending": {
    "en": "Pending",
    "pt-BR": "Pendente"
  },
  "quotes.accepted": {
    "en": "Accepted",
    "pt-BR": "Aceito"
  },
  "quotes.rejected": {
    "en": "Rejected",
    "pt-BR": "Rejeitado"
  },
  "quotes.issued": {
    "en": "Issued",
    "pt-BR": "Emitido"
  },
  "quotes.expired": {
    "en": "Expired",
    "pt-BR": "Expirado"
  },
  
  // Contracts
  "contracts.title": {
    "en": "Contracts",
    "pt-BR": "Contratos"
  },
  "contracts.addContract": {
    "en": "Add Contract",
    "pt-BR": "Adicionar Contrato"
  },
  "contracts.contractTitle": {
    "en": "Contract Title",
    "pt-BR": "Título do Contrato"
  },
  "contracts.contractDescription": {
    "en": "Contract Description",
    "pt-BR": "Descrição do Contrato"
  },
  "contracts.status": {
    "en": "Status",
    "pt-BR": "Status"
  },
  "contracts.active": {
    "en": "Active",
    "pt-BR": "Ativo"
  },
  "contracts.inactive": {
    "en": "Inactive",
    "pt-BR": "Inativo"
  },
  "contracts.pending": {
    "en": "Pending",
    "pt-BR": "Pendente"
  },
  "contracts.completed": {
    "en": "Completed",
    "pt-BR": "Concluído"
  },
  
  // Subscriptions
  "subscriptions.title": {
    "en": "Subscriptions",
    "pt-BR": "Assinaturas"
  },
  "subscriptions.addSubscription": {
    "en": "Add Subscription",
    "pt-BR": "Adicionar Assinatura"
  },
  "subscriptions.name": {
    "en": "Name",
    "pt-BR": "Nome"
  },
  "subscriptions.description": {
    "en": "Description",
    "pt-BR": "Descrição"
  },
  "subscriptions.amount": {
    "en": "Amount",
    "pt-BR": "Valor"
  },
  "subscriptions.billingCycle": {
    "en": "Billing Cycle",
    "pt-BR": "Ciclo de Cobrança"
  },
  "subscriptions.monthly": {
    "en": "Monthly",
    "pt-BR": "Mensal"
  },
  "subscriptions.quarterly": {
    "en": "Quarterly",
    "pt-BR": "Trimestral"
  },
  "subscriptions.semiannual": {
    "en": "Semi-annual",
    "pt-BR": "Semestral"
  },
  "subscriptions.annual": {
    "en": "Annual",
    "pt-BR": "Anual"
  },
  "subscriptions.nextBilling": {
    "en": "Next Billing",
    "pt-BR": "Próxima Cobrança"
  },
  "subscriptions.status": {
    "en": "Status",
    "pt-BR": "Status"
  },
  "subscriptions.active": {
    "en": "Active",
    "pt-BR": "Ativa"
  },
  "subscriptions.canceled": {
    "en": "Canceled",
    "pt-BR": "Cancelada"
  },
  "subscriptions.suspended": {
    "en": "Suspended",
    "pt-BR": "Suspensa"
  },
  
  // Achievements
  "achievements.title": {
    "en": "Achievements",
    "pt-BR": "Conquistas"
  },
  "achievements.level": {
    "en": "Level",
    "pt-BR": "Nível"
  },
  "achievements.points": {
    "en": "Points",
    "pt-BR": "Pontos"
  },
  "achievements.badges": {
    "en": "Badges",
    "pt-BR": "Insígnias"
  },
  "achievements.progress": {
    "en": "Progress",
    "pt-BR": "Progresso"
  },
  "achievements.complete": {
    "en": "Complete",
    "pt-BR": "Completo"
  },
  "achievements.incomplete": {
    "en": "Incomplete",
    "pt-BR": "Incompleto"
  },
  "achievements.clientAcquisition": {
    "en": "Client Acquisition",
    "pt-BR": "Aquisição de Clientes"
  },
  "achievements.quoteMaster": {
    "en": "Quote Master",
    "pt-BR": "Mestre em Orçamentos"
  },
  "achievements.dealCloser": {
    "en": "Deal Closer",
    "pt-BR": "Fechador de Negócios"
  },
  "achievements.revenueMilestones": {
    "en": "Revenue Milestones",
    "pt-BR": "Marcos de Receita"
  },
  "achievements.recurringRevenue": {
    "en": "Recurring Revenue",
    "pt-BR": "Receita Recorrente"
  },
  "achievements.badgeUnlocked": {
    "en": "Badge Unlocked!",
    "pt-BR": "Insígnia Desbloqueada!"
  },
  "achievements.levelUp": {
    "en": "Level Up!",
    "pt-BR": "Subiu de Nível!"
  },
  "achievements.rewardPoints": {
    "en": "Reward Points",
    "pt-BR": "Pontos de Recompensa"
  },
  
  // Settings
  "settings.title": {
    "en": "Settings",
    "pt-BR": "Configurações"
  },
  "settings.profile": {
    "en": "Profile",
    "pt-BR": "Perfil"
  },
  "settings.company": {
    "en": "Company",
    "pt-BR": "Empresa"
  },
  "settings.appearance": {
    "en": "Appearance",
    "pt-BR": "Aparência"
  },
  "settings.security": {
    "en": "Security",
    "pt-BR": "Segurança"
  },
  "settings.preferences": {
    "en": "Preferences",
    "pt-BR": "Preferências"
  },
  "settings.notifications": {
    "en": "Notifications",
    "pt-BR": "Notificações"
  },
  "settings.name": {
    "en": "Name",
    "pt-BR": "Nome"
  },
  "settings.email": {
    "en": "Email",
    "pt-BR": "Email"
  },
  "settings.phone": {
    "en": "Phone",
    "pt-BR": "Telefone"
  },
  "settings.location": {
    "en": "Location",
    "pt-BR": "Localização"
  },
  "settings.avatar": {
    "en": "Avatar",
    "pt-BR": "Avatar"
  },
  "settings.companyName": {
    "en": "Company Name",
    "pt-BR": "Nome da Empresa"
  },
  "settings.companyLogo": {
    "en": "Company Logo",
    "pt-BR": "Logo da Empresa"
  },
  "settings.theme": {
    "en": "Theme",
    "pt-BR": "Tema"
  },
  "settings.light": {
    "en": "Light",
    "pt-BR": "Claro"
  },
  "settings.dark": {
    "en": "Dark",
    "pt-BR": "Escuro"
  },
  "settings.system": {
    "en": "System",
    "pt-BR": "Sistema"
  },
  "settings.password": {
    "en": "Password",
    "pt-BR": "Senha"
  },
  "settings.currentPassword": {
    "en": "Current Password",
    "pt-BR": "Senha Atual"
  },
  "settings.newPassword": {
    "en": "New Password",
    "pt-BR": "Nova Senha"
  },
  "settings.confirmPassword": {
    "en": "Confirm Password",
    "pt-BR": "Confirmar Senha"
  },
  "settings.changePassword": {
    "en": "Change Password",
    "pt-BR": "Alterar Senha"
  },
  "settings.lastPasswordChange": {
    "en": "Last Password Change",
    "pt-BR": "Última Alteração de Senha"
  },
  "settings.saveChanges": {
    "en": "Save Changes",
    "pt-BR": "Salvar Alterações"
  },
  "settings.upload": {
    "en": "Upload",
    "pt-BR": "Enviar"
  },
  "settings.remove": {
    "en": "Remove",
    "pt-BR": "Remover"
  },
  
  // Notifications
  "notifications.title": {
    "en": "Notifications",
    "pt-BR": "Notificações"
  },
  "notifications.markAllRead": {
    "en": "Mark All as Read",
    "pt-BR": "Marcar Todas como Lidas"
  },
  "notifications.markRead": {
    "en": "Mark as Read",
    "pt-BR": "Marcar como Lida"
  },
  "notifications.noNotifications": {
    "en": "No notifications",
    "pt-BR": "Sem notificações"
  },
  "notifications.viewAll": {
    "en": "View All",
    "pt-BR": "Ver Todas"
  },
  
  // Auth
  "auth.login": {
    "en": "Login",
    "pt-BR": "Entrar"
  },
  "auth.logout": {
    "en": "Logout",
    "pt-BR": "Sair"
  },
  "auth.register": {
    "en": "Register",
    "pt-BR": "Registrar"
  },
  "auth.username": {
    "en": "Username",
    "pt-BR": "Nome de usuário"
  },
  "auth.password": {
    "en": "Password",
    "pt-BR": "Senha"
  },
  "auth.forgotPassword": {
    "en": "Forgot Password?",
    "pt-BR": "Esqueceu a Senha?"
  },
  "auth.rememberMe": {
    "en": "Remember Me",
    "pt-BR": "Lembrar-me"
  },
  "auth.signIn": {
    "en": "Sign In",
    "pt-BR": "Entrar"
  },
  "auth.signUp": {
    "en": "Sign Up",
    "pt-BR": "Cadastrar"
  },
  
  // Errors and messages
  "error.required": {
    "en": "This field is required",
    "pt-BR": "Este campo é obrigatório"
  },
  "error.invalid": {
    "en": "Invalid input",
    "pt-BR": "Entrada inválida"
  },
  "error.email": {
    "en": "Invalid email format",
    "pt-BR": "Formato de email inválido"
  },
  "error.minLength": {
    "en": "Must be at least {0} characters",
    "pt-BR": "Deve ter pelo menos {0} caracteres"
  },
  "error.maxLength": {
    "en": "Must be at most {0} characters",
    "pt-BR": "Deve ter no máximo {0} caracteres"
  },
  "error.passwordMatch": {
    "en": "Passwords do not match",
    "pt-BR": "As senhas não coincidem"
  },
  "error.unauthorized": {
    "en": "Unauthorized access",
    "pt-BR": "Acesso não autorizado"
  },
  "error.serverError": {
    "en": "Server error occurred",
    "pt-BR": "Ocorreu um erro no servidor"
  },
  "error.notFound": {
    "en": "Resource not found",
    "pt-BR": "Recurso não encontrado"
  },
  "success.saved": {
    "en": "Changes saved successfully",
    "pt-BR": "Alterações salvas com sucesso"
  },
  "success.created": {
    "en": "Created successfully",
    "pt-BR": "Criado com sucesso"
  },
  "success.updated": {
    "en": "Updated successfully",
    "pt-BR": "Atualizado com sucesso"
  },
  "success.deleted": {
    "en": "Deleted successfully",
    "pt-BR": "Excluído com sucesso"
  },
  "confirm.delete": {
    "en": "Are you sure you want to delete this?",
    "pt-BR": "Tem certeza que deseja excluir isto?"
  },
  "message.noData": {
    "en": "No data available",
    "pt-BR": "Nenhum dado disponível"
  },
  "message.loading": {
    "en": "Loading...",
    "pt-BR": "Carregando..."
  }
};