from flask import current_app
from flask_mail import Message
from app import mail
import os

def send_password_reset_email(to_email, reset_token):
    """Send password reset email via Flask-Mail"""

    try:
        # Get the frontend URL from config
        frontend_url = current_app.config.get('FRONTEND_URL', 'https://www.octovoc.be')
        reset_url = f"{frontend_url}/reset-password?token={reset_token}"

        # Create email message
        msg = Message(
            subject="Octovoc - Wachtwoord Resetten",
            recipients=[to_email],
            sender=current_app.config.get('MAIL_DEFAULT_SENDER')
        )

        # Plain text version
        msg.body = f"""
Hallo,

Je hebt een wachtwoordreset aangevraagd voor je Octovoc account.

Klik op de volgende link om je wachtwoord te resetten:
{reset_url}

Deze link is 1 uur geldig.

Als je geen wachtwoordreset hebt aangevraagd, kun je deze email negeren.

Met vriendelijke groet,
Het Octovoc Team
"""

        # HTML version
        msg.html = f"""
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

        # Send the email
        mail.send(msg)
        print(f"Password reset email sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
