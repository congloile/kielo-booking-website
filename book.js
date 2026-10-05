const isFinnishPage = window.location.pathname.includes("book-fi");
const dayNames = isFinnishPage
  ? ["Sunnuntai", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai"]
  : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const monthNames = isFinnishPage
  ? ["TAMMI", "HELMI", "MAALIS", "HUHTI", "TOUKO", "KESÄ", "HEINÄ", "ELO", "SYYS", "LOKA", "MARRAS", "JOULU"]
  : ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const {
  SUPABASE_URL,
  SUPABASE_KEY,
  EMAILJS_PUBLIC_KEY,
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID
} = window.KIELO_CONFIG;

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

emailjs.init(EMAILJS_PUBLIC_KEY);

const categoryButtons = document.querySelectorAll(".category-button");

const steps = document.querySelectorAll(".book-step");

const serviceGroups = document.querySelectorAll(".service-group");
emailjs.init("YOUR_EMAILJS_PUBLIC_KEY");

function showStep(stepId) {
  steps.forEach((step) => {
    step.classList.remove("active");
  });

  document.querySelector(stepId).classList.add("active");
}

categoryButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();

    const selectedCategory = button.dataset.target;

    serviceGroups.forEach((group) => {
      if (group.dataset.category === selectedCategory) {
        group.style.display = "block";
      } else {
        group.style.display = "none";
      }
    });

    showStep("#step-services");
  });
});
const backButton = document.querySelector("#back-to-categories");

backButton.addEventListener("click", () => {
  showStep("#step-category");
});
const serviceSelectButtons = document.querySelectorAll(".service-card .select-button");

serviceSelectButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();

    const serviceCard = button.closest(".service-card");
    selectedService = serviceCard.querySelector("h2").textContent.trim();
    selectedServiceMeta = serviceCard.querySelector(".service-meta").textContent.trim();
selectedDuration = selectedServiceMeta.split("·")[0].trim();
selectedServiceDurationMinutes = parseDuration(selectedServiceMeta);

const priceText = selectedServiceMeta.match(/€\d+/);
selectedServicePrice = priceText ? Number(priceText[0].replace("€", "")) : 0;

    showStep("#step-addons");
  });
});

const backToServices = document.querySelector("#back-to-services");
const continueToDate = document.querySelector("#continue-to-date");
const backToAddons = document.querySelector("#back-to-addons");
const continueToDetails = document.querySelector("#continue-to-details");
const backToDate = document.querySelector("#back-to-date");

backToServices.addEventListener("click", () => {
  showStep("#step-services");
});

continueToDate.addEventListener("click", async () => {
  selectedAddons = [];

  let addonDurationMinutes = 0;

  document.querySelectorAll(".addon-checkbox:checked").forEach((checkbox) => {
    const addonCard = checkbox.closest(".addon-card");
    const addonName = addonCard.querySelector("h2").textContent.trim();
    const addonMeta = addonCard.querySelector(".service-meta").textContent.trim();

    selectedAddons.push(addonName);
    addonDurationMinutes += parseDuration(addonMeta);
  });

  selectedTotalDurationMinutes =
    selectedServiceDurationMinutes + addonDurationMinutes;

  slotPage = 0;
  await generateAvailableSlots();
  renderSlots();
  showStep("#step-date");
});

backToAddons.addEventListener("click", () => {
  showStep("#step-addons");
});
continueToDetails.addEventListener("click", () => {
  if (!selectedDateTime) {
    alert("Please select an appointment time before continuing.");
    return;
  }

  selectedAddons = [];

  let addonTotal = 0;
  let addonDurationMinutes = 0;

  document.querySelectorAll(".addon-checkbox:checked").forEach((checkbox) => {
    const addonCard = checkbox.closest(".addon-card");
    const addonName = addonCard.querySelector("h2").textContent.trim();
    const addonMeta = addonCard.querySelector(".service-meta").textContent.trim();

    selectedAddons.push(addonName);

    const addonPriceText = addonMeta.match(/€\d+/);

if (addonPriceText) {
  addonTotal += Number(addonPriceText[0].replace("€", ""));
}

addonDurationMinutes += parseDuration(addonMeta);
  });

  const totalMinutes = selectedServiceDurationMinutes + addonDurationMinutes;
  selectedTotal = selectedServicePrice + addonTotal;

  document.querySelector("#summary-service").textContent =
    selectedService || "Selected service";

  document.querySelector("#summary-addons").textContent =
    selectedAddons.length > 0
      ? selectedAddons.join(", ")
      : "No add-ons selected";

  document.querySelector("#summary-date").textContent =
    selectedDateTime || "Selected date and time";

  const hasCustomDesign = selectedAddons.includes("Custom Design");

document.querySelector("#summary-duration").textContent =
  hasCustomDesign
    ? `${formatDuration(totalMinutes)} + consultation`
    : formatDuration(totalMinutes);

document.querySelector("#summary-total").textContent = hasCustomDesign
  ? `€${selectedServicePrice + addonTotal} + consultation`
  : `€${selectedTotal}`;

  showStep("#step-details");
});


backToDate.addEventListener("click", () => {
  showStep("#step-date");
});
const slotGrid = document.querySelector("#slot-grid");
const nextSlotsButton = document.querySelector("#next-slots");
const prevSlotsButton = document.querySelector("#prev-slots");

const openingHours = {
  1: { start: "10:00", end: "18:30" }, // Monday
  2: { start: "10:00", end: "18:30" },
  3: { start: "10:00", end: "18:30" },
  4: { start: "10:00", end: "18:30" },
  5: { start: "10:00", end: "18:30" },
  6: { start: "08:00", end: "19:00" }, // Saturday
  0: { start: "08:00", end: "15:00" } // Sunday
};

let availableSlots = [];

let slotPage = 0;
let selectedService = "";
let selectedAddons = [];
let selectedDateTime = "";
let selectedServiceMeta = "";
let selectedServicePrice = 0;
let selectedDuration = "";
let selectedTotal = 0;
let selectedServiceDurationMinutes = 0;
let selectedTotalDurationMinutes = 0;
let selectedAppointmentDate = "";
let selectedAppointmentTime = "";
const slotsPerPage = window.innerWidth <= 800 ? 1 : 4;
function parseDuration(text) {
  let total = 0;

  const hourMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(hour|hours|h|tuntia)/i);
  const minuteMatch = text.match(/(\d+)\s*(minute|minutes|min)/i);

  if (hourMatch) {
    total += Number(hourMatch[1].replace(",", ".")) * 60;
  }

  if (minuteMatch) {
    total += Number(minuteMatch[1]);
  }

  return total;
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins} min`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${mins} min`;
}
nextSlotsButton.addEventListener("click", async () => {
  const maxPage = Math.ceil(availableSlots.length / slotsPerPage) - 1;

  if (slotPage < maxPage) {
    slotPage++;
    await generateAvailableSlots();
    renderSlots();
  }
});
function timeToMinutes(time) {
  const [hours, minutes] = String(time).slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

async function generateAvailableSlots() {
  availableSlots = [];

  const { data: existingBookings, error } =
  await supabaseClient.rpc("get_public_availability");

if (error) {
  console.error("Booking request failed.");
  return;
}

  const today = new Date();
  const maxBookingDays = 30;

  for (let i = 0; i < maxBookingDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dateKey = date.toLocaleDateString("sv-SE");
    const dayOfWeek = date.getDay();
    const hours = openingHours[dayOfWeek];

    if (!hours) continue;

    const dayName = dayNames[date.getDay()];
    const dateLabel = `${monthNames[date.getMonth()]} ${date.getDate()}`;

    const times = generateTimesForDay(hours.start, hours.end, date).filter((time) => {
      const candidateStart = timeToMinutes(time);
      const candidateEnd = candidateStart + selectedTotalDurationMinutes;
      const closingTime = timeToMinutes(hours.end);

      if (candidateEnd > closingTime) {
        return false;
      }

      return !existingBookings?.some((booking) => {
        const bookingDate = String(booking.appointment_date);

        if (bookingDate !== dateKey) return false;

        const bookingStart = timeToMinutes(booking.appointment_time);
        const bookingDuration = Number(booking.duration_minutes) || 30;
        const bookingEnd = bookingStart + bookingDuration;

        return candidateStart < bookingEnd && candidateEnd > bookingStart;
      });
    });

    if (times.length === 0) continue;

    availableSlots.push({
      label:
        i === 0
          ? isFinnishPage
            ? "Tänään"
            : "Today"
          : i === 1
            ? isFinnishPage
              ? "Huomenna"
              : "Tomorrow"
            : dayName,
      day: dayName,
      date: dateLabel,
      dateKey: dateKey,
      times: times,
    });
  }
}

function generateTimesForDay(start, end, date) {
  const times = [];

  const now = new Date();
  const minimumBookingTime = new Date(
    now.getTime() + 2 * 60 * 60 * 1000
  );

  const isToday = date.toDateString() === now.toDateString();

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const current = new Date(date);
  current.setHours(startHour, startMinute, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(endHour, endMinute, 0, 0);

  while (current < endTime) {
    if (!isToday || current >= minimumBookingTime) {
      times.push(current.toTimeString().slice(0, 5));
    }

    current.setMinutes(current.getMinutes() + 30);
  }

  return times;
}

function renderSlots() {
  const start = slotPage * slotsPerPage;
  const end = start + slotsPerPage;
  const visibleSlots = availableSlots.slice(start, end);

  slotGrid.innerHTML = "";

  visibleSlots.forEach((slot) => {
    const slotDay = document.createElement("article");
    slotDay.className = "slot-day";
slotDay.dataset.date = slot.dateKey;

    const timeButtons = slot.times
      .map((time) => `<button class="slot-time">${time}</button>`)
      .join("");

    slotDay.innerHTML = `
      <p class="slot-label">${slot.label}</p>
      <h3>${slot.day}</h3>
      <p class="slot-date">${slot.date}</p>
      ${timeButtons}
    `;

    slotGrid.appendChild(slotDay);
  });

  document.querySelectorAll(".slot-time").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".slot-time").forEach((btn) => {
      btn.classList.remove("selected");
    });

    button.classList.add("selected");

    const slotDay = button.closest(".slot-day");

    const day = slotDay.querySelector("h3").textContent.trim();
    const date = slotDay.querySelector(".slot-date").textContent.trim();
    const time = button.textContent.trim();

    selectedDateTime = `${day}, ${date} at ${time}`;
selectedAppointmentDate = slotDay.dataset.date;
selectedAppointmentTime = time;
  });
});

  prevSlotsButton.disabled = slotPage === 0;
  nextSlotsButton.disabled = end >= availableSlots.length;
}
prevSlotsButton.addEventListener("click", async () => {
  if (slotPage > 0) {
    slotPage--;
    await generateAvailableSlots();
    renderSlots();
  }
});
const detailsForm = document.querySelector(".details-form");
const bookingImageInput = document.querySelector("#booking-image");
const imageUploadButton = document.querySelector("#image-upload-button");
const imagePreview = document.querySelector("#image-preview");
const imagePreviewImg = document.querySelector("#image-preview-img");
const removeImageButton = document.querySelector("#remove-image-button");

let selectedImageFile = null;
let uploadedImageUrl = null;

imageUploadButton.addEventListener("click", () => {
  bookingImageInput.click();
});

bookingImageInput.addEventListener("change", async () => {
  const file = bookingImageInput.files[0];

  if (!file) return;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ];

  const maxSize = 10 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    alert("Please upload a JPG, PNG, WebP or HEIC photo.");
    bookingImageInput.value = "";
    return;
  }

  if (file.size > maxSize) {
    alert("Photo size must be under 10 MB.");
    bookingImageInput.value = "";
    return;
  }

  selectedImageFile = file;

  imagePreviewImg.src = URL.createObjectURL(file);
  imagePreview.classList.add("active");
  const fileExt = file.name.split(".").pop();
const fileName = `${Date.now()}-${Math.random()
  .toString(36)
  .substring(2, 8)}.${fileExt}`;

const { error } = await supabaseClient.storage
  .from("booking-images")
  .upload(fileName, file);

if (error) {
  console.error("Image upload failed.");
  alert("Unable to upload photo. Please try again.");
  selectedImageFile = null;
  uploadedImageUrl = null;
  bookingImageInput.value = "";
  imagePreviewImg.src = "";
  imagePreview.classList.remove("active");
  return;
}

const { data } = supabaseClient.storage
  .from("booking-images")
  .getPublicUrl(fileName);

uploadedImageUrl = data.publicUrl;

});

removeImageButton.addEventListener("click", () => {
  selectedImageFile = null;
  uploadedImageUrl = null;
  bookingImageInput.value = "";
  imagePreviewImg.src = "";
  imagePreview.classList.remove("active");
});
const confirmButton = detailsForm.querySelector(".continue-button");

confirmButton.addEventListener("click", async () => {
  const inputs = detailsForm.querySelectorAll("input");
  const notesField = detailsForm.querySelector("textarea");

  const customerName = inputs[0].value.trim();
  const customerEmail = inputs[1].value.trim();
  const customerPhone = inputs[2].value.trim();
  const notes = notesField.value.trim();

  if (!customerName || !customerEmail || !customerPhone) {
    alert("Please fill in your name, email and phone number.");
    return;
  }

  const { data, error } = await supabaseClient
  .from("bookings")
  .insert({
    service_name: selectedService,
    addons_name: selectedAddons.length > 0 ? selectedAddons.join(", ") : null,
    appointment_date: selectedAppointmentDate,
appointment_time: selectedAppointmentTime,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    duration_minutes: selectedTotalDurationMinutes,
    notes: notes || null,
    image_url: uploadedImageUrl,
    status: "pending",
  })


  if (error) {
  console.error("Booking request failed.");
  alert("Something went wrong. Please try again.");
  return;
}

  await emailjs.send(
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  {
    customer_name: customerName,
    service_name: selectedService,
    addons: selectedAddons.join(", "),
    appointment_date: selectedAppointmentDate,
    appointment_time: selectedAppointmentTime,
    phone: customerPhone,
    email: customerEmail,
    notes: notes || "-",
  }
);
detailsForm.reset();

selectedDateTime = "";
selectedAddons = [];
selectedImageFile = null;
uploadedImageUrl = null;

document.querySelectorAll(".addon-checkbox").forEach((checkbox) => {
  checkbox.checked = false;
});

bookingImageInput.value = "";
imagePreviewImg.src = "";
imagePreview.classList.remove("active");

window.location.href = "thank-you.html";
});
document.querySelectorAll(".addon-card").forEach((card) => {
  card.classList.remove("active", "selected");
});
