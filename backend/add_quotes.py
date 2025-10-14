#!/usr/bin/env python3
"""
Script to add motivational quotes with video rewards to the database.
"""

import sys

# Add the app directory to the path
sys.path.insert(0, '/home/jelledekeersmaecker/dev/projects/octovoc/backend')

from app import create_app, db
from app.models.quote import Quote

def add_quote(text, author, video_url):
    """Add a quote to the database"""
    try:
        # Check if quote already exists
        existing = Quote.query.filter_by(text=text, author=author).first()
        if existing:
            print(f"⚠ Already exists: {text[:50]}... - {author}")
            return False

        quote = Quote(
            text=text,
            author=author,
            video_url=video_url,
            is_active=True
        )
        db.session.add(quote)
        db.session.commit()
        print(f"✓ Added: {text[:50]}... - {author}")
        return True
    except Exception as e:
        print(f"✗ Failed to add quote: {e}")
        db.session.rollback()
        return False

def main():
    """Add all quotes with videos"""
    print("🚀 Starting to add quotes and videos...")

    app = create_app()

    with app.app_context():
        # List of quotes and corresponding video URLs
        quotes_and_videos = [
            # Language quotes (1-10)
            ("De grenzen van mijn taal zijn de grenzen van mijn wereld.", "Ludwig Wittgenstein",
             "https://www.youtube.com/watch?v=YjDKzPo51V0"),

            ("Taal vormt onze manier van denken en bepaalt waarover we in staat zijn te denken.", "Benjamin Lee Whorf",
             "https://www.youtube.com/shorts/ubJLSIrwPRE"),

            ("Taal is het bloed van de ziel waarin gedachten binnenkomen en vanwaaruit ze verder groeien.", "Oliver Wendell Holmes",
             "https://www.youtube.com/watch?v=t8tjT9MA7yU"),

            ("Een taal is een precieze reflectie van het karakter en de ontwikkeling van de sprekers ervan.", "Cesar Chavez",
             "https://www.youtube.com/watch?v=w9Wc7KHspuU"),

            ("Als we een andere taal spraken, zouden we een enigszins andere wereld waarnemen.", "Ludwig Wittgenstein",
             "https://www.youtube.com/watch?v=tgMh_r-RalA"),

            ("Verander je taal en je verandert je gedachten.", "Karl Albrecht",
             "https://www.youtube.com/watch?v=lq89t75-Y1Y"),

            ("We vinden de wereld uit via taal. De wereld ontstaat door taal.", "Mal Pancoast",
             "https://www.youtube.com/watch?v=SQJrYw1QvSQ"),

            ("De expert in alles was ooit een beginner.", "Helen Hayes",
             "https://www.youtube.com/watch?v=Rpazrfptfeo"),

            ("Taal is niet alleen wat we spreken, het is wie we zijn.", "Onbekend",
             "https://www.youtube.com/watch?v=7L26xv-8LPs"),

            ("Een woordenschat van duizenden woorden begint met een enkel woord.", "Onbekend",
             "https://www.youtube.com/watch?v=msbp1FO87x0"),

            # Perseverance quotes (34-48 -> 11-25)
            ("Doorzettingsvermogen is geen lange race; het zijn vele korte races na elkaar.", "Walter Elliot",
             "https://www.youtube.com/watch?v=PAORQoMvSdY"),

            ("Succes is de som van kleine inspanningen die dag in dag uit herhaald worden.", "Robert Collier",
             "https://www.youtube.com/shorts/A7sXmY7b5Ws"),

            ("Ik heb nooit gedroomd van succes. Ik heb ervoor gewerkt.", "Estée Lauder",
             "https://www.youtube.com/watch?v=CyB6-AUlI6Q"),

            ("Je kunt vallen, maar je kunt ook weer opstaan.", "Angelique Kidjo",
             "https://www.youtube.com/shorts/mYic1zaPtOk"),

            ("Hard werken verslaat talent als talent niet hard werkt.", "Tim Notke",
             "https://www.youtube.com/shorts/L-9Fiu0MEmo"),

            ("Er is geen lift naar succes. Je moet de trap nemen.", "Zig Ziglar",
             "https://www.youtube.com/watch?v=beZ-eILsEm8"),

            ("Ik gedij op obstakels. Als mij wordt verteld dat iets niet kan, dan zet ik nog harder door.", "Issa Rae",
             "https://www.youtube.com/watch?v=0eFEb-xn6jc"),

            ("Blijf doorgaan. Iedereen wordt beter als ze doorgaan.", "Ted Williams",
             "https://www.youtube.com/shorts/D2xPW_9VUF4"),

            ("De prijs van succes is hard werken, toewijding aan de taak die voor je ligt, en de vastberadenheid dat of we nu winnen of verliezen, we het beste van onszelf hebben gegeven.", "Vince Lombardi",
             "https://www.youtube.com/watch?v=Fpnn03k42MA"),

            ("De enige plek waar succes voor werk komt, is in het woordenboek.", "Vidal Sassoon",
             "https://www.youtube.com/watch?v=kt-rKsZH7uM"),

            ("Grote werken worden niet door kracht verricht, maar door volharding.", "Samuel Johnson",
             "https://www.youtube.com/shorts/woxSV2kdMRI"),

            ("Als je door een hel gaat, blijf dan gaan.", "Winston Churchill",
             "https://www.youtube.com/shorts/Jw_evirOSa8"),

            ("Onze grootste zwakte ligt in het opgeven. De meest zekere manier om te slagen is altijd om het nog een keer te proberen.", "Thomas Edison",
             "https://www.youtube.com/watch?v=-paNTBJMcO0"),

            ("Een kampioen is iemand die opstaat als hij niet kan.", "Jack Dempsey",
             "https://www.youtube.com/watch?v=pHYieRWw8TU"),

            ("Het verschil tussen een succesvol persoon en anderen is niet een gebrek aan kracht, niet een gebrek aan kennis, maar eerder een gebrek aan wil.", "Vince Lombardi",
             "https://www.youtube.com/watch?v=f2Xn9j0t1iU"),

            # Growth quotes (67-73 -> 26-32)
            ("Doe het beste wat je kunt totdat je beter weet. Als je dan beter weet, doe dan beter.", "Maya Angelou",
             "https://www.youtube.com/watch?v=Y6MPOodenfA"),

            ("Groei moet keer op keer gekozen worden; angst moet keer op keer overwonnen worden.", "Abraham Maslow",
             "https://www.youtube.com/watch?v=feEMKVcFyC4"),

            ("Wees niet bang om langzaam te groeien; wees alleen bang om stil te staan.", "Chinees spreekwoord",
             "https://www.youtube.com/watch?v=QSxzQqKRGtY"),

            ("Je richting is belangrijker dan je snelheid.", "Onbekend",
             "https://www.youtube.com/shorts/e6CruuuJZcQ"),

            ("Verandering bestaat uit keuzes, en keuzes bestaan uit karakter.", "Amanda Gorman",
             "https://www.youtube.com/watch?v=6QucVoHmhc0"),

            ("Kracht en groei komen alleen door voortdurende inspanning en strijd.", "Napoleon Hill",
             "https://www.youtube.com/shorts/XCag4bcb5ao"),

            ("Als er geen wind is, roei dan.", "Latijns spreekwoord",
             "https://www.youtube.com/shorts/PIf-CatUMBE"),
        ]

        print(f"\n📝 Adding {len(quotes_and_videos)} quotes with video rewards...\n")

        success_count = 0
        for text, author, video_url in quotes_and_videos:
            if add_quote(text, author, video_url):
                success_count += 1

        print(f"\n{'='*60}")
        print(f"✅ Successfully added {success_count}/{len(quotes_and_videos)} quotes!")
        print(f"{'='*60}")
        print("\n💡 Tip: Quotes worden random getoond aan studenten na het voltooien van een module.")
        print("   Video's zijn bedoeld als beloning met schattige katjes en hondjes!")

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
