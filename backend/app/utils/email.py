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


def send_order_email(name, email, phone, school_name, billing_address, num_classrooms, num_students, num_teacher_accounts):
    """Send quote PDF to customer and notification to admin"""
    import os
    import tempfile
    from app.services.pdf_service import generate_quote_pdf

    try:
        app = current_app._get_current_object()

        # Calculate price (€0.95 per student)
        total_price = num_students * 0.95

        # Generate PDF quote
        try:
            pdf_path = generate_quote_pdf(
                name=name,
                school_name=school_name,
                billing_address=billing_address,
                num_classrooms=num_classrooms,
                num_students=num_students,
                num_teacher_accounts=num_teacher_accounts
            )
        except Exception as e:
            print(f"Error generating PDF: {str(e)}")
            # Continue without PDF attachment
            pdf_path = None

        # Get first name for personalization
        first_name = name.split()[0] if name else 'daar'

        # ===  1. Send quote to customer ===
        customer_msg = Message(
            subject=f"Offerte Octovoc - {school_name}",
            recipients=[email],
            sender=app.config.get('MAIL_DEFAULT_SENDER')
        )

        # Customer email body
        customer_msg.body = f"""Beste {first_name},

In bijlage onze offerte.

Om te bestellen volstaat een eenvoudige reply of het opgeven van een bestelbonnummer. Na bevestiging ontvang je de toegangscodes binnen de 5 werkdagen.

Vriendelijke groet,

Jelle De Keersmaecker
KATERN
Brabançonnestraat 73
3000 LEUVEN
BE0643.557.881"""

        # Attach PDF if generated
        if pdf_path and os.path.exists(pdf_path):
            with open(pdf_path, 'rb') as pdf_file:
                customer_msg.attach(
                    filename=os.path.basename(pdf_path),
                    content_type='application/pdf',
                    data=pdf_file.read()
                )

        # === 2. Send notification to admin ===
        admin_msg = Message(
            subject=f"Offerte verzonden - {school_name}",
            recipients=['octovoc@katern.be'],
            sender=app.config.get('MAIL_DEFAULT_SENDER'),
            reply_to=email
        )

        admin_msg.body = f"""Beste {first_name},

In bijlage onze offerte.

Om te bestellen volstaat een eenvoudige reply of het opgeven van een bestelbonnummer. Na bevestiging ontvang je de toegangscodes binnen de 5 werkdagen.

Vriendelijke groet,

Jelle De Keersmaecker
KATERN
Brabançonnestraat 73
3000 LEUVEN
BE0643.557.881

---
INTERNE INFO:
Contactpersoon: {name}
Email: {email}
Telefoon: {phone if phone else 'niet opgegeven'}
School: {school_name}
Facturatieadres: {billing_address if billing_address else 'niet opgegeven'}

Bestelling:
- Aantal klassen: {num_classrooms}
- Aantal leerlingen: {num_students}
- Aantal lerarenaccounts: {num_teacher_accounts}
- Totaalprijs: € {total_price:.2f}"""

        # Attach PDF to admin email too
        if pdf_path and os.path.exists(pdf_path):
            with open(pdf_path, 'rb') as pdf_file:
                admin_msg.attach(
                    filename=os.path.basename(pdf_path),
                    content_type='application/pdf',
                    data=pdf_file.read()
                )

        # Send both emails in background threads
        print(f"Sending quote to customer: {email}")
        customer_thread = threading.Thread(
            target=_send_async_email,
            args=(app, customer_msg, email),
            daemon=True
        )
        customer_thread.start()

        print(f"Sending notification to admin about order from {email}")
        admin_thread = threading.Thread(
            target=_send_async_email,
            args=(app, admin_msg, 'octovoc@katern.be'),
            daemon=True
        )
        admin_thread.start()

        # Cleanup temp PDF file after a delay
        if pdf_path:
            def cleanup_pdf():
                import time
                time.sleep(60)  # Wait for emails to send
                try:
                    if os.path.exists(pdf_path):
                        os.remove(pdf_path)
                        temp_dir = os.path.dirname(pdf_path)
                        if os.path.exists(temp_dir):
                            import shutil
                            shutil.rmtree(temp_dir, ignore_errors=True)
                except:
                    pass

            cleanup_thread = threading.Thread(target=cleanup_pdf, daemon=True)
            cleanup_thread.start()

        print(f"Quote emails queued for {email}")
        return True

    except Exception as e:
        print(f"Failed to start order email thread: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
