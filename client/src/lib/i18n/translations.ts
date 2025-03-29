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
    "en": "Eluvie",
    "pt-BR": "Eluvie"
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
  "nav.settings": {
    "en": "Settings",
    "pt-BR": "Configurações"
  },
  "nav.finance": {
    "en": "Finance",
    "pt-BR": "Finanças"
  },
  "nav.subscriptions": {
    "en": "Subscriptions",
    "pt-BR": "Assinaturas"
  },
  "nav.signOut": {
    "en": "Sign Out",
    "pt-BR": "Sair"
  },

  // Finance
  "finance.title": {
    "en": "Finance",
    "pt-BR": "Finanças"
  },
  "finance.revenue": {
    "en": "Revenue",
    "pt-BR": "Receita"
  },
  "finance.expenses": {
    "en": "Expenses",
    "pt-BR": "Despesas"
  },
  "finance.addRevenue": {
    "en": "Add Revenue",
    "pt-BR": "Adicionar Receita"
  },
  "finance.addExpense": {
    "en": "Add Expense",
    "pt-BR": "Adicionar Despesa"
  },
  "finance.transactions": {
    "en": "Transactions",
    "pt-BR": "Transações"
  },
  "finance.netIncome": {
    "en": "Net Income",
    "pt-BR": "Lucro Líquido"
  },
  "finance.totalRevenue": {
    "en": "Total Revenue",
    "pt-BR": "Receita Total"
  },
  "finance.totalExpenses": {
    "en": "Total Expenses",
    "pt-BR": "Despesas Totais"
  },
  "finance.amount": {
    "en": "Amount",
    "pt-BR": "Valor"
  },
  "finance.date": {
    "en": "Date",
    "pt-BR": "Data"
  },
  "finance.category": {
    "en": "Category",
    "pt-BR": "Categoria"
  },
  "finance.description": {
    "en": "Description",
    "pt-BR": "Descrição"
  },
  "finance.type": {
    "en": "Type",
    "pt-BR": "Tipo"
  },
  "finance.period": {
    "en": "Period",
    "pt-BR": "Período"
  },
  "finance.week": {
    "en": "Week",
    "pt-BR": "Semana"
  },
  "finance.month": {
    "en": "Month",
    "pt-BR": "Mês"
  },
  "finance.year": {
    "en": "Year",
    "pt-BR": "Ano"
  },
  "finance.custom": {
    "en": "Custom",
    "pt-BR": "Personalizado"
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
  "settings.notifications": {
    "en": "Notifications",
    "pt-BR": "Notificações"
  },
  "settings.security": {
    "en": "Security",
    "pt-BR": "Segurança"
  },
  "settings.language": {
    "en": "Language",
    "pt-BR": "Idioma"
  },
  "settings.theme": {
    "en": "Theme",
    "pt-BR": "Tema"
  },
  "settings.email": {
    "en": "Email",
    "pt-BR": "E-mail"
  },
  "settings.password": {
    "en": "Password",
    "pt-BR": "Senha"
  },
  "settings.name": {
    "en": "Name",
    "pt-BR": "Nome"
  },
  "settings.phone": {
    "en": "Phone",
    "pt-BR": "Telefone"
  },
  "settings.address": {
    "en": "Address",
    "pt-BR": "Endereço"
  },
  "settings.companyName": {
    "en": "Company Name",
    "pt-BR": "Nome da Empresa"
  },
  "settings.companyLogo": {
    "en": "Company Logo",
    "pt-BR": "Logo da Empresa"
  },
  "settings.uploadPhoto": {
    "en": "Upload Photo",
    "pt-BR": "Enviar Foto"
  },
  "settings.uploadLogo": {
    "en": "Upload Logo",
    "pt-BR": "Enviar Logo"
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
  "nav.arcade": {
    "en": "ARCADE",
    "pt-BR": "ARCADE"
  },

  // Dashboard
  "dashboard.title": {
    "en": "Dashboard",
    "pt-BR": "Painel"
  },
  "dashboard.welcome": {
    "en": "Welcome back! Here's what's happening with your business today.",
    "pt-BR": "Bem-vindo de volta! Aqui está o que está acontecendo com seu negócio hoje."
  },
  "dashboard.viewAchievements": {
    "en": "View Achievements",
    "pt-BR": "Ver Conquistas"
  },
  "dashboard.exportReport": {
    "en": "Export Report",
    "pt-BR": "Exportar Relatório"
  },
  "dashboard.export": {
    "en": "Export",
    "pt-BR": "Exportar"
  },
  "dashboard.summary": {
    "en": "Financial Summary",
    "pt-BR": "Resumo Financeiro"
  },
  "dashboard.financeSummary": {
    "en": "Finance Summary",
    "pt-BR": "Resumo Financeiro"
  },
  "dashboard.currentBalance": {
    "en": "Current Balance",
    "pt-BR": "Saldo Atual"
  },
  "dashboard.totalRevenue": {
    "en": "Total Revenue",
    "pt-BR": "Receita Total"
  },
  "dashboard.totalExpenses": {
    "en": "Total Expenses", 
    "pt-BR": "Despesas Totais"
  },
  "dashboard.outstandingPayments": {
    "en": "Outstanding Payments",
    "pt-BR": "Pagamentos Pendentes"
  },
  "dashboard.fromLastPeriod": {
    "en": "from last period",
    "pt-BR": "do período anterior"
  },
  "dashboard.withPendingInvoices": {
    "en": "with pending invoices",
    "pt-BR": "com faturas pendentes"
  },
  "dashboard.clients": {
    "en": "clients",
    "pt-BR": "clientes"
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
  "dashboard.noQuotes": {
    "en": "No recent quotes",
    "pt-BR": "Nenhum orçamento recente"
  },
  "dashboard.welcomeBack": {
    "en": "Welcome back",
    "pt-BR": "Bem-vindo(a) de volta"
  },
  "dashboard.overviewTitle": {
    "en": "Here's an overview of your business",
    "pt-BR": "Aqui está uma visão geral do seu negócio"
  },
  "dashboard.today": {
    "en": "Today",
    "pt-BR": "Hoje"
  },
  "dashboard.thisWeek": {
    "en": "This Week",
    "pt-BR": "Esta Semana"
  },
  "dashboard.thisMonth": {
    "en": "This Month",
    "pt-BR": "Este Mês"
  },
  "dashboard.lastMonth": {
    "en": "Last Month",
    "pt-BR": "Mês Passado"
  },
  "dashboard.thisYear": {
    "en": "This Year",
    "pt-BR": "Este Ano"
  },
  "dashboard.lastYear": {
    "en": "Last Year",
    "pt-BR": "Ano Passado"
  },
  "dashboard.noTopClients": {
    "en": "No top clients data",
    "pt-BR": "Sem dados de principais clientes"
  },
  "dashboard.topClients": {
    "en": "Top Clients",
    "pt-BR": "Principais Clientes"
  },
  "dashboard.financialTrends": {
    "en": "Financial Trends",
    "pt-BR": "Tendências Financeiras"
  },
  "dashboard.revenueExpenseTrends": {
    "en": "Revenue & Expense Trends",
    "pt-BR": "Tendências de Receita e Despesa"
  },
  "dashboard.quoteConversionRate": {
    "en": "Quote Conversion Rate",
    "pt-BR": "Taxa de Conversão de Orçamentos"
  },
  "dashboard.allTime": {
    "en": "All time",
    "pt-BR": "Todo período"
  },
  "dashboard.conversionRate": {
    "en": "Conversion Rate",
    "pt-BR": "Taxa de Conversão"
  },
  "dashboard.acceptedQuotes": {
    "en": "Accepted",
    "pt-BR": "Aceitos"
  },
  "dashboard.declinedQuotes": {
    "en": "Declined",
    "pt-BR": "Recusados"
  },
  "dashboard.pendingQuotes": {
    "en": "Pending",
    "pt-BR": "Pendentes"
  },
  "dashboard.quotes": {
    "en": "quotes",
    "pt-BR": "orçamentos"
  },
  "dashboard.topClientsByRevenue": {
    "en": "Top Clients by Revenue",
    "pt-BR": "Principais Clientes por Receita"
  },
  "dashboard.viewAllClients": {
    "en": "View All Clients",
    "pt-BR": "Ver Todos os Clientes"
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
  "finance.pageDescription": {
    "en": "Manage your revenues and expenses",
    "pt-BR": "Gerencie suas receitas e despesas"
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
  "finance.currentBalance": {
    "en": "Current Balance",
    "pt-BR": "Saldo Atual"
  },
  "finance.currentMonthRevenue": {
    "en": "Current Month Revenue",
    "pt-BR": "Receita do Mês Atual"
  },
  "finance.currentMonthExpenses": {
    "en": "Current Month Expenses",
    "pt-BR": "Despesas do Mês Atual"
  },
  "finance.monthlyBalance": {
    "en": "Monthly Balance",
    "pt-BR": "Saldo Mensal"
  },
  "finance.outstandingExpenses": {
    "en": "Outstanding Expenses",
    "pt-BR": "Despesas Pendentes"
  },
  "finance.expensesPaid": {
    "en": "Expenses Paid",
    "pt-BR": "Despesas Pagas"
  },
  "finance.outstandingRevenue": {
    "en": "Outstanding Revenue",
    "pt-BR": "Receita Pendente"
  },
  "finance.revenueReceived": {
    "en": "Revenue Received",
    "pt-BR": "Receita Recebida"
  },
  "finance.monthlyTotal": {
    "en": "Monthly Total",
    "pt-BR": "Total Mensal"
  },
  "finance.paidTransactionsOnly": {
    "en": "(paid transactions only)",
    "pt-BR": "(apenas transações pagas)"
  },
  "finance.paid": {
    "en": "Paid",
    "pt-BR": "Pago"
  },
  "finance.unpaid": {
    "en": "Unpaid",
    "pt-BR": "Não Pago"
  },
  "finance.overdue": {
    "en": "Overdue",
    "pt-BR": "Atrasado"
  },
  "finance.addExpense": {
    "en": "Add Expense",
    "pt-BR": "Adicionar Despesa"
  },
  "finance.addRevenue": {
    "en": "Add Revenue",
    "pt-BR": "Adicionar Receita"
  },
  "finance.all": {
    "en": "All",
    "pt-BR": "Todos"
  },
  "finance.expenses": {
    "en": "Expenses",
    "pt-BR": "Despesas"
  },
  "finance.searchTransactions": {
    "en": "Search transactions...",
    "pt-BR": "Buscar transações..."
  },
  "finance.period": {
    "en": "Period",
    "pt-BR": "Período"
  },
  "finance.thisMonth": {
    "en": "This Month",
    "pt-BR": "Este Mês"
  },
  "finance.last7Days": {
    "en": "Last 7 days",
    "pt-BR": "Últimos 7 dias"
  },
  "finance.last30Days": {
    "en": "Last 30 days",
    "pt-BR": "Últimos 30 dias"
  },
  "finance.last90Days": {
    "en": "Last 90 days",
    "pt-BR": "Últimos 90 dias"
  },
  "finance.pastYear": {
    "en": "Past year",
    "pt-BR": "Ano passado"
  },
  "finance.customRange": {
    "en": "Custom range",
    "pt-BR": "Intervalo personalizado"
  },
  "finance.allCategories": {
    "en": "All Categories",
    "pt-BR": "Todas as Categorias"
  },
  "finance.allAccounts": {
    "en": "All Accounts",
    "pt-BR": "Todas as Contas"
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
  "finance.deleteCategory": {
    "en": "Delete Category",
    "pt-BR": "Excluir Categoria"
  },
  "finance.deleteAccount": {
    "en": "Delete Account",
    "pt-BR": "Excluir Conta"
  },
  "finance.confirmDelete": {
    "en": "Are you sure you want to delete this item?",
    "pt-BR": "Tem certeza que deseja excluir este item?"
  },
  "finance.confirmDeleteCategory": {
    "en": "Are you sure you want to delete this category?",
    "pt-BR": "Tem certeza que deseja excluir esta categoria?"
  },
  "finance.confirmDeleteAccount": {
    "en": "Are you sure you want to delete this account?",
    "pt-BR": "Tem certeza que deseja excluir esta conta?"
  },
  "finance.delete": {
    "en": "Delete",
    "pt-BR": "Excluir"
  },
  "finance.cancel": {
    "en": "Cancel",
    "pt-BR": "Cancelar"
  },
  "finance.save": {
    "en": "Save",
    "pt-BR": "Salvar"
  },
  "finance.add": {
    "en": "Add",
    "pt-BR": "Adicionar"
  },
  "finance.edit": {
    "en": "Edit",
    "pt-BR": "Editar"
  },
  "finance.noTransactions": {
    "en": "No transactions found",
    "pt-BR": "Nenhuma transação encontrada"
  },
  "finance.noCategories": {
    "en": "No categories found",
    "pt-BR": "Nenhuma categoria encontrada"
  },
  "finance.noAccounts": {
    "en": "No accounts found",
    "pt-BR": "Nenhuma conta encontrada"
  },
  "finance.january": {
    "en": "January",
    "pt-BR": "Janeiro"
  },
  "finance.february": {
    "en": "February",
    "pt-BR": "Fevereiro"
  },
  "finance.march": {
    "en": "March",
    "pt-BR": "Março"
  },
  "finance.april": {
    "en": "April",
    "pt-BR": "Abril"
  },
  "finance.may": {
    "en": "May", 
    "pt-BR": "Maio"
  },
  "finance.june": {
    "en": "June",
    "pt-BR": "Junho"
  },
  "finance.july": {
    "en": "July",
    "pt-BR": "Julho"
  },
  "finance.august": {
    "en": "August",
    "pt-BR": "Agosto"
  },
  "finance.september": {
    "en": "September",
    "pt-BR": "Setembro"
  },
  "finance.october": {
    "en": "October",
    "pt-BR": "Outubro"
  },
  "finance.november": {
    "en": "November",
    "pt-BR": "Novembro"
  },
  "finance.december": {
    "en": "December",
    "pt-BR": "Dezembro"
  },
  "finance.isPaid": {
    "en": "Is Paid",
    "pt-BR": "Está Pago"
  },
  "finance.yes": {
    "en": "Yes",
    "pt-BR": "Sim"
  },
  "finance.no": {
    "en": "No",
    "pt-BR": "Não"
  },
  "finance.addNewClient": {
    "en": "Add New Client",
    "pt-BR": "Adicionar Novo Cliente"
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
  "clients.searchClients": {
    "en": "Search clients...",
    "pt-BR": "Buscar clientes..."
  },
  "clients.noClients": {
    "en": "No clients found",
    "pt-BR": "Nenhum cliente encontrado"
  },
  "clients.totalClients": {
    "en": "Total Clients",
    "pt-BR": "Total de Clientes"
  },
  "clients.recentActivity": {
    "en": "Recent Activity",
    "pt-BR": "Atividade Recente"
  },
  "clients.status": {
    "en": "Status",
    "pt-BR": "Status"
  },
  "clients.active": {
    "en": "Active",
    "pt-BR": "Ativo"
  },
  "clients.inactive": {
    "en": "Inactive",
    "pt-BR": "Inativo"
  },
  "clients.company": {
    "en": "Company",
    "pt-BR": "Empresa"
  },
  "clients.website": {
    "en": "Website",
    "pt-BR": "Site"
  },
  "clients.industry": {
    "en": "Industry",
    "pt-BR": "Indústria"
  },
  "clients.notes": {
    "en": "Notes",
    "pt-BR": "Observações"
  },
  "clients.save": {
    "en": "Save Client",
    "pt-BR": "Salvar Cliente"
  },
  "clients.edit": {
    "en": "Edit Client",
    "pt-BR": "Editar Cliente"
  },
  "clients.delete": {
    "en": "Delete Client",
    "pt-BR": "Excluir Cliente"
  },
  "clients.confirmDelete": {
    "en": "Are you sure you want to delete this client?",
    "pt-BR": "Tem certeza que deseja excluir este cliente?"
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
  "quotes.searchQuotes": {
    "en": "Search quotes...",
    "pt-BR": "Buscar orçamentos..."
  },
  "quotes.noQuotes": {
    "en": "No quotes found",
    "pt-BR": "Nenhum orçamento encontrado"
  },
  "quotes.totalQuotes": {
    "en": "Total Quotes",
    "pt-BR": "Total de Orçamentos"
  },
  "quotes.recentQuotes": {
    "en": "Recent Quotes",
    "pt-BR": "Orçamentos Recentes"
  },
  "quotes.client": {
    "en": "Client",
    "pt-BR": "Cliente"
  },
  "quotes.amount": {
    "en": "Amount",
    "pt-BR": "Valor"
  },
  "quotes.date": {
    "en": "Date",
    "pt-BR": "Data"
  },
  "quotes.expirationDate": {
    "en": "Expiration Date",
    "pt-BR": "Data de Expiração"
  },
  "quotes.items": {
    "en": "Items",
    "pt-BR": "Itens"
  },
  "quotes.addItem": {
    "en": "Add Item",
    "pt-BR": "Adicionar Item"
  },
  "quotes.itemName": {
    "en": "Item Name",
    "pt-BR": "Nome do Item"
  },
  "quotes.quantity": {
    "en": "Quantity",
    "pt-BR": "Quantidade"
  },
  "quotes.unitPrice": {
    "en": "Unit Price",
    "pt-BR": "Preço Unitário"
  },
  "quotes.subtotal": {
    "en": "Subtotal",
    "pt-BR": "Subtotal"
  },
  "quotes.total": {
    "en": "Total",
    "pt-BR": "Total"
  },
  "quotes.notes": {
    "en": "Notes",
    "pt-BR": "Observações"
  },
  "quotes.termsAndConditions": {
    "en": "Terms and Conditions",
    "pt-BR": "Termos e Condições"
  },
  "quotes.save": {
    "en": "Save Quote",
    "pt-BR": "Salvar Orçamento"
  },
  "quotes.send": {
    "en": "Send Quote",
    "pt-BR": "Enviar Orçamento"
  },
  "quotes.edit": {
    "en": "Edit Quote",
    "pt-BR": "Editar Orçamento"
  },
  "quotes.delete": {
    "en": "Delete Quote",
    "pt-BR": "Excluir Orçamento"
  },
  "quotes.confirmDelete": {
    "en": "Are you sure you want to delete this quote?",
    "pt-BR": "Tem certeza que deseja excluir este orçamento?"
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
  "contracts.searchContracts": {
    "en": "Search contracts...",
    "pt-BR": "Buscar contratos..."
  },
  "contracts.noContracts": {
    "en": "No contracts found",
    "pt-BR": "Nenhum contrato encontrado"
  },
  "contracts.totalContracts": {
    "en": "Total Contracts",
    "pt-BR": "Total de Contratos"
  },
  "contracts.client": {
    "en": "Client",
    "pt-BR": "Cliente"
  },
  "contracts.date": {
    "en": "Date",
    "pt-BR": "Data"
  },
  "contracts.amount": {
    "en": "Amount",
    "pt-BR": "Valor"
  },
  "contracts.startDate": {
    "en": "Start Date",
    "pt-BR": "Data de Início"
  },
  "contracts.endDate": {
    "en": "End Date",
    "pt-BR": "Data de Término"
  },
  "contracts.terms": {
    "en": "Terms",
    "pt-BR": "Termos"
  },
  "contracts.save": {
    "en": "Save Contract",
    "pt-BR": "Salvar Contrato"
  },
  "contracts.edit": {
    "en": "Edit Contract",
    "pt-BR": "Editar Contrato"
  },
  "contracts.delete": {
    "en": "Delete Contract",
    "pt-BR": "Excluir Contrato"
  },
  "contracts.confirmDelete": {
    "en": "Are you sure you want to delete this contract?",
    "pt-BR": "Tem certeza que deseja excluir este contrato?"
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
  "subscriptions.searchSubscriptions": {
    "en": "Search subscriptions...",
    "pt-BR": "Buscar assinaturas..."
  },
  "subscriptions.noSubscriptions": {
    "en": "No subscriptions found",
    "pt-BR": "Nenhuma assinatura encontrada"
  }, 
  "subscriptions.totalSubscriptions": {
    "en": "Total Subscriptions",
    "pt-BR": "Total de Assinaturas"
  },
  "subscriptions.client": {
    "en": "Client",
    "pt-BR": "Cliente"
  },
  "subscriptions.recurringRevenue": {
    "en": "Recurring Revenue",
    "pt-BR": "Receita Recorrente"
  },
  "subscriptions.startDate": {
    "en": "Start Date",
    "pt-BR": "Data de Início"
  },
  "subscriptions.save": {
    "en": "Save Subscription",
    "pt-BR": "Salvar Assinatura"
  },
  "subscriptions.edit": {
    "en": "Edit Subscription",
    "pt-BR": "Editar Assinatura"
  },
  "subscriptions.delete": {
    "en": "Delete Subscription",
    "pt-BR": "Excluir Assinatura"
  },
  "subscriptions.confirmDelete": {
    "en": "Are you sure you want to delete this subscription?",
    "pt-BR": "Tem certeza que deseja excluir esta assinatura?"
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
  "error.exportFailed": {
    "en": "Export failed",
    "pt-BR": "Falha na exportação"
  },
  "error.exportFailedDescription": {
    "en": "There was an error exporting your financial report.",
    "pt-BR": "Ocorreu um erro ao exportar seu relatório financeiro."
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
  "success.exported": {
    "en": "Report exported successfully",
    "pt-BR": "Relatório exportado com sucesso"
  },
  "success.exportedDescription": {
    "en": "Your financial report has been downloaded as a CSV file.",
    "pt-BR": "Seu relatório financeiro foi baixado como um arquivo CSV."
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