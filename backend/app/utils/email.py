from flask import current_app
from flask_mail import Message
from app import mail
import os
import threading
import socket

def _send_async_email(app, msg, to_email):
    """Send email in background thread with timeout"""
    # Set socket timeout to 30 seconds to prevent hanging
    default_timeout = socket.getdefaulttimeout()
    socket.setdefaulttimeout(30)

    try:
        with app.app_context():
            mail.send(msg)
            print(f"Password reset email sent successfully to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        # Restore default timeout
        socket.setdefaulttimeout(default_timeout)

def send_verification_email(to_email, verification_token, frontend_url, first_name):
    """Send email verification link via Flask-Mail in background thread"""

    try:
        app = current_app._get_current_object()

        verification_url = f"{frontend_url}/verify-email?token={verification_token}"

        # Create email message
        msg = Message(
            subject="Activeer je Octovoc account",
            recipients=[to_email],
            sender=app.config.get('MAIL_DEFAULT_SENDER')
        )

        # Plain text version
        msg.body = f"""
Hallo {first_name},

Welkom bij Octovoc!

Klik op de volgende link om je account te activeren:
{verification_url}

Deze link is 24 uur geldig.

Na activatie kun je inloggen en aan de slag met de woordenschat oefeningen.

Met vriendelijke groet,
Het Octovoc Team
"""

        # HTML version
        msg.html = f"""
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #000;">Welkom bij Octovoc!</h2>
      <p>Hallo {first_name},</p>
      <p>Bedankt voor je registratie bij Octovoc. Klik op de knop hieronder om je account te activeren:</p>
      <p style="margin: 30px 0;">
        <a href="{verification_url}"
           style="background-color: #000;
                  color: #fff;
                  padding: 12px 30px;
                  text-decoration: none;
                  border-radius: 4px;
                  display: inline-block;">
          Activeer account
        </a>
      </p>
      <p style="font-size: 14px; color: #666;">
        Of kopieer deze link naar je browser:<br>
        <a href="{verification_url}" style="color: #0066cc;">{verification_url}</a>
      </p>
      <p style="font-size: 14px; color: #666;">
        Deze link is 24 uur geldig.
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

        # Send email in background thread
        print(f"Starting background verification email send to {to_email}")
        thread = threading.Thread(
            target=_send_async_email,
            args=(app, msg, to_email),
            daemon=True
        )
        thread.start()

        print(f"Background verification email thread started for {to_email}")
        return True

    except Exception as e:
        print(f"Failed to start verification email thread: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def send_password_reset_email(to_email, reset_token):
    """Send password reset email via Flask-Mail in background thread"""

    try:
        app = current_app._get_current_object()

        # Get the frontend URL from config
        frontend_url = app.config.get('FRONTEND_URL', 'https://www.octovoc.be')
        reset_url = f"{frontend_url}/reset-password?token={reset_token}"

        # Create email message
        msg = Message(
            subject="wachtwoord resetten",
            recipients=[to_email],
            sender=app.config.get('MAIL_DEFAULT_SENDER')
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
      <h2 style="color: #000;">Octovoc - Wachtwoord resetten</h2>
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
          Wachtwoord resetten
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

        # Send email in background thread with daemon=True so it doesn't block shutdown
        print(f"Starting background email send to {to_email}")
        thread = threading.Thread(
            target=_send_async_email,
            args=(app, msg, to_email),
            daemon=True
        )
        thread.start()

        # Return immediately without waiting for email to send
        print(f"Background email thread started for {to_email}")
        return True

    except Exception as e:
        print(f"Failed to start email thread: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def send_order_email(name, email, school_name, num_classrooms, num_students, num_teacher_accounts):
    """Send order notification email to octovoc@katern.be"""

    try:
        app = current_app._get_current_object()

        # Calculate estimated price
        estimated_price = num_students * 1.90

        # Create email message
        msg = Message(
            subject=f"Nieuwe bestelling - {school_name}",
            recipients=['octovoc@katern.be'],
            sender=app.config.get('MAIL_DEFAULT_SENDER'),
            reply_to=email
        )

        # Plain text version
        msg.body = f"""
Nieuwe bestelling ontvangen via Octovoc!

Contactgegevens:
- Naam: {name}
- Email: {email}
- School: {school_name}

Bestelling:
- Aantal klassen: {num_classrooms}
- Totaal aantal leerlingen: {num_students}
- Aantal lerarenaccounts: {num_teacher_accounts}

Geschatte prijs: €{estimated_price:.2f} (€1,90 per leerling)

Neem binnen 3 werkdagen contact op met de klant voor een offerte en bevestiging.
"""

        # HTML version
        msg.html = f"""
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #000;">Nieuwe bestelling ontvangen</h2>

      <h3>Contactgegevens</h3>
      <table style="width: 100%; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Naam:</td>
          <td style="padding: 8px 0;">{name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Email:</td>
          <td style="padding: 8px 0;"><a href="mailto:{email}">{email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">School:</td>
          <td style="padding: 8px 0;">{school_name}</td>
        </tr>
      </table>

      <h3>Bestelling</h3>
      <table style="width: 100%; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Aantal klassen:</td>
          <td style="padding: 8px 0;">{num_classrooms}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Totaal aantal leerlingen:</td>
          <td style="padding: 8px 0;">{num_students}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Aantal lerarenaccounts:</td>
          <td style="padding: 8px 0;">{num_teacher_accounts}</td>
        </tr>
      </table>

      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; font-size: 18px;">
          <strong>Geschatte prijs:</strong> €{estimated_price:.2f}
        </p>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
          (€1,90 per leerling)
        </p>
      </div>

      <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; border-left: 4px solid #ffc107;">
        <p style="margin: 0; font-weight: bold;">Actie vereist:</p>
        <p style="margin: 5px 0 0 0;">Neem binnen 3 werkdagen contact op met de klant voor een offerte en bevestiging.</p>
      </div>
    </div>
  </body>
</html>
"""

        # Send email in background thread
        print(f"Starting background email send to octovoc@katern.be (order from {email})")
        thread = threading.Thread(
            target=_send_async_email,
            args=(app, msg, 'octovoc@katern.be'),
            daemon=True
        )
        thread.start()

        print(f"Background email thread started for order from {email}")
        return True

    except Exception as e:
        print(f"Failed to start order email thread: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
