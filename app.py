from flask import Flask, request, jsonify
from flask_cors import CORS 

# Initialize the Flask application and enable CORS
app = Flask(__name__)
CORS(app) 

@app.route('/classify', methods=['POST'])
def classify_content():
    # 1. Receive the data (webpage text) sent by the browser extension
    data = request.json
    page_text = data.get('text', '').lower()

    # 2. Define your classification rules
    educational_keywords = ['science', 'math', 'history', 'tutorial', 'learning']
    graphic_keywords = ['violence', 'blood', 'gore', 'weapons', 'nsfw']

    # 3. Analyze the text to find the category
    category = "Neutral / Unclassified"
    
    if any(word in page_text for word in graphic_keywords):
        category = "Warning: Potentially Graphic"
    elif any(word in page_text for word in educational_keywords):
        category = "Educational"

    # 4. Send the classification back to the browser extension
    return jsonify({"category": category})

if __name__ == '__main__':
    # Run the server locally
    app.run(debug=True, port=8000)