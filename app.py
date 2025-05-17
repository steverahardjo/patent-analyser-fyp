from flask import Flask, request, jsonify
import re
from pydantic import ValidationError
from services.patent_parser import DocProcessing
from services.textClassification import PatentClassifier
from services.LLM import Openai
from services.chatbot import PatentChatbot
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# --- New Improved Regex Patterns ---
PATENT_NUM_PATTERN = re.compile(
    rb'(?:US[-\s]*)(\d{5,11})(?:[-\s]*A1)?',
    re.IGNORECASE
)
TEXT_PATTERN = re.compile(
    r'(?:US[-\s]*)(\d{5,11})(?:[-\s]*A1)?',
    re.IGNORECASE
)

# --- Service Initializations ---
processor = DocProcessing()
classifier = PatentClassifier(Openai("OPENAI_KEY"))
globalPatent = None
chatbot = None
summarization = None

@app.route('/upload', methods=['POST'])
def upload_pdf():
    global globalPatent
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    print(f"DEBUG: Received file: {file.filename}")
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are allowed'}), 400

    try:
        content = file.read()
        if not content:
            return jsonify({'error': 'Empty file content'}), 400

        # More lenient PDF validation
        if not content.startswith(b'%PDF') and b'%PDF' not in content[:1024]:
            print("DEBUG: PDF header not found in first 1024 bytes")
            # Continue processing anyway as some PDFs might have different headers

        # Extract patent number - NEW IMPROVED VERSION
        extracted_num = None
        
        # Try binary search first
        match = PATENT_NUM_PATTERN.search(content)
        if match:
            extracted_num = match.group(1).decode('utf-8')
        else:
            # Fallback to text search
            try:
                sample = content[:10240].decode('utf-8', errors='ignore')
                text_match = TEXT_PATTERN.search(sample)
                if text_match:
                    extracted_num = text_match.group(1)
                else:
                    # Try alternative patterns if needed
                    alt_match = re.search(r'(\d{5,11})', sample)
                    if alt_match:
                        extracted_num = alt_match.group(1)
            
            except Exception as e:
                print(f"DEBUG: Decoding error: {str(e)}")

        if not extracted_num:
            return jsonify({
                'error': 'Patent number not found',
                'debug': 'Tried patterns: US-<digits>-A1 and standalone 5-11 digit numbers'
            }), 422

        # Process and classify
        try:
            patent_doc = processor.process_document(extracted_num)
            print(f"DEBUG: Processed patent document: {patent_doc.title}")
            raw_result = classifier.classify_patent(patent_doc.abstract, patent_doc.claims)
            summarization = classifier.summarization(patent_doc)
            suggested_questions = classifier.generate_suggested_questions(summarization+raw_result.final_classification)
            globalPatent = patent_doc

            return jsonify({
                'message': 'PDF processed and classified successfully',
                'patent_number': extracted_num,
                'title': patent_doc.title,
                'Inventors': patent_doc.inventor,
                'publication_date': patent_doc.publication_date,
                'classification_result': raw_result.final_classification,
                'summ': summarization,
                'suggested_questions': suggested_questions
            }), 200

        except ValidationError as ve:
            return jsonify({'error': 'Validation failed', 'details': ve.errors()}), 422
        except Exception as e:
            print(f"[Processing Error]: {str(e)}")
            return jsonify({'error': f'Error during processing/classification: {str(e)}'}), 500

    except Exception as e:
        print(f"[Upload Error]: {str(e)}")
        return jsonify({'error': f'Failed to process PDF: {str(e)}'}), 500

@app.route('/query', methods=['POST'])
def interact_query():
    global chatbot, globalPatent
    if not globalPatent:
        return jsonify({'error': 'No document uploaded or processed. Please upload a PDF first.'}), 400

    if not chatbot:
        chatbot = PatentChatbot(globalPatent)

    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({'error': 'No question provided'}), 400

    question = data['question'].strip()
    try:
        result = chatbot.generate_patent_answer(question)
        return jsonify({'answer': result}), 200
    except KeyError as ke:
        return jsonify({'error': str(ke)}), 500
    except Exception as e:
        return jsonify({'error': f'Error generating response: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8000)
