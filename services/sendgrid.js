import sg from "@sendgrid/mail";

if (process.env.SENDGRID_API_KEY) {
  sg.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendMail(msg) {
  if (!process.env.SENDGRID_API_KEY) return;
  await sg.send(msg);
}
