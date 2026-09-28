const cryptoData = [
  { symbol: 'BTC', name: 'Bitcoin', price: 68240.18, change: 2.42 },
  { symbol: 'ETH', name: 'Ethereum', price: 3520.92, change: 1.18 },
  { symbol: 'SOL', name: 'Solana', price: 186.74, change: 3.73 },
  { symbol: 'BNB', name: 'BNB', price: 595.31, change: 1.07 },
  { symbol: 'XRP', name: 'XRP', price: 0.72, change: -0.88 },
  { symbol: 'ADA', name: 'Cardano', price: 0.91, change: 1.42 }
];

const securityBackgrounds = [
  'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1600&q=80'
];

const state = {
  otp: '0000',
  otpTimer: 60,
  otpInterval: null,
  currentBackgroundIndex: 0,
  tempUser: null,
  chartValues: [52000, 54000, 53500, 56000, 58000, 62000]
};

function showSection(sectionId) {
  document.querySelectorAll('.auth-section').forEach((section) => {
    section.classList.remove('active');
  });
  document.getElementById(sectionId).classList.add('active');
}

function populateYearOptions() {
  const yearSelect = document.getElementById('birthYear');
  const currentYear = new Date().getFullYear();
  const startYear = 1950;

  for (let year = currentYear; year >= startYear; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }

  const validYears = Array.from(yearSelect.options)
    .map((option) => option.value)
    .filter((year) => Number(year) <= currentYear - 20 && year !== '');

  yearSelect.innerHTML = '<option value="">Year</option>' + validYears.map((year) => `<option value="${year}">${year}</option>`).join('');
}

function updateDayOptions() {
  const year = Number(document.getElementById('birthYear').value || 2006);
  const month = Number(document.getElementById('birthMonth').value || 1);
  const daySelect = document.getElementById('birthDay');
  const daysInMonth = new Date(year, month, 0).getDate();

  daySelect.innerHTML = '<option value="">Day</option>';

  for (let day = 1; day <= daysInMonth; day++) {
    const option = document.createElement('option');
    option.value = String(day).padStart(2, '0');
    option.textContent = String(day).padStart(2, '0');
    daySelect.appendChild(option);
  }
}

function generateOTP() {
  state.otp = String(Math.floor(1000 + Math.random() * 9000));
  document.getElementById('otpValue').textContent = state.otp;
}

function startOTPTimer() {
  clearInterval(state.otpInterval);
  state.otpTimer = 60;
  document.getElementById('otpTimer').textContent = state.otpTimer;

  state.otpInterval = setInterval(() => {
    state.otpTimer -= 1;
    document.getElementById('otpTimer').textContent = state.otpTimer;

    if (state.otpTimer <= 0) {
      clearInterval(state.otpInterval);
      generateOTP();
      state.otpTimer = 60;
      document.getElementById('otpTimer').textContent = state.otpTimer;
      startOTPTimer();
    }
  }, 1000);
}

function resendOTP() {
  generateOTP();
  startOTPTimer();
  alert('New OTP generated.');
}

function validateAgeFromDOB() {
  const year = Number(document.getElementById('birthYear').value);
  const month = Number(document.getElementById('birthMonth').value);
  const day = Number(document.getElementById('birthDay').value);

  if (!year || !month || !day) {
    alert('Please complete your birthdate.');
    return false;
  }

  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 20) {
    alert('You must be at least 20 years old to proceed.');
    return false;
  }

  return true;
}

function buildCryptoCards() {
  const coinGrid = document.getElementById('coinGrid');
  coinGrid.innerHTML = cryptoData.map((coin) => `
    <div class="coin-card">
      <div class="coin-top">
        <div class="coin-name">${coin.name}</div>
        <div class="coin-symbol">${coin.symbol}</div>
      </div>
      <div class="coin-price">$${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
      <div class="coin-meta">
        <span>${coin.change >= 0 ? '+' : ''}${coin.change.toFixed(2)}%</span>
        <span>${coin.change >= 0 ? 'Bullish' : 'Bearish'}</span>
      </div>
    </div>
  `).join('');

  const watchlist = document.getElementById('watchlist');
  watchlist.innerHTML = cryptoData.slice(0, 5).map((coin) => `
    <div class="watch-item">
      <div class="watch-left">
        <span class="watch-badge"></span>
        <strong>${coin.symbol}</strong>
      </div>
      <span class="${coin.change >= 0 ? 'change-positive' : 'change-negative'}">
        ${coin.change >= 0 ? '+' : ''}${coin.change.toFixed(2)}%
      </span>
    </div>
  `).join('');
}

function updatePortfolioValue() {
  const total = cryptoData.reduce((sum, coin) => sum + coin.price, 0);
  document.getElementById('portfolioValue').textContent = `$${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  const changePercent = cryptoData.reduce((sum, coin) => sum + coin.change, 0) / cryptoData.length;
  const changeElement = document.getElementById('portfolioChange');
  changeElement.textContent = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
  changeElement.classList.toggle('positive', changePercent >= 0);
  changeElement.classList.toggle('negative', changePercent < 0);
}

function drawChart() {
  const canvas = document.getElementById('priceChart');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 30;

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;

  for (let i = 0; i <= 4; i++) {
    const y = padding + (i * (height - padding * 2)) / 4;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  const min = Math.min(...state.chartValues) * 0.96;
  const max = Math.max(...state.chartValues) * 1.04;

  ctx.beginPath();
  state.chartValues.forEach((value, index) => {
    const x = padding + (index * (width - padding * 2)) / (state.chartValues.length - 1);
    const y = height - padding - ((value - min) / (max - min || 1)) * (height - padding * 2);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#f0b90b';
  ctx.lineWidth = 3;
  ctx.stroke();

  const last = state.chartValues[state.chartValues.length - 1];
  ctx.fillStyle = '#f0b90b';
  ctx.font = '12px sans-serif';
  ctx.fillText(`Last: $${last.toLocaleString()}`, width - 120, 24);
}

function refreshCryptoData() {
  cryptoData.forEach((coin) => {
    const fluctuation = (Math.random() - 0.5) * 8;
    coin.price = Number((coin.price * (1 + fluctuation / 100)).toFixed(2));
    coin.change = Number((coin.change + fluctuation * 0.4).toFixed(2));
  });

  const nextValue = state.chartValues[state.chartValues.length - 1] * (1 + (Math.random() - 0.3) * 0.08);
  state.chartValues.push(Number(nextValue.toFixed(0)));
  if (state.chartValues.length > 10) state.chartValues.shift();

  buildCryptoCards();
  updatePortfolioValue();
  drawChart();
}

function openSecurityRoom() {
  const modal = document.getElementById('securityModal');
  modal.classList.remove('hidden');
  shuffleBackground();
}

function closeSecurityRoom() {
  document.getElementById('securityModal').classList.add('hidden');
}

function shuffleBackground() {
  const bg = document.getElementById('securityBackground');
  state.currentBackgroundIndex = (state.currentBackgroundIndex + 1) % securityBackgrounds.length;
  bg.style.backgroundImage = `url('${securityBackgrounds[state.currentBackgroundIndex]}')`;
}

function logout() {
  document.getElementById('dashboardContainer').classList.add('hidden');
  document.getElementById('authContainer').classList.remove('hidden');
  showSection('signInSection');
}

function handleSignIn(event) {
  event.preventDefault();
  const email = document.getElementById('signInEmail').value.trim();
  const password = document.getElementById('signInPassword').value.trim();

  if (!email || !password) {
    alert('Please enter your login details.');
    return;
  }

  document.getElementById('authContainer').classList.add('hidden');
  document.getElementById('dashboardContainer').classList.remove('hidden');
  document.getElementById('userGreeting').textContent = `Welcome, ${email.split('@')[0]}`;
}

function handleSignUp(event) {
  event.preventDefault();

  if (!validateAgeFromDOB()) return;

  state.tempUser = {
    fullName: document.getElementById('fullName').value,
    age: document.getElementById('age').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    nationality: document.getElementById('nationality').value,
    birthdate: `${document.getElementById('birthYear').value}-${document.getElementById('birthMonth').value}-${document.getElementById('birthDay').value}`
  };

  generateOTP();
  startOTPTimer();
  showSection('otpSection');
}

function handleOTP(event) {
  event.preventDefault();
  const otpInput = document.getElementById('otpInput').value.trim();

  if (otpInput !== state.otp) {
    alert('Incorrect OTP. Please try again.');
    return;
  }

  showSection('profileSection');
}

function handleProfile(event) {
  event.preventDefault();
  const nickname = document.getElementById('nickname').value.trim();
  const upload = document.getElementById('profilePicture').files[0];

  if (!nickname || !upload) {
    alert('Please fill in your nickname and upload a profile picture.');
    return;
  }

  document.getElementById('authContainer').classList.add('hidden');
  document.getElementById('dashboardContainer').classList.remove('hidden');
  document.getElementById('userGreeting').textContent = `Welcome, ${nickname}`;
}

function previewProfileImage() {
  const file = document.getElementById('profilePicture').files[0];
  const preview = document.getElementById('profilePreview');

  if (!file) {
    preview.innerHTML = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    preview.innerHTML = `<img src="${event.target.result}" alt="Profile preview" />`;
  };
  reader.readAsDataURL(file);
}

function init() {
  populateYearOptions();
  showSection('signInSection');
  buildCryptoCards();
  updatePortfolioValue();
  drawChart();

  document.getElementById('signInForm').addEventListener('submit', handleSignIn);
  document.getElementById('signUpForm').addEventListener('submit', handleSignUp);
  document.getElementById('otpForm').addEventListener('submit', handleOTP);
  document.getElementById('profileForm').addEventListener('submit', handleProfile);
  document.getElementById('birthYear').addEventListener('change', updateDayOptions);
  document.getElementById('birthMonth').addEventListener('change', updateDayOptions);
  document.getElementById('profilePicture').addEventListener('change', previewProfileImage);

  document.getElementById('securityBackground').style.backgroundImage = `url('${securityBackgrounds[0]}')`;
  setInterval(shuffleBackground, 300000);
  setInterval(refreshCryptoData, 300000);
}

window.addEventListener('DOMContentLoaded', init);
