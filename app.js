"use strict";

const db = window.dbClient;
const CFG = window.APP_CONFIG || {
  businessSlug: "debora-gomes-beauty",
  locale: "pt-BR",
  currency: "BRL",
  timezone: "America/Belem"
};

const state = {
  business: null,
  services: [],
  selectedService: null,
  selectedDate: "",
  selectedSlot: null,
  guestHold: null,
  pix: null,
  paymentPoll: null,

  adminUser: null,
  adminProfile: null,
  adminBookings: [],
  adminCustomers: [],
  adminPayments: []
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const el = {
  splash: $("#splash"),
  publicView: $("#public-view"),
  appView: $("#app-view"),

  professionalAreaBtn: $("#professional-area-btn"),
  professionalAreaMobileBtn: $("#professional-area-mobile-btn"),
  publicMenuBtn: $("#public-menu-btn"),
  publicMenuClose: $("#public-menu-close"),
  publicMenuOverlay: $("#public-menu-overlay"),
  publicMobileMenu: $("#public-mobile-menu"),
  adminLoginModal: $("#admin-login-modal"),
  closeAdminLogin: $("#close-admin-login"),
  adminLoginForm: $("#admin-login-form"),
  adminEmail: $("#admin-email"),
  adminPassword: $("#admin-password"),
  adminLoginSubmit: $("#admin-login-submit"),

  publicServicesGrid: $("#public-services-grid"),
  publicBookingDate: $("#public-booking-date"),
  publicBookingSlots: $("#public-booking-slots"),
  publicSlotDateLabel: $("#public-slot-date-label"),
  selectedServiceCaption: $("#selected-service-caption"),
  toCustomerDataBtn: $("#to-customer-data-btn"),
  guestName: $("#guest-name"),
  guestPhone: $("#guest-phone"),
  guestCpf: $("#guest-cpf"),
  guestEmail: $("#guest-email"),
  guestNotes: $("#guest-notes"),
  reviewService: $("#review-service"),
  reviewDatetime: $("#review-datetime"),
  reviewTotal: $("#review-total"),
  reviewDeposit: $("#review-deposit"),
  reserveAndPayBtn: $("#reserve-and-pay-btn"),

  pixQrImage: $("#pix-qr-image"),
  pixPayload: $("#pix-payload"),
  pixValue: $("#pix-value"),
  pixExpirationLabel: $("#pix-expiration-label"),
  copyPixBtn: $("#copy-pix-btn"),
  paymentStatusBox: $("#payment-status-box"),

  successMessage: $("#success-message"),
  successReference: $("#success-reference"),
  successService: $("#success-service"),
  successDatetime: $("#success-datetime"),
  newPublicBookingBtn: $("#new-public-booking-btn"),

  sidebar: $("#sidebar"),
  sidebarOverlay: $("#sidebar-overlay"),
  menuBtn: $("#menu-btn"),
  logoutBtn: $("#logout-btn"),
  sidebarAvatar: $("#sidebar-avatar"),
  sidebarName: $("#sidebar-name"),
  topbarAvatar: $("#topbar-avatar"),
  pageTitle: $("#page-title"),

  metricBookings: $("#metric-bookings"),
  metricClients: $("#metric-clients"),
  metricServices: $("#metric-services"),
  metricRevenue: $("#metric-revenue"),
  dashboardBookings: $("#dashboard-bookings"),
  agendaDateFilter: $("#agenda-date-filter"),
  agendaStatusFilter: $("#agenda-status-filter"),
  adminBookings: $("#admin-bookings"),
  clientsTable: $("#clients-table"),
  adminServicesGrid: $("#admin-services-grid"),
  financeReceived: $("#finance-received"),
  financePending: $("#finance-pending"),
  paymentsTable: $("#payments-table"),

  toastRoot: $("#toast-root")
};

document.addEventListener("DOMContentLoaded", init);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closePublicMenu();
    closeSidebar();
  }
});

window.setTimeout(() => {
  if (!el.splash.classList.contains("hidden")) {
    el.splash.classList.add("hidden");
    el.publicView.classList.remove("hidden");
  }
}, 10000);

async function init() {
  bindEvents();
  setDateDefaults();

  try {
    state.business = await fetchBusiness();
    state.services = await fetchPublicServices();
    renderPublicServices();

    const { data } = await db.auth.getSession();
    if (data?.session?.user) {
      const admin = await tryLoadAdmin(data.session.user);
      if (admin) {
        await openAdminPanel();
        return;
      }
    }

    showPublic();
  } catch (error) {
    console.error(error);
    showPublic();
    toast("Não foi possível carregar todos os dados do agendamento.", "error");
  } finally {
    hideSplash();
  }
}

function bindEvents() {
  el.professionalAreaBtn.addEventListener("click", openAdminLogin);
  el.professionalAreaMobileBtn?.addEventListener("click", () => {
    closePublicMenu();
    openAdminLogin();
  });

  el.publicMenuBtn?.addEventListener("click", openPublicMenu);
  el.publicMenuClose?.addEventListener("click", closePublicMenu);
  el.publicMenuOverlay?.addEventListener("click", closePublicMenu);

  $$("[data-public-nav]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.publicNav;
      closePublicMenu();

      if (target === "booking") {
        document.querySelector("#booking-area")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }

      if (target === "services") {
        goPublicStep(1);
        document.querySelector("#booking-area")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });
  el.closeAdminLogin.addEventListener("click", closeAdminLogin);
  el.adminLoginModal.addEventListener("click", e => {
    if (e.target === el.adminLoginModal) closeAdminLogin();
  });
  el.adminLoginForm.addEventListener("submit", adminLogin);

  el.publicServicesGrid.addEventListener("click", e => {
    const btn = e.target.closest("[data-public-service]");
    if (!btn) return;
    chooseService(btn.dataset.publicService);
  });

  el.publicBookingDate.addEventListener("change", loadPublicSlots);
  el.publicBookingSlots.addEventListener("click", e => {
    const btn = e.target.closest("[data-slot]");
    if (!btn) return;
    selectPublicSlot(btn);
  });

  el.toCustomerDataBtn.addEventListener("click", () => goPublicStep(3));
  $$("[data-back-step]").forEach(btn => {
    btn.addEventListener("click", () => goPublicStep(Number(btn.dataset.backStep)));
  });

  el.guestPhone.addEventListener("input", e => e.target.value = phoneMask(e.target.value));
  el.guestCpf.addEventListener("input", e => e.target.value = cpfMask(e.target.value));
  el.reserveAndPayBtn.addEventListener("click", reserveAndGeneratePix);
  el.copyPixBtn.addEventListener("click", copyPix);
  el.newPublicBookingBtn.addEventListener("click", resetPublicBooking);

  $$("[data-page]").forEach(btn => btn.addEventListener("click", () => navigateAdmin(btn.dataset.page)));
  el.menuBtn.addEventListener("click", openSidebar);
  el.sidebarOverlay.addEventListener("click", closeSidebar);
  el.logoutBtn.addEventListener("click", adminLogout);
  el.agendaDateFilter.addEventListener("change", renderAdminBookings);
  el.agendaStatusFilter.addEventListener("change", renderAdminBookings);
}

function setDateDefaults() {
  const today = dateInput(new Date());
  el.publicBookingDate.min = today;
  el.publicBookingDate.value = today;
  state.selectedDate = today;
}

async function fetchBusiness() {
  const { data, error } = await db
    .from("businesses")
    .select("id,slug,name,email,phone,active")
    .eq("slug", CFG.businessSlug)
    .eq("active", true)
    .single();

  if (error) throw error;
  return data;
}

async function fetchPublicServices() {
  const { data, error } = await db
    .from("services")
    .select("id,name,description,price,duration_minutes,deposit_percentage,active")
    .eq("business_id", state.business.id)
    .eq("active", true)
    .order("name");

  if (error) throw error;
  return data || [];
}

function renderPublicServices() {
  if (!state.services.length) {
    el.publicServicesGrid.innerHTML = empty("Nenhum serviço disponível", "Os serviços aparecerão aqui assim que forem cadastrados.");
    return;
  }

  el.publicServicesGrid.innerHTML = state.services.map(service => {
    const deposit = Number(service.price) * Number(service.deposit_percentage || 0) / 100;

    return `
      <article class="service-card">
        <div class="service-head">
          <div class="service-icon">✦</div>
          <span class="service-status">Disponível</span>
        </div>

        <h3>${escapeHtml(service.name)}</h3>
        <p>${escapeHtml(service.description || "Procedimento premium.")}</p>

        <div class="service-meta">
          <div><span>Valor</span><strong>${money(service.price)}</strong></div>
          <div><span>Duração</span><strong>${duration(service.duration_minutes)}</strong></div>
        </div>

        <div class="service-meta">
          <div><span>Sinal</span><strong>${money(deposit)}</strong></div>
        </div>

        <button class="btn btn-primary" data-public-service="${service.id}" type="button">
          Escolher horário
        </button>
      </article>
    `;
  }).join("");

  el.adminServicesGrid.innerHTML = el.publicServicesGrid.innerHTML
    .replaceAll('data-public-service="', 'data-noop="');
}

function chooseService(serviceId) {
  state.selectedService = state.services.find(s => s.id === serviceId);
  state.selectedSlot = null;

  el.selectedServiceCaption.textContent =
    `${state.selectedService.name} • ${money(state.selectedService.price)} • ${duration(state.selectedService.duration_minutes)}`;

  goPublicStep(2);
  loadPublicSlots();
}

async function loadPublicSlots() {
  if (!state.selectedService) return;

  state.selectedDate = el.publicBookingDate.value;
  state.selectedSlot = null;
  el.toCustomerDataBtn.disabled = true;
  el.publicSlotDateLabel.textContent = humanDate(state.selectedDate);
  el.publicBookingSlots.innerHTML = `<div class="slots-message">Consultando horários...</div>`;

  const { data, error } = await db.rpc("get_available_slots", {
    p_service_id: state.selectedService.id,
    p_date: state.selectedDate
  });

  if (error) {
    console.error(error);
    el.publicBookingSlots.innerHTML = `<div class="slots-message">Não foi possível consultar os horários.</div>`;
    return;
  }

  if (!data?.length) {
    el.publicBookingSlots.innerHTML = `<div class="slots-message">Nenhum horário disponível nesta data.</div>`;
    return;
  }

  el.publicBookingSlots.innerHTML = data.map(row => `
    <button class="slot-btn" type="button" data-slot="${row.slot_start}">
      ${timeOf(new Date(row.slot_start))}
    </button>
  `).join("");

  requestAnimationFrame(() => {
    const step2 = $("#public-step-2");
    if (step2 && !step2.classList.contains("hidden")) {
      const slotCard = step2.querySelector(".slot-card");
      if (slotCard) {
        const headerOffset = window.innerWidth <= 900 ? 82 : 24;
        const top = slotCard.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({
          top: Math.max(top, 0),
          behavior: "smooth"
        });
      }
    }
  });
}

function selectPublicSlot(btn) {
  $$(".slot-btn").forEach(x => x.classList.remove("selected"));
  btn.classList.add("selected");
  state.selectedSlot = btn.dataset.slot;
  el.toCustomerDataBtn.disabled = false;
  updateReview();

  requestAnimationFrame(() => {
    const actions = $("#public-step-2 .step-actions");
    if (actions) {
      const headerOffset = window.innerWidth <= 900 ? 82 : 24;
      const top = actions.getBoundingClientRect().top + window.scrollY - window.innerHeight + 120;
      window.scrollTo({
        top: Math.max(top, 0),
        behavior: "smooth"
      });
    }
  });
}

function updateReview() {
  if (!state.selectedService || !state.selectedSlot) return;

  const deposit =
    Number(state.selectedService.price) *
    Number(state.selectedService.deposit_percentage || 0) / 100;

  el.reviewService.textContent = state.selectedService.name;
  el.reviewDatetime.textContent = `${fullDate(new Date(state.selectedSlot))} às ${timeOf(new Date(state.selectedSlot))}`;
  el.reviewTotal.textContent = money(state.selectedService.price);
  el.reviewDeposit.textContent = money(deposit);
}

async function reserveAndGeneratePix() {
  const name = el.guestName.value.trim();
  const phone = digits(el.guestPhone.value);
  const cpf = digits(el.guestCpf.value);
  const email = el.guestEmail.value.trim().toLowerCase() || null;
  const notes = el.guestNotes.value.trim() || null;

  if (name.length < 3) return toast("Informe seu nome completo.", "error");
  if (phone.length < 10) return toast("Informe um WhatsApp válido.", "error");
  if (!isValidCPF(cpf)) return toast("Informe um CPF válido.", "error");
  if (!state.selectedService || !state.selectedSlot) return toast("Escolha um horário.", "error");

  buttonBusy(el.reserveAndPayBtn, true, "Reservando...");

  try {
    const { data: hold, error: holdError } = await db.rpc("create_guest_hold", {
      p_service_id: state.selectedService.id,
      p_start_at: state.selectedSlot,
      p_name: name,
      p_phone: phone,
      p_email: email,
      p_notes: notes
    });

    if (holdError) throw holdError;

    state.guestHold = Array.isArray(hold) ? hold[0] : hold;

    const { data: pixData, error: pixError } = await db.functions.invoke("create-pix", {
      body: {
        appointmentId: state.guestHold.appointment_id,
        accessToken: state.guestHold.access_token,
        cpf
      }
    });

    if (pixError) throw pixError;
    if (!pixData?.success) throw new Error(pixData?.error || "Não foi possível gerar o Pix.");

    state.pix = pixData;

    renderPix();
    goPublicStep(4);
    startPaymentPolling();
  } catch (error) {
    console.error(error);
    toast(guestError(error.message), "error");
    await loadPublicSlots();
  } finally {
    buttonBusy(el.reserveAndPayBtn, false, "Reservar horário e gerar Pix");
  }
}

function renderPix() {
  el.pixQrImage.src = `data:image/png;base64,${state.pix.encodedImage}`;
  el.pixPayload.value = state.pix.payload;
  el.pixValue.textContent = money(state.pix.amount);
  el.pixExpirationLabel.textContent = state.pix.expirationDate
    ? `Pix válido até ${state.pix.expirationDate}`
    : "Aguardando pagamento";
}

async function copyPix() {
  try {
    await navigator.clipboard.writeText(el.pixPayload.value);
    toast("Código Pix copiado.", "success");
  } catch {
    el.pixPayload.select();
    document.execCommand("copy");
    toast("Código Pix copiado.", "success");
  }
}

function startPaymentPolling() {
  stopPaymentPolling();

  state.paymentPoll = window.setInterval(async () => {
    if (!state.guestHold?.access_token) return;

    const { data, error } = await db.rpc("get_guest_booking_status", {
      p_access_token: state.guestHold.access_token
    });

    if (error || !data?.length) return;

    const status = data[0];

    if (status.appointment_status === "confirmed" || status.payment_status === "received") {
      stopPaymentPolling();
      showPaymentSuccess(status);
    }

    if (status.appointment_status === "cancelled") {
      stopPaymentPolling();
      el.paymentStatusBox.className = "payment-status";
      el.paymentStatusBox.innerHTML = `
        <span class="status-dot"></span>
        <div>
          <strong>Reserva expirada</strong>
          <small>Faça um novo agendamento.</small>
        </div>
      `;
    }
  }, 5000);
}

function stopPaymentPolling() {
  if (state.paymentPoll) {
    clearInterval(state.paymentPoll);
    state.paymentPoll = null;
  }
}

function showPaymentSuccess(status) {
  el.successReference.textContent = status.public_reference;
  el.successService.textContent = state.selectedService?.name || "Serviço";
  el.successDatetime.textContent = state.selectedSlot
    ? `${fullDate(new Date(state.selectedSlot))} às ${timeOf(new Date(state.selectedSlot))}`
    : "Confirmado";

  el.successMessage.textContent =
    `Obrigada, ${el.guestName.value.trim().split(" ")[0]}! Seu pagamento foi identificado e o horário está confirmado.`;

  goPublicStep("success");
}

function resetPublicBooking() {
  stopPaymentPolling();
  state.selectedService = null;
  state.selectedSlot = null;
  state.guestHold = null;
  state.pix = null;

  el.guestName.value = "";
  el.guestPhone.value = "";
  el.guestCpf.value = "";
  el.guestEmail.value = "";
  el.guestNotes.value = "";

  setDateDefaults();
  goPublicStep(1);
}

function goPublicStep(step) {
  $$(".public-step").forEach(section => section.classList.add("hidden"));

  if (step === "success") {
    const successSection = $("#public-step-success");
    successSection.classList.remove("hidden");
    updateProgress(4);

    requestAnimationFrame(() => {
      focusBookingStep(successSection);
    });

    return;
  }

  const targetSection = $(`#public-step-${step}`);
  targetSection.classList.remove("hidden");

  updateProgress(step);

  if (step === 3) {
    updateReview();
  }

  requestAnimationFrame(() => {
    focusBookingStep(targetSection);
  });
}

/*
  EXPERIÊNCIA GUIADA:
  sempre leva a cliente diretamente para a etapa atual,
  sem voltar para o topo da landing page.
*/
function focusBookingStep(section) {
  if (!section) return;

  const headerOffset = window.innerWidth <= 900 ? 82 : 24;
  const targetTop =
    section.getBoundingClientRect().top +
    window.scrollY -
    headerOffset;

  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: "smooth"
  });

  const firstInteractive = section.querySelector(
    "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])"
  );

  if (firstInteractive && window.innerWidth <= 900) {
    window.setTimeout(() => {
      firstInteractive.focus({ preventScroll: true });
    }, 420);
  }
}

function updateProgress(step) {
  $$("[data-progress]").forEach(item => {
    item.classList.toggle("active", Number(item.dataset.progress) <= Number(step));
  });
}

function openPublicMenu() {
  if (!el.publicMobileMenu) return;

  el.publicMobileMenu.classList.add("open");
  el.publicMenuOverlay?.classList.add("visible");
  el.publicMobileMenu.setAttribute("aria-hidden", "false");
  el.publicMenuBtn?.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-lock");
}

function closePublicMenu() {
  if (!el.publicMobileMenu) return;

  el.publicMobileMenu.classList.remove("open");
  el.publicMenuOverlay?.classList.remove("visible");
  el.publicMobileMenu.setAttribute("aria-hidden", "true");
  el.publicMenuBtn?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-lock");
}

/* =========================================================
   ADMIN
   ========================================================= */

function openAdminLogin() {
  el.adminLoginModal.classList.remove("hidden");
}

function closeAdminLogin() {
  el.adminLoginModal.classList.add("hidden");
}

async function adminLogin(event) {
  event.preventDefault();
  buttonBusy(el.adminLoginSubmit, true, "Entrando...");

  try {
    const { data, error } = await db.auth.signInWithPassword({
      email: el.adminEmail.value.trim().toLowerCase(),
      password: el.adminPassword.value
    });

    if (error) throw error;

    const ok = await tryLoadAdmin(data.user);
    if (!ok) {
      await db.auth.signOut();
      throw new Error("Esta conta não possui acesso administrativo.");
    }

    closeAdminLogin();
    await openAdminPanel();
  } catch (error) {
    toast(authError(error.message), "error");
  } finally {
    buttonBusy(el.adminLoginSubmit, false, "Entrar no painel");
  }
}

async function tryLoadAdmin(user) {
  const { data, error } = await db
    .from("profiles")
    .select("id,name,email,role,business_id,active")
    .eq("id", user.id)
    .single();

  if (error || !data) return false;
  if (!["owner", "admin"].includes(data.role) || !data.active) return false;

  state.adminUser = user;
  state.adminProfile = data;
  return true;
}

async function openAdminPanel() {
  await loadAdminData();
  renderAdmin();
  el.publicView.classList.add("hidden");
  el.appView.classList.remove("hidden");
  navigateAdmin("dashboard");
}

async function loadAdminData() {
  const [bookings, customers, payments] = await Promise.all([
    db.from("appointments")
      .select(`
        id,start_at,end_at,total_amount,deposit_amount,status,payment_status,public_reference,created_at,
        customer:guest_customers!appointments_customer_id_fkey(id,name,phone,email),
        service:services!appointments_service_id_fkey(id,name)
      `)
      .eq("business_id", state.business.id)
      .order("start_at", { ascending: true }),

    db.from("guest_customers")
      .select("id,name,phone,email,created_at")
      .eq("business_id", state.business.id)
      .order("created_at", { ascending: false }),

    db.from("payments")
      .select("id,appointment_id,amount,status,provider,created_at")
      .eq("business_id", state.business.id)
      .order("created_at", { ascending: false })
  ]);

  if (bookings.error) console.error(bookings.error);
  if (customers.error) console.error(customers.error);
  if (payments.error) console.error(payments.error);

  state.adminBookings = bookings.data || [];
  state.adminCustomers = customers.data || [];
  state.adminPayments = payments.data || [];
}

function renderAdmin() {
  const name = state.adminProfile?.name || "Débora";
  const initials = initialsFrom(name);

  el.sidebarName.textContent = name;
  el.sidebarAvatar.textContent = initials;
  el.topbarAvatar.textContent = initials;

  el.metricBookings.textContent = state.adminBookings.length;
  el.metricClients.textContent = state.adminCustomers.length;
  el.metricServices.textContent = state.services.length;

  const received = state.adminPayments
    .filter(p => ["received", "confirmed"].includes(p.status))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  el.metricRevenue.textContent = money(received);

  renderDashboardBookings();
  renderAdminBookings();
  renderCustomers();
  renderAdminFinance();
  renderPublicServices();
}

function renderDashboardBookings() {
  const upcoming = state.adminBookings
    .filter(b => new Date(b.start_at) >= new Date() && ["pending", "confirmed"].includes(normalizeStatus(b.status)))
    .slice(0, 5);

  el.dashboardBookings.innerHTML = upcoming.length
    ? upcoming.map(adminBookingCard).join("")
    : empty("Nenhum atendimento próximo", "Os novos agendamentos aparecerão aqui.");
}

function renderAdminBookings() {
  const date = el.agendaDateFilter.value;
  const status = el.agendaStatusFilter.value;

  const rows = state.adminBookings.filter(b => {
    const dateOk = !date || dateInput(new Date(b.start_at)) === date;
    const statusOk = status === "all" || normalizeStatus(b.status) === status;
    return dateOk && statusOk;
  });

  el.adminBookings.innerHTML = rows.length
    ? rows.map(adminBookingCard).join("")
    : empty("Nenhum agendamento", "Nenhum registro encontrado para os filtros atuais.");
}

function adminBookingCard(b) {
  const d = new Date(b.start_at);
  const status = normalizeStatus(b.status);

  return `
    <article class="booking-card">
      <div class="booking-date">
        <strong>${String(d.getDate()).padStart(2, "0")}</strong>
        <span>${d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</span>
      </div>

      <div class="booking-main">
        <h3>${escapeHtml(b.service?.name || "Serviço")}</h3>
        <p>${escapeHtml(b.customer?.name || "Cliente")} • ${timeOf(d)}</p>

        <div class="chips">
          <span class="status ${status}">${statusLabel(status)}</span>
          <span class="chip">${money(b.deposit_amount)}</span>
          <span class="chip">${phoneMask(b.customer?.phone || "")}</span>
        </div>
      </div>

      <div>
        <span class="chip">${escapeHtml(b.public_reference || "")}</span>
      </div>
    </article>
  `;
}

function renderCustomers() {
  el.clientsTable.innerHTML = state.adminCustomers.length ? `
    <table class="data-table">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>WhatsApp</th>
          <th>E-mail</th>
          <th>Desde</th>
        </tr>
      </thead>
      <tbody>
        ${state.adminCustomers.map(c => `
          <tr>
            <td><strong>${escapeHtml(c.name)}</strong></td>
            <td>${phoneMask(c.phone)}</td>
            <td>${escapeHtml(c.email || "—")}</td>
            <td>${new Date(c.created_at).toLocaleDateString("pt-BR")}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  ` : empty("Nenhuma cliente", "As clientes serão criadas automaticamente quando agendarem.");
}

function renderAdminFinance() {
  const received = state.adminPayments
    .filter(p => ["received", "confirmed"].includes(p.status))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const pending = state.adminPayments
    .filter(p => ["pending", "waiting_payment"].includes(p.status))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  el.financeReceived.textContent = money(received);
  el.financePending.textContent = money(pending);

  el.paymentsTable.innerHTML = state.adminPayments.length ? `
    <table class="data-table">
      <thead>
        <tr>
          <th>Data</th>
          <th>Provedor</th>
          <th>Status</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody>
        ${state.adminPayments.map(p => `
          <tr>
            <td>${new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
            <td>${escapeHtml(p.provider || "Asaas")}</td>
            <td>${escapeHtml(p.status || "—")}</td>
            <td>${money(p.amount)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  ` : empty("Sem pagamentos", "As cobranças Pix aparecerão aqui.");
}

function navigateAdmin(page) {
  $$(".page").forEach(p => p.classList.add("hidden"));
  $$("[data-page]").forEach(btn => btn.classList.toggle("active", btn.dataset.page === page));

  const target = $(`#page-${page}`);
  if (!target) return;

  target.classList.remove("hidden");
  closeSidebar();

  const titles = {
    dashboard: "Visão geral",
    agenda: "Agenda",
    clients: "Clientes",
    services: "Serviços",
    finance: "Financeiro"
  };

  el.pageTitle.textContent = titles[page] || "Débora Gomes Beauty";
}

async function adminLogout() {
  await db.auth.signOut();
  state.adminUser = null;
  state.adminProfile = null;
  el.appView.classList.add("hidden");
  showPublic();
}

function openSidebar() {
  el.sidebar.classList.add("open");
  el.sidebarOverlay.classList.add("visible");
}

function closeSidebar() {
  el.sidebar.classList.remove("open");
  el.sidebarOverlay.classList.remove("visible");
}

/* HELPERS */
function showPublic() {
  el.publicView.classList.remove("hidden");
  el.appView.classList.add("hidden");
}

function hideSplash() {
  el.splash.classList.add("hidden");
}

function buttonBusy(button, busy, text) {
  button.disabled = busy;
  button.textContent = text;
}

function money(value) {
  return new Intl.NumberFormat(CFG.locale, {
    style: "currency",
    currency: CFG.currency
  }).format(Number(value || 0));
}

function duration(minutes) {
  const total = Number(minutes || 0);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? (m ? `${h}h ${m}min` : `${h}h`) : `${m}min`;
}

function timeOf(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: CFG.timezone
  }).format(date);
}

function fullDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: CFG.timezone
  }).format(date);
}

function dateInput(date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: CFG.timezone
  }).format(date);
}

function humanDate(value) {
  if (!value) return "Selecione uma data";
  const [y, m, d] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  }).format(new Date(y, m - 1, d));
}

function digits(value) {
  return String(value || "").replace(/\D/g, "");
}

function phoneMask(value) {
  const n = digits(value).slice(0, 11);
  if (n.length <= 2) return n;
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}

function cpfMask(value) {
  const n = digits(value).slice(0, 11);
  if (n.length <= 3) return n;
  if (n.length <= 6) return `${n.slice(0, 3)}.${n.slice(3)}`;
  if (n.length <= 9) return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6)}`;
  return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6, 9)}-${n.slice(9)}`;
}

function isValidCPF(value) {
  const cpf = digits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);
  let d1 = (sum * 10) % 11; if (d1 === 10) d1 = 0;
  if (d1 !== Number(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);
  let d2 = (sum * 10) % 11; if (d2 === 10) d2 = 0;
  return d2 === Number(cpf[10]);
}

function initialsFrom(name) {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "DG";
  return words.length > 1
    ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
    : words[0].slice(0, 2).toUpperCase();
}

function normalizeStatus(status) {
  if (["waiting_payment", "pending"].includes(status)) return "pending";
  return status || "pending";
}

function statusLabel(status) {
  return {
    pending: "Aguardando Pix",
    confirmed: "Confirmado",
    completed: "Concluído",
    cancelled: "Cancelado"
  }[status] || status;
}

function authError(message = "") {
  const text = message.toLowerCase();
  if (text.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  return message || "Não foi possível entrar.";
}

function guestError(message = "") {
  const text = message.toLowerCase();
  if (text.includes("horário indisponível") || text.includes("horario indisponivel")) {
    return "Este horário acabou de ser reservado. Escolha outro.";
  }
  if (text.includes("reserva expirada")) {
    return "Sua reserva expirou. Escolha o horário novamente.";
  }
  return message || "Não foi possível continuar.";
}

function toast(message, type = "default") {
  const node = document.createElement("div");
  node.className = `toast ${type}`;
  node.textContent = message;
  el.toastRoot.appendChild(node);
  setTimeout(() => node.remove(), 4500);
}

function empty(title, message) {
  return `
    <div class="empty-state">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}