import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

def send_password_reset_email(to_email, reset_token):
    """Send password reset email via One.com SMTP"""

    # Get email configuration from environment variables
    smtp_server = os.getenv('MAIL_SERVER', 'send.one.com')
    smtp_port = int(os.getenv('MAIL_PORT', 587))
    sender_email = os.getenv('MAIL_USERNAME')
    sender_password = os.getenv('MAIL_PASSWORD')

    if not sender_email or not sender_password:
        print("WARNING: Email credentials not configured. Email not sent.")
        return False

    # Get the frontend URL from environment or use default
    frontend_url = os.getenv('FRONTEND_URL', 'https://octovoc.katern.be')
    reset_url = f"{frontend_url}/reset-password?token={reset_token}"

    # Create email
    message = MIMEMultipart("alternative")
    message["Subject"] = "Octovoc - Wachtwoord Resetten"
    message["From"] = f"Octovoc <{sender_email}>"
    message["To"] = to_email

    # Create HTML and plain text versions
    text = f"""
Hallo,

Je hebt een wachtwoordreset aangevraagd voor je Octovoc account.

Klik op de volgende link om je wachtwoord te resetten:
{reset_url}

Deze link is 1 uur geldig.

Als je geen wachtwoordreset hebt aangevraagd, kun je deze email negeren.

Met vriendelijke groet,
Het Octovoc Team
"""

    html = f"""
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #000;">Octovoc - Wachtwoord Resetten</h2>
      <p>Hallo,</p>
      <p>Je hebt een wachtwoordreset aangevraagd voor je Octovoc account.</p>
      <p>Klik op de knop hieronder om je wachtwoord te resetten:</p>
      <p style="margin: 30px 0;">
        <a href="{reset_url}"
           style="background-color: #000;
                  color: #fff;
                  padding: 12px 30px;
                  text-decoration: none;
                  border-radius: 4px;
                  display: inline-block;">
          Wachtwoord Resetten
        </a>
      </p>
      <p style="font-size: 14px; color: #666;">
        Of kopieer deze link naar je browser:<br>
        <a href="{reset_url}" style="color: #0066cc;">{reset_url}</a>
      </p>
      <p style="font-size: 14px; color: #666;">
        Deze link is 1 uur geldig.
      </p>
      <p style="font-size: 14px; color: #666;">
        Als je geen wachtwoordreset hebt aangevraagd, kun je deze email negeren.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="font-size: 12px; color: #999;">
        Met vriendelijke groet,<br>
        Het Octovoc Team
      </p>
    </div>
  </body>
</html>
"""

    # Attach both versions
    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")
    message.attach(part1)
    message.attach(part2)

    try:
        # Connect to SMTP server
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Enable TLS encryption
        server.login(sender_email, sender_password)

        # Send email
        server.sendmail(sender_email, to_email, message.as_string())
        server.quit()

        print(f"Password reset email sent to {to_email}")
        return True

    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
