with open('temp_doc.txt', 'r', encoding='utf-16le', errors='ignore') as f:
    content = f.read()
with open('temp_doc_utf8.txt', 'w', encoding='utf-8') as f2:
    f2.write(content)
