const { SUPABASE_URL, SUPABASE_KEY } = window.KIELO_CONFIG;

const supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

const bookingList = document.querySelector("#booking-list");
const totalBookings = document.querySelector("#total-bookings");
const pendingBookings = document.querySelector("#pending-bookings");
const confirmedBookings = document.querySelector("#confirmed-bookings");
const cancelledBookings = document.querySelector("#cancelled-bookings");
const upcomingCount = document.querySelector("#upcoming-count");
const pastCount = document.querySelector("#past-count");
const loginBox = document.querySelector("#login-box");
const loginButton = document.querySelector("#login-button");
const logoutButton = document.querySelector("#logout-button");
const adminEmail = document.querySelector("#admin-email");
const adminPassword = document.querySelector("#admin-password");
const manualBlockBox = document.querySelector("#manual-block-box");
const adminStats = document.querySelector("#admin-stats");
let currentView = "upcoming";
let currentStatus = "all";
document.querySelectorAll(".view-filter").forEach((button) => {
  button.addEventListener("click", () => {
    currentView = button.dataset.view;

    document.querySelectorAll(".view-filter").forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    loadBookings();
  });
});

document.querySelectorAll(".stat-card").forEach((card) => {
  card.addEventListener("click", () => {
    currentStatus = card.dataset.status;

    document.querySelectorAll(".stat-card").forEach((item) => {
      item.classList.remove("active");
    });

    card.classList.add("active");

    loadBookings();
  });
});

loginButton.addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signInWithPassword({
    email: adminEmail.value,
    password: adminPassword.value,
  });

  if (error) {
    alert("Login failed.");
    console.error("Login failed.");
    return;
  }

  loginBox.style.display = "none";
logoutButton.style.display = "block";
manualBlockBox.style.display = "block";
adminStats.style.display = "grid";
loadBookings();
});


logoutButton.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  location.reload();
});

async function loadBookings() {
  const { data, error } = await supabaseClient
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Unable to load dashboard.");
    bookingList.innerHTML =
      '<p class="empty">Unable to load bookings.</p>';
    return;
  }

  totalBookings.textContent = data.length;

  pendingBookings.textContent = data.filter(
    (booking) => booking.status === "pending"
  ).length;

  confirmedBookings.textContent = data.filter(
  (booking) => booking.status === "confirmed"
).length;

cancelledBookings.textContent = data.filter(
  (booking) => booking.status === "cancelled"
).length;

  if (data.length === 0) {
    bookingList.innerHTML = '<p class="empty">No bookings yet.</p>';
    return;
  }
  let filteredBookings = [...data];

const now = new Date();

const upcomingBookings = data.filter((booking) => {
  const bookingDateTime = new Date(
    `${booking.appointment_date}T${booking.appointment_time}`
  );

  return bookingDateTime >= now;
});

const pastBookings = data.filter((booking) => {
  const bookingDateTime = new Date(
    `${booking.appointment_date}T${booking.appointment_time}`
  );

  return bookingDateTime < now;
});

upcomingCount.textContent = `· ${upcomingBookings.length}`;
pastCount.textContent = `· ${pastBookings.length}`;

filteredBookings = filteredBookings.filter((booking) => {
  const bookingDateTime = new Date(
    `${booking.appointment_date}T${booking.appointment_time}`
  );

  if (currentView === "upcoming") {
    return bookingDateTime >= now;
  }

  if (currentView === "past") {
    return bookingDateTime < now;
  }

  return true;
});

if (currentStatus !== "all") {
  filteredBookings = filteredBookings.filter((booking) => {
    return booking.status === currentStatus;
  });
}

filteredBookings.sort((a, b) => {
  const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
  const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);

  if (currentView === "past") {
    return dateB - dateA;
  }

  return dateA - dateB;
});

if (filteredBookings.length === 0) {
  bookingList.innerHTML = '<p class="empty">No bookings in this view.</p>';
  return;
}

  bookingList.innerHTML = filteredBookings
    .map((booking) => {
      return `
        <article class="booking-card">
          <div class="booking-top">
            <h2>${booking.customer_name || "No name"}</h2>
            <span class="status ${booking.status || "pending"}">
  ${(booking.status || "pending").toUpperCase()}
</span>
          </div>

          <p class="booking-row"><strong>Service:</strong> ${
            booking.service_name || "-"
          }</p>

          <p class="booking-row"><strong>Add-ons:</strong> ${
            booking.addons_name || "No add-ons"
          }</p>
          <p class="booking-row"><strong>Date:</strong> ${
  formatBookingDate(
    booking.appointment_date,
    booking.appointment_time
  )
}</p>
<p class="booking-row"><strong>Duration:</strong> ${
  formatDuration(booking.duration_minutes)
}</p>

          <p class="booking-row"><strong>Phone:</strong> ${
            booking.customer_phone || "-"
          }</p>

          <p class="booking-row"><strong>Email:</strong> ${
            booking.customer_email || "-"
          }</p>

          <p class="booking-row"><strong>Notes:</strong> ${
            booking.notes || "No notes"
          }</p>

          ${
            booking.image_url
              ? `<a class="photo-link" href="${booking.image_url}" target="_blank">View reference photo</a>`
              : ""
          }
          
 ${
  booking.customer_name === "Manual block" &&
  booking.status === "confirmed"
    ? `
      <div class="booking-actions">
        <button
          class="unblock-button"
          onclick="cancelBooking('${booking.id}')"
        >
          Unblock
        </button>
      </div>
    `
    : booking.status === "pending"
    ? `
      <div class="booking-actions">
        <button
          class="confirm-button"
          onclick="confirmBooking('${booking.id}')"
        >
          Confirm
        </button>

        <button
          class="cancel-button"
          onclick="cancelBooking('${booking.id}')"
        >
          Cancel
        </button>
      </div>
    `
    : ""
}

        </article>
      `;
    })
    .join("");
}
function formatBookingDate(dateString, timeString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  const weekday = date.toLocaleDateString("en-US", {
    weekday: "long",
  });

  const month = date.toLocaleDateString("en-US", {
    month: "short",
  });

  const day = date.getDate();
  const time = timeString ? String(timeString).slice(0, 5) : "-";

  return `${weekday}, ${month} ${day} at ${time}`;
}
function formatDuration(minutes) {
  const totalMinutes = Number(minutes);

  if (!totalMinutes) return "-";

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours && mins) return `${hours}h ${mins}min`;
  if (hours) return `${hours}h`;
  return `${mins}min`;
}

async function checkSession() {
  const { data } = await supabaseClient.auth.getSession();

  if (!data.session) {
  loginBox.style.display = "grid";
  logoutButton.style.display = "none";
  manualBlockBox.style.display = "none";
  adminStats.style.display = "none";
  bookingList.innerHTML = "";
  return;
}
  loginBox.style.display = "none";
logoutButton.style.display = "block";
manualBlockBox.style.display = "block";
adminStats.style.display = "grid";
loadBookings();
}
async function blockTimeManually() {
  const date = document.getElementById("block-date").value;
  const time = document.getElementById("block-time").value;
  const duration = Number(document.getElementById("block-duration").value);

  if (!date || !time || !duration) {
    alert("Please select date, time and duration.");
    return;
  }

  const [startHour, startMinute] = time.split(":").map(Number);
  const startDate = new Date(date);
  startDate.setHours(startHour, startMinute, 0, 0);

  const numberOfSlots = duration / 30;
  const manualBlocks = [];

  for (let i = 0; i < numberOfSlots; i++) {
    const slotDate = new Date(startDate);
    slotDate.setMinutes(startDate.getMinutes() + i * 30);

    const slotTime = slotDate.toTimeString().slice(0, 5);

    manualBlocks.push({
      customer_name: "Manual block",
      customer_email: "-",
      customer_phone: "-",
      service_name: `Manual block (${duration} min)`,
      addons_name: "No add-ons",
      appointment_date: date,
      appointment_time: slotTime,
      duration_minutes: duration,
      status: "confirmed",
      notes: "Blocked manually from admin dashboard",
    });
  }

  const { error } = await supabaseClient
    .from("bookings")
    .insert(manualBlocks);

  if (error) {
    console.error("Unable to block time.");
    alert("Could not block this time.");
    return;
  }

  alert("Time blocked.");
  await loadBookings();
}

function getBusinessHours(dateString) {
  const day = new Date(`${dateString}T00:00:00`).getDay();

  if (day === 0) {
    return { startTime: "08:00", endTime: "14:00" }; // Sunday
  }

  if (day === 6) {
    return { startTime: "08:00", endTime: "18:00" }; // Saturday
  }

  return { startTime: "10:00", endTime: "17:30" }; // Mon-Fri
}

function getDurationMinutes(startTime, endTime) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
}

async function blockFullDay() {
  const date = document.getElementById("block-date").value;

  if (!date) {
    alert("Please select a date.");
    return;
  }

  const confirmBlock = confirm(
    "Block the full day? This will make all time slots unavailable."
  );

  if (!confirmBlock) return;

  const { startTime, endTime } = getBusinessHours(date);
  const duration = getDurationMinutes(startTime, endTime);

  const { error } = await supabaseClient.from("bookings").insert([
    {
      customer_name: "Manual block",
      customer_email: "-",
      customer_phone: "-",
      service_name: "Full day block",
      addons_name: "No add-ons",
      appointment_date: date,
      appointment_time: startTime,
      duration_minutes: duration,
      status: "confirmed",
      notes: "Full day blocked from admin dashboard",
    },
  ]);

  if (error) {
    console.error("Unable to block full day:", error);
    alert("Could not block this day.");
    return;
  }

  alert("Full day blocked.");
  await loadBookings();
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function blockOneWeek() {
  const startDateValue = document.getElementById("block-date").value;

  if (!startDateValue) {
    alert("Please select a start date.");
    return;
  }

  const confirmBlock = confirm(
    "Block 1 week from the selected date? This will make all time slots unavailable for 7 days."
  );

  if (!confirmBlock) return;

  const blocks = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(`${startDateValue}T00:00:00`);
    date.setDate(date.getDate() + i);

    const dateString = formatLocalDate(date);
    const { startTime, endTime } = getBusinessHours(dateString);
    const duration = getDurationMinutes(startTime, endTime);

    blocks.push({
      customer_name: "Manual block",
      customer_email: "-",
      customer_phone: "-",
      service_name: "Full day block",
      addons_name: "No add-ons",
      appointment_date: dateString,
      appointment_time: startTime,
      duration_minutes: duration,
      status: "confirmed",
      notes: "1 week blocked from admin dashboard",
    });
  }

  const { error } = await supabaseClient.from("bookings").insert(blocks);

  if (error) {
    console.error("Unable to block 1 week:", error);
    alert("Could not block this week.");
    return;
  }

  alert("1 week blocked.");
  await loadBookings();
}

document
  .getElementById("block-time-button")
  .addEventListener("click", blockTimeManually);

document
  .getElementById("block-day-button")
  .addEventListener("click", blockFullDay);

document
  .getElementById("block-week-button")
  .addEventListener("click", blockOneWeek);

checkSession();
async function confirmBooking(id) {
  const { error } = await supabaseClient
    .from("bookings")
    .update({
      status: "confirmed",
    })
    .eq("id", id);

  if (error) {
    console.error("Request failed.");
    alert("Unable to confirm booking.");
    return;
  }

  loadBookings();
}

const themeToggle = document.querySelector("#theme-toggle");

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀";
}

async function cancelBooking(id) {
  const { error } = await supabaseClient
    .from("bookings")
    .update({
      status: "cancelled",
    })
    .eq("id", id);

  if (error) {
    console.error("Request failed.");
    alert("Unable to cancel booking.");
    return;
  }

  loadBookings();
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const darkMode = document.body.classList.contains("dark");

  themeToggle.textContent = darkMode
    ? "☀"
    : "☾";

  localStorage.setItem(
    "theme",
    darkMode
      ? "dark"
      : "light"
  );
});