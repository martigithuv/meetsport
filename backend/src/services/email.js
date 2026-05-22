const nodemailer = require('nodemailer');

let transporter;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== '' && !process.env.EMAIL_USER.includes('PON_AQUI')) {
  transporter = nodemailer.createTransport({
    pool: true, // Reutilitza connexions SMTP per a millor rendiment
    maxConnections: 3,
    maxMessages: 100,
    connectionTimeout: 2000, // 2 segons màxim per establir la connexió TCP
    greetingTimeout: 2000,   // 2 segons màxim per rebre el greeting SMTP
    socketTimeout: 3000,     // 3 segons màxim d'inactivitat del socket
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: 465, // PUERTO SSL SEGURO
    secure: true, // TRUE para puerto 465
    family: 4, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
} else {
  transporter = {
    sendMail: async (mailOptions) => {
      const fs = require('fs');
      const path = require('path');
      const logMsg = `
[${new Date().toLocaleString()}]
A: ${mailOptions.to}
ASSUMPTE: ${mailOptions.subject}
CONTINGUT: ${mailOptions.html}
------------------------------------------------
`;
      console.log('--- EMAIL SIMULAT (DEV MODE) ---');
      console.log(logMsg);
      
      // Guardar en un archivo de log para que el usuario lo vea fácilmente
      fs.appendFileSync(path.join(__dirname, '../../logs_email.txt'), logMsg);
      
      return { messageId: 'dev-mode-mock-id' };
    }
  };
}

// MARCA DE REINICI PARA VERIFICACIÓ
const fs = require('fs');
const path = require('path');
fs.appendFileSync(path.join(__dirname, '../../logs_email.txt'), `\n--- SERVIDOR REINICIAT EL ${new Date().toLocaleString()} ---\n`);

const getFromEmail = () => process.env.EMAIL_USER || 'no-reply@meetsport.com';

exports.sendWelcomeEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: `"MeetSport Team" <${getFromEmail()}>`,
      to: email,
      subject: 'Benvingut a MeetSport! 🎾',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #C8F542;">Hola ${name}!</h2>
          <p>Estem molt feliços de tenir-te a la nostra plataforma. Prepara't per fer match i gaudir de l'esport!</p>
          <p>Ja pots començar a explorar activitats a la teva zona.</p>
          <br/>
          <p>Equip de MeetSport</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error enviando email:', error);
  }
};

exports.sendFollowerNotification = async (targetEmail, targetName, followerName) => {
  try {
    await transporter.sendMail({
      from: `"MeetSport Notifications" <${getFromEmail()}>`,
      to: targetEmail,
      subject: `🎉 Tens un nou seguidor: ${followerName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h3>Hola ${targetName}!</h3>
          <p>L'usuari <b>${followerName}</b> ha començat a seguir-te.</p>
          <p>Vés al teu perfil per veure qui és!</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error enviando email de seguidor:', error);
  }
};

exports.sendMessageNotification = async (targetEmail, targetName, senderName, messagePreview) => {
  try {
    await transporter.sendMail({
      from: `"MeetSport Messages" <${getFromEmail()}>`,
      to: targetEmail,
      subject: `📩 Tens una nova notificació de MeetSport`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h3>Hola ${targetName}!</h3>
          <p>Revisa la teva missatgeria, tens una nova notificació de <b>${senderName}</b>.</p>
          <blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #C8F542;">
            "${messagePreview}"
          </blockquote>
          <p><a href="${process.env.FRONTEND_URL}/matches">Vés al xat</a></p>
        </div>
      `,
    });
  } catch (error) {
    const fs = require('fs');
    const path = require('path');
    const errorMsg = `\n[${new Date().toLocaleString()}] [ERROR REAL MISSATGE]: ${error.message}\n`;
    console.error(errorMsg);
    fs.appendFileSync(path.join(__dirname, '../../logs_email.txt'), errorMsg);
  }
};

exports.sendActivityCreationEmail = async (email, name, activityTitle) => {
  try {
    await transporter.sendMail({
      from: `"MeetSport" <${getFromEmail()}>`,
      to: email,
      subject: `✅ Has publicat una nova activitat!`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Enhorabona ${name}!</h2>
          <p><b>Has publicat una nova activitat:</b> ${activityTitle}</p>
          <p>Ara només cal esperar que altres atletes s'hi uneixin.</p>
          <br/>
          <p>Equip de MeetSport</p>
        </div>
      `,
    });
  } catch (error) {
    const fs = require('fs');
    const path = require('path');
    const errorMsg = `\n[${new Date().toLocaleString()}] [ERROR REAL ACTIVITAT]: ${error.message}\n`;
    console.error(errorMsg);
    fs.appendFileSync(path.join(__dirname, '../../logs_email.txt'), errorMsg);
  }
};

exports.sendReminderNotification = async (targetEmail, targetName, activityName, time) => {
  try {
    await transporter.sendMail({
      from: `"MeetSport Reminders" <${getFromEmail()}>`,
      to: targetEmail,
      subject: `⏰ Recordatori: Activitat ${activityName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h3>Hola ${targetName}!</h3>
          <p>Recorda que tens una activitat programada: <b>${activityName}</b>.</p>
          <p><b>Hora:</b> ${time}</p>
          <p>No hi faltis!</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error enviando email de recordatorio:', error);
  }
};
