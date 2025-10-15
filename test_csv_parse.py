#!/usr/bin/env python3
"""
Test CSV parsing to identify issues
"""
import csv
import io

# Eerste paar regels van de tweede CSV
csv_data = """moralistisch;geneigd om anderen de les te lezen over goed en kwaad;Zijn *moralistisch* betoog over de jeugd van tegenwoordig irriteerde veel van zijn jongere toehoorders.
secularisme;de overtuiging dat religie en staat gescheiden moeten zijn;Het *secularisme* is een belangrijk principe in veel westerse democratieën voor een neutrale overheid.
esthetica;de leer van de schoonheid en de kunst;In de les *esthetica* bestudeerden we hoe opvattingen over schoonheid door de eeuwen heen zijn veranderd."""

# Parse CSV
csv_file = io.StringIO(csv_data)
sample = csv_data[:1024]

try:
    delimiter = csv.Sniffer().sniff(sample).delimiter
    print(f"Detected delimiter: '{delimiter}'")
except Exception as e:
    print(f"Delimiter detection failed: {e}")
    delimiter = ','

csv_file.seek(0)
reader = csv.reader(csv_file, delimiter=delimiter)

print("\nParsed rows:")
for idx, row in enumerate(reader, start=1):
    print(f"\nRow {idx}:")
    print(f"  Columns: {len(row)}")
    for col_idx, col in enumerate(row):
        print(f"  Col {col_idx}: {col[:60]}..." if len(col) > 60 else f"  Col {col_idx}: {col}")

        # Check for asterisks in third column
        if col_idx == 2:
            asterisk_count = col.count('*')
            print(f"    -> Asterisks: {asterisk_count}")
            if asterisk_count >= 2:
                print(f"    -> ✓ Valid")
            else:
                print(f"    -> ✗ INVALID: needs at least 2 asterisks")
