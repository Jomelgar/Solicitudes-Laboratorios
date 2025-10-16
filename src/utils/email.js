import emailjs from 'emailjs-com';

export async function sendVerificationCode(email, code) {
  await fetch(import.meta.env.VITE_URL_CODE, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: email,
    verification_code: code
  })
});

}

export async function sendNotificationStudent(request_type,id,section,url,first_name,last_name, email, message) {
  return await fetch(import.meta.env.VITE_URL_NOTIFICATION, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: first_name + " " + last_name,
    message: message,
    email: email,
    section: section,
    type: request_type,
    url_case: url,
    })
  });
}

export async function sendNotificationUser(request_type,id,section,url,email, message) {
  return await fetch(import.meta.env.VITE_URL_NOTIFICATION, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: email,
    message: message,
    email: email,
    section: section,
    type: request_type,
    url_case: url,
    })
  });
}