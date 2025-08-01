import emailjs from 'emailjs-com';

export function sendVerificationCode(email, code) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_VERIFICATION;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const params = {
    email: email,
    verification_code: code,
  };

  return emailjs.send(serviceId, templateId, params, publicKey);
}

export function sendNotificationStudent(request_type,id,section,url,first_name,last_name, email, message) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_NOTIFICATION;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const full_name = first_name + " " + last_name;
  const params = {
    name: full_name,
    message: message,
    email: email,
    section: section,
    id: id,
    type: request_type,
    url_case: url
  };

  return emailjs.send(serviceId, templateId, params, publicKey);
}

export function sendNotificationUser(request_type,id,section,url,email, message) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_NOTIFICATION;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const params = {
    name: email,
    message: message,
    email: email,
    section: section,
    id: id,
    type: request_type,
    url_case: url,
  };

  return emailjs.send(serviceId, templateId, params, publicKey);
}