from urllib.parse import quote


class EmailService:
    # Default template for teacher instructions
    TEACHER_INSTRUCTION_TEMPLATE = """Beste {teacher_name},

Welkom bij Octovoc!

Je lerarencode is: {teacher_code}

Met deze code kun je toegang krijgen tot je dashboard en de voortgang van je leerlingen volgen.

Instructies:
1. Ga naar de Octovoc website
2. Registreer met je e-mailadres
3. Gebruik de bovenstaande lerarencode bij het registreren
4. Je hebt nu toegang tot je klassen en dashboard

Voor vragen kun je contact opnemen via info@katern.be.

Met vriendelijke groet,
Het Octovoc Team
"""

    _custom_template = None

    @classmethod
    def get_teacher_instruction_template(cls):
        """Get the current teacher instruction template"""
        return cls._custom_template if cls._custom_template else cls.TEACHER_INSTRUCTION_TEMPLATE

    @classmethod
    def set_teacher_instruction_template(cls, template):
        """Set a custom teacher instruction template"""
        cls._custom_template = template

    @classmethod
    def generate_email_content(cls, template_type, context):
        """
        Generate email content from template and context

        Args:
            template_type: Type of template ('teacher_instruction', etc.)
            context: Dictionary with placeholder values

        Returns:
            Formatted email content
        """
        if template_type == 'teacher_instruction':
            template = cls.get_teacher_instruction_template()
        else:
            template = cls.TEACHER_INSTRUCTION_TEMPLATE

        # Replace placeholders
        content = template
        for key, value in context.items():
            placeholder = f'{{{key}}}'
            content = content.replace(placeholder, str(value))

        return content

    @classmethod
    def generate_gmail_compose_link(cls, recipient, template_type='teacher_instruction', context=None):
        """
        Generate a Gmail compose link with pre-filled content

        Args:
            recipient: Email address of recipient
            template_type: Type of email template
            context: Dictionary with template variables

        Returns:
            Gmail compose URL
        """
        if context is None:
            context = {}

        # Set default subject
        subject = context.get('subject', 'Octovoc - Je lerarencode')

        # Generate email body
        body = cls.generate_email_content(template_type, context)

        # URL encode
        encoded_recipient = quote(recipient)
        encoded_subject = quote(subject)
        encoded_body = quote(body)

        # Create Gmail compose link
        gmail_link = (
            f'https://mail.google.com/mail/?view=cm'
            f'&fs=1'
            f'&to={encoded_recipient}'
            f'&su={encoded_subject}'
            f'&body={encoded_body}'
        )

        return gmail_link

    @classmethod
    def generate_verification_link(cls, base_url, token):
        """Generate email verification link"""
        return f'{base_url}/verify/{token}'

    @classmethod
    def generate_password_reset_link(cls, base_url, token):
        """Generate password reset link"""
        return f'{base_url}/reset-password/{token}'
