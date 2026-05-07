const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4174;

const RSVP_RECIPIENTS = (process.env.RSVP_RECIPIENTS || "somtochukwu.okoma@ethnoscyber.com")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.use(express.json());
app.use(express.static(path.join(__dirname), { extensions: ["html"] }));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post("/api/rsvp", async (req, res) => {
  try {
    const { name, email, attending } = req.body;

    if (!name || !name.trim()) {
      return res.json({ success: false, message: "Please enter your name." });
    }
    if (!email || !EMAIL_RE.test(String(email).trim())) {
      return res.json({ success: false, message: "Please enter a valid email." });
    }
    if (attending === null || attending === undefined) {
      return res.json({
        success: false,
        message: "Please select whether you will attend.",
      });
    }

    const attendingText = attending ? "Joyfully Accepts" : "Regretfully Declines";

    await transporter.sendMail({
      from: '"Toinfinity Wedding" <admin@foreverpredestined.love>',
      to: RSVP_RECIPIENTS,
      replyTo: String(email).trim(),
      subject: `RSVP from ${name.trim()} — ${attendingText}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #faf9f6; border: 1px solid #e8e0d0;">
          <h2 style="color: #2c2c2c; font-weight: 300; border-bottom: 1px solid #d4af37; padding-bottom: 12px;">
            New RSVP Received
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Guest Name</td>
              <td style="padding: 10px 0; color: #2c2c2c; font-size: 16px;">${name.trim()}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Email</td>
              <td style="padding: 10px 0; color: #2c2c2c; font-size: 16px;">${String(email).trim()}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Attending</td>
              <td style="padding: 10px 0; color: ${attending ? "#2e7d32" : "#c62828"}; font-size: 16px; font-weight: 600;">${attendingText}</td>
            </tr>
          </table>
          <p style="margin-top: 24px; color: #aaa; font-size: 12px; font-style: italic;">
            #toinfinity — June 6, 2026
          </p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: `Thank you, ${name.trim()}! Your RSVP has been received.`,
    });
  } catch (error) {
    console.error("RSVP error:", error.message);
    return res.json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Wedding site running at http://0.0.0.0:${PORT}`);
});
