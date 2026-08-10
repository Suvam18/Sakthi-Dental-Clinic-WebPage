/* 
  Sakthi Dental Clinic - Main JavaScript
  Interactivity, Theme Management, Modals, Filters, FAQs, and Form Validation
*/

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileDrawer();
  initAppointmentModal();
  initTreatmentFilters();
  initFaqAccordions();
  initContactForm();
  initActiveNavLink();
  initScrollAnimations();
  renderAppointments();
});

/* ==========================================================================
   1. Theme Management (Dark / Light Mode)
   ========================================================================== */
function initThemeToggle() {
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const savedTheme = localStorage.getItem('sakthi_theme') || 'dark';
  
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    updateThemeIcons(false);
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcons(true);
  }

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const isDark = currentTheme === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('sakthi_theme', newTheme);
      updateThemeIcons(!isDark);
      
      showToast(`Switched to ${newTheme} mode!`, 'info');
    });
  });
}

function updateThemeIcons(isDark) {
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  themeToggleBtns.forEach(btn => {
    btn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  });
}

/* ==========================================================================
   2. Mobile Navigation Drawer
   ========================================================================== */
function initMobileDrawer() {
  const hamburger = document.querySelector('.hamburger');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.drawer-overlay');
  const closeBtn = document.querySelector('.close-drawer-btn');

  if (!hamburger || !drawer || !overlay) return;

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
}

let currentEditingAptId = null;

/* ==========================================================================
   3. Appointment Booking Modal
   ========================================================================== */
function initAppointmentModal() {
  const modalOverlay = document.getElementById('appointmentModal');
  const ctaButtons = document.querySelectorAll('.trigger-appointment');
  const closeModalBtn = document.querySelector('.close-modal-btn');
  const appointmentForm = document.getElementById('appointmentForm');
  const modalTitle = modalOverlay?.querySelector('h2');
  const submitBtn = appointmentForm?.querySelector('button[type="submit"]');

  if (!modalOverlay) return;

  ctaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // If clicking trigger for fresh booking, reset editing state
      if (!currentEditingAptId && appointmentForm) {
        appointmentForm.reset();
        if (modalTitle) modalTitle.textContent = 'Fix an Appointment';
        if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Appointment Request';
      }

      // Smooth scroll down to #contact section if clicked from empty state or booking section
      if (btn.classList.contains('btn-empty-book') || btn.closest('#my-appointments')) {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          const yOffset = -90;
          const y = contactSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }

      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    currentEditingAptId = null;
    if (appointmentForm) appointmentForm.reset();
    if (modalTitle) modalTitle.textContent = 'Fix an Appointment';
    if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Appointment Request';
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  if (appointmentForm) {
    appointmentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('aptName').value.trim();
      const phone = document.getElementById('aptPhone').value.trim();
      const date = document.getElementById('aptDate').value;
      const doctor = document.getElementById('aptDoctor').value;
      const service = document.getElementById('aptService').value;

      if (!name || !phone || !date) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      if (currentEditingAptId) {
        // Editing existing appointment
        updateAppointmentRecord(currentEditingAptId, { name, phone, date, doctor, service });
        showToast(`Appointment ${currentEditingAptId} updated successfully!`, 'success');
      } else {
        // Creating new appointment
        const newBooking = {
          id: 'APT-' + Math.floor(100000 + Math.random() * 900000),
          name: name,
          phone: phone,
          date: date,
          doctor: doctor,
          service: service,
          status: 'Confirmed',
          bookedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
        saveAndRenderAppointment(newBooking);
        showToast(`Appointment Confirmed for ${name}!`, 'success');
      }

      closeModal();

      setTimeout(() => {
        const myAptSection = document.getElementById('my-appointments');
        if (myAptSection) {
          const yOffset = -90; // Header offset
          const y = myAptSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 150);
    });
  }
}

/* ==========================================================================
   3b. Appointments LocalStorage & Dashboard Management
   ========================================================================== */
function getAppointments() {
  const stored = localStorage.getItem('sakthi_appointments');
  if (stored) {
    return JSON.parse(stored);
  }
  const sample = [
    {
      id: 'APT-849201',
      name: 'Sample Patient',
      phone: '+91 9862890897',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      doctor: 'Dr. Anupriya (Founder)',
      service: 'General Dental Consultation',
      status: 'Confirmed',
      bookedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  ];
  localStorage.setItem('sakthi_appointments', JSON.stringify(sample));
  return sample;
}

function saveAndRenderAppointment(newApt) {
  const appointments = getAppointments();
  appointments.unshift(newApt);
  localStorage.setItem('sakthi_appointments', JSON.stringify(appointments));
  renderAppointments();
}

function updateAppointmentRecord(id, updatedFields) {
  let appointments = getAppointments();
  const index = appointments.findIndex(a => a.id === id);
  if (index !== -1) {
    appointments[index] = { ...appointments[index], ...updatedFields };
    localStorage.setItem('sakthi_appointments', JSON.stringify(appointments));
    renderAppointments();
  }
}

function renderAppointments() {
  const container = document.getElementById('myAppointmentsContainer');
  const badgeCounts = document.querySelectorAll('.apt-badge-count');
  const appointments = getAppointments();

  // Red Alert Badge Counter logic: HIDE if 0, SHOW red alert badge if > 0
  badgeCounts.forEach(badge => {
    if (appointments.length === 0) {
      badge.style.display = 'none';
      badge.textContent = '';
    } else {
      badge.style.display = 'inline-flex';
      badge.textContent = appointments.length;
    }
  });

  if (!container) return;

  if (appointments.length === 0) {
    container.innerHTML = `
      <div class="glass-card empty-appointments-card reveal-on-scroll is-visible">
        <div class="empty-apt-icon-wrapper">
          <div class="empty-apt-pulse-ring"></div>
          <div class="empty-apt-icon">
            <i class="fa-solid fa-calendar-plus"></i>
          </div>
        </div>
        <h3 class="empty-apt-title">No Appointments Scheduled Yet</h3>
        <p class="empty-apt-subtitle">
          You don't have any active consultations. Click below to schedule your appointment with our specialist dental team!
        </p>
        <button class="btn btn-primary btn-glow-primary trigger-appointment btn-empty-book">
          <i class="fa-solid fa-calendar-check"></i> Book Your First Appointment
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = appointments.map(apt => `
    <div class="glass-card appointment-booking-card reveal-on-scroll is-visible" data-apt-id="${apt.id}">
      <div class="apt-card-header">
        <div class="apt-id-pill"><i class="fa-solid fa-ticket"></i> ${apt.id}</div>
        <div class="apt-status-badge ${apt.status === 'Confirmed' ? 'status-confirmed' : 'status-pending'}">
          <span class="status-dot"></span> ${apt.status}
        </div>
      </div>

      <div class="apt-card-body">
        <h3 class="apt-service-title"><i class="fa-solid fa-stethoscope" style="color: var(--primary);"></i> ${apt.service}</h3>
        
        <div class="apt-details-grid">
          <div class="apt-detail-item">
            <i class="fa-solid fa-user-doctor"></i>
            <div>
              <span class="detail-label">Assigned Specialist</span>
              <strong>${apt.doctor}</strong>
            </div>
          </div>

          <div class="apt-detail-item">
            <i class="fa-solid fa-calendar-day"></i>
            <div>
              <span class="detail-label">Scheduled Date</span>
              <strong>${apt.date}</strong>
            </div>
          </div>

          <div class="apt-detail-item">
            <i class="fa-solid fa-user"></i>
            <div>
              <span class="detail-label">Patient Name</span>
              <strong>${apt.name}</strong>
            </div>
          </div>

          <div class="apt-detail-item">
            <i class="fa-solid fa-phone"></i>
            <div>
              <span class="detail-label">Contact Mobile</span>
              <strong>${apt.phone}</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="apt-card-footer">
        <span class="booked-on-text"><i class="fa-solid fa-clock"></i> Booked on ${apt.bookedAt}</span>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary edit-apt-btn" onclick="editAppointment('${apt.id}')" style="font-size: 0.85rem; padding: 0.4rem 0.85rem;">
            <i class="fa-solid fa-pen-to-square" style="color: var(--primary);"></i> Edit
          </button>
          <button class="btn btn-secondary cancel-apt-btn" onclick="deleteAppointment('${apt.id}')" style="font-size: 0.85rem; padding: 0.4rem 0.85rem;">
            <i class="fa-solid fa-trash-can" style="color: #ef4444;"></i> Delete
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function editAppointment(id) {
  const appointments = getAppointments();
  const apt = appointments.find(a => a.id === id);
  if (!apt) return;

  currentEditingAptId = id;

  const modalOverlay = document.getElementById('appointmentModal');
  const modalTitle = modalOverlay?.querySelector('h2');
  const appointmentForm = document.getElementById('appointmentForm');
  const submitBtn = appointmentForm?.querySelector('button[type="submit"]');

  if (document.getElementById('aptName')) document.getElementById('aptName').value = apt.name;
  if (document.getElementById('aptPhone')) document.getElementById('aptPhone').value = apt.phone;
  if (document.getElementById('aptDate')) document.getElementById('aptDate').value = apt.date;
  if (document.getElementById('aptDoctor')) document.getElementById('aptDoctor').value = apt.doctor;
  if (document.getElementById('aptService')) document.getElementById('aptService').value = apt.service;

  if (modalTitle) modalTitle.textContent = `Edit Appointment (${id})`;
  if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Update Appointment';

  if (modalOverlay) {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function deleteAppointment(id) {
  if (confirm(`Are you sure you want to delete appointment ${id}?`)) {
    let appointments = getAppointments();
    appointments = appointments.filter(a => a.id !== id);
    localStorage.setItem('sakthi_appointments', JSON.stringify(appointments));
    renderAppointments();
    showToast(`Appointment ${id} has been deleted.`, 'info');
  }
}

/* ==========================================================================
   4. Treatment Search & Filter Logic
   ========================================================================== */
function initTreatmentFilters() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const searchInput = document.getElementById('treatmentSearch');
  const treatmentCards = document.querySelectorAll('.treatment-card-wrapper');

  if (!tabBtns.length && !searchInput) return;

  let activeCategory = 'all';
  let searchQuery = '';

  function filterCards() {
    treatmentCards.forEach(card => {
      const category = card.dataset.category || 'all';
      const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('p')?.textContent.toLowerCase() || '';

      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      const matchesSearch = title.includes(searchQuery) || desc.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'block';
        card.style.animation = 'fadeIn 0.4s ease';
      } else {
        card.style.display = 'none';
      }
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      filterCards();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterCards();
    });
  }
}

/* ==========================================================================
   5. FAQs Accordion & Search
   ========================================================================== */
function initFaqAccordions() {
  const faqItems = document.querySelectorAll('.faq-item');
  const faqSearch = document.getElementById('faqSearch');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close other accordion items
      faqItems.forEach(i => i.classList.remove('active'));
      
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  if (faqSearch) {
    faqSearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();

      faqItems.forEach(item => {
        const qText = item.querySelector('.faq-question span')?.textContent.toLowerCase() || '';
        const aText = item.querySelector('.faq-answer p')?.textContent.toLowerCase() || '';

        if (qText.includes(query) || aText.includes(query)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }
}

/* ==========================================================================
   6. Contact Form Validation
   ========================================================================== */
function initContactForm() {
  const contactForm = document.getElementById('clinicContactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) {
      showToast('Please enter your full name.', 'error');
      return;
    }

    if (!email || !emailRegex.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    if (!phone) {
      showToast('Please enter your phone number.', 'error');
      return;
    }

    showToast(`Thank you, ${name}! Your message has been sent successfully.`, 'success');
    contactForm.reset();
  });
}

/* ==========================================================================
   7. Active Nav Link Highlighting
   ========================================================================== */
function initActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ==========================================================================
   8. Toast Notification Utility
   ========================================================================== */
function showToast(message, type = 'success') {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' 
    ? '<i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 1.25rem;"></i>'
    : type === 'error'
    ? '<i class="fa-solid fa-circle-xmark" style="color: #ef4444; font-size: 1.25rem;"></i>'
    : '<i class="fa-solid fa-circle-info" style="color: #0284c7; font-size: 1.25rem;"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ==========================================================================
   9. Scroll Reveal Animations (Intersection Observer)
   ========================================================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  
  if (!revealElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}
