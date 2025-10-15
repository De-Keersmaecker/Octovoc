#!/usr/bin/env python3
"""
Test the improved delimiter detection that excludes asterisks
"""
import csv
import io

csv_data = """inventiviteit;vindingrijkheid;Zijn *inventiviteit* kwam goed van pas bij het oplossen van het onverwachte technische probleem.
apathisch;lusteloos en onverschillig;Na het slechte nieuws reageerde hij *apathisch* en toonde hij geen enkele vorm van emotie.
assertiviteit;zelfverzekerd opkomen voor je eigen mening;Tijdens de cursus leerde ze hoe *assertiviteit* haar kon helpen om duidelijker grenzen te stellen."""

# Simulate the improved logic
csv_file = io.StringIO(csv_data)
sample = csv_data[:1024]

# Only allow common delimiters (comma, semicolon, tab, pipe)
valid_delimiters = [',', ';', '\t', '|']

try:
    detected = csv.Sniffer().sniff(sample, delimiters=',;\t|').delimiter
    print(f"✓ Sniffer detected: '{detected}'")
    # Verify it's a valid delimiter
    if detected in valid_delimiters:
        delimiter = detected
        print(f"✓ Delimiter is valid")
    else:
        print(f"✗ Invalid delimiter detected: '{detected}'")
        raise ValueError("Invalid delimiter detected")
except Exception as e:
    print(f"✗ Sniffer failed: {e}")
    # Fallback: Try semicolon first (common in European CSVs), then comma
    if ';' in sample and sample.count(';') > sample.count(','):
        delimiter = ';'
        print(f"✓ Fallback to semicolon (count: {sample.count(';')} semicolons)")
    else:
        delimiter = ','
        print(f"✓ Fallback to comma")

# Test parsing
csv_file.seek(0)
reader = csv.reader(csv_file, delimiter=delimiter)

print(f"\nUsing delimiter: '{delimiter}'")
print("\nParsed rows:")
for idx, row in enumerate(reader, start=1):
    print(f"  Row {idx}: {len(row)} columns")
    if len(row) >= 3:
        word = row[0].strip()
        asterisks = row[2].count('*')
        print(f"    - Word: {word}")
        print(f"    - Asterisks in example: {asterisks}")
        if asterisks >= 2:
            print(f"    ✓ Valid!")
        else:
            print(f"    ✗ Invalid - only {asterisks} asterisks")
    else:
        print(f"    ✗ ERROR: Only {len(row)} columns!")
