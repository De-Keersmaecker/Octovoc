#!/usr/bin/env python3
"""
Test the improved delimiter detection
"""
import csv
import io

csv_data = """moralistisch;geneigd om anderen de les te lezen over goed en kwaad;Zijn *moralistisch* betoog over de jeugd van tegenwoordig irriteerde veel van zijn jongere toehoorders.
secularisme;de overtuiging dat religie en staat gescheiden moeten zijn;Het *secularisme* is een belangrijk principe in veel westerse democratieën voor een neutrale overheid.
esthetica;de leer van de schoonheid en de kunst;In de les *esthetica* bestudeerden we hoe opvattingen over schoonheid door de eeuwen heen zijn veranderd."""

# Simulate the improved logic
csv_file = io.StringIO(csv_data)
sample = csv_data[:1024]

try:
    delimiter = csv.Sniffer().sniff(sample).delimiter
    print(f"✓ Sniffer detected: '{delimiter}'")
except Exception as e:
    print(f"✗ Sniffer failed: {e}")
    # Try semicolon first (common in European CSVs), then comma
    if ';' in sample and sample.count(';') > sample.count(','):
        delimiter = ';'
        print(f"✓ Fallback to semicolon (count: {sample.count(';')} semicolons vs {sample.count(',')} commas)")
    else:
        delimiter = ','
        print(f"✓ Fallback to comma")

# Test parsing
csv_file.seek(0)
reader = csv.reader(csv_file, delimiter=delimiter)

print(f"\n✓ Using delimiter: '{delimiter}'")
print("\nParsed rows:")
for idx, row in enumerate(reader, start=1):
    print(f"  Row {idx}: {len(row)} columns")
    if len(row) >= 3:
        print(f"    - Word: {row[0]}")
        print(f"    - Asterisks in example: {row[2].count('*')}")
    else:
        print(f"    ✗ ERROR: Only {len(row)} columns!")
