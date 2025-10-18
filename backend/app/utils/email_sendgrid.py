"""
SendGrid email implementation (backup for if One.com SMTP doesn't work on Railway)

Setup:
1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Create API key in Settings > API Keys
3. Add to Railway environment: SENDGRID_API_KEY=your_key_here
4. Install: pip install sendgrid
5. Replace send_password_reset_email import in auth.py
"""

from flask import current_app
import os

def send_password_reset_email(to_email, reset_token):
    """Send password reset email via SendGrid API"""

    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail

        # Get SendGrid API key
        api_key = os.getenv('SENDGRID_API_KEY')
        if not api_key:
            print("ERROR: SENDGRID_API_KEY not configured")
            return False

        # Get the frontend URL from config
        frontend_url = current_app.config.get('FRONTEND_URL', 'https://www.octovoc.be')
        reset_url = f"{frontend_url}/reset-password?token={reset_token}"

        # Create email message
        message = Mail(
            from_email=('octovoc@katern.be', 'Octovoc'),
            to_emails=to_email,
            subject='Octovoc - Wachtwoord Resetten',
            html_content=f"""
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
""")

        # Send email via SendGrid API
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)

        print(f"SendGrid email sent successfully to {to_email} (status: {response.status_code})")
        return True

    except Exception as e:
        print(f"Failed to send email via SendGrid: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
