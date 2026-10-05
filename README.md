# Kielo Booking Website

A bilingual booking website developed for a beauty service business.

The project includes an online booking flow, an administrative dashboard and integrations with external services for database management, authentication, email notifications and analytics.

## Features

- Online appointment booking
- Finnish and English user interfaces
- Service and add-on selection
- Date and time availability handling
- Admin login and booking management
- Supabase database and authentication
- Image/file upload support
- Email notifications with EmailJS
- Cookie consent with Google Analytics and Microsoft Clarity
- Responsive web interface

## Technologies

- HTML
- CSS
- JavaScript
- Supabase
- EmailJS
- Google Analytics
- Microsoft Clarity

## Project Structure

- `book.html` / `book-fi.html` – customer booking interface
- `book.js` – booking logic and Supabase integration
- `admin.html` / `admin.js` – administrative dashboard
- `portfolio.html` – service portfolio
- `cookies.js` – analytics consent handling
- `config.example.js` – example configuration file

## Configuration

The production configuration is not included in this public repository.

Create a local `config.js` based on `config.example.js`:

```js
window.KIELO_CONFIG = {
  SUPABASE_URL: "YOUR_SUPABASE_URL",
  SUPABASE_KEY: "YOUR_SUPABASE_PUBLISHABLE_KEY",
  EMAILJS_PUBLIC_KEY: "YOUR_EMAILJS_PUBLIC_KEY",
  EMAILJS_SERVICE_ID: "YOUR_EMAILJS_SERVICE_ID",
  EMAILJS_TEMPLATE_ID: "YOUR_EMAILJS_TEMPLATE_ID",
  CLARITY_ID: "YOUR_CLARITY_PROJECT_ID",
  GA_ID: "G-XXXXXXXXXX"
};
```
config.js is excluded from version control.
## What I Learned

This project gave me practical experience in building and troubleshooting a web application that connects multiple external services.

I worked with frontend JavaScript, database queries, authentication, booking logic, file uploads, email integration and analytics.

The project also helped me develop a more systematic approach to debugging integration and data-flow issues between frontend and backend services.

## Note
This repository is a sanitized portfolio version of the project. Production configuration values and customer data are not included.
