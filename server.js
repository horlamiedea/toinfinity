require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn("WARNING: SMTP_HOST/PORT/USER/PASS not set — RSVP emails will fail.");
}

const app = express();
const PORT = process.env.PORT || 4174;

const RSVP_RECIPIENTS = (process.env.RSVP_RECIPIENTS || "horlamiedea@gmail.com,jesutominiabikoye@gmail.com")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const SMTP_PORT = Number(process.env.SMTP_PORT);
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_HOST = `"Toinfinity Wedding" <${process.env.SMTP_USER}>`;
const FROM_COUPLE = `"Tomini & Olamide" <${process.env.SMTP_USER}>`;

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

    const guestName = name.trim();
    const guestEmail = String(email).trim();
    const attendingText = attending ? "Joyfully Accepts" : "Regretfully Declines";

    const hostEmail = transporter.sendMail({
      from: FROM_HOST,
      to: RSVP_RECIPIENTS,
      replyTo: guestEmail,
      subject: `RSVP from ${guestName} — ${attendingText}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #faf9f6; border: 1px solid #e8e0d0;">
          <h2 style="color: #2c2c2c; font-weight: 300; border-bottom: 1px solid #d4af37; padding-bottom: 12px;">
            New RSVP Received
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Guest Name</td>
              <td style="padding: 10px 0; color: #2c2c2c; font-size: 16px;">${guestName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Email</td>
              <td style="padding: 10px 0; color: #2c2c2c; font-size: 16px;">${guestEmail}</td>
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

    const guestInvitation = attending
      ? transporter.sendMail({
          from: FROM_COUPLE,
          to: guestEmail,
          subject: "You're invited — Tomini & Olamide, June 6, 2026",
          html: `
            <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 32px; background: #faf9f6; border: 1px solid #e8e0d0; text-align: center;">
              <p style="margin: 0; color: #b8860b; font-size: 11px; letter-spacing: 4px; text-transform: uppercase;">The Wedding Of</p>
              <h1 style="margin: 16px 0 8px; color: #2c2c2c; font-weight: 300; font-size: 36px; letter-spacing: 1px;">
                Tomini <span style="color: #d4af37; font-style: italic;">&amp;</span> Olamide
              </h1>
              <div style="width: 64px; height: 1px; background: #d4af37; margin: 24px auto;"></div>
              <p style="color: #2c2c2c; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">
                Dear ${guestName},
              </p>
              <p style="color: #555; font-size: 15px; line-height: 1.8; margin: 0 0 24px;">
                Thank you for joyfully accepting our invitation. Your presence on our wedding day means more to us than words can say. We cannot wait to celebrate the first day of forever with you.
              </p>
              <div style="margin: 32px 0; padding: 24px; background: #fff; border: 1px solid #e8e0d0;">
                <p style="margin: 0 0 6px; color: #999; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">Date</p>
                <p style="margin: 0 0 18px; color: #2c2c2c; font-size: 18px; font-style: italic;">Saturday, June 6, 2026</p>
                <p style="margin: 0 0 6px; color: #999; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">Venue</p>
                <p style="margin: 0 0 6px; color: #2c2c2c; font-size: 18px; font-style: italic;">K&amp;M Event Centre</p>
                <p style="margin: 0; color: #888; font-size: 13px;">Address to be shared closer to the date</p>
              </div>
              <p style="color: #555; font-size: 14px; line-height: 1.7; margin: 24px 0 0;">
                With love,<br/>
                <span style="font-style: italic; color: #b8860b;">Tomini &amp; Olamide</span>
              </p>
              <p style="margin-top: 32px; color: #aaa; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">
                #toinfinity
              </p>
            </div>
          `,
        })
      : Promise.resolve(null);

    const results = await Promise.allSettled([hostEmail, guestInvitation]);
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(`RSVP email ${i === 0 ? "to hosts" : "to guest"} failed:`, r.reason?.message);
      }
    });

    if (results[0].status === "rejected") {
      return res.json({
        success: false,
        message: "Something went wrong. Please try again.",
      });
    }

    return res.json({
      success: true,
      message: attending
        ? `Thank you, ${guestName}! Your invitation is on its way.`
        : `Thank you, ${guestName}! Your RSVP has been received.`,
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
