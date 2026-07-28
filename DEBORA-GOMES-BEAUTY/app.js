"use strict";

const dbClient = window.dbClient;
const APP_CONFIG = window.APP_CONFIG;

const state = {
  user: null,
  profile: null,
  business: null,
  services: [],
  clients: [],
  appointments: [],
  payments: []
};

const $ = (selector) => document.querySelector(selector);

const elements = {
  loadingScreen: $("#loading-screen"),
  loadingMessage: $("#loading-message"),
  authScreen: $("#auth-screen"),
  appScreen: $("#app-screen"),
  tabLogin: $("#tab-login"),
  tabRegister: $("#tab-register"),
  loginForm: $("#login-form"),
  registerForm: $("#register-form"),
  loginEmail: $("#login-email"),
  loginPassword: $("#login-password"),
  loginSubmit: $("#login-submit"),
  registerName: $("#register-name"),
  registerPhone: $("#register-phone"),
  registerEmail: $("#register-email"),
  registerPassword: $("#register-password"),
  registerSubmit: $("#register-submit"),
  forgotPasswordButton: $("#forgot-password-button"),
  logoutButton: $("#logout-button"),
  sidebar: $("#sidebar"),
  sidebarOverlay: $("#sidebar-overlay"),
  menuToggle: $("#menu-toggle"),
  adminMenu: $("#admin-menu"),
  clientMenu: $("#client-menu"),
  mobileAdminMenu: $("#mobile-admin-menu"),
  mobileClientMenu: $("#mobile-client-menu"),
  mobileProfileButton: $("#mobile-profile-button"),
  pageTitle: $("#page-title"),
  pageEyebrow: $("#page-eyebrow"),
  sidebarAvatar: $("#sidebar-avatar"),
  sidebarUserName: $("#sidebar-user-name"),
  sidebarUserRole: $("#sidebar-user-role"),
  topbarAvatar: $("#topbar-avatar"),
  topbarUserName: $("#topbar-user-name"),
  topbarUserEmail: $("#topbar-user-email"),
  welcomeName: $("#welcome-name"),
  clientWelcomeName: $("#client-welcome-name"),
  dashboardServicesCount: $("#dashboard-services-count"),
  dashboardClientsCount: $("#dashboard-clients-count"),
  dashboardAppointmentsCount: $("#dashboard-appointments-count"),
  dashboardRevenue: $("#dashboard-revenue"),
  dashboardServicesList: $("#dashboard-services-list"),
  adminServicesList: $("#admin-services-list"),
  clientHomeServices: $("#client-home-services"),
  clientServicesList: $("#client-services-list"),
  clientsList: $("#clients-list"),
  toastContainer: $("#toast-container")
};

document.addEventListener("DOMContentLoaded", initializeApplication);

window.setTimeout(() => {
  if (elements.loadingScreen && !elements.loadingScreen.classList.contains("hidden")) {
    elements.loadingScreen.classList.add("hidden");
    elements.authScreen?.classList.remove("hidden");
    showToast("A inicialização demorou demais. Verifique a URL e a chave pública.", "error");
  }
}, 10000);

async function initializeApplication() {
  try {
    if (!dbClient) throw new Error("Cliente do Supabase não inicializado.");

    configureEvents();
    configureMasks();

    const { data, error } = await dbClient.auth.getSession();
    if (error) throw error;

    if (data?.session?.user) {
      await loadAuthenticatedApplication(data.session.user);
    } else {
      showAuthScreen();
    }

    dbClient.auth.onAuthStateChange((event, session) => {
      window.setTimeout(async () => {
        if (event === "SIGNED_OUT") {
          resetState();
          showAuthScreen();
        }

        if (
          event === "SIGNED_IN" &&
          session?.user &&
          state.user?.id !== session.user.id
        ) {
          await loadAuthenticatedApplication(session.user);
        }
      }, 0);
    });
  } catch (error) {
    console.error(error);
    showAuthScreen();
    showToast(error.message || "Não foi possível iniciar o sistema.", "error");
  } finally {
    hideLoading();
  }
}

function configureEvents() {
  elements.tabLogin?.addEventListener("click", () => showAuthTab("login"));
  elements.tabRegister?.addEventListener("click", () => showAuthTab("register"));
  elements.loginForm?.addEventListener("submit", handleLogin);
  elements.registerForm?.addEventListener("submit", handleRegister);
  elements.forgotPasswordButton?.addEventListener("click", handlePasswordRecovery);
  elements.logoutButton?.addEventListener("click", handleLogout);
  elements.menuToggle?.addEventListener("click", openMobileSidebar);
  elements.sidebarOverlay?.addEventListener("click", closeMobileSidebar);
  elements.mobileProfileButton?.addEventListener("click", openMobileSidebar);

  document.querySelectorAll(".password-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.querySelector(`#${button.dataset.target}`);
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.textContent = show ? "Ocultar" : "Mostrar";
    });
  });

  document.querySelectorAll(".menu-item, .mobile-nav-item[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      navigateTo(button.dataset.page);
      closeMobileSidebar();
    });
  });
}

function configureMasks() {
  elements.registerPhone?.addEventListener("input", (event) => {
    event.target.value = formatPhoneInput(event.target.value);
  });
}

async function handleLogin(event) {
  event.preventDefault();
  setButtonLoading(elements.loginSubmit, true, "Entrando...");

  try {
    const { data, error } = await dbClient.auth.signInWithPassword({
      email: elements.loginEmail.value.trim().toLowerCase(),
      password: elements.loginPassword.value
    });

    if (error) throw error;

    await loadAuthenticatedApplication(data.user);
    elements.loginForm.reset();
    showToast("Login realizado com sucesso.", "success");
  } catch (error) {
    showToast(translateAuthError(error.message), "error");
  } finally {
    setButtonLoading(elements.loginSubmit, false, "Entrar");
  }
}

async function handleRegister(event) {
  event.preventDefault();

  const name = elements.registerName.value.trim();
  const phone = normalizePhone(elements.registerPhone.value);
  const email = elements.registerEmail.value.trim().toLowerCase();
  const password = elements.registerPassword.value;

  if (name.length < 3) return showToast("Informe seu nome completo.", "error");
  if (phone.length < 10) return showToast("Informe um telefone válido.", "error");

  setButtonLoading(elements.registerSubmit, true, "Criando conta...");

  try {
    const { data, error } = await dbClient.auth.signUp({
      email,
      password,
      options: { data: { name, phone } }
    });

    if (error) throw error;

    elements.registerForm.reset();

    if (!data.session) {
      showToast("Conta criada. Confirme seu e-mail para entrar.", "success");
      showAuthTab("login");
      elements.loginEmail.value = email;
      return;
    }

    await loadAuthenticatedApplication(data.user);
    showToast("Conta criada com sucesso.", "success");
  } catch (error) {
    showToast(translateAuthError(error.message), "error");
  } finally {
    setButtonLoading(elements.registerSubmit, false, "Criar minha conta");
  }
}

async function handlePasswordRecovery() {
  const email = elements.loginEmail.value.trim().toLowerCase();
  if (!email) return showToast("Digite seu e-mail primeiro.", "error");

  const { error } = await dbClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin
  });

  if (error) return showToast(translateAuthError(error.message), "error");
  showToast("Enviamos as instruções de recuperação.", "success");
}

async function handleLogout() {
  const { error } = await dbClient.auth.signOut();
  if (error) return showToast("Não foi possível sair.", "error");
  resetState();
  showAuthScreen();
}

async function loadAuthenticatedApplication(user) {
  showLoading("Carregando sua conta...");

  try {
    state.user = user;
    state.business = await fetchBusiness();
    state.profile = await fetchProfile(user.id);

    if (!state.profile.business_id && state.profile.role === "client") {
      await linkClientToBusiness();
    }

    state.services = await fetchServices();

    if (isAdmin()) await loadAdminData();

    renderApplication();
    showAppScreen();
  } catch (error) {
    console.error(error);
    showToast(error.message || "Não foi possível carregar a conta.", "error");
    await dbClient.auth.signOut();
    showAuthScreen();
  } finally {
    hideLoading();
  }
}

async function fetchBusiness() {
  const { data, error } = await dbClient
    .from("businesses")
    .select("id,slug,name,email,phone,logo_url,active")
    .eq("slug", APP_CONFIG.businessSlug)
    .eq("active", true)
    .single();

  if (error) throw new Error("A empresa não foi encontrada no Supabase.");
  return data;
}

async function fetchProfile(userId) {
  const { data, error } = await dbClient
    .from("profiles")
    .select("id,business_id,name,email,phone,role,active")
    .eq("id", userId)
    .single();

  if (error) throw new Error("O perfil do usuário não foi encontrado.");
  if (!data.active) throw new Error("Esta conta está desativada.");
  return data;
}

async function linkClientToBusiness() {
  const { data, error } = await dbClient
    .from("profiles")
    .update({
      business_id: state.business.id,
      updated_at: new Date().toISOString()
    })
    .eq("id", state.user.id)
    .select("id,business_id,name,email,phone,role,active")
    .single();

  if (!error) state.profile = data;
}

async function fetchServices() {
  const { data, error } = await dbClient
    .from("services")
    .select("id,business_id,name,description,price,duration_minutes,deposit_percentage,interval_after_minutes,active")
    .eq("business_id", state.business.id)
    .eq("active", true)
    .order("name");

  if (error) throw new Error("Não foi possível carregar os serviços.");
  return data || [];
}

async function loadAdminData() {
  const [clientsResult, appointmentsResult, paymentsResult] = await Promise.all([
    dbClient.from("profiles").select("id,name,email,phone,role,active,created_at").eq("business_id", state.business.id).eq("role", "client"),
    dbClient.from("appointments").select("id,status,payment_status,total_amount,deposit_amount").eq("business_id", state.business.id),
    dbClient.from("payments").select("id,amount,status").eq("business_id", state.business.id)
  ]);

  state.clients = clientsResult.data || [];
  state.appointments = appointmentsResult.data || [];
  state.payments = paymentsResult.data || [];
}

function renderApplication() {
  const name = state.profile?.name || state.user?.email || "Usuário";
  const initials = getInitials(name);

  elements.sidebarAvatar.textContent = initials;
  elements.topbarAvatar.textContent = initials;
  elements.sidebarUserName.textContent = name;
  elements.topbarUserName.textContent = name;
  elements.topbarUserEmail.textContent = state.profile?.email || "";
  elements.sidebarUserRole.textContent = roleLabel(state.profile?.role);
  elements.welcomeName.textContent = firstName(name);
  elements.clientWelcomeName.textContent = firstName(name);

  elements.adminMenu.classList.toggle("hidden", !isAdmin());
  elements.clientMenu.classList.toggle("hidden", isAdmin());

  const adminHtml = createServicesHtml(state.services, false);
  const clientHtml = createServicesHtml(state.services, true);

  elements.dashboardServicesList.innerHTML = adminHtml;
  elements.adminServicesList.innerHTML = adminHtml;
  elements.clientHomeServices.innerHTML = clientHtml;
  elements.clientServicesList.innerHTML = clientHtml;

  renderAdminDashboard();
  renderClients();
  navigateTo(isAdmin() ? "dashboard" : "client-home");
}

function createServicesHtml(services, clientMode) {
  if (!services.length) return `<div class="empty-state"><div>✦</div><h3>Nenhum serviço cadastrado</h3><p>Cadastre serviços no Supabase.</p></div>`;

  return services.map((service) => {
    const deposit = Number(service.price) * (Number(service.deposit_percentage) / 100);

    return `
      <article class="service-card">
        <div class="service-card-header"><div class="service-icon">✦</div><span class="service-status">Ativo</span></div>
        <h3>${escapeHtml(service.name)}</h3>
        <p class="service-description">${escapeHtml(service.description || "Procedimento de beleza.")}</p>
        <div class="service-details">
          <div><span>Valor</span><strong>${formatCurrency(service.price)}</strong></div>
          <div><span>Duração</span><strong>${formatDuration(service.duration_minutes)}</strong></div>
        </div>
        <p class="service-deposit">${clientMode ? `Sinal de ${formatCurrency(deposit)}` : `${service.deposit_percentage}% de sinal`}</p>
      </article>`;
  }).join("");
}

function renderAdminDashboard() {
  elements.dashboardServicesCount.textContent = state.services.length;
  elements.dashboardClientsCount.textContent = state.clients.length;
  elements.dashboardAppointmentsCount.textContent = state.appointments.length;

  const revenue = state.payments
    .filter((p) => ["received", "confirmed"].includes(p.status))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  elements.dashboardRevenue.textContent = formatCurrency(revenue);
}

function renderClients() {
  if (!state.clients.length) {
    elements.clientsList.innerHTML = `<div class="empty-state"><div>♡</div><h3>Nenhuma cliente cadastrada</h3><p>Quando uma cliente criar uma conta, ela aparecerá aqui.</p></div>`;
    return;
  }

  elements.clientsList.innerHTML = `
    <table class="data-table">
      <thead><tr><th>Cliente</th><th>E-mail</th><th>Telefone</th><th>Status</th></tr></thead>
      <tbody>
        ${state.clients.map((client) => `
          <tr>
            <td><strong>${escapeHtml(client.name)}</strong></td>
            <td>${escapeHtml(client.email || "—")}</td>
            <td>${formatPhoneDisplay(client.phone)}</td>
            <td><span class="badge">${client.active ? "Ativa" : "Inativa"}</span></td>
          </tr>`).join("")}
      </tbody>
    </table>`;
}

function navigateTo(pageName) {
  document.querySelectorAll(".page").forEach((page) => page.classList.add("hidden"));
  document.querySelectorAll(".menu-item").forEach((button) => button.classList.toggle("active", button.dataset.page === pageName));

  const page = document.querySelector(`#page-${pageName}`);
  if (!page) return;
  page.classList.remove("hidden");

  const titles = {
    dashboard: "Visão geral",
    services: "Serviços",
    clients: "Clientes",
    appointments: "Agenda",
    "client-home": "Meu espaço",
    "client-services": "Serviços",
    "client-appointments": "Meus agendamentos"
  };

  elements.pageTitle.textContent = titles[pageName] || "Débora Gomes Beauty";
  elements.pageEyebrow.textContent = state.business?.name || "Débora Gomes Beauty";
}

function openMobileSidebar() {
  elements.sidebar?.classList.add("open");
  elements.sidebarOverlay?.classList.add("visible");
  document.body.classList.add("menu-open");
}

function closeMobileSidebar() {
  elements.sidebar?.classList.remove("open");
  elements.sidebarOverlay?.classList.remove("visible");
  document.body.classList.remove("menu-open");
}

function showAuthTab(tab) {
  const login = tab === "login";
  elements.tabLogin.classList.toggle("active", login);
  elements.tabRegister.classList.toggle("active", !login);
  elements.loginForm.classList.toggle("hidden", !login);
  elements.registerForm.classList.toggle("hidden", login);
}

function showAuthScreen() {
  elements.authScreen.classList.remove("hidden");
  elements.appScreen.classList.add("hidden");
  showAuthTab("login");
}

function showAppScreen() {
  elements.authScreen.classList.add("hidden");
  elements.appScreen.classList.remove("hidden");
}

function showLoading(message) {
  elements.loadingMessage.textContent = message;
  elements.loadingScreen.classList.remove("hidden");
}

function hideLoading() {
  elements.loadingScreen.classList.add("hidden");
}

function setButtonLoading(button, loading, text) {
  button.disabled = loading;
  button.textContent = text;
}

function isAdmin() {
  return ["owner", "admin"].includes(state.profile?.role);
}

function resetState() {
  state.user = null;
  state.profile = null;
  state.business = null;
  state.services = [];
  state.clients = [];
  state.appointments = [];
  state.payments = [];
}

function showToast(message, type = "default") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);
  window.setTimeout(() => toast.remove(), 5000);
}

function translateAuthError(message = "") {
  const value = message.toLowerCase();
  if (value.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (value.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (value.includes("user already registered")) return "Este e-mail já possui uma conta.";
  return message || "Ocorreu um erro inesperado.";
}

function roleLabel(role) {
  return { owner: "Proprietária", admin: "Administradora", client: "Cliente" }[role] || "Usuário";
}

function firstName(name) {
  return String(name || "").trim().split(" ")[0] || "Usuário";
}

function getInitials(name) {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "DG";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function formatCurrency(value) {
  return new Intl.NumberFormat(APP_CONFIG.locale, {
    style: "currency",
    currency: APP_CONFIG.currency
  }).format(Number(value || 0));
}

function formatDuration(minutes) {
  const total = Number(minutes || 0);
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours && rest) return `${hours}h ${rest}min`;
  if (hours) return `${hours}h`;
  return `${rest}min`;
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatPhoneInput(value) {
  const n = normalizePhone(value).slice(0, 11);
  if (n.length <= 2) return n;
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}

function formatPhoneDisplay(value) {
  return value ? formatPhoneInput(value) : "—";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
