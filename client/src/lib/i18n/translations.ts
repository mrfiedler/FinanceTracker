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
    "en": "Welcome back",
    "pt-BR": "Bem-vindo(a) de volta"
  },
  "dashboard.summary": {
    "en": "Here's what's happening with your business",
    "pt-BR": "Aqui está o que está acontecendo com seu negócio"
  },

  // Finance
  "finance.title": {
    "en": "Finance",
    "pt-BR": "Finanças"
  },
  "finance.description": {
    "en": "Manage your revenue and expenses",
    "pt-BR": "Gerencie suas receitas e despesas"
  },
  "finance.transactions": {
    "en": "Transactions",
    "pt-BR": "Transações"
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
  "finance.currentBalance": {
    "en": "Current Balance",
    "pt-BR": "Saldo Atual"
  },
  "finance.monthlyBalance": {
    "en": "Monthly Balance",
    "pt-BR": "Saldo Mensal"
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
  }
};