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
  initAuthSystem();
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

      // Enforce login requirement for fixing appointment or booking consultation
      const currentUserRaw = localStorage.getItem('sakthi_current_user');
      if (!currentUserRaw) {
        showToast('Please log in first to fix an appointment or book a consultation.', 'info');
        const authModal = document.getElementById('authModal');
        if (typeof switchAuthTab === 'function') switchAuthTab('signin');
        if (authModal) {
          authModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
        return;
      }

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

      const currentUserRaw = localStorage.getItem('sakthi_current_user');
      if (!currentUserRaw) {
        showToast('Please log in first to fix an appointment or book a consultation.', 'info');
        closeModal();
        const authModal = document.getElementById('authModal');
        if (typeof switchAuthTab === 'function') switchAuthTab('signin');
        if (authModal) {
          authModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
        return;
      }
      
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

/* ==========================================================================
   10. Authentication System & User Session Management
   ========================================================================== */

let currentAuthRole = 'patient'; // 'patient' or 'doctor'
let currentAuthTab = 'signin';   // 'signin' or 'signup'

function initAuthSystem() {
  const authModal = document.getElementById('authModal');
  const openAuthBtns = document.querySelectorAll('.open-auth-btn');
  const closeAuthBtn = document.querySelector('.close-auth-modal-btn');
  
  // Tab Switch Buttons
  const tabBtnSignIn = document.getElementById('tabBtnSignIn');
  const tabBtnSignUp = document.getElementById('tabBtnSignUp');
  const switchToSignUpLink = document.getElementById('switchToSignUpLink');
  const switchToSignInLink = document.getElementById('switchToSignInLink');

  // Role Selector Buttons
  const roleBtnPatient = document.getElementById('roleBtnPatient');
  const roleBtnDoctor = document.getElementById('roleBtnDoctor');

  // Forms
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');

  // User Profile Dropdown Toggle
  const userProfileBadgeBtn = document.getElementById('userProfileBadgeBtn');
  const userDropdownContainer = document.getElementById('navUserDropdown');

  // Password Visibility Toggle
  const togglePasswordBtns = document.querySelectorAll('.toggle-password-btn');

  // Demo Login Chips
  const fillDemoPatientBtn = document.getElementById('fillDemoPatient');
  const fillDemoDoctorBtn = document.getElementById('fillDemoDoctor');

  // Logout buttons
  const logoutBtns = document.querySelectorAll('.logout-btn');

  // 1. Open Auth Modal Triggers
  openAuthBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetMode = btn.getAttribute('data-auth-mode') || 'signin';
      switchAuthTab(targetMode);
      if (authModal) {
        authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // 2. Close Modal
  function closeAuthModal() {
    if (authModal) {
      authModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (closeAuthBtn) {
    closeAuthBtn.addEventListener('click', closeAuthModal);
  }

  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  // 3. Tab Switching Event Listeners
  if (tabBtnSignIn) tabBtnSignIn.addEventListener('click', () => switchAuthTab('signin'));
  if (tabBtnSignUp) tabBtnSignUp.addEventListener('click', () => switchAuthTab('signup'));
  if (switchToSignUpLink) switchToSignUpLink.addEventListener('click', (e) => { e.preventDefault(); switchAuthTab('signup'); });
  if (switchToSignInLink) switchToSignInLink.addEventListener('click', (e) => { e.preventDefault(); switchAuthTab('signin'); });

  const guidanceSignUpBtns = document.querySelectorAll('.btn-guidance-signup, #guidanceSignUpBtn');
  guidanceSignUpBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthTab('signup');
    });
  });

  // 4. Role Switching Event Listeners
  if (roleBtnPatient) roleBtnPatient.addEventListener('click', () => switchAuthRole('patient'));
  if (roleBtnDoctor) roleBtnDoctor.addEventListener('click', () => switchAuthRole('doctor'));

  // 5. Password Eye Icon Toggle
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (!input) return;
      const isPassword = input.getAttribute('type') === 'password';
      input.setAttribute('type', isPassword ? 'text' : 'password');
      btn.innerHTML = isPassword ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
    });
  });

  // 6. Demo Chips Quick Fill
  if (fillDemoPatientBtn) {
    fillDemoPatientBtn.addEventListener('click', () => {
      switchAuthTab('signin');
      switchAuthRole('patient');
      document.getElementById('signInEmail').value = 'jane@example.com';
      document.getElementById('signInPassword').value = 'password123';
      showToast('Patient demo credentials pre-filled!', 'info');
    });
  }

  if (fillDemoDoctorBtn) {
    fillDemoDoctorBtn.addEventListener('click', () => {
      switchAuthTab('signin');
      switchAuthRole('doctor');
      document.getElementById('signInEmail').value = 'dr.anupriya@sakthidental.in';
      document.getElementById('signInPassword').value = 'doctor123';
      showToast('Doctor demo credentials pre-filled!', 'info');
    });
  }

  // 7. Navbar Profile Dropdown Toggle
  if (userProfileBadgeBtn && userDropdownContainer) {
    userProfileBadgeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdownContainer.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!userDropdownContainer.contains(e.target)) {
        userDropdownContainer.classList.remove('active');
      }
    });
  }

  // 8. Sign Out / Logout
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  });

  // 9. Sign In Form Submit
  if (signInForm) {
    signInForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('signInEmail').value.trim();
      const password = document.getElementById('signInPassword').value;

      if (!email || !password) {
        showToast('Please enter your email/phone and password.', 'error');
        return;
      }

      if (password.length < 4) {
        showToast('Password must be at least 4 characters long.', 'error');
        return;
      }

      // Check registered users in localStorage or demo accounts
      const storedUsers = JSON.parse(localStorage.getItem('sakthi_users') || '[]');
      let user = storedUsers.find(u => 
        (u.email.toLowerCase() === email.toLowerCase() || u.phone === email) && u.password === password
      );

      // Check default demo account
      if (!user) {
        if ((email.toLowerCase() === 'jane@example.com' || email.toLowerCase() === 'patient' || email === '9876543210') && (password === 'password123' || password === '123456' || password === 'patient')) {
          user = { name: 'Jane Doe', email: 'jane@example.com', phone: '+91 98765 43210', password: 'password123', role: 'patient' };
        }
      }

      if (!user) {
        showToast('Invalid credentials! Please check your email/phone and password.', 'error');
        return;
      }

      // Save user session
      localStorage.setItem('sakthi_current_user', JSON.stringify(user));
      closeAuthModal();
      showToast(`Welcome back, ${user.name}!`, 'success');
      updateAuthStateUI();
    });
  }

  // 10. Sign Up Form Submit
  if (signUpForm) {
    signUpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signUpName').value.trim();
      const phone = document.getElementById('signUpPhone').value.trim();
      const email = document.getElementById('signUpEmail').value.trim();
      const password = document.getElementById('signUpPassword').value;

      if (!name || !phone || !email || !password) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      if (password.length < 6) {
        showToast('Password must be at least 6 characters long.', 'error');
        return;
      }

      // Check if user already exists
      const storedUsers = JSON.parse(localStorage.getItem('sakthi_users') || '[]');
      const existingUser = storedUsers.find(u => u.email.toLowerCase() === email.toLowerCase() || u.phone === phone);

      if (existingUser) {
        showToast('An account with this email or phone already exists! Please log in.', 'warning');
        const signInEmailInput = document.getElementById('signInEmail');
        if (signInEmailInput) signInEmailInput.value = email;
        switchAuthTab('signin');
        return;
      }

      const newUser = {
        name: name,
        phone: phone,
        email: email,
        password: password,
        role: 'patient',
        registeredAt: new Date().toLocaleDateString()
      };

      // Save to sakthi_users list
      storedUsers.push(newUser);
      localStorage.setItem('sakthi_users', JSON.stringify(storedUsers));

      // DO NOT AUTO-LOGIN! Direct user to log in section to login manually!
      const signInEmailInput = document.getElementById('signInEmail');
      if (signInEmailInput) signInEmailInput.value = email;
      const signInPasswordInput = document.getElementById('signInPassword');
      if (signInPasswordInput) signInPasswordInput.value = '';

      switchAuthTab('signin');
      showToast(`Registration successful, ${name}! Please log in with your password to enter.`, 'success');
    });
  }

  // Initialize UI State
  updateAuthStateUI();
}

/* Tab Switch Helper */
function switchAuthTab(mode) {
  currentAuthTab = mode;
  const tabBtnSignIn = document.getElementById('tabBtnSignIn');
  const tabBtnSignUp = document.getElementById('tabBtnSignUp');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');

  const authVisualTitle = document.getElementById('authVisualTitle');
  const authVisualSubtitle = document.getElementById('authVisualSubtitle');

  if (mode === 'signin') {
    if (tabBtnSignIn) tabBtnSignIn.classList.add('active');
    if (tabBtnSignUp) tabBtnSignUp.classList.remove('active');
    if (signInForm) { signInForm.style.display = 'block'; signInForm.classList.add('active'); }
    if (signUpForm) { signUpForm.style.display = 'none'; signUpForm.classList.remove('active'); }

    if (authVisualTitle) authVisualTitle.textContent = 'Painless Dental Care. Lifelong Healthy Smiles.';
    if (authVisualSubtitle) authVisualSubtitle.textContent = 'Join Hosur\'s premier dental clinic. Access digital consultation history, doctor scheduling & treatment records instantly.';
  } else {
    if (tabBtnSignUp) tabBtnSignUp.classList.add('active');
    if (tabBtnSignIn) tabBtnSignIn.classList.remove('active');
    if (signUpForm) { signUpForm.style.display = 'block'; signUpForm.classList.add('active'); }
    if (signInForm) { signInForm.style.display = 'none'; signInForm.classList.remove('active'); }

    if (authVisualTitle) authVisualTitle.textContent = 'Start Managing Your Dental Care Today.';
    if (authVisualSubtitle) authVisualSubtitle.textContent = 'Create your free account to access digital appointment history, care plans & priority specialist bookings.';
  }
}

/* Role Switch Helper */
function switchAuthRole(role) {
  currentAuthRole = role;
  const roleBtnPatient = document.getElementById('roleBtnPatient');
  const roleBtnDoctor = document.getElementById('roleBtnDoctor');
  const doctorRegGroup = document.getElementById('doctorRegGroup');

  const signUpNameLabel = document.getElementById('signUpNameLabel');
  const signInSubmitBtn = document.getElementById('signInSubmitBtn');
  const signUpSubmitBtn = document.getElementById('signUpSubmitBtn');
  const authNetworkPill = document.getElementById('authNetworkPill');

  if (role === 'doctor') {
    if (roleBtnDoctor) roleBtnDoctor.classList.add('active');
    if (roleBtnPatient) roleBtnPatient.classList.remove('active');
    if (doctorRegGroup) doctorRegGroup.style.display = 'block';

    if (signUpNameLabel) signUpNameLabel.textContent = 'Doctor Name';
    if (signInSubmitBtn) signInSubmitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In as Doctor';
    if (signUpSubmitBtn) signUpSubmitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Register Specialist Doctor';
    if (authNetworkPill) authNetworkPill.textContent = 'SAKTHI SPECIALIST NETWORK';
  } else {
    if (roleBtnPatient) roleBtnPatient.classList.add('active');
    if (roleBtnDoctor) roleBtnDoctor.classList.remove('active');
    if (doctorRegGroup) doctorRegGroup.style.display = 'none';

    if (signUpNameLabel) signUpNameLabel.textContent = 'Full Name';
    if (signInSubmitBtn) signInSubmitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In as Patient';
    if (signUpSubmitBtn) signUpSubmitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Register Patient';
    if (authNetworkPill) authNetworkPill.textContent = 'SAKTHI HEALTHCARE NETWORK';
  }
}

/* Logout Helper */
function handleLogout() {
  localStorage.removeItem('sakthi_current_user');
  const userDropdownContainer = document.getElementById('navUserDropdown');
  if (userDropdownContainer) userDropdownContainer.classList.remove('active');
  showToast('Signed out successfully.', 'info');
  updateAuthStateUI();
}

/* Auth State UI Controller */
function updateAuthStateUI() {
  const currentUserRaw = localStorage.getItem('sakthi_current_user');

  const guestNavMenu = document.getElementById('guestNavMenu');
  const userNavMenu = document.getElementById('userNavMenu');
  const userAptBtn = document.getElementById('userAptBtn');

  const mobileNavGuest = document.getElementById('mobileNavGuest');
  const mobileNavUser = document.getElementById('mobileNavUser');

  const navGuestActions = document.getElementById('navGuestActions');
  const navUserDropdown = document.getElementById('navUserDropdown');
  const navHeaderLogoutBtn = document.getElementById('navHeaderLogoutBtn');

  const mobileGuestAuth = document.getElementById('mobileGuestAuth');
  const mobileUserAuth = document.getElementById('mobileUserAuth');

  const guestAppointmentsState = document.getElementById('guestAppointmentsState');
  const userAppointmentsState = document.getElementById('userAppointmentsState');
  const heroSection = document.getElementById('home');

  if (currentUserRaw) {
    const user = JSON.parse(currentUserRaw);
    const initials = user.name
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'U';

    const formattedRole = 'Patient';

    // Hide Hero Section After Login
    if (heroSection) heroSection.style.display = 'none';

    // Show Authenticated Navbar (My Bookings, Fix an Appointment, Profile Badge)
    if (guestNavMenu) guestNavMenu.style.display = 'none';
    if (userNavMenu) userNavMenu.style.display = 'flex';
    if (userAptBtn) userAptBtn.style.display = 'inline-flex';

    if (navGuestActions) navGuestActions.style.display = 'none';
    if (navUserDropdown) navUserDropdown.style.display = 'inline-block';
    if (navHeaderLogoutBtn) navHeaderLogoutBtn.style.display = 'inline-flex';

    // Show Authenticated Mobile Drawer
    if (mobileNavGuest) mobileNavGuest.style.display = 'none';
    if (mobileNavUser) mobileNavUser.style.display = 'flex';

    if (mobileGuestAuth) mobileGuestAuth.style.display = 'none';
    if (mobileUserAuth) mobileUserAuth.style.display = 'block';

    // Set User Info in Nav
    const navUserAvatar = document.getElementById('navUserAvatar');
    const navUserName = document.getElementById('navUserName');
    const navUserRole = document.getElementById('navUserRole');
    const dropdownUserFullName = document.getElementById('dropdownUserFullName');
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');

    if (navUserAvatar) navUserAvatar.textContent = initials;
    if (navUserName) navUserName.textContent = user.name;
    if (navUserRole) navUserRole.textContent = formattedRole;
    if (dropdownUserFullName) dropdownUserFullName.textContent = user.name;
    if (dropdownUserEmail) dropdownUserEmail.textContent = user.email || 'user@sakthidental.in';

    // Set Mobile Drawer User Info
    const mobileUserAvatar = document.getElementById('mobileUserAvatar');
    const mobileUserName = document.getElementById('mobileUserName');
    const mobileUserRole = document.getElementById('mobileUserRole');

    if (mobileUserAvatar) mobileUserAvatar.textContent = initials;
    if (mobileUserName) mobileUserName.textContent = user.name;
    if (mobileUserRole) mobileUserRole.textContent = formattedRole;

    // Dashboard State
    if (guestAppointmentsState) guestAppointmentsState.style.display = 'none';
    if (userAppointmentsState) userAppointmentsState.style.display = 'block';

    const dashboardAvatar = document.getElementById('dashboardAvatar');
    const dashboardWelcomeName = document.getElementById('dashboardWelcomeName');
    const dashboardMetaSub = document.getElementById('dashboardMetaSub');

    if (dashboardAvatar) dashboardAvatar.textContent = initials;
    if (dashboardWelcomeName) dashboardWelcomeName.textContent = `Welcome back, ${user.name}!`;
    if (dashboardMetaSub) {
      dashboardMetaSub.innerHTML = `<i class="fa-solid fa-envelope"></i> ${user.email} • <i class="fa-solid fa-phone"></i> ${user.phone || '+91 98765 43210'} • <span class="badge" style="background: rgba(79, 70, 229, 0.2); color: var(--primary); font-size: 0.75rem;">${formattedRole}</span>`;
    }

    // Auto-fill Appointment Form
    const aptName = document.getElementById('aptName');
    const aptPhone = document.getElementById('aptPhone');
    const aptEmail = document.getElementById('aptEmail');
    if (aptName && !aptName.value) aptName.value = user.name;
    if (aptPhone && !aptPhone.value) aptPhone.value = user.phone || '';
    if (aptEmail && !aptEmail.value) aptEmail.value = user.email || '';

    // Render User Appointments List
    if (typeof renderUserAppointments === 'function') renderUserAppointments();

  } else {
    // Show Hero Section for Guest Mode
    if (heroSection) heroSection.style.display = 'block';

    // Show Guest Navbar (Home, About Us, Treatments, FAQs, Contact, Login Button)
    if (guestNavMenu) guestNavMenu.style.display = 'flex';
    if (userNavMenu) userNavMenu.style.display = 'none';
    if (userAptBtn) userAptBtn.style.display = 'none';

    if (navGuestActions) navGuestActions.style.display = 'inline-block';
    if (navUserDropdown) navUserDropdown.style.display = 'none';
    if (navHeaderLogoutBtn) navHeaderLogoutBtn.style.display = 'none';

    // Show Guest Mobile Drawer
    if (mobileNavGuest) mobileNavGuest.style.display = 'flex';
    if (mobileNavUser) mobileNavUser.style.display = 'none';

    if (mobileGuestAuth) mobileGuestAuth.style.display = 'block';
    if (mobileUserAuth) mobileUserAuth.style.display = 'none';

    // Dashboard Guest Lock State
    if (guestAppointmentsState) guestAppointmentsState.style.display = 'block';
    if (userAppointmentsState) userAppointmentsState.style.display = 'none';
  }
}

/* Patient Profile Modal Helper */
function initProfileModal() {
  const profileModal = document.getElementById('profileModal');
  const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
  const openProfileModalBtns = document.querySelectorAll('.open-profile-modal-btn, .user-profile-badge-btn');
  const profileTabBtns = document.querySelectorAll('.profile-tab-btn');
  const profilePersonalForm = document.getElementById('profilePersonalForm');

  function openProfileModal(defaultTab = 'personal') {
    const currentUserRaw = localStorage.getItem('sakthi_current_user');
    if (!currentUserRaw) {
      showToast('Please log in to view your patient profile.', 'info');
      return;
    }

    const user = JSON.parse(currentUserRaw);
    const initials = user.name
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'P';

    // Populate modal fields
    const modalProfileAvatar = document.getElementById('modalProfileAvatar');
    const modalProfileName = document.getElementById('modalProfileName');
    const modalProfilePatientId = document.getElementById('modalProfilePatientId');
    const modalProfileMemberSince = document.getElementById('modalProfileMemberSince');

    if (modalProfileAvatar) modalProfileAvatar.textContent = initials;
    if (modalProfileName) modalProfileName.textContent = user.name;
    if (modalProfilePatientId) modalProfilePatientId.textContent = user.patientId || `SP-2026-8891`;
    if (modalProfileMemberSince) modalProfileMemberSince.textContent = user.registeredAt || 'August 2026';

    const profName = document.getElementById('profName');
    const profEmail = document.getElementById('profEmail');
    const profPhone = document.getElementById('profPhone');
    const profGender = document.getElementById('profGender');
    const profDob = document.getElementById('profDob');
    const profBloodGroup = document.getElementById('profBloodGroup');
    const profAddress = document.getElementById('profAddress');

    if (profName) profName.value = user.name || '';
    if (profEmail) profEmail.value = user.email || '';
    if (profPhone) profPhone.value = user.phone || '';
    if (profGender) profGender.value = user.gender || 'Female';
    if (profDob) profDob.value = user.dob || '28 Years (15 May 1998)';
    if (profBloodGroup) profBloodGroup.value = user.bloodGroup || 'O+';
    if (profAddress) profAddress.value = user.address || 'Hosur, Tamil Nadu (Emergency: +91 98628 90897)';

    switchProfileTab(defaultTab);

    if (profileModal) {
      profileModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeProfileModal() {
    if (profileModal) {
      profileModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function switchProfileTab(tabName) {
    profileTabBtns.forEach(btn => {
      if (btn.getAttribute('data-profile-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const tabContents = document.querySelectorAll('.profile-tab-content');
    tabContents.forEach(content => {
      if (content.id === `tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`) {
        content.style.display = 'block';
        content.classList.add('active');
      } else {
        content.style.display = 'none';
        content.classList.remove('active');
      }
    });
  }

  openProfileModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetTab = btn.getAttribute('data-target-tab') || 'personal';
      openProfileModal(targetTab);
    });
  });

  if (closeProfileModalBtn) {
    closeProfileModalBtn.addEventListener('click', closeProfileModal);
  }

  if (profileModal) {
    profileModal.addEventListener('click', (e) => {
      if (e.target === profileModal) closeProfileModal();
    });
  }

  profileTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-profile-tab');
      switchProfileTab(tabName);
    });
  });

  if (profilePersonalForm) {
    profilePersonalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentUserRaw = localStorage.getItem('sakthi_current_user');
      if (!currentUserRaw) return;

      const user = JSON.parse(currentUserRaw);
      user.name = document.getElementById('profName').value.trim() || user.name;
      user.phone = document.getElementById('profPhone').value.trim() || user.phone;
      user.gender = document.getElementById('profGender').value;
      user.dob = document.getElementById('profDob').value.trim();
      user.bloodGroup = document.getElementById('profBloodGroup').value;
      user.address = document.getElementById('profAddress').value.trim();

      localStorage.setItem('sakthi_current_user', JSON.stringify(user));
      showToast('Patient profile updated successfully!', 'success');
      updateAuthStateUI();
      closeProfileModal();
    });
  }
}

// Call initProfileModal & initAnimatedCounters on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initProfileModal();
  initAnimatedCounters();
});

/* Animated Number Counter Function */
function initAnimatedCounters() {
  const counters = document.querySelectorAll('.counter-number');
  if (!counters.length) return;

  let animated = false;

  function animateCounters() {
    if (animated) return;
    animated = true;

    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
      const suffix = counter.getAttribute('data-suffix') || '';
      const formatComma = counter.getAttribute('data-format') === 'comma';
      const duration = 2200;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        // Smooth easeOutExpo for satisfying slowdown at target
        const easeOutProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentValue = Math.floor(easeOutProgress * target);

        let formattedValue = currentValue.toString();
        if (formatComma) {
          formattedValue = currentValue.toLocaleString('en-IN');
        }

        counter.textContent = formattedValue + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          let finalFormatted = target.toString();
          if (formatComma) {
            finalFormatted = target.toLocaleString('en-IN');
          }
          counter.textContent = finalFormatted + suffix;
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.disconnect();
        }
      });
    }, { threshold: 0.15 });
    observer.observe(statsSection);
  } else {
    animateCounters();
  }
}
