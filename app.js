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
  paymentCountdownTimer: null,

  adminApprovalPoll: null,
  adminApprovalQueue: [],
  currentApproval: null,
  blockedPeriods: [],
  agendaWeekStart: null,
  agendaSelectedDate: null,
  servicesSearch: "",
  servicesStatus: "all",
  confirmResolver: null,

  adminUser: null,
  adminProfile: null,
  adminBookings: [],
  adminCustomers: [],
  adminPayments: [],
  adminServices: [],
  editingServiceImageUrl: ""
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const el = {
  splash: $("#splash"),
  publicView: $("#public-view"),
  appView: $("#app-view"),

  professionalAreaBtn: $("#professional-area-btn"),
  heroBookNow: $("#hero-book-now"),
  mobileQuickBook: $("#mobile-quick-book"),
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
  paymentCountdown: $("#payment-countdown"),
  paymentCountdownCard: $("#payment-countdown-card"),

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
  metricTodayBookings: $("#metric-today-bookings"),
  metricTodayValue: $("#metric-today-value"),
  metricBookingsMonth: $("#metric-bookings-month"),
  metricNewClients: $("#metric-new-clients"),
  metricTicket: $("#metric-ticket"),
  metricRevenueMonth: $("#metric-revenue-month"),
  adminDateLabel: $("#admin-date-label"),
  adminFirstName: $("#admin-first-name"),
  dashboardMonthReceived: $("#dashboard-month-received"),
  dashboardMonthPending: $("#dashboard-month-pending"),
  dashboardTopClient: $("#dashboard-top-client"),
  dashboardTopService: $("#dashboard-top-service"),
  dashboardBookings: $("#dashboard-bookings"),
  agendaDateFilter: $("#agenda-date-filter"),
  agendaStatusFilter: $("#agenda-status-filter"),
  adminBookings: $("#admin-bookings"),
  clientsTable: $("#clients-table"),
  adminServicesGrid: $("#admin-services-grid"),
  addServiceBtn: $("#add-service-btn"),
  serviceEditorModal: $("#service-editor-modal"),
  closeServiceEditor: $("#close-service-editor"),
  serviceEditorForm: $("#service-editor-form"),
  serviceEditorTitle: $("#service-editor-title"),
  serviceEditId: $("#service-edit-id"),
  serviceEditName: $("#service-edit-name"),
  serviceEditDescription: $("#service-edit-description"),
  serviceEditPrice: $("#service-edit-price"),
  serviceEditDuration: $("#service-edit-duration"),
  serviceEditDeposit: $("#service-edit-deposit"),
  serviceEditActive: $("#service-edit-active"),
  serviceImageFile: $("#service-image-file"),
  serviceImagePreview: $("#service-image-preview"),
  serviceImagePlaceholder: $("#service-image-placeholder"),
  deleteServiceBtn: $("#delete-service-btn"),
  saveServiceBtn: $("#save-service-btn"),
  financeReceived: $("#finance-received"),
  financePending: $("#finance-pending"),
  paymentsTable: $("#payments-table"),
  agendaDayCount: $("#agenda-day-count"),
  agendaDayValue: $("#agenda-day-value"),
  agendaDayPaid: $("#agenda-day-paid"),
  agendaDayRemaining: $("#agenda-day-remaining"),
  agendaMonthLabel: $("#agenda-month-label"),
  agendaSelectedLabel: $("#agenda-selected-label"),
  agendaWeekStrip: $("#agenda-week-strip"),
  agendaPrevWeek: $("#agenda-prev-week"),
  agendaNextWeek: $("#agenda-next-week"),
  agendaTodayBtn: $("#agenda-today-btn"),
  agendaNowStatus: $("#agenda-now-status"),
  agendaNextBooking: $("#agenda-next-booking"),
  agendaListTitle: $("#agenda-list-title"),
  clientsTotal: $("#clients-total"),
  clientsNewMonth: $("#clients-new-month"),
  clientsReturning: $("#clients-returning"),
  clientsTopName: $("#clients-top-name"),
  clientsTopMeta: $("#clients-top-meta"),
  clientRanking: $("#client-ranking"),
  servicesSearch: $("#services-search"),
  servicesStatusFilter: $("#services-status-filter"),
  newServiceBtn: $("#new-service-btn"),
  financeMonth: $("#finance-month"),
  financeTicket: $("#finance-ticket"),
  accountAvatar: $("#account-avatar"),
  accountName: $("#account-name"),
  accountCurrentEmail: $("#account-current-email"),
  accountSecurityForm: $("#account-security-form"),
  accountNewEmail: $("#account-new-email"),
  accountNewPassword: $("#account-new-password"),
  accountConfirmPassword: $("#account-confirm-password"),
  accountSaveBtn: $("#account-save-btn"),
  toggleAccountPassword: $("#toggle-account-password"),
  blockPeriodForm: $("#block-period-form"),
  blockDate: $("#block-date"),
  blockStartTime: $("#block-start-time"),
  blockEndTime: $("#block-end-time"),
  blockReason: $("#block-reason"),
  blockPeriodBtn: $("#block-period-btn"),
  blockedPeriodsList: $("#blocked-periods-list"),

  approvalModal: $("#approval-modal"),
  approvalClientName: $("#approval-client-name"),
  approvalClientPhone: $("#approval-client-phone"),
  approvalClientCpf: $("#approval-client-cpf"),
  approvalService: $("#approval-service"),
  approvalDatetime: $("#approval-datetime"),
  approvalDeposit: $("#approval-deposit"),
  approvalRemaining: $("#approval-remaining"),
  approvalAcceptBtn: $("#approval-accept-btn"),
  approvalRejectBtn: $("#approval-reject-btn"),
  confirmModal: $("#confirm-modal"),
  confirmModalClose: $("#confirm-modal-close"),
  confirmModalIcon: $("#confirm-modal-icon"),
  confirmModalTitle: $("#confirm-modal-title"),
  confirmModalMessage: $("#confirm-modal-message"),
  confirmModalCancel: $("#confirm-modal-cancel"),
  confirmModalOk: $("#confirm-modal-ok"),

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

    if (!state.business?.id) {
      throw new Error("Empresa Débora Gomes Beauty não encontrada no Supabase.");
    }

    state.services = await fetchPublicServices();
    renderPublicServices();

    /*
      REGRA DE ACESSO:
      A tela inicial deve ser SEMPRE o agendamento público.
      Mesmo que exista uma sessão administrativa salva no navegador,
      o painel só será aberto após o usuário digitar novamente
      e-mail e senha no formulário administrativo.
    */
    state.adminUser = null;
    state.adminProfile = null;

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

  el.heroBookNow?.addEventListener("click", () => {
    goPublicStep(1);
    document.querySelector("#booking-area")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  el.mobileQuickBook?.addEventListener("click", () => {
    goPublicStep(1);
    document.querySelector("#booking-area")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
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
  el.blockPeriodForm?.addEventListener("submit", createBlockedPeriod);
  el.approvalAcceptBtn?.addEventListener("click", acceptCurrentApproval);
  el.approvalRejectBtn?.addEventListener("click", rejectCurrentApproval);
  el.confirmModalCancel?.addEventListener("click", () => closeConfirmModal(false));
  el.confirmModalClose?.addEventListener("click", () => closeConfirmModal(false));
  el.confirmModal?.addEventListener("click", event => {
    if (event.target === el.confirmModal) closeConfirmModal(false);
  });
  el.confirmModalOk?.addEventListener("click", () => closeConfirmModal(true));
  el.accountSecurityForm?.addEventListener("submit", updateAdminCredentials);
  el.toggleAccountPassword?.addEventListener("click", toggleAccountPasswordVisibility);
  el.agendaDateFilter?.addEventListener("change", renderAdminBookings);
  el.agendaStatusFilter?.addEventListener("change", renderAdminBookings);
  el.agendaPrevWeek?.addEventListener("click", () => shiftAgendaWeek(-7));
  el.agendaNextWeek?.addEventListener("click", () => shiftAgendaWeek(7));
  el.agendaTodayBtn?.addEventListener("click", goAgendaToday);
  el.servicesSearch?.addEventListener("input", () => {
    state.servicesSearch = el.servicesSearch.value.trim().toLowerCase();
    renderPublicServices();
  });
  el.servicesStatusFilter?.addEventListener("change", () => {
    state.servicesStatus = el.servicesStatusFilter.value;
    renderPublicServices();
  });

  el.addServiceBtn?.addEventListener("click", () => openServiceEditor());
  el.newServiceBtn?.addEventListener("click", () => openServiceEditor());
  el.closeServiceEditor?.addEventListener("click", closeServiceEditorModal);
  el.serviceEditorModal?.addEventListener("click", e => {
    if (e.target === el.serviceEditorModal) closeServiceEditorModal();
  });
  el.serviceEditorForm?.addEventListener("submit", saveServiceFromAdmin);
  el.serviceImageFile?.addEventListener("change", previewServiceImage);
  el.deleteServiceBtn?.addEventListener("click", deleteServiceFromAdmin);
  el.adminServicesGrid?.addEventListener("click", e => {
    const editBtn = e.target.closest("[data-edit-service]");
    if (editBtn) {
      openServiceEditor(editBtn.dataset.editService);
      return;
    }

    const toggleBtn = e.target.closest("[data-toggle-service]");
    if (toggleBtn) {
      toggleServiceActive(toggleBtn.dataset.toggleService);
    }
  });
}

function setDateDefaults() {
  const today = dateInput(new Date());

  if (el.publicBookingDate) {
    el.publicBookingDate.min = today;
    el.publicBookingDate.value = today;
  }

  state.selectedDate = today;
  state.agendaSelectedDate = today;
  state.agendaWeekStart = startOfWeekISO(today);

  if (el.agendaDateFilter) el.agendaDateFilter.value = today;
  if (el.blockDate) el.blockDate.value = today;
}

async function fetchBusiness() {
  let query = db
    .from("businesses")
    .select("id,slug,name,email,phone,active")
    .eq("slug", CFG.businessSlug);

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("fetchBusiness:", error);
    throw error;
  }

  if (!data?.id) {
    throw new Error(`Empresa não encontrada para o slug: ${CFG.businessSlug}`);
  }

  if (data.active === false) {
    throw new Error("A empresa está desativada no Supabase.");
  }

  return data;
}

async function fetchPublicServices() {
  if (!state.business?.id) {
    state.business = await fetchBusiness();
  }

  const { data, error } = await db
    .from("services")
    .select("id,name,description,price,duration_minutes,deposit_percentage,active,image_url")
    .eq("business_id", state.business.id)
    .eq("active", true)
    .order("name");

  if (error) {
    console.error("fetchPublicServices:", error);
    throw error;
  }

  return data || [];
}

function adminServiceCard(s) {
  const deposit = Number(s.price || 0) * (Number(s.deposit_percentage || 50) / 100);

  const image = s.image_url
    ? `<img class="admin-service-thumb-img" src="${escapeHtml(s.image_url)}" alt="${escapeHtml(s.name || "Serviço")}" />`
    : `<div class="admin-service-thumb-placeholder">✦</div>`;

  return `
    <article class="admin-service-card ${s.active === false ? "inactive" : ""}">
      <div class="admin-service-thumb">
        ${image}
        <span class="admin-service-status ${s.active === false ? "off" : "on"}">
          ${s.active === false ? "Desativado" : "Disponível"}
        </span>
      </div>

      <div class="admin-service-content">
        <div>
          <h3>${escapeHtml(s.name || "Procedimento")}</h3>
          <p>${escapeHtml(s.description || "Sem descrição cadastrada.")}</p>
        </div>

        <div class="admin-service-values">
          <div>
            <span>Valor</span>
            <strong>${money(s.price)}</strong>
          </div>
          <div>
            <span>Duração</span>
            <strong>${duration(s.duration_minutes)}</strong>
          </div>
          <div>
            <span>Sinal</span>
            <strong>${money(deposit)}</strong>
          </div>
        </div>

        <div class="admin-service-actions">
          <button class="btn btn-primary" type="button" data-edit-service="${s.id}">
            Editar
          </button>
          <button class="btn btn-soft" type="button" data-toggle-service="${s.id}">
            ${s.active === false ? "Ativar" : "Desativar"}
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderPublicServices() {
  const publicRows = (state.services || []).filter(service => service.active !== false);

  if (el.publicServicesGrid) {
    if (!publicRows.length) {
      el.publicServicesGrid.innerHTML = empty(
        "Nenhum serviço disponível",
        "Os serviços aparecerão aqui assim que forem cadastrados."
      );
    } else {
      el.publicServicesGrid.innerHTML = publicRows.map((service, index) => {
        const deposit =
          Number(service.price || 0) *
          (Number(service.deposit_percentage || 0) / 100);

        const image = service.image_url
          ? `
            <div class="service-cover">
              <img
                src="${escapeHtml(service.image_url)}"
                alt="${escapeHtml(service.name || "Procedimento")}"
                loading="lazy"
              />
            </div>
          `
          : `
            <div class="service-cover service-cover-placeholder">
              <span>✦</span>
            </div>
          `;

        return `
          <article class="service-card ${index === 0 ? "featured" : ""}">
            ${index === 0
              ? `<span class="service-featured-badge">Mais escolhido</span>`
              : ""}

            ${image}

            <div class="service-head service-head-after-image">
              <div class="service-icon">✦</div>
              <span class="service-status">Disponível</span>
            </div>

            <h3>${escapeHtml(service.name || "Procedimento")}</h3>

            <p>
              ${escapeHtml(
                service.description ||
                "Procedimento realizado com atendimento personalizado."
              )}
            </p>

            <div class="service-meta">
              <div>
                <span>Valor</span>
                <strong>${money(service.price)}</strong>
              </div>

              <div>
                <span>Duração</span>
                <strong>${duration(service.duration_minutes)}</strong>
              </div>
            </div>

            <div class="service-meta">
              <div>
                <span>Sinal</span>
                <strong>${money(deposit)}</strong>
              </div>
            </div>

            <button
              class="btn btn-primary service-cta"
              data-public-service="${service.id}"
              type="button"
            >
              Ver horários disponíveis
            </button>
          </article>
        `;
      }).join("");
    }
  }

  // A área administrativa só é atualizada se a profissional já estiver logada.
  if (state.adminUser && el.adminServicesGrid) {
    renderAdminServices();
  }
}

function renderAdminServices() {
  if (!el.adminServicesGrid) return;

  const rowsBase = state.adminServices.length
    ? state.adminServices
    : state.services;

  const search = (state.servicesSearch || "").trim().toLowerCase();
  const status = state.servicesStatus || "all";

  const rows = rowsBase.filter(service => {
    const text = `${service.name || ""} ${service.description || ""}`.toLowerCase();

    const matchesSearch = !search || text.includes(search);

    const matchesStatus =
      status === "all" ||
      (status === "active" && service.active !== false) ||
      (status === "inactive" && service.active === false);

    return matchesSearch && matchesStatus;
  });

  el.adminServicesGrid.innerHTML = rows.length
    ? rows.map(adminServiceCard).join("")
    : empty(
        "Nenhum serviço encontrado",
        "Ajuste os filtros ou cadastre um novo procedimento."
      );
}

async function toggleServiceActive(serviceId) {
  const service =
    state.adminServices.find(item => item.id === serviceId) ||
    state.services.find(item => item.id === serviceId);

  if (!service) {
    toast("Serviço não encontrado.", "error");
    return;
  }

  const nextActive = service.active === false;

  try {
    const { error } = await db
      .from("services")
      .update({
        active: nextActive,
        updated_at: new Date().toISOString()
      })
      .eq("id", serviceId)
      .eq("business_id", state.adminProfile?.business_id || state.business?.id);

    if (error) throw error;

    service.active = nextActive;

    const adminIndex = state.adminServices.findIndex(item => item.id === serviceId);
    if (adminIndex >= 0) {
      state.adminServices[adminIndex] = {
        ...state.adminServices[adminIndex],
        active: nextActive
      };
    }

    // Serviços públicos só devem mostrar os ativos.
    state.services = state.adminServices.filter(item => item.active !== false);

    renderAdminServices();
    renderPublicServices();

    toast(
      nextActive
        ? "Serviço disponibilizado para agendamento."
        : "Serviço ocultado do agendamento público.",
      "success"
    );
  } catch (error) {
    console.error("toggleServiceActive:", error);
    toast(readableError(error), "error");
  }
}

function chooseService(serviceId) {
  const service = state.services.find(s => s.id === serviceId);

  if (!service) {
    toast("Não foi possível localizar este procedimento.", "error");
    return;
  }

  state.selectedService = service;
  state.selectedSlot = null;

  if (el.selectedServiceCaption) {
    el.selectedServiceCaption.textContent =
      `${service.name} • ${money(service.price)} • ${duration(service.duration_minutes)}`;
  }

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
      p_cpf: cpf,
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
    startPaymentCountdown();
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
  stopPaymentCountdown();

  state.paymentPoll = window.setInterval(async () => {
    if (!state.guestHold?.access_token) return;

    const { data, error } = await db.rpc("get_guest_booking_status", {
      p_access_token: state.guestHold.access_token
    });

    if (error || !data?.length) return;

    const status = data[0];
    const approval = String(status.admin_approval_status || "pending").toLowerCase();

    if (status.payment_status === "received" && approval === "pending") {
      el.paymentStatusBox.className = "payment-status received";
      el.paymentStatusBox.innerHTML = `
        <span class="status-dot"></span>
        <div>
          <strong>Pagamento recebido ✓</strong>
          <small>Aguardando a confirmação da profissional.</small>
        </div>
      `;
      stopPaymentCountdown();
      return;
    }

    if (
      status.payment_status === "received" &&
      approval === "accepted"
    ) {
      stopPaymentPolling();
      stopPaymentCountdown();
      showPublicSuccess(status);
      return;
    }

    if (
      status.appointment_status === "cancelled" ||
      ["rejected", "refunded"].includes(approval)
    ) {
      stopPaymentPolling();
      stopPaymentCountdown();

      el.paymentStatusBox.className = "payment-status expired";
      el.paymentStatusBox.innerHTML = `
        <span class="status-dot"></span>
        <div>
          <strong>${approval === "refunded" || approval === "rejected" ? "Atendimento não confirmado" : "Reserva expirada"}</strong>
          <small>${approval === "refunded" || approval === "rejected"
            ? "O valor do sinal será devolvido conforme o processamento do meio de pagamento."
            : "O horário foi liberado. Faça um novo agendamento."}</small>
        </div>
      `;
    }
  }, 3000);
}

function stopPaymentPolling() {
  if (state.paymentPoll) {
    clearInterval(state.paymentPoll);
    state.paymentPoll = null;
  }
}

function startPaymentCountdown() {
  stopPaymentCountdown();

  const expiresAt = state.guestHold?.hold_expires_at
    ? new Date(state.guestHold.hold_expires_at)
    : new Date(Date.now() + 5 * 60 * 1000);

  const tick = async () => {
    const remaining = Math.max(0, expiresAt.getTime() - Date.now());
    const totalSeconds = Math.ceil(remaining / 1000);
    const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const sec = String(totalSeconds % 60).padStart(2, "0");

    if (el.paymentCountdown) {
      el.paymentCountdown.textContent = `${min}:${sec}`;
    }

    if (remaining <= 0) {
      stopPaymentCountdown();

      try {
        await db.rpc("expire_guest_holds");
      } catch (error) {
        console.error("expire_guest_holds:", error);
      }

      if (el.paymentCountdownCard) {
        el.paymentCountdownCard.classList.add("expired");
      }

      el.paymentStatusBox.className = "payment-status expired";
      el.paymentStatusBox.innerHTML = `
        <span class="status-dot"></span>
        <div>
          <strong>Prazo expirado</strong>
          <small>O horário foi liberado automaticamente. Volte e escolha outro horário.</small>
        </div>
      `;

      await loadPublicSlots();
    }
  };

  tick();
  state.paymentCountdownTimer = window.setInterval(tick, 1000);
}

function stopPaymentCountdown() {
  if (state.paymentCountdownTimer) {
    clearInterval(state.paymentCountdownTimer);
    state.paymentCountdownTimer = null;
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

  if (el.mobileQuickBook) {
    el.mobileQuickBook.classList.toggle("hidden-by-flow", Number(step) !== 1);
  }
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
  // Sempre exige nova digitação da senha para entrar no painel.
  el.adminPassword.value = "";
  el.adminLoginModal.classList.remove("hidden");

  window.setTimeout(() => {
    el.adminPassword?.focus();
  }, 80);
}

function closeAdminLogin() {
  el.adminLoginModal.classList.add("hidden");
}

async function adminLogin(event) {
  event.preventDefault();
  buttonBusy(el.adminLoginSubmit, true, "Entrando...");

  try {
    const email = el.adminEmail.value.trim().toLowerCase();
    const password = el.adminPassword.value;

    const { data, error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (!data?.user) throw new Error("Usuário administrativo não retornado pelo Supabase.");

    const ok = await tryLoadAdmin(data.user);

    if (!ok) {
      await db.auth.signOut();
      throw new Error("Esta conta não possui acesso administrativo.");
    }

    await openAdminPanel();
    closeAdminLogin();

  } catch (error) {
    console.error("ADMIN LOGIN:", error);

    const message =
      error?.message ||
      "Não foi possível entrar no painel administrativo.";

    toast(authError(message), "error");
  } finally {
    buttonBusy(el.adminLoginSubmit, false, "Entrar no painel");
  }
}

async function tryLoadAdmin(user) {
  const { data, error } = await db
    .from("profiles")
    .select("id,name,email,role,business_id,active")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("tryLoadAdmin profile:", error);
    throw new Error("Não foi possível validar o perfil administrativo.");
  }

  if (!data) return false;

  const role = String(data.role || "").toLowerCase();

  if (!["owner", "admin"].includes(role) || data.active !== true) {
    return false;
  }

  if (!data.business_id) {
    throw new Error("O usuário administrativo não está vinculado a uma empresa.");
  }

  const { data: business, error: businessError } = await db
    .from("businesses")
    .select("id,slug,name,email,phone,active")
    .eq("id", data.business_id)
    .maybeSingle();

  if (businessError) {
    console.error("tryLoadAdmin business:", businessError);
    throw new Error("Não foi possível localizar a empresa vinculada ao administrador.");
  }

  state.adminUser = user;
  state.adminProfile = data;

  // Mantém o painel sempre associado ao business_id do usuário logado.
  if (business?.id) {
    state.business = business;
  } else {
    state.business = {
      ...(state.business || {}),
      id: data.business_id
    };
  }

  return true;
}

async function openAdminPanel() {
  await loadAdminData();

  renderAdmin();

  if (el.publicView) el.publicView.classList.add("hidden");
  if (el.appView) el.appView.classList.remove("hidden");

  navigateAdmin("dashboard");
  renderAdminServices();
  startAdminApprovalPolling();
}

async function loadAdminData() {
  const businessId =
    state.adminProfile?.business_id ||
    state.business?.id;

  if (!businessId) {
    throw new Error("Empresa administrativa não identificada.");
  }

  const [bookings, customers, payments, blocks, services] = await Promise.all([
    db.from("appointments")
      .select(`
        id,start_at,end_at,total_amount,deposit_amount,remaining_amount,status,payment_status,admin_approval_status,public_reference,created_at,updated_at,
        customer:guest_customers!appointments_customer_id_fkey(id,name,phone,email,cpf),
        service:services!appointments_service_id_fkey(id,name)
      `)
      .eq("business_id", businessId)
      .order("start_at", { ascending: true }),

    db.from("guest_customers")
      .select("id,name,phone,email,cpf,created_at")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false }),

    db.from("payments")
      .select("id,appointment_id,amount,status,provider,provider_payment_id,created_at")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false }),

    db.from("blocked_periods")
      .select("id,start_at,end_at,reason,created_at")
      .eq("business_id", businessId)
      .gte("end_at", new Date().toISOString())
      .order("start_at", { ascending: true }),

    db.from("services")
      .select("id,name,description,price,duration_minutes,deposit_percentage,active,image_url,created_at")
      .eq("business_id", businessId)
      .order("name")
  ]);

  const queries = {
    bookings,
    customers,
    payments,
    blocks,
    services
  };

  Object.entries(queries).forEach(([name, result]) => {
    if (result.error) {
      console.error(`loadAdminData/${name}:`, result.error);
    }
  });

  // O painel continua abrindo mesmo que uma consulta secundária falhe.
  state.adminBookings = bookings.data || [];
  state.adminCustomers = customers.data || [];
  state.adminPayments = payments.data || [];
  state.blockedPeriods = blocks.data || [];
  state.adminServices = services.data || [];

  // A versão pública continua apenas com serviços ativos.
  if (services.data) {
    state.services = services.data.filter(service => service.active !== false);
  }
}

function renderAdmin() {
  const name = state.adminProfile?.name || "Débora";
  const initials = initialsFrom(name);
  const firstName = name.trim().split(/\s+/)[0] || "Débora";

  if (el.sidebarName) el.sidebarName.textContent = name;
  if (el.sidebarAvatar) el.sidebarAvatar.textContent = initials;
  if (el.topbarAvatar) el.topbarAvatar.textContent = initials;
  if (el.adminFirstName) el.adminFirstName.textContent = firstName;

  if (el.accountAvatar) el.accountAvatar.textContent = initials;
  if (el.accountName) el.accountName.textContent = name;
  if (el.accountCurrentEmail) {
    el.accountCurrentEmail.textContent =
      state.adminUser?.email ||
      state.adminProfile?.email ||
      "—";
  }

  const now = new Date();
  const todayKey = dateInput(now);
  const monthKey = monthInput(now);

  const receivedPayments = state.adminPayments.filter(p =>
    ["received", "confirmed"].includes(String(p.status || "").toLowerCase())
  );

  const pendingPayments = state.adminPayments.filter(p =>
    ["pending", "waiting_payment"].includes(String(p.status || "").toLowerCase())
  );

  const totalReceived = receivedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const monthReceived = receivedPayments
    .filter(p => monthInput(new Date(p.created_at)) === monthKey)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const monthPending = pendingPayments
    .filter(p => monthInput(new Date(p.created_at)) === monthKey)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const monthBookings = state.adminBookings.filter(
    b => monthInput(new Date(b.start_at)) === monthKey
  );

  const todayBookings = state.adminBookings.filter(
    b =>
      dateInput(new Date(b.start_at)) === todayKey &&
      normalizeStatus(b.status) !== "cancelled"
  );

  const todayValue = todayBookings.reduce(
    (sum, b) => sum + Number(b.total_amount || 0),
    0
  );

  const newClientsMonth = state.adminCustomers.filter(
    c => monthInput(new Date(c.created_at)) === monthKey
  ).length;

  const ticket = receivedPayments.length
    ? totalReceived / receivedPayments.length
    : 0;

  if (el.metricBookings) el.metricBookings.textContent = state.adminBookings.length;
  if (el.metricClients) el.metricClients.textContent = state.adminCustomers.length;
  if (el.metricServices) el.metricServices.textContent = state.adminServices.length || state.services.length;
  if (el.metricRevenue) el.metricRevenue.textContent = money(totalReceived);

  if (el.metricTodayBookings) {
    if (el.metricTodayBookings) el.metricTodayBookings.textContent =
      `${todayBookings.length} ${todayBookings.length === 1 ? "atendimento" : "atendimentos"}`;
  }
  if (el.metricTodayValue) el.metricTodayValue.textContent = money(todayValue);
  if (el.metricBookingsMonth) el.metricBookingsMonth.textContent = `${monthBookings.length} neste mês`;
  if (el.metricNewClients) el.metricNewClients.textContent = `${newClientsMonth} novas no mês`;
  if (el.metricTicket) el.metricTicket.textContent = money(ticket);
  if (el.metricRevenueMonth) el.metricRevenueMonth.textContent = `${money(monthReceived)} neste mês`;

  if (el.adminDateLabel) {
    if (el.adminDateLabel) el.adminDateLabel.textContent = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      timeZone: CFG.timezone
    }).format(now);
  }

  if (el.dashboardMonthReceived) el.dashboardMonthReceived.textContent = money(monthReceived);
  if (el.dashboardMonthPending) el.dashboardMonthPending.textContent = money(monthPending);

  const ranking = buildClientRanking();
  if (el.dashboardTopClient) {
    if (el.dashboardTopClient) el.dashboardTopClient.textContent = ranking[0]?.name || "—";
  }

  const topService = buildServiceRanking()[0];
  if (el.dashboardTopService) {
    if (el.dashboardTopService) el.dashboardTopService.textContent = topService?.name || "—";
  }

  renderDashboardBookings();
  renderAdminBookings();
  renderCustomers();
  renderClientRanking();
  renderAdminFinance();
  renderBlockedPeriods();
  renderPublicServices();
  renderAdminServices();
}

function renderDashboardBookings() {
  const now = new Date();
  const todayKey = dateInput(now);

  const today = state.adminBookings
    .filter(b =>
      dateInput(new Date(b.start_at)) === todayKey &&
      ["pending", "confirmed"].includes(normalizeStatus(b.status))
    )
    .sort((a, b) => new Date(a.start_at) - new Date(b.start_at));

  const upcoming = state.adminBookings
    .filter(b =>
      new Date(b.start_at) > now &&
      ["pending", "confirmed"].includes(normalizeStatus(b.status)) &&
      dateInput(new Date(b.start_at)) !== todayKey
    )
    .sort((a, b) => new Date(a.start_at) - new Date(b.start_at));

  const rows = [...today, ...upcoming].slice(0, 6);

  if (!el.dashboardBookings) return;
  if (el.dashboardBookings) el.dashboardBookings.innerHTML = rows.length
    ? rows.map(adminBookingCard).join("")
    : empty("Agenda livre", "Nenhum atendimento confirmado ou aguardando Pix.");
}

function renderAdminBookings() {
  const date = state.agendaSelectedDate || el.agendaDateFilter?.value || dateInput(new Date());
  const status = el.agendaStatusFilter?.value || "all";

  const rows = state.adminBookings
    .filter(b => {
      const dateOk = dateInput(new Date(b.start_at)) === date;
      const statusOk = status === "all" || normalizeStatus(b.status) === status;
      return dateOk && statusOk;
    })
    .sort((a, b) => new Date(a.start_at) - new Date(b.start_at));

  const activeRows = rows.filter(b => normalizeStatus(b.status) !== "cancelled");
  const value = activeRows.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
  const paid = activeRows.reduce((sum, b) => {
    const paymentStatus = String(b.payment_status || "").toLowerCase();
    return sum + (["received", "confirmed"].includes(paymentStatus) ? Number(b.deposit_amount || 0) : 0);
  }, 0);
  const remaining = activeRows.reduce((sum, b) => {
    const paymentStatus = String(b.payment_status || "").toLowerCase();
    return sum + (["received", "confirmed"].includes(paymentStatus)
      ? Number(b.remaining_amount ?? (Number(b.total_amount || 0) - Number(b.deposit_amount || 0)))
      : 0);
  }, 0);

  if (el.agendaDayCount) el.agendaDayCount.textContent = activeRows.length;
  if (el.agendaDayValue) el.agendaDayValue.textContent = money(value);
  if (el.agendaDayPaid) el.agendaDayPaid.textContent = money(paid);
  if (el.agendaDayRemaining) el.agendaDayRemaining.textContent = money(remaining);

  renderAgendaWeekStrip();
  renderAgendaNextBooking(rows);

  if (el.agendaListTitle) {
    el.agendaListTitle.textContent = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      timeZone: CFG.timezone
    }).format(new Date(`${date}T12:00:00-03:00`));
  }

  if (!el.adminBookings) return;

  el.adminBookings.innerHTML = rows.length
    ? rows.map((b, index) => agendaTimelineCard(b, index, rows)).join("")
    : empty("Dia livre", "Nenhum atendimento para o dia selecionado.");
}


function agendaTimelineCard(b, index, rows) {
  const d = new Date(b.start_at);
  const status = normalizeStatus(b.status);
  const paymentStatus = String(b.payment_status || "").toLowerCase();
  const paid = ["received", "confirmed"].includes(paymentStatus);
  const remaining = Number(
    b.remaining_amount ??
    (Number(b.total_amount || 0) - Number(b.deposit_amount || 0))
  );

  const isNext = isNextBookingForSelectedDay(b, rows);

  return `
    <article class="agenda-timeline-item ${status} ${isNext ? "is-next" : ""}">
      <div class="agenda-time-column">
        <strong>${timeOf(d)}</strong>
        <span>${isNext ? "Próximo" : statusLabel(status)}</span>
      </div>

      <div class="agenda-timeline-line">
        <span></span>
      </div>

      <div class="agenda-timeline-card">
        <div class="agenda-timeline-top">
          <div>
            <h3>${escapeHtml(b.customer?.name || "Cliente")}</h3>
            <p>${escapeHtml(b.service?.name || "Serviço")}</p>
          </div>
          <span class="status ${status}">${statusLabel(status)}</span>
        </div>

        <div class="agenda-timeline-meta">
          <span>${phoneMask(b.customer?.phone || "")}</span>
          <span>${paid ? `Pago ${money(b.deposit_amount)}` : `Pix ${money(b.deposit_amount)} pendente`}</span>
          ${paid ? `<span class="remaining-chip">Receber ${money(remaining)}</span>` : ""}
        </div>

        <div class="agenda-timeline-bottom">
          <small>${escapeHtml(b.public_reference || "")}</small>
          <span class="payment-pill ${paid ? "paid" : "pending"}">
            ${paid ? "✓ Pago" : "○ Pendente"}
          </span>
        </div>
      </div>
    </article>
  `;
}

function isNextBookingForSelectedDay(booking, rows) {
  const selected = state.agendaSelectedDate || dateInput(new Date());
  const today = dateInput(new Date());

  if (selected !== today) return false;

  const now = new Date();
  const next = rows.find(item =>
    new Date(item.start_at) >= now &&
    ["pending", "confirmed"].includes(normalizeStatus(item.status))
  );

  return next?.id === booking.id;
}

function renderAgendaNextBooking(rows) {
  if (!el.agendaNextBooking) return;

  const selected = state.agendaSelectedDate || dateInput(new Date());
  const today = dateInput(new Date());
  const now = new Date();

  let next = null;

  if (selected === today) {
    next = rows.find(item =>
      new Date(item.start_at) >= now &&
      ["pending", "confirmed"].includes(normalizeStatus(item.status))
    );
  } else {
    next = rows.find(item =>
      ["pending", "confirmed"].includes(normalizeStatus(item.status))
    );
  }

  if (!next) {
    el.agendaNowStatus.textContent = "Agenda livre";
    el.agendaNextBooking.classList.remove("has-booking");
    el.agendaNextBooking.classList.add("is-empty");
    el.agendaNextBooking.innerHTML = empty("Sem próximo atendimento", "Não há atendimento ativo neste dia.");
    return;
  }

  const paid = ["received", "confirmed"].includes(String(next.payment_status || "").toLowerCase());
  const remaining = Number(
    next.remaining_amount ??
    (Number(next.total_amount || 0) - Number(next.deposit_amount || 0))
  );

  el.agendaNowStatus.textContent = paid ? "Sinal pago" : "Aguardando Pix";
  el.agendaNextBooking.classList.remove("is-empty");
  el.agendaNextBooking.classList.add("has-booking");
  el.agendaNextBooking.innerHTML = `
    <div class="agenda-next-time">${timeOf(new Date(next.start_at))}</div>
    <div class="agenda-next-main">
      <strong>${escapeHtml(next.customer?.name || "Cliente")}</strong>
      <span>${escapeHtml(next.service?.name || "Serviço")}</span>
      <small>${phoneMask(next.customer?.phone || "")}</small>
    </div>
    <div class="agenda-next-finance">
      <span>${paid ? "Receber no atendimento" : "Sinal pendente"}</span>
      <strong>${paid ? money(remaining) : money(next.deposit_amount)}</strong>
    </div>
  `;
}

function renderAgendaWeekStrip() {
  if (!el.agendaWeekStrip) return;

  const selected = state.agendaSelectedDate || dateInput(new Date());
  const weekStart = state.agendaWeekStart || startOfWeekISO(selected);
  const dates = Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i));

  const selectedDateObj = new Date(`${selected}T12:00:00-03:00`);

  if (el.agendaMonthLabel) {
    el.agendaMonthLabel.textContent = new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
      timeZone: CFG.timezone
    }).format(selectedDateObj);
  }

  if (el.agendaSelectedLabel) {
    const today = dateInput(new Date());
    el.agendaSelectedLabel.textContent = selected === today
      ? "Hoje"
      : new Intl.DateTimeFormat("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          timeZone: CFG.timezone
        }).format(selectedDateObj);
  }

  el.agendaWeekStrip.innerHTML = dates.map(date => {
    const d = new Date(`${date}T12:00:00-03:00`);
    const dayBookings = state.adminBookings.filter(
      b => dateInput(new Date(b.start_at)) === date &&
      normalizeStatus(b.status) !== "cancelled"
    );

    const paidCount = dayBookings.filter(
      b => ["received", "confirmed"].includes(String(b.payment_status || "").toLowerCase())
    ).length;

    return `
      <button class="agenda-day-btn ${date === selected ? "active" : ""}" type="button" data-agenda-date="${date}">
        <span>${new Intl.DateTimeFormat("pt-BR",{weekday:"short",timeZone:CFG.timezone}).format(d).replace(".","")}</span>
        <strong>${String(d.getDate()).padStart(2,"0")}</strong>
        <small>${dayBookings.length ? `${dayBookings.length} ag.` : "Livre"}</small>
        ${paidCount ? `<i>${paidCount}</i>` : ""}
      </button>
    `;
  }).join("");

  $$("[data-agenda-date]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.agendaSelectedDate = btn.dataset.agendaDate;
      if (el.agendaDateFilter) el.agendaDateFilter.value = state.agendaSelectedDate;
      if (el.blockDate) el.blockDate.value = state.agendaSelectedDate;
      renderAdminBookings();
    });
  });
}

function shiftAgendaWeek(days) {
  const current = state.agendaWeekStart || startOfWeekISO(state.agendaSelectedDate || dateInput(new Date()));
  state.agendaWeekStart = addDaysISO(current, days);
  state.agendaSelectedDate = state.agendaWeekStart;
  if (el.agendaDateFilter) el.agendaDateFilter.value = state.agendaSelectedDate;
  if (el.blockDate) el.blockDate.value = state.agendaSelectedDate;
  renderAdminBookings();
}

function goAgendaToday() {
  const today = dateInput(new Date());
  state.agendaSelectedDate = today;
  state.agendaWeekStart = startOfWeekISO(today);
  if (el.agendaDateFilter) el.agendaDateFilter.value = today;
  if (el.blockDate) el.blockDate.value = today;
  renderAdminBookings();
}

function startOfWeekISO(date) {
  const d = new Date(`${date}T12:00:00-03:00`);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return dateInput(d);
}

function addDaysISO(date, amount) {
  const d = new Date(`${date}T12:00:00-03:00`);
  d.setDate(d.getDate() + amount);
  return dateInput(d);
}

function adminBookingCard(b) {
  const d = new Date(b.start_at);
  const status = normalizeStatus(b.status);
  const paymentStatus = String(b.payment_status || "").toLowerCase();
  const paid = ["received", "confirmed"].includes(paymentStatus);

  return `
    <article class="booking-card premium-booking-card ${status}">
      <div class="booking-time-block">
        <strong>${timeOf(d)}</strong>
        <span>${dateInput(d) === dateInput(new Date()) ? "Hoje" : shortDate(d)}</span>
      </div>

      <div class="booking-main">
        <div class="booking-title-line">
          <h3>${escapeHtml(b.customer?.name || "Cliente")}</h3>
          <span class="status ${status}">${statusLabel(status)}</span>
        </div>

        <p class="booking-service-name">${escapeHtml(b.service?.name || "Serviço")}</p>

        <div class="booking-meta-row">
          <span>${phoneMask(b.customer?.phone || "")}</span>
          <span>•</span>
          <span>Valor ${money(b.total_amount)}</span>
          <span>•</span>
          <span>${paid ? `Pago ${money(b.deposit_amount)} • Receber ${money(b.remaining_amount || (Number(b.total_amount) - Number(b.deposit_amount)))}` : `Pix pendente ${money(b.deposit_amount)}`}</span>
        </div>
      </div>

      <div class="booking-side">
        <span class="payment-pill ${paid ? "paid" : "pending"}">
          ${paid ? `✓ Pago ${money(b.deposit_amount)}` : "○ Pendente"}
        </span>
        <small>${escapeHtml(b.public_reference || "")}</small>
      </div>
    </article>
  `;
}

function renderCustomers() {
  const ranking = buildClientRanking();
  const monthKey = monthInput(new Date());
  const newMonth = state.adminCustomers.filter(
    c => monthInput(new Date(c.created_at)) === monthKey
  ).length;
  const returning = ranking.filter(c => c.bookings >= 2).length;

  if (el.clientsTotal) el.clientsTotal.textContent = state.adminCustomers.length;
  if (el.clientsNewMonth) el.clientsNewMonth.textContent = newMonth;
  if (el.clientsReturning) el.clientsReturning.textContent = returning;

  if (el.clientsTopName) el.clientsTopName.textContent = ranking[0]?.name || "—";
  if (el.clientsTopMeta) {
    if (el.clientsTopMeta) el.clientsTopMeta.textContent = ranking[0]
      ? `${ranking[0].bookings} agendamentos • ${money(ranking[0].spent)} em sinais`
      : "Sem histórico ainda";
  }

  if (el.clientsTable) el.clientsTable.innerHTML = state.adminCustomers.length ? `
    <table class="data-table premium-client-table">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>WhatsApp</th>
          <th>Agendamentos</th>
          <th>Última visita</th>
          <th>Desde</th>
        </tr>
      </thead>
      <tbody>
        ${state.adminCustomers.map(c => {
          const info = ranking.find(r => r.id === c.id);
          return `
            <tr>
              <td>
                <div class="client-cell">
                  <span class="client-mini-avatar">${initialsFrom(c.name)}</span>
                  <div>
                    <strong>${escapeHtml(c.name)}</strong>
                    <small>${escapeHtml(c.email || "Sem e-mail")}</small>
                  </div>
                </div>
              </td>
              <td>${phoneMask(c.phone)}</td>
              <td>${info?.bookings || 0}</td>
              <td>${info?.lastVisit ? shortDate(new Date(info.lastVisit)) : "—"}</td>
              <td>${new Date(c.created_at).toLocaleDateString("pt-BR")}</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  ` : empty("Nenhuma cliente", "As clientes serão criadas automaticamente quando agendarem.");
}

function renderClientRanking() {
  if (!el.clientRanking) return;
  const ranking = buildClientRanking().slice(0, 5);

  if (el.clientRanking) el.clientRanking.innerHTML = ranking.length
    ? ranking.map((client, index) => `
        <article class="ranking-item">
          <span class="ranking-position">${index + 1}</span>
          <span class="client-ranking-avatar">${initialsFrom(client.name)}</span>
          <div class="ranking-main">
            <strong>${escapeHtml(client.name)}</strong>
            <small>${client.bookings} agendamentos • ${money(client.spent)} em sinais</small>
          </div>
          <span class="ranking-badge">${index === 0 ? "VIP" : `${client.bookings}x`}</span>
        </article>
      `).join("")
    : empty("Sem ranking ainda", "O ranking aparece conforme as clientes realizarem agendamentos.");
}

function buildClientRanking() {
  const paymentByAppointment = new Map(
    state.adminPayments.map(p => [p.appointment_id, p])
  );

  return state.adminCustomers
    .map(customer => {
      const bookings = state.adminBookings.filter(
        b => b.customer?.id === customer.id
      );

      const paidBookings = bookings.filter(b => {
        const payment = paymentByAppointment.get(b.id);
        return payment && ["received", "confirmed"].includes(String(payment.status || "").toLowerCase());
      });

      const spent = paidBookings.reduce((sum, b) => {
        const payment = paymentByAppointment.get(b.id);
        return sum + Number(payment?.amount || b.deposit_amount || 0);
      }, 0);

      const lastVisit = bookings.length
        ? [...bookings].sort((a, b) => new Date(b.start_at) - new Date(a.start_at))[0].start_at
        : null;

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        bookings: bookings.length,
        spent,
        lastVisit
      };
    })
    .sort((a, b) => b.bookings - a.bookings || b.spent - a.spent);
}

function buildServiceRanking() {
  const map = new Map();

  state.adminBookings.forEach(b => {
    const id = b.service?.id;
    const name = b.service?.name;
    if (!id || !name || normalizeStatus(b.status) === "cancelled") return;

    const current = map.get(id) || { id, name, count: 0 };
    current.count += 1;
    map.set(id, current);
  });

  return [...map.values()].sort((a, b) => b.count - a.count);
}

function renderAdminFinance() {
  const receivedRows = state.adminPayments.filter(p =>
    ["received", "confirmed"].includes(String(p.status || "").toLowerCase())
  );
  const pendingRows = state.adminPayments.filter(p =>
    ["pending", "waiting_payment"].includes(String(p.status || "").toLowerCase())
  );

  const received = receivedRows.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const pending = pendingRows.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const monthKey = monthInput(new Date());
  const monthReceived = receivedRows
    .filter(p => monthInput(new Date(p.created_at)) === monthKey)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const ticket = receivedRows.length ? received / receivedRows.length : 0;

  if (el.financeReceived) el.financeReceived.textContent = money(received);
  if (el.financePending) el.financePending.textContent = money(pending);
  if (el.financeMonth) el.financeMonth.textContent = money(monthReceived);
  if (el.financeTicket) el.financeTicket.textContent = money(ticket);

  if (el.paymentsTable) el.paymentsTable.innerHTML = state.adminPayments.length ? `
    <table class="data-table premium-payment-table">
      <thead>
        <tr>
          <th>Data</th>
          <th>Status</th>
          <th>Valor</th>
          <th>Provedor</th>
        </tr>
      </thead>
      <tbody>
        ${state.adminPayments.map(p => {
          const status = String(p.status || "pending").toLowerCase();
          const paid = ["received", "confirmed"].includes(status);
          return `
            <tr>
              <td>${new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
              <td><span class="payment-pill ${paid ? "paid" : "pending"}">${paid ? "Recebido" : statusLabel(status)}</span></td>
              <td><strong>${money(p.amount)}</strong></td>
              <td>${escapeHtml(p.provider || "Asaas")}</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  ` : empty("Sem pagamentos", "As cobranças Pix aparecerão aqui.");
}


function startAdminApprovalPolling() {
  stopAdminApprovalPolling();

  checkPendingAdminApprovals();
  state.adminApprovalPoll = window.setInterval(checkPendingAdminApprovals, 3500);
}

function stopAdminApprovalPolling() {
  if (state.adminApprovalPoll) {
    clearInterval(state.adminApprovalPoll);
    state.adminApprovalPoll = null;
  }
}

async function checkPendingAdminApprovals() {
  if (!state.adminUser || state.currentApproval) return;

  const { data, error } = await db
    .from("appointments")
    .select(`
      id,start_at,total_amount,deposit_amount,remaining_amount,payment_status,admin_approval_status,public_reference,
      customer:guest_customers!appointments_customer_id_fkey(id,name,phone,email,cpf),
      service:services!appointments_service_id_fkey(id,name)
    `)
    .eq("business_id", state.business.id)
    .eq("payment_status", "received")
    .eq("admin_approval_status", "pending")
    .order("updated_at", { ascending: true })
    .limit(1);

  if (error) {
    console.error("checkPendingAdminApprovals:", error);
    return;
  }

  const appointment = data?.[0];
  if (!appointment) return;

  state.currentApproval = appointment;
  showApprovalModal(appointment);
  playMoneyAlert();
}

function showApprovalModal(booking) {
  const customer = Array.isArray(booking.customer) ? booking.customer[0] : booking.customer;
  const service = Array.isArray(booking.service) ? booking.service[0] : booking.service;

  el.approvalClientName.textContent = customer?.name || "Cliente";
  el.approvalClientPhone.textContent = phoneMask(customer?.phone || "");
  el.approvalClientCpf.textContent = cpfMask(customer?.cpf || "");
  el.approvalService.textContent = service?.name || "Serviço";
  el.approvalDatetime.textContent = `${fullDate(new Date(booking.start_at))} às ${timeOf(new Date(booking.start_at))}`;
  el.approvalDeposit.textContent = money(booking.deposit_amount);
  el.approvalRemaining.textContent = money(
    booking.remaining_amount ??
    (Number(booking.total_amount || 0) - Number(booking.deposit_amount || 0))
  );

  el.approvalModal.classList.remove("hidden");
}

function closeApprovalModal() {
  el.approvalModal.classList.add("hidden");
  state.currentApproval = null;
}

async function acceptCurrentApproval() {
  const booking = state.currentApproval;
  if (!booking) return;

  buttonBusy(el.approvalAcceptBtn, true, "Confirmando...");

  try {
    const { error } = await db
      .from("appointments")
      .update({
        status: "confirmed",
        admin_approval_status: "accepted",
        admin_decided_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", booking.id)
      .eq("business_id", state.business.id);

    if (error) throw error;

    closeApprovalModal();
    toast("Atendimento confirmado na agenda.", "success");
    await loadAdminData();
    renderAdmin();

  } catch (error) {
    console.error("acceptCurrentApproval:", error);
    toast(readableError(error), "error");
  } finally {
    buttonBusy(el.approvalAcceptBtn, false, "Sim, confirmar atendimento");
  }
}

async function rejectCurrentApproval() {
  const booking = state.currentApproval;
  if (!booking) return;

  const customer = Array.isArray(booking.customer) ? booking.customer[0] : booking.customer;

  const proceed = await appConfirm({
    title: "Recusar atendimento?",
    message: "O pagamento será estornado e o horário será liberado novamente.",
    confirmText: "Sim, estornar",
    cancelText: "Voltar",
    tone: "danger",
    icon: "↩"
  });
  if (!proceed) return;

  const shouldBlock = await appConfirm({
    title: "Bloquear esta cliente?",
    message: `Deseja impedir novos agendamentos de ${customer?.name || "esta cliente"} usando WhatsApp e CPF?`,
    confirmText: "Sim, bloquear",
    cancelText: "Não bloquear",
    tone: "warning",
    icon: "!"
  });

  buttonBusy(el.approvalRejectBtn, true, "Estornando...");

  try {
    const { data, error } = await db.functions.invoke("admin-booking-action", {
      body: {
        action: "reject_refund",
        appointmentId: booking.id,
        blockCustomer: shouldBlock
      }
    });

    if (error) throw error;
    if (!data?.success) throw new Error(data?.error || "Não foi possível estornar o pagamento.");

    closeApprovalModal();
    toast(
      shouldBlock
        ? "Pagamento estornado, atendimento cancelado e cliente bloqueada."
        : "Pagamento estornado e atendimento cancelado.",
      "success"
    );

    await loadAdminData();
    renderAdmin();

  } catch (error) {
    console.error("rejectCurrentApproval:", error);
    toast(readableError(error), "error");
  } finally {
    buttonBusy(el.approvalRejectBtn, false, "Não aceitar");
  }
}

function playMoneyAlert() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.85);
    master.connect(ctx.destination);

    [659.25, 783.99, 987.77].forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.value = 0.28;
      osc.connect(gain);
      gain.connect(master);
      const start = ctx.currentTime + index * 0.11;
      osc.start(start);
      osc.stop(start + 0.24);
    });

    window.setTimeout(() => ctx.close(), 1200);
  } catch (error) {
    console.warn("Alerta sonoro indisponível:", error);
  }
}

async function createBlockedPeriod(event) {
  event.preventDefault();

  const date = el.blockDate.value;
  const startTime = el.blockStartTime.value;
  const endTime = el.blockEndTime.value;
  const reason = el.blockReason.value.trim() || "Bloqueio administrativo";

  if (!date || !startTime || !endTime) {
    return toast("Preencha data, início e fim.", "error");
  }

  const start = localDateTimeToISO(date, startTime);
  const end = localDateTimeToISO(date, endTime);

  if (new Date(end) <= new Date(start)) {
    return toast("O horário final precisa ser maior que o inicial.", "error");
  }

  buttonBusy(el.blockPeriodBtn, true, "Bloqueando...");

  try {
    const { error } = await db.from("blocked_periods").insert({
      business_id: state.business.id,
      start_at: start,
      end_at: end,
      reason
    });

    if (error) throw error;

    el.blockReason.value = "";
    toast("Período bloqueado. Ele não aparecerá para novas clientes.", "success");

    await loadAdminData();
    renderAdmin();

  } catch (error) {
    console.error("createBlockedPeriod:", error);
    toast(readableError(error), "error");
  } finally {
    buttonBusy(el.blockPeriodBtn, false, "Bloquear período");
  }
}

function renderBlockedPeriods() {
  if (!el.blockedPeriodsList) return;

  const rows = state.blockedPeriods || [];

  el.blockedPeriodsList.innerHTML = rows.length
    ? rows.map(item => `
        <article class="blocked-period-item">
          <div>
            <strong>${fullDate(new Date(item.start_at))}</strong>
            <span>${timeOf(new Date(item.start_at))} – ${timeOf(new Date(item.end_at))}</span>
            <small>${escapeHtml(item.reason || "Bloqueio administrativo")}</small>
          </div>
          <button class="remove-block-btn" type="button" data-remove-block="${item.id}">
            Liberar
          </button>
        </article>
      `).join("")
    : empty("Nenhum bloqueio futuro", "Você pode bloquear dias ou períodos específicos.");

  $$("[data-remove-block]").forEach(btn => {
    btn.addEventListener("click", () => removeBlockedPeriod(btn.dataset.removeBlock));
  });
}

async function removeBlockedPeriod(id) {
  const ok = await appConfirm({
    title: "Liberar este período?",
    message: "Esse horário voltará a aparecer para novas clientes no agendamento.",
    confirmText: "Sim, liberar",
    cancelText: "Cancelar",
    tone: "success",
    icon: "✓"
  });
  if (!ok) return;

  const { error } = await db
    .from("blocked_periods")
    .delete()
    .eq("id", id)
    .eq("business_id", state.business.id);

  if (error) {
    toast(readableError(error), "error");
    return;
  }

  toast("Período liberado.", "success");
  await loadAdminData();
  renderAdmin();
}

function localDateTimeToISO(date, time) {
  const raw = `${date}T${time}:00-03:00`;
  return new Date(raw).toISOString();
}


function openServiceEditor(serviceId = "") {
  const service = serviceId
    ? state.adminServices.find(item => item.id === serviceId)
    : null;

  el.serviceEditorForm.reset();
  el.serviceEditId.value = service?.id || "";
  el.serviceEditName.value = service?.name || "";
  el.serviceEditDescription.value = service?.description || "";
  el.serviceEditPrice.value = service?.price ?? "";
  el.serviceEditDuration.value = service?.duration_minutes ?? 60;
  el.serviceEditDeposit.value = service?.deposit_percentage ?? 50;
  el.serviceEditActive.checked = service ? Boolean(service.active) : true;
  state.editingServiceImageUrl = service?.image_url || "";

  el.serviceEditorTitle.textContent = service ? "Editar procedimento" : "Novo procedimento";
  el.deleteServiceBtn.classList.toggle("hidden", !service);
  setServiceImagePreview(state.editingServiceImageUrl);
  el.serviceEditorModal.classList.remove("hidden");
}

function closeServiceEditorModal() {
  el.serviceEditorModal.classList.add("hidden");
  el.serviceImageFile.value = "";
  state.editingServiceImageUrl = "";
}

function previewServiceImage() {
  const file = el.serviceImageFile.files?.[0];
  if (!file) {
    setServiceImagePreview(state.editingServiceImageUrl);
    return;
  }

  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
    el.serviceImageFile.value = "";
    return toast("Use uma imagem JPG, PNG ou WEBP.", "error");
  }

  if (file.size > 5 * 1024 * 1024) {
    el.serviceImageFile.value = "";
    return toast("A imagem precisa ter no máximo 5 MB.", "error");
  }

  const url = URL.createObjectURL(file);
  setServiceImagePreview(url);
}

function setServiceImagePreview(url) {
  if (url) {
    el.serviceImagePreview.src = url;
    el.serviceImagePreview.classList.remove("hidden");
    el.serviceImagePlaceholder.classList.add("hidden");
  } else {
    el.serviceImagePreview.removeAttribute("src");
    el.serviceImagePreview.classList.add("hidden");
    el.serviceImagePlaceholder.classList.remove("hidden");
  }
}

async function saveServiceFromAdmin(event) {
  event.preventDefault();

  const id = el.serviceEditId.value;
  const name = el.serviceEditName.value.trim();
  const description = el.serviceEditDescription.value.trim();
  const price = Number(el.serviceEditPrice.value);
  const durationMinutes = Number(el.serviceEditDuration.value);
  const depositPercentage = Number(el.serviceEditDeposit.value);
  const active = el.serviceEditActive.checked;

  if (name.length < 2) return toast("Informe o nome do procedimento.", "error");
  if (!Number.isFinite(price) || price < 0) return toast("Informe um valor válido.", "error");
  if (!Number.isFinite(durationMinutes) || durationMinutes < 5) return toast("Informe uma duração válida.", "error");
  if (!Number.isFinite(depositPercentage) || depositPercentage < 0 || depositPercentage > 100) {
    return toast("O sinal precisa ficar entre 0% e 100%.", "error");
  }

  buttonBusy(el.saveServiceBtn, true, "Salvando...");

  try {
    let imageUrl = state.editingServiceImageUrl || null;
    const file = el.serviceImageFile.files?.[0];

    if (file) {
      imageUrl = await uploadServiceImage(file, id || crypto.randomUUID());
    }

    const payload = {
      business_id: state.business.id,
      name,
      description: description || null,
      price,
      duration_minutes: durationMinutes,
      deposit_percentage: depositPercentage,
      active,
      image_url: imageUrl,
      updated_at: new Date().toISOString()
    };

    let result;
    if (id) {
      result = await db
        .from("services")
        .update(payload)
        .eq("id", id)
        .eq("business_id", state.business.id)
        .select()
        .single();
    } else {
      result = await db
        .from("services")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) throw result.error;

    state.services = await fetchPublicServices();
    await loadAdminData();
    renderAdmin();
    closeServiceEditorModal();
    toast(id ? "Procedimento atualizado." : "Procedimento criado.", "success");
  } catch (error) {
    console.error("saveServiceFromAdmin:", error);
    toast(readableError(error), "error");
  } finally {
    buttonBusy(el.saveServiceBtn, false, "Salvar alterações");
  }
}

async function uploadServiceImage(file, serviceKey) {
  const extension = (file.name.split(".").pop() || "jpg").toLowerCase();
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(extension) ? extension : "jpg";
  const path = `${state.business.id}/${serviceKey}-${Date.now()}.${safeExt}`;

  const { error } = await db.storage
    .from("service-images")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type
    });

  if (error) throw error;

  const { data } = db.storage
    .from("service-images")
    .getPublicUrl(path);

  return data.publicUrl;
}

async function deleteServiceFromAdmin() {
  const id = el.serviceEditId.value;
  if (!id) return;

  const ok = window.confirm("Deseja excluir este procedimento? Para preservar o histórico, recomendamos ocultar em vez de excluir quando já houver agendamentos.");
  if (!ok) return;

  buttonBusy(el.deleteServiceBtn, true, "Excluindo...");
  try {
    const { error } = await db
      .from("services")
      .delete()
      .eq("id", id)
      .eq("business_id", state.business.id);

    if (error) throw error;

    state.services = await fetchPublicServices();
    await loadAdminData();
    renderAdmin();
    closeServiceEditorModal();
    toast("Procedimento excluído.", "success");
  } catch (error) {
    console.error("deleteServiceFromAdmin:", error);
    toast("Não foi possível excluir. Se o procedimento já tiver histórico, desative-o em vez de excluir.", "error");
  } finally {
    buttonBusy(el.deleteServiceBtn, false, "Excluir procedimento");
  }
}


function appConfirm({
  title = "Confirmar ação",
  message = "Deseja continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  tone = "default",
  icon = "?"
} = {}) {
  return new Promise(resolve => {
    if (!el.confirmModal) {
      resolve(window.confirm(message));
      return;
    }

    state.confirmResolver = resolve;

    el.confirmModalTitle.textContent = title;
    el.confirmModalMessage.textContent = message;
    el.confirmModalOk.textContent = confirmText;
    el.confirmModalCancel.textContent = cancelText;
    el.confirmModalIcon.textContent = icon;

    el.confirmModal.classList.remove("hidden");

    const card = el.confirmModal.querySelector(".confirm-modal-card");
    card?.classList.remove("danger", "warning", "success", "default");
    card?.classList.add(tone);

    window.setTimeout(() => el.confirmModalOk?.focus(), 80);
  });
}

function closeConfirmModal(result) {
  if (!el.confirmModal || el.confirmModal.classList.contains("hidden")) return;

  el.confirmModal.classList.add("hidden");

  const resolve = state.confirmResolver;
  state.confirmResolver = null;

  if (typeof resolve === "function") {
    resolve(Boolean(result));
  }
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
    finance: "Financeiro",
    account: "Conta e segurança"
  };

  el.pageTitle.textContent = titles[page] || "Débora Gomes Beauty";
}

async function updateAdminCredentials(event) {
  event.preventDefault();

  const newEmail = el.accountNewEmail?.value.trim().toLowerCase() || "";
  const newPassword = el.accountNewPassword?.value || "";
  const confirmPassword = el.accountConfirmPassword?.value || "";

  if (!newEmail && !newPassword) {
    toast("Informe um novo e-mail ou uma nova senha.", "error");
    return;
  }

  if (newPassword && newPassword.length < 6) {
    toast("A nova senha precisa ter pelo menos 6 caracteres.", "error");
    return;
  }

  if (newPassword && newPassword !== confirmPassword) {
    toast("As senhas digitadas não são iguais.", "error");
    return;
  }

  buttonBusy(el.accountSaveBtn, true, "Salvando...");

  try {
    const attributes = {};

    if (newEmail && newEmail !== state.adminUser?.email) {
      attributes.email = newEmail;
    }

    if (newPassword) {
      attributes.password = newPassword;
    }

    if (!Object.keys(attributes).length) {
      toast("Nenhuma alteração foi identificada.", "error");
      return;
    }

    const { data, error } = await db.auth.updateUser(attributes);

    if (error) throw error;

    const updatedUser = data?.user || state.adminUser;

    if (attributes.email && state.adminProfile?.id) {
      /*
        Mantemos o perfil administrativo sincronizado com o Auth.
        Dependendo da configuração do Supabase, o e-mail do Auth
        só muda após confirmação. O perfil é atualizado quando
        o Auth já retornar o novo e-mail.
      */
      const authEmail = updatedUser?.email || "";
      if (authEmail && authEmail === attributes.email) {
        const { error: profileError } = await db
          .from("profiles")
          .update({
            email: authEmail,
            updated_at: new Date().toISOString()
          })
          .eq("id", state.adminProfile.id);

        if (profileError) {
          console.warn("E-mail alterado no Auth, mas o profile não foi sincronizado:", profileError);
        } else {
          state.adminProfile.email = authEmail;
        }
      }
    }

    state.adminUser = updatedUser;

    if (el.accountCurrentEmail) {
      el.accountCurrentEmail.textContent =
        updatedUser?.email ||
        state.adminProfile?.email ||
        "—";
    }

    if (el.adminEmail && updatedUser?.email) {
      el.adminEmail.value = updatedUser.email;
    }

    el.accountNewEmail.value = "";
    el.accountNewPassword.value = "";
    el.accountConfirmPassword.value = "";

    if (attributes.email && updatedUser?.email !== attributes.email) {
      toast("Solicitação enviada. Confirme a troca de e-mail conforme a mensagem do Supabase.");
    } else {
      toast("Dados de acesso atualizados com sucesso.");
    }

  } catch (error) {
    console.error("updateAdminCredentials:", error);
    toast(readableError(error), "error");
  } finally {
    buttonBusy(el.accountSaveBtn, false, "Salvar alterações");
  }
}

function toggleAccountPasswordVisibility() {
  if (!el.accountNewPassword) return;

  const showing = el.accountNewPassword.type === "text";
  el.accountNewPassword.type = showing ? "password" : "text";

  if (el.accountConfirmPassword) {
    el.accountConfirmPassword.type = showing ? "password" : "text";
  }

  el.toggleAccountPassword.textContent = showing ? "Mostrar" : "Ocultar";
}

async function adminLogout() {
  stopAdminApprovalPolling();
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

function monthInput(date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    timeZone: CFG.timezone
  }).format(date);
}

function shortDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: CFG.timezone
  }).format(date).replace(".", "");
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